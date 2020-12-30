export class List {
  static subtract(a, b) {
    if (!Array.isArray(b))
      b = [b];
    const res = [];
    for (let i = 0; i < a.length; i += 1) {
      if (!b.includes(a[i]))
        res.push(a[i]);
    }
    return res;
  }
  static compare(a, b) {
    if (!Array.isArray(b))
      return false;
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i += 1) {
      if (b[i] !== a[i])
        return false;
    }
    return true;
  }
  static compareUnordered(a, b) {
    if (!Array.isArray(b))
      return false;
    if (a.length !== b.length)
      return false;
    for (const el of a) {
      if (!b.includes(el))
        return false;
    }
    return true;
  }
  static remove(ary, el) {
    const index = ary.indexOf(el);
    if (index !== -1) {
      ary.splice(index, 1);
    }
  }
  static filterByAttribute(ary, attName, value) {
    return ary.filter((el) => el[attName] === value);
  }
  static next(ary, el, circular) {
    const index = ary.indexOf(el) + 1;
    if (index === 0)
      return false;
    if (index === ary.length)
      return circular ? ary[0] : false;
    return ary[index];
  }
  static array(ary, el, att, circular) {
    let o = el;
    let count = ary.length;
    while (o && !o[att] && count > 0) {
      o = List.next(ary, o, circular);
      count -= 1;
    }
    if (!o || !o[att])
      return false;
    return o;
  }
  static clone(ary, options) {
    if (!options)
      options = {};
    let newary = options.compress ? [...new Set(ary)] : [...ary];
    if (options.value)
      newary = newary.map((el) => el[options.value]);
    if (options.function)
      newary = newary.map((el) => el[options.function]());
    if (options.attribute)
      newary = newary.map((el) => typeof el[options.attribute] === "function" ? el[options.attribute]() : el[options.attribute]);
    return options.reverse ? newary.reverse() : newary;
  }
}
