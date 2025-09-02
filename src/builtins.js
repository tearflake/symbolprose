const BUILTINS = {
  /*
  MATH FUNCTIONS
  */
  
  // (add elem elem) -> elem
  add(args) {
    if (args.length !== 2) throw new Error("add expects 2 args");
    const lft = Number(args[0]);
    const rgt = Number(args[1]);
    return (lft + rgt).toString();
  },
  
  // (add elem elem) -> elem
  sub(args) {
    if (args.length !== 2) throw new Error("sub expects 2 args");
    const lft = Number(args[0]);
    const rgt = Number(args[1]);
    return (lft - rgt).toString();
  },
  
  // (add elem elem) -> elem
  mul(args) {
    if (args.length !== 2) throw new Error("mul expects 2 args");
    const lft = Number(args[0]);
    const rgt = Number(args[1]);
    return (lft * rgt).toString();
  },
  
  // (add elem elem) -> elem
  div(args) {
    if (args.length !== 2) throw new Error("div expects 2 args");
    const lft = Number(args[0]);
    const rgt = Number(args[1]);
    return (lft / rgt).toString();
  },
  
  // (mod elem elem) -> elem
  mod(args) {
    if (args.length !== 2) throw new Error("mod expects 2 args");
    const lft = Number(args[0]);
    const rgt = Number(args[1]);
    return (lft % rgt).toString();
  },
  
  // (add elem elem) -> elem
  pow(args) {
    if (args.length !== 2) throw new Error("pow expects 2 args");
    const lft = Number(args[0]);
    const rgt = Number(args[1]);
    return (Math.pow(lft, rgt)).toString();
  },
  
  // (add elem elem) -> elem
  log(args) {
    if (args.length !== 1) throw new Error("log expects 1 arg");
    const param = Number(args[0]);
    return (Math.log(param)).toString();
  },
  
  
  /*
  STRING FUNCTIONS
  */

  // (strlen elem) -> elem
  strlen(args) {
    const elem = args[0];
    if (typeof elem !== "string") throw new Error("strlen: first arg must be an atom");
    return elem.length.toString();
  },

  // (strcat elem elem) -> elem
  strcat(args) {
    if (args.length !== 2) throw new Error("strcat expects 2 args");
    const elem1 = args[0];
    const elem2 = args[1];
    if (typeof elem1 !== "string") throw new Error("strcat: first arg must be an atom");
    if (typeof elem2 !== "string") throw new Error("strcat: first arg must be an atom");
    return "" + elem1 + elem2;
  },

  // (charat elem) -> elem
  charat(args) {
    const elem1 = args[0];
    const elem2 = args[1];
    if (typeof elem1 !== "string") throw new Error("charat: first arg must be an atom");
    if (typeof elem2 !== "string") throw new Error("charat: first arg must be an atom");
    return elem1.charAt(elem2);
  },

  // (substr elem elem elem) -> elem
  substr(args) {
    if (args.length !== 3) throw new Error("substr expects 3 args");
    const elem1 = args[0];
    const elem2 = args[1];
    const elem3 = args[1];
    if (typeof elem1 !== "string") throw new Error("substr: first arg must be an atom");
    if (typeof elem2 !== "string") throw new Error("substr: second arg must be an atom");
    if (typeof elem3 !== "string") throw new Error("substr: third arg must be an atom");
    return elem1.substring(elem2, elem3);
  },

  /*
  LIST FUNCTIONS
  */
  
  // (nth elem list) -> elem
  nth(args) {
    if (args.length !== 2) throw new Error("nth expects 2 args");
    const elem = args[0];
    const lst = args[1];
    if (!Array.isArray(lst)) throw new Error("nth: second arg must be a list");
    return lst[elem];
  },
  
  // (prepend elem lst) -> list
  prepend(args) {
    if (args.length !== 2) throw new Error("prepend expects 2 args");
    const elem = args[0];
    const lst = args[1];
    if (!Array.isArray(lst)) throw new Error("prepend: second arg must be a list");
    return [elem, ...lst];
  },
  
  // (append elem lst) -> list
  append(args) {
    if (args.length !== 2) throw new Error("append expects 2 args");
    const lst = args[0];
    const elem = args[1];
    if (!Array.isArray(lst)) throw new Error("append: first arg must be a list");
    return [...lst, elem];
  },
  
  // (concat lst lst) -> lst
  concat(args) {
    if (args.length !== 2) throw new Error("concat expects 2 args");
    const lst1 = args[0];
    const lst2 = args[1];
    if (!Array.isArray(lst1)) throw new Error("concat: first arg must be a list");
    if (!Array.isArray(lst2)) throw new Error("concat: second arg must be a list");
    return [...lst1, ...lst2];
  },
  
  // (first lst) -> any
  first(args) {
    const lst = args;
    if (!Array.isArray(lst)) throw new Error("first: arg must be a list");
    return lst[0];
  },
  
  // (rest lst) -> list
  rest(args) {
    const lst = args;
    if (!Array.isArray(lst)) throw new Error("rest: arg must be a list");
    return lst.slice(1);
  },
  
  // (first lst) -> any
  lstlen(args) {
    const lst = args;
    if (!Array.isArray(lst)) throw new Error("lstlen: arg must be a list");
    return lst.length.toString();
  }
};

