// interpreter.js
// (c) tearflake, 2025
// MIT License

var Interpreter = (
    function (obj) {
        return {
            parse: obj.parse,
            run: obj.run,
            runLowLevel: obj.runLowLevel,
            stringify: obj.stringify
        };
    }
) (
    (function () {
        "use strict";
        
        function parse (program) {
            let syntax = `
            (SEQUENCE
                'GRAPH'
                (ONEORMORE
                    (SEQUENCE
                        'EDGE'
                        (SEQUENCE 'SOURCE' ATOMIC)
                        (OPTIONAL
                            (SEQUENCE
                                'INSTR'
                                (ONEORMORE
                                    (CHOICE
                                        (SEQUENCE 'TEST' ANY ANY)
                                        (SEQUENCE 'ASGN' ATOMIC ANY)))))
                        (SEQUENCE 'TARGET' ATOMIC))))
            `;
            
            let sSyntax = Sexpr.parse (syntax);
            let sProgram = Sexpr.parse (program);
            
            if (sProgram.err) {
                return sProgram;
            }
            
            let ast = Parser.parse (sProgram, sSyntax);
            
            if (ast.err) {
                let msg = Sexpr.getNode (program, ast.path);
                return {err: msg.err, found: msg.found, pos: msg.pos};
            }
            else {
                return ast;
            }
        }
        
        function makeGraph (sexpr) {
            let graph = [];
            // GRAPH
            let grph = sexpr;
            for (let i = 1; i < grph.length; i++) {
                let elem = grph[i];
                // EDGE
                if (elem[0] === "EDGE") {
                    // SOURCE
                    let source = elem[1][1];
                    if (!graph[source] && !Object.prototype.hasOwnProperty.call(graph, source)) {
                        graph[source] = [];
                    }
                    
                    if (elem.length === 4) {
                        let instructionSet = [];
                        let instrs = elem[2];
                        // INSTR
                        for (let j = 1; j < instrs.length; j++) {
                            let instr = instrs[j];
                            var instruction;
                            // ASGN
                            if (instr[0] === "ASGN") {
                                instruction = {name: "ASGN", var: instr[1], value: instr [2]}
                            }
                            // TEST
                            else if (instr[0] === "TEST") {
                                instruction = {name: "TEST", lft: instr[1], rgt: instr [2]}
                            }
                            
                            instructionSet.push (instruction);
                        }
                        
                        // TARGET
                        graph[source].push ({instructions: instructionSet, target: elem[3][1]});
                    }
                    else if (elem.length === 3) {
                        // TARGET
                        graph[source].push ({instructions: [], target: elem[2][1]});
                    }
                }
            }
            
            return graph;
        }

        function deepClone(v) {
            if (Array.isArray (v)) return v.map (deepClone);
            return v;
        }

        function deepEqual(a, b) {
            if (a === b) return true;
            if (Array.isArray (a) && Array.isArray (b)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
                return true;
            }
            return (Number.isNaN (a) && Number.isNaN (b)) ? true : false;
        }

        function evalExpr(expr, env) {
            if (!Array.isArray (expr)) {
                if (typeof expr === "string") {
                    if (Object.prototype.hasOwnProperty.call (env, expr)) return env[expr];
                    return expr;
                }
                return expr;
            }
            
            expr = expr.map(e => evalExpr (e, env));
            
            if (Array.isArray (expr)) {
                const head = expr[0];
                if (typeof head === "string" && BUILTINS[head]) {
                    return BUILTINS[head] (expr);
                }
            }
          
            return expr;
        }

        function run (program, params) {
            var params = Sexpr.parse (params);
            if (params.err) return params;
            return runLowLevel (makeGraph (program), params);
        }

        function runLowLevel (graph, params) {
            const env = Object.create(null);
            env["PARAMS"] = params;
            env["RESULT"] = "NIL";
            
            let node = "BEGIN"; 
            let guard = 0, GUARD_LIMIT = 10000;
            try {
                loop1: while (node !== "END") {
                    if (guard++ > GUARD_LIMIT) {
                        throw new Error ("Guard limit exceeded");
                    }
                    else if (Array.isArray (node)) {
                        throw new Error (`Error - node can not be a list: ${node}`);
                    }
                    
                    let edges = graph[node];
                    if (!edges) {
                        throw new Error (`Uknown node: ${node}`);
                    }

                    loop2: for (let i = 0; i < edges.length; i++) {
                        let edge = edges[i];
                        for (let j = 0; j < edge.instructions.length; j++) {
                            let instruction = edge.instructions[j];
                            if (instruction.name === "ASGN") {
                                env[instruction.var] = evalExpr (instruction.value, env);
                            }
                            else if (instruction.name === "TEST") {
                                const a = evalExpr (instruction.lft, env);
                                const b = evalExpr (instruction.rgt, env);
                                if (!deepEqual (a, b)) {
                                    continue loop2;
                                }
                            }
                        }
                        
                        node = evalExpr (edge.target, env);
                        continue loop1;
                    }
                }

                return env["RESULT"];
            }
            catch (e) {
                return {err: e.message};
            }
        }
        
        var stringify = function (arr) {
            return Sexpr.stringify (arr);
        }

        return {
            parse: parse,
            run: run,
            runLowLevel: runLowLevel,
            stringify: stringify,
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    var Sexpr = require ("./s-expr.js");
    var Sexpr = require ("./parser.js");
    module.exports = Interpreter;
    
    // end of Node.js support
}

