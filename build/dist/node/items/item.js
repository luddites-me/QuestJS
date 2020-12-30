import {WorldStates} from "../../lib/constants.js";
import {Node} from "../node.js";
export var allowable;
(function(allowable2) {
  allowable2[allowable2["count"] = 0] = "count";
  allowable2[allowable2["open"] = 1] = "open";
  allowable2[allowable2["shift"] = 2] = "shift";
  allowable2[allowable2["take"] = 3] = "take";
  allowable2[allowable2["wear"] = 4] = "wear";
  allowable2[allowable2["lock"] = 5] = "lock";
})(allowable || (allowable = {}));
export class Item extends Node {
  verbFunction(...params) {
    return {};
  }
  getWorn(...params) {
    return {};
  }
  isAtLoc(...params) {
    return false;
  }
  lightSource() {
    return WorldStates.LIGHT_NONE;
  }
  icon() {
    return "";
  }
  testKeys(char, toLock) {
    return false;
  }
  get takeable() {
    return (this.allowed & 3) === 3;
  }
  get shiftable() {
    return (this.allowed & 2) === 2;
  }
  get countable() {
    return (this.allowed & 0) === 0;
  }
  get wearable() {
    return (this.allowed & 4) === 4;
  }
  get openable() {
    return (this.allowed & 1) === 1;
  }
  get lockable() {
    return (this.allowed & 5) === 5;
  }
  get closed() {
    return !this.openable || this._closed;
  }
  set closed(val) {
    if (this.openable)
      this._closed = val;
  }
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
  }
  getVerbs() {
    const verbList = [];
    for (const f of this.verbFunctions)
      f(this, verbList);
    if (!this.isAtLoc(this.game.player.name)) {
      if (this.hereVerbs) {
        for (const s of this.hereVerbs)
          verbList.push(s);
      }
    } else if (this.getWorn()) {
      if (this.wornVerbs) {
        for (const s of this.wornVerbs)
          verbList.push(s);
      }
    } else if (this.heldVerbs) {
      for (const s of this.heldVerbs)
        verbList.push(s);
    }
    if (this.verbFunction)
      this.verbFunction(verbList);
    return verbList;
  }
}
