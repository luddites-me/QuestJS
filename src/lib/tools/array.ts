
// ============  Array Utilities  =======================================
// @DOC
// ## Array (List) Functions
// @UNDOC
export class List {
  // @DOC
  // Returns a new array, derived by subtracting each element in b from the array a.
  // If b is not an array, then b itself will be removed.
  // Unit tested.
  public static subtract(a, b) {
    if (!Array.isArray(b)) b = [b];
    const res = [];
    for (let i = 0; i < a.length; i += 1) {
      if (!b.includes(a[i])) res.push(a[i]);
    }
    return res;
  }

  // @DOC
  // Returns true if the arrays a and b are equal. They are equal if both are arrays, they have the same length,
  // and each element in order is the same.
  // Assumes a is an array, but not b.
  // Unit tested
  public static compare(a, b) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (b[i] !== a[i]) return false;
    }
    return true;
  }

  // @DOC
  // Returns true if each element in a matches the elements in b, but not necessarily in the same order
  // (assumes each element is unique; repeated elements may give spurious results).
  // Assumes a is an array, but not b.
  // Unit tested
  public static compareUnordered(a, b) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (const el of a) {
      if (!b.includes(el)) return false;
    }
    return true;
  }

  // @DOC
  // Removes the element el from the array, ary.
  // Unlike List.subtract, no new array is created; the original aray is modified, and nothing is returned.
  public static remove(ary, el) {
    const index = ary.indexOf(el);
    if (index !== -1) {
      ary.splice(index, 1);
    }
  }

  // @DOC
  // Returns a new array based on ary, but including only those objects for which the attribute attName is equal to value.
  // To filter for objects that do not have the attribute you can filter for the value undefined.
  public static filterByAttribute(ary, attName, value) {
    return ary.filter((el) => el[attName] === value);
  }

  // @DOC
  // Returns the next element after el from the array, ary.
  // If el is present more than once, it goes with the first.
  // If el is the last element, and circular is true it return the fist element and false otherwise.
  public static next(ary, el, circular) {
    const index = ary.indexOf(el) + 1;
    if (index === 0) return false;
    if (index === ary.length) return circular ? ary[0] : false;
    return ary[index];
  }

  // @DOC
  // Returns the next element after el from the array, ary, for which the attribute, att, is true.
  // If el is present more than once, it goes with the first.
  // If el is the last element, and circular is true it return the fist element and false otherwise.
  public static array(ary, el, att, circular) {
    let o = el;
    let count = ary.length;
    while (o && !o[att] && count > 0) {
      o = List.next(ary, o, circular);
      count -= 1;
    }
    if (!o || !o[att]) return false;
    return o;
  }

  // @DOC
  // Returns a copy of the given array. Members of the array are not cloned.
  public static clone(ary, options) {
    if (!options) options = {};
    let newary = options.compress ? [...new Set(ary)] : [...ary];
    if (options.value) newary = newary.map((el) => el[options.value]);
    if (options.function) newary = newary.map((el) => el[options.function]());
    if (options.attribute)
      newary = newary.map((el) =>
        typeof el[options.attribute] === 'function'
          ? el[options.attribute]()
          : el[options.attribute],
      );
    return options.reverse ? newary.reverse() : newary;
  }
}
