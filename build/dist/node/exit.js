import {Node} from "./node.js";
export class Exit extends Node {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.use = this.utils.defaultExitUse;
  }
}
