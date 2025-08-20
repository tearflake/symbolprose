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
          
            expr = expr.map(e => evalExpr(e, env));
            // Lists: could be builtin call or literal list.
          
            if (Array.isArray (expr)) {
                const head = expr[0];
                if (typeof head === "string" && BUILTINS[head]) {
                    return BUILTINS[head](expr.slice(1), env);
                }
            }
          
            // Literal list: evaluate each element (so lists can contain expressions)
            return expr;//.map(e => evalExpr(e, env));
        }

        const BUILTINS = {
          // (prepend elem lst) -> list
          prepend(args, env) {
            if (args.length !== 2) throw new Error("prepend expects 2 args");
            const elem = evalExpr(args[0], env);
            const lst = evalExpr(args[1], env);
            if (!Array.isArray(lst)) throw new Error("prepend: second arg must be a list");
            return [deepClone(elem), ...lst.map(deepClone)];
          },
          // (first lst) -> any
          first(args, env) {
            if (args.length !== 1) throw new Error("first expects 1 arg");
            const lst = evalExpr(args[0], env);
            if (!Array.isArray(lst)) throw new Error("first: arg must be a list");
            return lst[0];
          },
          // (rest lst) -> list
          rest(args, env) {
            if (args.length !== 1) throw new Error("rest expects 1 arg");
            const lst = evalExpr(args[0], env);
            if (!Array.isArray(lst)) throw new Error("rest: arg must be a list");
            return lst.slice(1);
          }
        };

        function compile (program) {
            program = Sexpr.parse(program);
            if (program.err) {
                return program;
            }

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

        function run (edges, params) {
            params = Sexpr.parse(params);
            if (params.err) {
                return params;
            }

            //const edges = compile (program);
            const env = Object.create(null);
            env["Params"] = params;
            
            let node = "begin"; 
            let guard = 0, GUARD_LIMIT = 1_000_000;
            while (true) {
                if (guard++ > GUARD_LIMIT) throw new Error("Guard limit exceeded");
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

