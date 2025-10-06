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
            let [path, ok] = parseLowLevel (sSyntax, sGrammar);

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
        
        let parse = function (grammar, sexpr) {
            let sSexpr = SExpr.parse (sexpr);
            if (sSexpr.err) return sSexpr;
            let [path, ok] = parseLowLevel (grammar, sSexpr)

            return formatOutput (ok, sSexpr, sexpr, denormalizeIndexes (path));
        }
        
        let parseLowLevel = function (grammar, expr) {
            grammar = makeGrammar (grammar);
            let pattern = "<start>";

            return match (normalizeSExpr (expr), pattern, grammar, [], [], false);
        }

        let match = function (expr, pattern, grammar, farPath, curPath, subAtomic) {
            let ok;
            
            if (!subAtomic && compareArr(curPath, farPath) > 0) {
                farPath = curPath;
            }
            
            if (typeof pattern === "string" && grammar[pattern]) {
                let arrPat = grammar[pattern];
                for (let i = 0; i < arrPat.length; i++) {
                    ok = false;
                    if (arrPat[i].type === "ATOM") {
                        if (subAtomic || typeof expr ===  "string") {
                            [farPath, ok] = match(subAtomic ? expr : normalizeSExpr (expr.split ("")), arrPat[i].pattern, grammar, farPath, curPath, true);
                        }
                    }
                    else if (arrPat[i].type === "FLAT" && !subAtomic) {
                        [farPath, ok] = match(expr, normalizeSExpr(arrPat[i].pattern), grammar, farPath, curPath, subAtomic);
                    }
                    else if (arrPat[i].type === "NORM" && !subAtomic) {
                        [farPath, ok] = match(expr, arrPat[i].pattern, grammar, farPath, curPath, subAtomic);
                    }
                    
                    if (ok) {
                        return [farPath, true];
                    }
                }
            }
            else if (Array.isArray (expr) && Array.isArray (pattern)) {
                if (expr.length !== pattern.length) {
                    return [farPath, false];
                }

                for (let idx = 0; idx < expr.length; idx++) {
                    let tmpPath = [...curPath, idx];
                    [farPath, ok] = match (expr[idx], pattern[idx], grammar, farPath, tmpPath, subAtomic);
                    if (!ok) {
                        return [farPath, false];
                    }
                }
                
                return [farPath, true];
            }
            else if (typeof expr === "string" && '"' + expr + '"' === pattern) {
                return [farPath, true];
            }
            else if (pattern === "STRING") {
                if (typeof expr === "string" && expr.charAt(0) === '"' && expr.charAt(expr.length - 1) === '"') {
                    return [farPath, true];
                }
            }
            else if (pattern === "IDENTIFIER") {
                if (typeof expr === "string" && expr.charAt(0) !== '"' && expr.charAt(expr.length - 1) !== '"') {
                    return [farPath, true];
                }
            }
            else if (pattern === "ATOMIC") {
                if (typeof expr === "string") {
                    return [farPath, true];
                }
            }
            else if (pattern === "ANY") {
                return [farPath, true];
            }
            
            return [farPath, false];
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

