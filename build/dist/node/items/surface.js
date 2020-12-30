import {allowable, Item} from "./item.js";
export class Surface extends Item {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.shift;
    this.container = true;
    this.contentsType = "surface";
  }
  onCreation(o) {
    o.nameModifierFunctions.push(this.utils.nameModifierFunctionForContainer);
  }
  canReachThrough() {
    return true;
  }
  canSeeThrough() {
    return true;
  }
}
