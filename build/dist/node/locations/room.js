import {Loc} from "./loc.js";
export class Room extends Loc {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.room = true;
  }
}
