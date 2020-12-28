import { Base } from "../base";
import { WorldStates } from "../constants";

// ============  Scope Utilities  =======================================

// @DOC
// ## Scope Functions
// @UNDOC
export class Scope extends Base {

  // @DOC
  // Returns an array of objects the player can currently reach and see.
  scopeReachable() {
    const list = [];
    this.state.forEach((key, val) => {
      if (
        val.scopeStatus === WorldStates.REACHABLE &&
        this.world.ifNotDark(val)
      ) {
        list.push(val);
      }
    })
    return list;
  }

  // @DOC
  // Returns an array of objects held by the given character.
  scopeHeldBy(chr, situation = WorldStates.PARSER) {
    return chr.getContents(situation);
  }

  // @DOC
  // Returns an array of objects at the player's location that can be seen.
  scopeHereListed() {
    const list = [];
    this.state.forEach((key, val) => {
      if (
        !val.player &&
        val.isAtLoc(this.game.player.loc, WorldStates.LOOK) &&
        this.world.ifNotDark(val)
      ) {
        list.push(val);
      }
    })
    return list;
  }

  // @DOC
  // Returns an array of NPCs at the player's location (excludes those flagged as scenery).
  scopeNpcHere(ignoreDark) {
    const list = [];
    this.state.forEach((key, val) => {
      if (
        val.isAtLoc(this.game.player.loc, WorldStates.LOOK) &&
        val.npc &&
        (this.world.ifNotDark(val) || ignoreDark)
      ) {
        list.push(val);
      }
    })
    return list;
  }

  // @DOC
  // Returns an array of NPCs at the player's location (includes those flagged as scenery).
  scopeAllNpcHere(ignoreDark) {
    const list = [];
    this.state.forEach((key, val) => {
      if (
        val.isAtLoc(this.game.player.loc, WorldStates.PARSER) &&
        val.npc &&
        (this.world.ifNotDark(val) || ignoreDark)
      ) {
        list.push(val);
      }
    })
    return list;
  }

  // @DOC
  // Returns an array of objects for which the given function returns true.
  scopeBy(func) {
    const list = [];
    this.state.forEach((key, val) => {
      if (func(val)) {
        list.push(val);
      }
    })
    return list;
  }
}
