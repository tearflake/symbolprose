const BUILTINS = {
  /*
  MATH FUNCTIONS
  */
  
  // (add elem elem) -> elem
  add(args) {
    if (args[2].length !== 3) return undefined;
    const lft = Number(args[2][1]);
    const rgt = Number(args[2][2]);
    return (lft + rgt).toString();
  },
  
  // (add elem elem) -> elem
  sub(args) {
    if (args[2].length !== 3) return undefined;
    const lft = Number(args[2][1]);
    const rgt = Number(args[2][2]);
    return (lft - rgt).toString();
  },
  
  // (add elem elem) -> elem
  mul(args) {
    if (args[2].length !== 3) return undefined;
    const lft = Number(args[2][1]);
    const rgt = Number(args[2][2]);
    return (lft * rgt).toString();
  },
  
  // (add elem elem) -> elem
  div(args) {
    if (args[2].length !== 3) return undefined;
    const lft = Number(args[2][1]);
    const rgt = Number(args[2][2]);
    return (lft / rgt).toString();
  },
  
  // (mod elem elem) -> elem
  mod(args) {
    if (args[2].length !== 3) return undefined;
    const lft = Number(args[2][1]);
    const rgt = Number(args[2][2]);
    return (lft % rgt).toString();
  },
  
  // (add elem elem) -> elem
  pow(args) {
    if (args[2].length !== 3) return undefined;
    const lft = Number(args[2][1]);
    const rgt = Number(args[2][2]);
    return (Math.pow(lft, rgt)).toString();
  },
  
  // (add elem elem) -> elem
  log(args) {
    if (args[2].length !== 2) return undefined;
    const param = Number(args[2][1]);
    return (Math.log(param)).toString();
  },
  
  
  /*
  STRING FUNCTIONS
  */

  // (strlen elem) -> elem
  strlen(args) {
    if (args[2].length !== 2) return undefined;
    const elem = args[2][1];
    if (typeof elem !== "string") return undefined;
    return elem.length.toString();
  },

  // (strcat elem elem) -> elem
  strcat(args) {
    if (args[2].length !== 3) return undefined;
    const elem1 = args[2][1];
    const elem2 = args[2][2];
    if (typeof elem1 !== "string") return undefined;
    if (typeof elem2 !== "string") return undefined;
    return "" + elem1 + elem2;
  },

  // (charat elem) -> elem
  charat(args) {
    if (args[2].length !== 3) return undefined;
    const elem1 = args[2][1];
    const elem2 = args[2][2];
    if (typeof elem1 !== "string") return undefined;
    if (typeof elem2 !== "string") return undefined;
    return elem1.charAt(elem2);
  },

  // (substr elem elem elem) -> elem
  substr(args) {
    if (args[2].length !== 4) return undefined;
    const elem1 = args[2][1];
    const elem2 = args[2][2];
    const elem3 = args[2][3];
    if (typeof elem1 !== "string") return undefined;
    if (typeof elem2 !== "string") return undefined;
    if (typeof elem3 !== "string") return undefined;
    return elem1.substring(elem2, elem3);
  },

  /*
  LIST FUNCTIONS
  */
  
  // (nth elem list) -> elem
  nth(args) {
    if (args[2].length !== 3) return undefined;
    const elem = args[2][1];
    const lst = args[2][2];
    if (!Array.isArray(lst)) return undefined;
    if (lst[elem]) return lst[elem];
    return [];
  },
  
  // (prepend elem lst) -> list
  prepend(args) {
    if (args[2].length !== 3) return undefined;
    const elem = args[2][1];
    const lst = args[2][2];
    if (!Array.isArray(lst)) return undefined;
    return [elem, ...lst];
  },
  
  // (append elem lst) -> list
  append(args) {
    if (args[2].length !== 3) return undefined;
    const lst = args[2][1];
    const elem = args[2][2];
    if (!Array.isArray(lst)) return undefined;
    return [...lst, elem];
  },
  
  // (concat lst lst) -> lst
  concat(args) {
    if (args[2].length !== 3) return undefined;
    const lst1 = args[2][1];
    const lst2 = args[2][2];
    if (!Array.isArray(lst1)) return undefined;
    if (!Array.isArray(lst2)) return undefined;
    return [...lst1, ...lst2];
  },
  
  // (first lst) -> any
  first(args) {
    if (args[2].length !== 2) return undefined;
    const lst = args[2][1];
    if (!Array.isArray(lst)) return undefined;
    return lst[0];
  },
  
  // (rest lst) -> list
  rest(args) {
    if (args[2].length !== 2) return undefined;
    const lst = args[2][1];
    if (!Array.isArray(lst)) return undefined;
    return lst.slice(1);
  },
  
  // (first lst) -> any
  lstlen(args) {
    if (args[2].length !== 2) return undefined;
    const lst = args[2][1];
    if (!Array.isArray(lst)) return undefined;
    return lst.length.toString();
  }
};

