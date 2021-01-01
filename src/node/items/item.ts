import { WorldStates } from "../../lib/constants";
import { Quest } from "../../Quest";
import { Node } from "../node";

export enum allowable {
  count = 0,
  open = 1,
  shift = 2,
  take = 3,
  wear = 4,
  lock = 5,
}
export class Item extends Node {
  verbFunctions;
  hereVerbs;
  wornVerbs;
  heldVerbs;
  verbFunction(...params) { return {}; }
  getWorn(...params): any { return {}; }
  isAtLoc(...params) { return false; }
  _lightSource =WorldStates.LIGHT_NONE;
  icon() { return ''; }
  testKeys(char, toLock) { return false; }
  allowed: allowable;
  get takeable(): boolean { return allowable.take === (this.allowed & allowable.take) } ;
  get shiftable(): boolean { return allowable.shift === (this.allowed & allowable.shift) } ;
  get countable(): boolean { return allowable.count === (this.allowed & allowable.count) } ;
  get wearable(): boolean { return allowable.wear === (this.allowed & allowable.wear) } ;
  get openable(): boolean { return allowable.open === (this.allowed & allowable.open) } ;
  get lockable(): boolean { return allowable.lock === (this.allowed & allowable.lock) } ;

  private _closed;
  get closed(): boolean { return !this.openable || this._closed; }
  set closed(val: boolean) { if(this.openable) this._closed = val; }

  multiLoc: boolean;

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
