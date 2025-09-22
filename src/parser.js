// parser.js
// (c) tearflake, 2025
// MIT License

var Parser = (
    function (obj) {
        return {
            parseRules: obj.parseRules,
            parse: obj.parse
        };
    }
) (
    (function () {
        "use strict";
        
        let makeRules = function (sexpr) {
            let rules = [];
            for (let i = 1; i < sexpr.length; i++) {
                let ruleName = sexpr[i][1];
                let ruleBody = sexpr[i][2];
                rules[ruleName] = ruleBody;
            }
            
            return rules
        }
        
        let path, farthestPath;

        let parseRules = function (rules) {
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
                        (GROUP (MUL "GROUP" <expr>))
                        (GROUP (MUL "ADD" (STAR <expr>)))
                        (GROUP (MUL "MUL" (STAR <expr>)))
                        (GROUP (MUL "STAR" <expr>))
                        (GROUP (MUL "ATOM" <expr>))
                        ATOMIC)))
            `

            let sSyntax = SExpr.parse (syntax);
            let sRules = SExpr.parse (rules);
            
            if (sRules.err) {
                return sRules;
            }

            path = [];
            farthestPath = [];
            let ast = parse (sSyntax, rules);
            
            if (ast.err) {
                let msg = SExpr.getPosition (rules, farthestPath);
                return {err: msg.err, found: msg.found, pos: msg.pos};
            }
            else {
                return ast;
            }

        }
        
        let err;
        function parse (syntax, sexpr) {
            let sSexpr = SExpr.parse (sexpr);
            if (sSexpr.err) return sSexpr;

            path = [];
            farthestPath = [];
            err = undefined;
            let ast = dispatch ("<start>", [sSexpr], 0, makeRules (syntax), false, 0);
            if (ast.err) {
                if (err) {
                    return {err: err};
                }
                else {
                    let msg = SExpr.getPosition (sexpr, farthestPath);
                    return {err: msg.err, found: msg.found, pos: msg.pos, path: farthestPath};
                }
            }
            else {
                if (typeof ast === "string") {
                    return ast;
                }
                else {
                    return ast[0];
                }
            }
        }

        let dispatch = function (pattern, expr, idx, rules, atomic, rec) {
            if (rec > 1000) {
                err = "Too much recursion";
                return {err: true};
            }

            if (expr === undefined) {
                return ret ({err: true});
            }
            else if (Array.isArray (expr)) {
                if (Array.isArray (pattern)) {
                    if (pattern[0] === "GROUP") {
                        return ret (matchGroup (pattern, expr, idx, rules, atomic, rec + 1), atomic);
                    }
                    if (pattern[0] === "ATOM") {
                        return ret (matchAtom (pattern, expr, idx, rules, true, rec + 1), true);
                    }
                    else if (pattern[0] === "MUL") {
                        return ret (matchMul (pattern, expr, idx, rules, atomic, rec + 1), atomic);
                    }
                    else if (pattern[0] === "ADD") {
                        return ret (matchAdd (pattern, expr, idx, rules, atomic, rec + 1), atomic);
                    }
                    else if (pattern[0] === "STAR") {
                        return ret (matchStar (pattern, expr, idx, rules, atomic, rec + 1), atomic);
                    }
                }
                else if (!Array.isArray (pattern)) {
                    if (pattern === "ZERO") {
                        return ret ({err: true}, atomic);
                    }
                    else if (pattern === "ONE") {
                        return ret ([], atomic);
                    }
                    else if (pattern === '"' + expr[idx] + '"') {
                        return ret (expr[idx], atomic);
                    }
                    else if (pattern === "ATOMIC") {
                        if (typeof expr[idx] === "string") {
                            return ret (expr[idx], atomic);
                        }
                        else {
                            return ret ({err: true}, atomic);
                        }
                    }
                    else if (pattern === "ANY") {
                        if (Array.isArray (expr[idx])) {
                            return ret ([expr[idx]], atomic);
                        }
                        else {
                            return ret (expr[idx], atomic);
                        }
                    }
                    else if (rules[pattern]){
                        return ret (matchRule (pattern, expr, idx, rules, atomic, rec + 1), atomic);
                    }
                }
            }
            
            return ret ({err: true});
        }
        
        let ret = function (val, atomic) {
            if (!atomic && compareArr(path, farthestPath) > 0) {
                farthestPath = [...path];
            }
            return val;
        }
        
        let matchRule = function (pattern, expr, idx, rules, atomic, rec) {
            let rbody = rules[pattern];
            let res = dispatch (rbody, expr, idx, rules, atomic, rec);
            if (!res.err) {
                return res;
            }
            
            return {err: true};
        }

        let matchGroup = function (pattern, expr, idx, rules, atomic, rec) {
            if (Array.isArray (expr[idx])) {
                path = [...path, 0]
                let res = dispatch (pattern[1], expr[idx], 0, rules, atomic, rec)
                path.pop ();
                if (!res.err && (typeof res === typeof expr[idx] && res.length === expr[idx].length)) {
                    return [res];
                }
            }
            
            return {err: true};
        }

        let matchAtom = function (pattern, expr, idx, rules, atomic, rec) {
            if (typeof expr[idx] === "string") {
                let chars = expr[idx].split ("");
                path = [...path, 0]
                let res = dispatch (pattern[1], chars, 0, rules, atomic, rec);
                path.pop ();
                if (!res.err && Array.isArray (res) && res.length === chars.length) {
                    for (let i = 0; i < res.length; i++) {
                        if (res[i] !== chars[i]) {
                            return {err: true};
                        }
                    }
                    
                    return [expr[idx]];
                }
            }

            return {err: true};
        }

        let matchMul = function (pattern, expr, idx, rules, atomic, rec) {
            let res = [];
            let d = 0;
            
            for (let i = 1; i < pattern.length; i++) {
                path[path.length - 1] = idx + i - 1 + d;
                
                let el = dispatch (pattern[i], expr, idx + i - 1 + d, rules, atomic, rec);
                if (el.err) {
                    return {err:true};
                }
                else if (typeof el === "string") {
                    res.push (el);
                }
                else {
                    if (Array.isArray (el)) {
                        res = [...res, ...el];
                        d += el.length - 1;
                    }
                    else {
                        res = [...res, el];
                    }
                }
                
                if (expr.length <= i - 1 + d) {
                    return {err:true};
                }
            }
            
            path[path.length - 1] = idx + pattern.length - 1 + d;
            
            return res;
        }
        
        let matchAdd = function (pattern, expr, idx, rules, atomic, rec) {
            for (let i = 1; i < pattern.length; i++) {
                let res = dispatch (pattern[i], expr, idx, rules, atomic, rec);
                if (!res.err) {
                    return res;
                }
            }
            
            return {err:true}
        }
        
        let matchStar = function (pattern, expr, idx, rules, atomic, rec) {
            let res = []
            for (let i = idx; i < expr.length; i++) {
                let el = dispatch (pattern[1], expr, i, rules, atomic, rec)
                if (!el.err) {
                    if (Array.isArray (el)) {
                        res = [...res, ...el];
                        path[path.length - 1] += el.length;
                    }
                    else {
                        res = [...res, el];
                        path[path.length - 1]++;
                    }
                }
                else {
                    return res;
                }
            }
            
            return res;
        }

        var compareArr = function (arr1, arr2) {
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

        return {
            parse: parse,
            parseRules: parseRules
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    module.exports = Parser;
    
    // end of Node.js support
}

