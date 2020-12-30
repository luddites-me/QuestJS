import {Base} from "../base.js";
import {toInt} from "./tools.js";
export class Rndm extends Base {
  constructor() {
    super(...arguments);
    this.buffer = [];
  }
  int(n1, n2) {
    if (this.buffer.length > 0)
      return this.buffer.shift();
    if (n2 === void 0) {
      n2 = n1;
      n1 = 0;
    }
    return Math.floor(Math.random() * (n2 - n1 + 1)) + n1;
  }
  chance(percentile) {
    return this.int(99) < percentile;
  }
  fromArray(arr, deleteEntry = false) {
    if (arr.length === 0)
      return null;
    const index = this.int(arr.length - 1);
    const res = arr[index];
    if (deleteEntry)
      arr.splice(index, 1);
    return res;
  }
  shuffle(arr) {
    if (typeof arr === "number")
      arr = [...Array(arr).keys()];
    const res = [];
    while (arr.length > 0) {
      res.push(this.fromArray(arr, true));
    }
    return res;
  }
  dice(s) {
    if (typeof s === "number")
      return s;
    s = s.replace(/ /g, "").replace(/\-/g, "+-");
    let total = 0;
    for (let dice of s.split("+")) {
      if (dice === "")
        continue;
      let negative = 1;
      if (/^\-/.test(dice)) {
        dice = dice.substring(1);
        negative = -1;
      }
      if (/^\d+$/.test(dice)) {
        total += toInt(dice);
      } else {
        if (/^d/.test(dice)) {
          dice = `1${dice}`;
        }
        const parts = dice.split("d");
        if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^[0-9\:]+$/.test(parts[1])) {
          const number = toInt(parts[0]);
          for (let i = 0; i < number; i += 1) {
            if (/^\d+$/.test(parts[1])) {
              total += negative * this.int(1, toInt(parts[1]));
            } else {
              total += negative * toInt(this.fromArray(parts[1].split(":")));
            }
          }
        } else {
          this.log.info(`Can't parse dice type (but will attempt to use what I can): ${dice}`);
          this.io.errormsg(`Can't parse dice type (but will attempt to use what I can): ${dice}`);
        }
      }
    }
    return total;
  }
  prime(ary) {
    if (typeof ary === "number")
      ary = [ary];
    for (const el of ary)
      this.buffer.push(el);
  }
}
