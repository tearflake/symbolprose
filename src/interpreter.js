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

        function getRules (arr, file, level, parents, Files, rec) {
            var rules = [];
            var stack = [];
            var p = [];
            if (level === undefined) {
                level = 0;
            }
            
            stack.push ({ast: arr, level: level, parents});
            while (stack.length > 0){
                var node = stack.pop ();
                if (node.ast[0] === "REWRITE") {
                    if (node.index) {
                        p.pop ();
                        p.push (node.index)
                    }
                    
                    for(var i = node.ast.length - 1; i >= 1 && node.ast[i] !== "RULE" ; i--) {
                        stack.push ({parents: [node.ast, node.parents], ast: node.ast[i], level: node.level + 1, index: i});
                    }
                    
                    for(var i = node.ast.length - 1; i >= 1 && node.ast[i] === "RULE" ; i--) {
                        stack.push ({parents: [node.ast, node.parents], ast: node.ast[i], level: node.level + 1, index: i});
                    }
                }
                else if (node.ast[0] === "RULE") {
                    var rule = node.ast;
                    var v = [];
                    var varsOffset = 0;
                    if (rule[1][0] === "VAR") {
                        varsOffset = 1;
                        for (var j = 1; j < rule[1].length; j++) {
                            if (-Ruler.getLvl (rule[1][j]) !== 0){
                                return {err: "Can not escape variable definition error", file: file, path: p.concat ([node.index, 1, j])};
                            }
                            v.push (rule[1][j]);
                        }
                    }
                    
                    var r = {read: [], write: []};
                    for (var j = 1; j < rule[1 + varsOffset][1].length; j++) {
                        r.read.push (rule[1 + varsOffset][1][j]);
                    }
                    
                    for (var j = 1; j < rule[2 + varsOffset][1].length; j++) {
                        r.write.push (rule[2 + varsOffset][1][j]);
                    }
                    
                    r.read = Sexpr.flatten (r.read[0]);
                    r.write = Sexpr.flatten (r.write[0]);
                    
                    r.read = Ruler.levelShift (r.read, node.level);
                    r.write = Ruler.levelShift (r.write, node.level);
                    
                    r.maxLvlR = Ruler.getMaxLvl (r.read, 0, r.read.length, v);
                    r.maxLvlW = Ruler.getMaxLvl (r.write, 0, r.write.length, v);
                    
                    rules.push ({vars: v, rule: r, level: node.level, parents: node.parents});
                }
            }

            return rules;
        };

        function compile (program) {
            var syntax = `
                (
                    REWRITE
                    (RULE (READ (EXP start)) (WRITE (EXP (\\GRAPH expressions))))
                    
                    (RULE (READ (EXP expressions)) (WRITE (EXP (expression expressions))))
                    (RULE (READ (EXP expressions)) (WRITE (EXP (expression ())         )))

                    (RULE (READ (EXP expression)) (WRITE (EXP (\\EDGE ((\\SOURCE (ATOMIC ())) ((\\MID instructions) ((\\TARGET (ATOMIC ())) ())))))))
                    (RULE (READ (EXP expression)) (WRITE (EXP (\\EDGE ((\\SOURCE (ATOMIC ())) ((\\TARGET (ATOMIC ())) ()))))))
                    
                    (RULE (READ (EXP instructions)) (WRITE (EXP (instruction instructions))))
                    (RULE (READ (EXP instructions)) (WRITE (EXP (instruction ())          )))

                    (RULE (READ (EXP instruction)) (WRITE (EXP (\\TEST (ANY (ANY ()))))))
                    (RULE (READ (EXP instruction)) (WRITE (EXP (\\HOLD (ANY (ANY ()))))))
                )
            `;
            
            var syntaxRules = getRules (Sexpr.parse (syntax));
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

