// interpreter.js
// (c) tearflake, 2025
// MIT License

var Interpreter = (
    function (obj) {
        return {
            compile: obj.compile,
            run: obj.run,
            stringify: obj.stringify
        };
    }
) (
    (function () {
        "use strict";
        
        /** Deep structural equality for arrays and atoms */
        function deepEqual(a, b) {
            if (a === b) return true;
            if (Array.isArray(a) && Array.isArray(b)) {
              if (a.length !== b.length) return false;
              for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
              return true;
            }
            // Distinguish +0/-0, NaN
            return (Number.isNaN (a) && Number.isNaN (b)) ? true : false;
        }

        /** Clone JS value composed of arrays/atoms */
        function deepClone(v) {
            if (Array.isArray (v)) return v.map (deepClone);
            return v;
        }

        /** Evaluate an expression under environment */
        function evalExpr(expr, env) {
          // Atoms: numbers/booleans/null/undefined treated as-is.
            if (!Array.isArray(expr)) {
                if (typeof expr === "string") {
                    // Variable reference if present in env; else treat as string literal.
                    if (Object.prototype.hasOwnProperty.call(env, expr)) return env[expr];
                    return expr;
                }
                return expr;
            }
          
            // Literal list: evaluate each element (so lists can contain expressions)
            expr = expr.map(e => evalExpr(e, env));
            
            // Lists: could be builtin call or literal list.
            if (Array.isArray (expr)) {
                const head = expr[0];
                if (typeof head === "string" && BUILTINS[head]) {
                    return BUILTINS[head](expr.slice(1));
                }
            }
          
            return expr;
        }

        function compile (program) {
            var syntax = `
                (
                    REWRITE
                    (RULE (READ (EXP start)) (WRITE (EXP (\\GRAPH expressions))))
                    
                    (RULE (READ (EXP expressions)) (WRITE (EXP (expression expressions))))
                    (RULE (READ (EXP expressions)) (WRITE (EXP (expression ())         )))

                    (RULE (READ (EXP expression)) (WRITE (EXP (\\EDGE ((\\SOURCE (ATOMIC ())) ((\\INSTR instructions) ((\\TARGET (ATOMIC ())) ())))))))
                    (RULE (READ (EXP expression)) (WRITE (EXP (\\EDGE ((\\SOURCE (ATOMIC ())) ((\\TARGET (ATOMIC ())) ())))                       )))
                    
                    (RULE (READ (EXP instructions)) (WRITE (EXP (instruction instructions))))
                    (RULE (READ (EXP instructions)) (WRITE (EXP (instruction ())          )))

                    (RULE (READ (EXP instruction)) (WRITE (EXP (\\TEST (ANY (ANY ()))))))
                    (RULE (READ (EXP instruction)) (WRITE (EXP (\\HOLD (ANY (ANY ()))))))
                )
            `;
            
            var syntaxRules = Parser.getRules (Sexpr.parse (syntax));
            var pProgram = Sexpr.parse (program);
            
            if (pProgram.err) {
                return pProgram;
            }
            
            var expression = Sexpr.normalizeSexpr (pProgram);
            var ret = Parser.consumeCFG (syntaxRules, "start\\", expression);
            if (ret.err) {
                var path = Sexpr.denormalizeIndexes (ret.path);
                var msg = Sexpr.getNode (program, path);

                return {err: msg.err, found: msg.found, pos: msg.pos};
            }
            else {
                program = pProgram;
                let compiled = [];
                for (let i = 1; i < program.length; i++) {
                    let name = program[i][1][1];
                    if (!compiled [name] && !Object.prototype.hasOwnProperty.call(compiled, name)) {
                        compiled[name] = [];
                    }
                    
                    compiled[name].push (program[i]);
                }
                
                return compiled;
            }
        }

        function run (edges, params) {
            params = Sexpr.parse(params);
            if (params.err) {
                return params;
            }

            //const edges = compile (program);
            const env = Object.create(null);
            env["Params"] = params;
            
            let node = "begin"; 
            let guard = 0, GUARD_LIMIT = 10000;
            while (true) {
                if (guard++ > GUARD_LIMIT) {
                    throw new Error("Guard limit exceeded");
                }
                
                let edgeSet = edges[node];
                if (!edgeSet) {
                    throw new Error (`Uknown node: ${node}`);
                }

                loop1: for (let i = 0; i < edgeSet.length; i++) {
                    let edge = edgeSet[i];
                    
                    if (edge.length === 4) {
                        node = edge[3][1];
                        for (let j = 1; j < edge[2].length; j++) {
                            let instr = edge[2][j];
                            if (instr[0] === "HOLD") {
                                env[instr[1]] = deepClone(evalExpr(instr[2], env));
                            }
                            else if (instr[0] === "TEST") {
                                const a = evalExpr(instr[1], env);
                                const b = evalExpr(instr[2], env);
                                if (!deepEqual(a, b)) {
                                    continue loop1;
                                }
                            }
                        }
                        
                        break;
                    }
                    else {
                        node = edge[2][1];
                    }
                }
                
                if (node  === "end") {
                    break;
                }
            }

            return env["Result"] || "NIL";
        }
        
        var stringify = function (arr) {
            return Sexpr.stringify (arr);
        }

        return {
            compile: compile,
            run: run,
            stringify: stringify,
        }
    }) ()
);

