import {Base} from "../base.js";
import {WorldStates} from "../constants.js";
export class Scope extends Base {
  scopeReachable() {
    const list = [];
    this.state.forEach((key, val) => {
      if (val.scopeStatus === WorldStates.REACHABLE && this.world.ifNotDark(val)) {
        list.push(val);
      }
    });
    return list;
  }
  scopeHeldBy(chr, situation = WorldStates.PARSER) {
    return chr.getContents(situation);
  }
  scopeHereListed() {
    const list = [];
    this.state.forEach((key, val) => {
      if (!val.player && val.isAtLoc(this.game.player.loc, WorldStates.LOOK) && this.world.ifNotDark(val)) {
        list.push(val);
      }
    });
    return list;
  }
  scopeNpcHere(ignoreDark) {
    const list = [];
    this.state.forEach((key, val) => {
      if (val.isAtLoc(this.game.player.loc, WorldStates.LOOK) && val.npc && (this.world.ifNotDark(val) || ignoreDark)) {
        list.push(val);
      }
    });
    return list;
  }
  scopeAllNpcHere(ignoreDark) {
    const list = [];
    this.state.forEach((key, val) => {
      if (val.isAtLoc(this.game.player.loc, WorldStates.PARSER) && val.npc && (this.world.ifNotDark(val) || ignoreDark)) {
        list.push(val);
      }
    });
    return list;
  }
  scopeBy(func) {
    const list = [];
    this.state.forEach((key, val) => {
      if (func(val)) {
        list.push(val);
      }
    });
    return list;
  }
}
