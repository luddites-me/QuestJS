import { Base } from "../base";

// ============  Random Utilities  =======================================
// @DOC
// ## Random Functions
// @UNDOC
export class Rndm extends Base {
  buffer = [];

  // @DOC
  // Returns a random number from 0 to n1, or n1 to n2, inclusive.
  int(n1: number, n2?: number) {
    if (this.buffer.length > 0) return this.buffer.shift();
    if (n2 === undefined) {
      n2 = n1;
      n1 = 0;
    }
    return Math.floor(Math.random() * (n2 - n1 + 1)) + n1;
  }

  // @DOC
  // Returns true 'percentile' times out of 100, false otherwise.
  chance(percentile) {
    return this.int(99) < percentile;
  }

  // @DOC
  // Returns a random element from the array, or null if it is empty
  // If the second parameter is true, then the selected value is also deleted from the array,
  // preventing it from being selected a second time.
  // If sent a string instead of an array, the string will be broken into an array on |.
  fromArray(arr: any[], deleteEntry = false) {
    if (arr.length === 0) return null;
    const index = this.int(arr.length - 1);
    const res = arr[index];
    if (deleteEntry) arr.splice(index, 1);
    return res;
  };

  // @DOC
  // Returns the given array, in random order using the Fisher-Yates algorithm
  shuffle(arr) {
    if (typeof arr === 'number') arr = [...Array(arr).keys()];
    const res = [];
    while (arr.length > 0) {
      res.push(this.fromArray(arr, true));
    }
    return res;
  };

  // @DOC
  // Returns a random number based on the standard RPG dice notation.
  // For example 2d6+3 means roll two six sided dice and add three.
  // Returns he number if sent a number.
  // It can cope with complex strings such as 2d8-3d6
  // You can also specify unusual dice, i.e., not a sequence from one to n, by separating each value with a colon,
  // so d1:5:6 rolls a three sided die, with 1, 5 and 6 on the sides.
  // It will cope with any number of parts, so -19+2d1:5:6-d4 will be fine.
  dice(s) {
    if (typeof s === 'number') return s;
    s = s.replace(/ /g, '').replace(/\-/g, '+-');
    let total = 0;

    for (let dice of s.split('+')) {
      if (dice === '') continue;
      let negative = 1;
      if (/^\-/.test(dice)) {
        dice = dice.substring(1);
        negative = -1;
      }
      if (/^\d+$/.test(dice)) {
        total += parseInt(dice);
      } else {
        if (/^d/.test(dice)) {
          dice = `1${dice}`;
        }
        const parts = dice.split('d');
        if (
          parts.length === 2 &&
          /^\d+$/.test(parts[0]) &&
          /^[0-9\:]+$/.test(parts[1])
        ) {
          const number = parseInt(parts[0]);
          for (let i = 0; i < number; i += 1) {
            if (/^\d+$/.test(parts[1])) {
              total += negative * this.int(1, parseInt(parts[1]));
            } else {
              total += negative * parseInt(this.fromArray(parts[1].split(':')));
            }
          }
        } else {
          this.log.info(
            `Can't parse dice type (but will attempt to use what I can): ${dice}`,
          );
          this.io.errormsg(
            `Can't parse dice type (but will attempt to use what I can): ${dice}`,
          );
        }
      }
    }
    return total;
  }

  // @DOC
  // Loads up a buffer with the given number or array of numbers.
  // The this.int function will grab the first number from the buffer and return that instead of a random
  // number, if there is anything in the buffer. Note that the other random functions all use this.int,
  // so you can use this.prime to force any of them to return a certain value. Note that there is no
  // checking, so this.int(4) could return 7 or even "seven". It is up to you to ensure the numbers you
  // prime the buffer with make sense.
  // This is most useful when testing, as you know in advance what the random number will be.
  prime(ary) {
    if (typeof ary === 'number') ary = [ary];
    for (const el of ary) this.buffer.push(el);
  };
}
