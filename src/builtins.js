const BUILTINS = {
  // (prepend elem lst) -> list
  PREPEND(args) {
    if (args.length !== 3) throw new Error("PREPEND expects 2 args");
    const elem = args[1];
    const lst = args[2];
    if (!Array.isArray(lst)) throw new Error("PREPEND: second arg must be a list");
    return [elem, ...lst];
  },
  
  // (first lst) -> any
  FIRST(args) {
    if (args.length !== 2) throw new Error("FIRST expects 1 arg");
    const lst = args[1]
    if (!Array.isArray(lst)) throw new Error("FIRST: arg must be a list");
    return lst[0];
  },
  
  // (rest lst) -> list
  REST(args) {
    if (args.length !== 2) throw new Error("REST expects 1 arg");
    const lst = args[1]
    if (!Array.isArray(lst)) throw new Error("REST: arg must be a list");
    return lst.slice(1);
  },
  
  // (run graph any) -> any
  RUN(args) {
    if (args.length !== 3) throw new Error("RUN expects 2 args");
    const prg = args[1]
    const prm = args[2]
    if (!prg.graph) throw new Error("RUN: first arg must be a program variable");
    return Interpreter.runLowLevel(prg, prm);
  }
};

