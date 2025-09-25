// interpreter.js
// (c) tearflake, 2025
// MIT License

var Interpreter = (
    function (obj) {
        return {
            parse: obj.parse,
            run: obj.run,
        };
    }
) (
    (function () {
        "use strict";
        
        function parse (program) {
            let syntax = `
            (
                GRAMMAR
                (RULE <start> <graph>)

                (RULE
                    <graph>
                    (GROUP (MUL "GRAPH" <element> (STAR <element>))))

                (RULE
                    <element>
                    (ADD
                        (
                            GROUP
                            (MUL
                                "EDGE"
                                (GROUP (MUL "SOURCE" ATOMIC))
                                (ADD
                                    (GROUP (MUL "INSTR" <instruction> (STAR <instruction>)))
                                    ONE)
                                (GROUP (MUL "TARGET" ATOMIC))))
                        (GROUP (MUL "COMPUTE" (GROUP (MUL "NAME" ATOMIC)) <graph>))))

                (RULE
                    <instruction>
                    (ADD
                        (GROUP (MUL "TEST" ANY ANY))
                        (GROUP (MUL "ASGN" ATOMIC ANY)))))
            `;
            
            let sSyntax = SExpr.parse (syntax);
            let sProgram = SExpr.parse (program);
            
            if (sProgram.err) {
                return sProgram;
            }
            
            let ast = Parser.parse (sSyntax, program);
            
            if (ast.err) {
                let msg = SExpr.getPosition (program, ast.path);
                return {err: msg.err, found: msg.found, pos: msg.pos};
            }
            else {
                return ast;
            }
        }
        
        function makeGraph (sexpr) {
            let graph = {item: [], children: [], parent: null};
            // GRAPH
            let grph = sexpr;
            for (let i = 1; i < grph.length; i++) {
                let elem = grph[i];
                // EDGE
                if (elem[0] === "EDGE") {
                    // SOURCE
                    let source = elem[1][1];
                    if (!graph.item[source] && !Object.prototype.hasOwnProperty.call(graph.item, source)) {
                        graph.item[source] = [];
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
                        graph.item[source].push ({instructions: instructionSet, target: elem[3][1]});
                    }
                    else if (elem.length === 3) {
                        // TARGET
                        graph.item[source].push ({instructions: [], target: elem[2][1]});
                    }
                }
                // COMPUTE
                else if (elem[0] === "COMPUTE") {
                    graph.children[elem[1][1]] = makeGraph (elem[2])
                    graph.children[elem[1][1]].parent = graph;
                }
            }
            
            return graph;
        }

        function run (program, params) {
            var params = SExpr.parse (params);
            if (params.err) return params;
            return runLowLevel (makeGraph (program), quote (params));
        }

        function runLowLevel (graph, params) {
            const env = Object.create(null);
            env["PARAMS"] = params;
            env["RESULT"] = "NIL";
            
            let node = "BEGIN"; 
            let guard = 0, GUARD_LIMIT = 100000;
            try {
                loop1: while (node !== "END") {
                    if (guard++ > GUARD_LIMIT) {
                        throw new Error ("Guard limit exceeded");
                    }
                    else if (Array.isArray (node)) {
                        throw new Error (`Error - node can not be a list: ${node}`);
                    }
                    
                    let edges = graph.item[node];
                    if (!edges) {
                        throw new Error (`Uknown node: ${node}`);
                    }

                    loop2: for (let i = 0; i < edges.length; i++) {
                        let edge = edges[i];
                        for (let j = 0; j < edge.instructions.length; j++) {
                            let instruction = edge.instructions[j];
                            if (instruction.name === "ASGN") {
                                var res = evalExpr (instruction.value, graph, env);
                                if (res.err)
                                    return res;
                                    
                                env[instruction.var] = res;
                            }
                            else if (instruction.name === "TEST") {
                                const a = evalExpr (instruction.lft, graph, env);
                                if (a.err)
                                    return a;
                                    
                                const b = evalExpr (instruction.rgt, graph, env);
                                if (b.err)
                                    return b;
                                    
                                if (!deepEqual (a, b)) {
                                    continue loop2;
                                }
                            }
                        }
                        
                        node = edge.target;
                        continue loop1;
                    }
                    
                    return {err: "Runtime error: no more fallback edges from node: " + node};
                }

                return env["RESULT"].err ? env["RESULT"] : unquote (env["RESULT"]);
            }
            catch (e) {
                return {err: e.message};
            }
        }

        function evalExpr(expr, graph, env) {
            if (!Array.isArray (expr)) {
                if (Object.prototype.hasOwnProperty.call (env, expr)) {
                    return env[expr];
                }
                else {
                    return expr;
                }
            }

            expr = expr.map(e => evalExpr (e, graph, env));

            if (expr[0] === "RUN" && expr.length === 3) {
                if (Object.prototype.hasOwnProperty.call (env, expr[1])) {
                    expr[1] = env[expr[1]];
                }

                let parent = graph;
                while (parent) {
                    let child = parent.children[expr[1]];
                    if (child) {
                        return runLowLevel (child, evalExpr (expr[2], graph, env));
                    }
                    parent = parent.parent;
                }
                
                if (expr[1] === "stdlib") {
                    let fnName = expr[2][0];
                    if (BUILTINS[fnName]) {
                        return BUILTINS[fnName](["RUN", "stdlib", evalExpr (expr[2], graph, env)]);
                    }
                    else {
                        return {err: `Undefined stdlib function ${fnName}`};
                    }
                }

                return {err: `Undefined function ${expr[1]}`};
            }
      
            return expr;
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
        
        function unquote(expr) {
            if (!Array.isArray (expr)) {
                if (expr.charAt (0) === '"' && expr.charAt (expr.length - 1) === '"') {
                    return expr.substring (1, expr.length - 1);
                }
                else {
                    return `${expr}`;
                }
            }
      
            return expr.map(e => unquote (e));
        }

        function quote(expr) {
            if (!Array.isArray (expr)) {
                return `"${expr}"`;
            }
      
            return expr.map(e => quote (e));
        }

        return {
            parse: parse,
            run: run,
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    var SExpr = require ("./s-expr.js");
    var SExpr = require ("./parser.js");
    module.exports = Interpreter;
    
    // end of Node.js support
}

