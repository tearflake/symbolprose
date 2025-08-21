const BUILTINS = {
  // (prepend elem lst) -> list
  //prepend(args, env) {
  PREPEND(args) {
    if (args.length !== 2) throw new Error("prepend expects 2 args");
    //const elem = evalExpr(args[0], env);
    //const lst = evalExpr(args[1], env);
    const elem = args[0];
    const lst = args[1];
    if (!Array.isArray(lst)) throw new Error("prepend: second arg must be a list");
    //return [deepClone(elem), ...lst.map(deepClone)];
    return [elem, ...lst];
  },
  // (first lst) -> any
  //first(args, env) {
  FIRST(args) {
    if (args.length !== 1) throw new Error("first expects 1 arg");
    //const lst = evalExpr(args[0], env);
    const lst = args[0]
    if (!Array.isArray(lst)) throw new Error("first: arg must be a list");
    return lst[0];
  },
  // (rest lst) -> list
  //rest(args, env) {
  REST(args) {
    if (args.length !== 1) throw new Error("rest expects 1 arg");
    //const lst = evalExpr(args[0], env);
    const lst = args[0]
    if (!Array.isArray(lst)) throw new Error("rest: arg must be a list");
    return lst.slice(1);
  }
};

