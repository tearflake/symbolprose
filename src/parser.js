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
                (RULES
                    (NORM <start> ("RULES" <rules>))

                    (NORM <rules> (<rule> <rules>))
                    (NORM <rules> (<rule> ()))

                    (FLAT <rule> ("FLAT" IDENTIFIER ANY))
                    (FLAT <rule> ("NORM" IDENTIFIER ANY))
                    (FLAT <rule> ("ATOM" IDENTIFIER ANY))
                )
            `

            let sSyntax = SExpr.parse (syntax);
            let sGrammar = SExpr.parse (grammar);
            if (sGrammar.err) return sGrammar;
            let [path, ok] = parseLowLevel (sGrammar, sSyntax);

            return formatOutput (ok, sGrammar, grammar, denormalizeIndexes (path));
        }
        
        let makeGrammar = function (sexpr) {
            let rules = [];
            for (let i = 1; i < sexpr.length; i++) {
                let ruleType = sexpr[i][0]
                let ruleName = sexpr[i][1];
                let ruleBody = sexpr[i][2];
                if (!rules[ruleName]) {
                    rules[ruleName] = [];
                }
                
                rules[ruleName].push ({type: ruleType, pattern: ruleBody});
            }
            
            return rules
        }
        
        let parse = function (sexpr, grammar) {
            let sSexpr = SExpr.parse (sexpr);
            if (sSexpr.err) return sSexpr;
            let [path, ok] = parseLowLevel (sSexpr, grammar)

            return formatOutput (ok, sSexpr, sexpr, denormalizeIndexes (path));
        }
        
        let parseLowLevel = function (expr, grammar) {
            grammar = makeGrammar (grammar);
            let pattern = "<start>";

            //return match (normalizeSExpr (expr), pattern, grammar, [], [], false);
            return match (normalizeSExpr (expr), pattern, grammar);
        }
        
        function match(expr, patt, grammar) {
            let idx, from;
            let [mode, ok, stack, farPath] = ["fore", false, [], []];
            stack.push([-1, expr, patt, [], false]);
            loop1: while (mode === "fore" || stack.length > 1) {
                if (mode === "back") {
                    stack.pop ();
                }
                let [idx, expr, patt, curPath, subAtomic] = stack[stack.length - 1];
                let atomMatch = false;
                if (typeof patt === "string" && grammar[patt]) {
                    if (mode === "back") {
                        if (ok) {
                            continue loop1;
                        }
                        else {
                            mode = "fore";
                        }
                    }
                    
                    stack[stack.length - 1][0]++;
                    idx = stack[stack.length - 1][0];
                    let rule = grammar[patt];
                    if (idx < rule.length) {
                        if (rule[idx].type === "ATOM") {
                            if (subAtomic || typeof expr === 'string') {
                                expr = subAtomic ? expr : normalizeSExpr(expr.split(""));
                                stack.push([-1, expr, rule[idx].pattern, curPath, true]);
                                continue loop1;
                            }
                        }
                        else if (rule[idx].type == "FLAT" && !subAtomic) {
                            stack.push([-1, expr, normalizeSExpr(rule[idx].pattern), curPath, subAtomic]);
                            continue loop1;
                        }
                        else if (rule[idx].type == "NORM" && !subAtomic) {
                            stack.push([-1, expr, rule[idx].pattern, curPath, subAtomic]);
                            continue loop1;
                        }
                    }
                    
                    [mode, ok] = ["back", false];
                    continue loop1;
                }
                else if (Array.isArray(expr) && Array.isArray(patt)) {
                    if (expr.length !== patt.length) {
                        [mode, ok] = ["back", false];
                        continue loop1;
                    }
                    else {
                        if (mode === "back")
                            if (!ok) {
                                continue loop1;
                            }
                            else {
                                mode = "fore";
                            }

                        stack[stack.length - 1][0]++;
                        idx = stack[stack.length - 1][0];
                        if (idx < expr.length) {
                            let tmpPath = [...curPath, idx]
                            if (!subAtomic && compareArr(tmpPath, farPath) > 0) {
                                farPath = tmpPath;
                            }
                            stack.push([-1, expr[idx], patt[idx], tmpPath, subAtomic]);
                            continue loop1;
                        }
                    }
                    [mode, ok] = ["back", true]
                    continue loop1;
                }
                else if (typeof expr === 'string' && '"' + expr + '"' == patt) {
                    atomMatch = true;
                }
                else if (patt == "STRING") {
                    if (typeof expr === 'string' && expr.charAt(0) == '"' && expr.charAt(expr.length - 1) == '"') {
                        atomMatch = true;
                    }
                }
                else if (patt == "IDENTIFIER") {
                    if (typeof expr === 'string' && expr.charAt(0) != '"' && expr.charAt(expr.length - 1) != '"') {
                        atomMatch = true;
                    }
                }
                else if (patt == "ATOMIC") {
                    if (typeof expr === 'string') {
                        atomMatch = true;
                    }
                }
                else if (patt == "ANY") {
                    atomMatch = true;
                }
                
                if (atomMatch) {
                    [mode, ok] = ["back", true];
                }
                else {
                    [mode, ok] = ["back", false];
                }
            }
            
            return [farPath, ok];
        }

        let compareArr = function (arr1, arr2) {
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

        var denormalizeIndexes = function (nm) {
            var dnm = [];
            var idx = 0;
            for (var i = 0; i < nm.length; i++) {
                if (nm[i] === 0) {
                    dnm.push (idx);
                    idx = 0;
                }
                else {
                    idx++;
                }
            }
            
            if (idx > 0) {
                dnm.push (idx);
            }
            
            return dnm;
        };

        var normalizeSExpr = function (expr) {
            var stack = [], item;
            var car = expr, cdr = [];
            stack.push ({car: expr});
            while (stack.length > 0) {
                item = stack.pop ();
                if (item.car !== undefined) {
                    car = item.car;
                    if (Array.isArray (car)) {
                        stack.push ({cdr: cdr})
                        cdr = [];
                        for (var i = 0;  i < car.length; i++) {
                            stack.push ({car: car[i]})
                        }
                    }
                    else {
                        cdr = [car, cdr];
                    }
                }
                else {
                    car = cdr;
                    cdr = [car, item.cdr];
                }
            }
            
            return car;
        };
        
        let formatOutput = function (ok, sexpr, text, path) {
            if (ok) {
                return sexpr;
            }   
            else {
                let msg = SExpr.getPosition (text, path);
                return {err: msg.err, found: msg.found, pos: msg.pos, path: path};
            }
        }

        return {
            parseGrammar: parseGrammar,
            parse: parse
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    module.exports = Parser;
    
    // end of Node.js support
}

