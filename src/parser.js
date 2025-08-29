// parser.js
// (c) tearflake, 2025
// MIT License

var Parser = (
    function (obj) {
        return {
            makeRules: obj.makeRules,
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
                if (!rules[ruleName]) {
                    rules[ruleName] = [];
                }
                
                let ruleBody = sexpr[i][2];
                rules[ruleName].push (ruleBody);
            }
            
            return rules
        }
        
        let parse = function (expr, syntax) {
            let rules = makeRules (syntax);
            //let res = matchRule ("<start>", [expr], 0, rules);
            let res = dispatch (syntax, [expr], 0, rules);
            if (res.err) {
                return {err: res.err, path: []};
            }
            else {
                return res[0];
            }
        }
        
        let dispatch = function (pattern, expr, idx, rules) {
            if (Array.isArray (pattern)) {
                if (pattern[0] === "GROUP") {
                    return matchGroup (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "MUL") {
                    return matchMul (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "ADD") {
                    return matchAdd (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "STAR") {
                    return matchStar (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "SEQUENCE") {
                    return matchSeq (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "CHOICE") {
                    return matchCho (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "OPTIONAL") {
                    return matchOpt (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "ZEROORMORE") {
                    return matchZOM (pattern, expr, idx, rules);
                }
                else if (pattern[0] === "ONEORMORE") {
                    return matchOOM (pattern, expr, idx, rules);
                }
            }
            else if (!Array.isArray (pattern)) {
                if (pattern === "ZERO") {
                    return {err: true};
                }
                else if (pattern === "ONE") {
                    return [];
                }
                else if (pattern === "'" + expr[idx] + "'") {
                    return expr[idx];
                }
                else if (pattern === "ATOMIC") {
                    if (typeof expr[idx] === "string") {
                        return expr[idx];
                    }
                    else {
                        return {err: true}
                    }
                }
                else if (pattern === "ANY") {
                    if (Array.isArray (expr[idx])) {
                        return [expr[idx]];
                    }
                    return expr[idx];
                }
                else if (pattern.charAt(0) === "<" && pattern.charAt(pattern.length - 1) === ">") {
                    return matchRule (pattern, expr[idx], 0, rules);
                }
            }
            
            return {err: true};
        }
        
        let matchRule = function (pattern, expr, idx, rules) {
            let ruleSet = rules[pattern];
            for (let i = 0; i < ruleSet.length; i++) {
                let res = dispatch (ruleSet[i], [expr[idx]], 0, rules);
                if (!res.err) {
                    return res;
                }
            }
            
            return {err: true};
        }

        let matchGroup = function (pattern, expr, idx, rules) {
            let res = dispatch (pattern[1], expr[idx], 0, rules)
            if (res.err || res.length !== expr[idx].length) {
                return {err: true};
            }
            
            return [res];
        }

        let matchMul = function (pattern, expr, idx, rules) {
            let res = [];
            let d = 0;
            
            for (let i = 1; i < pattern.length; i++) {
                if (expr.length <= i - 1 + d) {
                    return {err:true};
                }
                
                let el = dispatch (pattern[i], expr, idx + i - 1 + d, rules);
                if (el.err) {
                    return {err:true};
                }
                else if (typeof el === "string") {
                    res.push (el);
                }
                else {
                    res = [...res, ...el];
                    d += el.length - 1;
                }
            }
            
            return res;
        }
        
        let matchAdd = function (pattern, expr, idx, rules) {
            for (let i = 1; i < pattern.length; i++) {
                let res = dispatch (pattern[i], expr, idx, rules);
                if (!res.err) {
                    return res;
                }
            }
            
            return {err:true}
        }
        
        let matchStar = function (pattern, expr, idx, rules) {
            let res = []
            for (let i = idx; i < expr.length; i++) {
                let el = dispatch (pattern[1], expr, i, rules)
                if (!el.err) {
                    res = [...res, ...el];
                }
                else {
                    return res;
                }
            }
            
            return res;
        }

        let matchSeq = function (pattern, expr, idx, rules) {
            return dispatch (["GROUP", ["MUL", ...pattern.slice(1)]], expr, idx, rules);
        }

        let matchCho = function (pattern, expr, idx, rules) {
            return dispatch (["ADD", ...pattern.slice(1)], expr, idx, rules);
        }

        let matchOpt = function (pattern, expr, idx, rules) {
            return dispatch (["ADD", pattern[1], "ONE"], expr, idx, rules);
        }

        let matchZOM = function (pattern, expr, idx, rules) {
            return dispatch (["STAR", pattern[1]], expr, idx, rules);
        }

        let matchOOM = function (pattern, expr, idx, rules) {
            return dispatch (["MUL", pattern[1], ["STAR", pattern[1]]], expr, idx, rules);
        }
        
        return {
            parse: parse,
            makeRules: makeRules
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    module.exports = Parser;
    
    // end of Node.js support
}

