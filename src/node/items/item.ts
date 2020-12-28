import { WorldStates } from "../../lib/constants";
import { Quest } from "../../Quest";
import { Node } from "../node";

export class Item extends Node {
  verbFunctions;
  hereVerbs;
  wornVerbs;
  heldVerbs;
  verbFunction(...params) { return {}; }
  getWorn(...params): any { return {}; }
  isAtLoc(...params) { return false; }
  lightSource() { return WorldStates.LIGHT_NONE; }
  icon() { return ''; }
  testKeys(char, toLock) { return false; }
  takeable: boolean;
  shiftable: boolean;
  countable: boolean;
  multiLoc: boolean;
  wearable: boolean;

  constructor(quest: Quest, name: string, hash: Partial<Item> = {}) {
    super(quest, name, hash);
  }

  getVerbs() {
    const verbList = [];
    // this.log.info('verbs for ' + this.name)
    // this.log.info('count ' + this.verbFunctions.length)
    // this.log.info(verbList)
    for (const f of this.verbFunctions) f(this, verbList);

    // this.log.info(verbList)
    if (!this.isAtLoc(this.game.player.name)) {
      if (this.hereVerbs) {
        for (const s of this.hereVerbs) verbList.push(s);
      }
    } else if (this.getWorn()) {
      if (this.wornVerbs) {
        for (const s of this.wornVerbs) verbList.push(s);
      }
    } else if (this.heldVerbs) {
      for (const s of this.heldVerbs) verbList.push(s);
    }
    if (this.verbFunction) this.verbFunction(verbList);
    return verbList;
  }
}
