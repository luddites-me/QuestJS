import {allowable, Item} from "./item.js";
export class Shiftable extends Item {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.take;
  }
}
