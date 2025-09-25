// parser.js
// (c) tearflake, 2025
// MIT License

var Parser = (
    function (obj) {
        return {
            parseGrammar: obj.parseGrammar,
            parse: obj.parse
        };
    }
) (
    (function () {
        "use strict";

        let parseGrammar = function (grammar) {
            let syntax = `
            (GRAMMAR
                (RULE
                    <start>
                    (GROUP (MUL "GRAMMAR" <rule> (STAR <rule>))))

                (RULE
                    <rule>
                    (GROUP (MUL "RULE" ATOMIC <expr>)))

                (RULE
                    <expr>
                    (ADD
                        ()
                        ATOMIC
                        (GROUP (MUL "GROUP" <expr>))
                        (GROUP (MUL "ADD" (STAR <expr>)))
                        (GROUP (MUL "MUL" (STAR <expr>)))
                        (GROUP (MUL "STAR" <expr>))
                        (GROUP (MUL "ATOM" <expr>)))))
            `

            let sSyntax = SExpr.parse (syntax);
            let sGrammar = SExpr.parse (grammar);
            if (sGrammar.err) return sGrammar;
            let [length, path, ok] = parseLowLevel (sSyntax, sGrammar);

            return formatOutput (ok, sGrammar, grammar, path);
        }
        
        let makeGrammar = function (sexpr) {
            let rules = [];
            for (let i = 1; i < sexpr.length; i++) {
                let ruleName = sexpr[i][1];
                let ruleBody = sexpr[i][2];
                rules[ruleName] = ruleBody;
            }
            
            return rules
        }
        
        function parse (grammar, sexpr) {
            let sSexpr = SExpr.parse (sexpr);
            if (sSexpr.err) return sSexpr;
            let [length, path, ok] = parseLowLevel (grammar, sSexpr)

            return formatOutput (ok, sSexpr, sexpr, path);
        }
        
        function parseLowLevel (grammar, expr) {
            grammar = makeGrammar (grammar);
            let pattern = grammar["<start>"];

            return match([expr], 0, pattern, grammar, [], [], false);
        }

        function match (expr, idx, pattern, grammar, farPath, curPath, noTrackPath) {
            if (!noTrackPath && compareArr (curPath, farPath) > 0) {
                farPath = curPath;
            }
            
            if (typeof expr === "string") {
                expr = [expr];
                idx = 0;
            }
            
            let type;
            if (Array.isArray (pattern)) {
                type = pattern[0];
            }
            else {
                type = pattern;
            }
            
            if (!Array.isArray (pattern) && Object.prototype.hasOwnProperty.call (grammar, pattern)) {
                return match (expr, idx, grammar[pattern], grammar, farPath, curPath, noTrackPath);
            }
            else if (idx < expr.length && Array.isArray (expr[idx]) && expr[idx].length === 0 && Array.isArray (pattern) && pattern.length === 0) {
                return [1, farPath, true];
            }
            else if (idx < expr.length && !Array.isArray (expr[idx]) && '"' + expr[idx] + '"' == pattern) {
                return [1, farPath, true];
            }
            else if (idx < expr.length && type === "ATOMIC") {
                if (!Array.isArray (expr[idx])) {
                    return [1, farPath, true];
                }
                else {
                    return [0, farPath, false];
                }
            }
            else if (idx < expr.length && type === "ANY") {
                return [1, farPath, true];
            }
            else if (idx < expr.length && type === "GROUP") {
                if (!Array.isArray (expr[idx])) {
                    return [0, farPath, false];
                }
                
                let [length, farPath1, ok] = match (expr[idx], 0, pattern[1], grammar, farPath, [...curPath, 0], noTrackPath);
                farPath = farPath1;
                if (!ok || length !== expr[idx].length) {
                    return [0, farPath, false];
                }
                else {
                    return [1, farPath, true];
                }
            }
            else if (type === "ADD") {
                for (let i = 1; i < pattern.length; i++) {
                    let [length, farPath1, ok] = match (expr, idx, pattern[i], grammar, farPath, curPath, noTrackPath);
                    farPath = farPath1;
                    if (ok) {
                        return [length, farPath, true];
                    }
                }
                        
                return [0, farPath, false];
            }
            else if (type === "MUL") {
                let length = 0;
                for (let i = 1; i < pattern.length; i++) {
                    let tmpPath = [...curPath.slice(0, curPath.length - 1), idx + length];
                    let [itemLength, farPath1, ok] = match (expr, idx + length, pattern[i], grammar, farPath, tmpPath, noTrackPath);
                    farPath = farPath1;
                    length += itemLength;
                    if (!ok || idx + length > expr.length) {
                        return [0, farPath, false];
                    }
                }
                
                return [length, farPath, true];
            }
            else if (type === "STAR") {
                let length = 0;
                while (true) {
                    let tmpPath = [...curPath.slice(0, curPath.length - 1), idx + length];
                    let [itemLength, farPath1, ok] = match (expr, idx + length, pattern[1], grammar, farPath, tmpPath, noTrackPath);
                    farPath = farPath1;
                    length += itemLength;
                    if (!ok || idx + length >= expr.length || itemLength == 0) {
                        break;
                    }
                }

                return [length, farPath, true];
            }
            else if (type === "ATOM") {
                if (!Array.isArray (expr[idx])) {
                    let [itemLength, farPath1, ok] = match ([expr[idx].split("")], 0, ["GROUP", pattern[1]], grammar, farPath, curPath, true);
                    farPath = farPath1;
                    return [ok ? 1: 0, farPath, ok]
                }
                else {
                    return [0, farPath, false];
                }
            }
            else if (type === "ONE") {
                return [0, farPath, true];
            }
            else if (type === "ZERO") {
                return [0, farPath, false];
            }
            
            return [0, farPath, false];
        }
        
        function compareArr (arr1, arr2) {
            for (var i = 0; i < arr1.length; i++) {
                if (i < arr2.length) {
                    if (arr1[i] < arr2[i]) {
                        return -1;
                    }
                    else if (arr1[i] > arr2[i]) {
                        return 1;
                    }
                }
                else {
                    break;
                }
            }
            
            if (arr1.length < arr2.length) {
                return -1;
            }
            else if (arr1.length > arr2.length) {
                return 1;
            }
            else {
                return 0;
            }
        }
        
        function formatOutput(ok, sexpr, text, path) {
            if (ok) {
                return sexpr;
            }   
            else {
                let msg = SExpr.getPosition (text, path);
                return {err: msg.err, found: msg.found, pos: msg.pos, path: path};
            }
        }

        return {
            parse: parse,
            parseGrammar: parseGrammar
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    module.exports = Parser;
    
    // end of Node.js support
}

