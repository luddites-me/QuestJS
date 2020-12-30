import {Base} from "../base.js";
import {WorldStates} from "../constants.js";
import {prefix} from "../tools/tools.js";
export class Rules extends Base {
  isHeldNotWorn(cmd, char, item, isMultiple) {
    if (!item.getWorn() && item.isAtLoc(char.name, WorldStates.PARSER))
      return true;
    if (item.isAtLoc(char.name, WorldStates.PARSER))
      return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.already_wearing, {char, garment: item});
    if (item.loc) {
      const holder = this.state.get(item.loc);
      if (holder.npc || holder.player)
        return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.char_has_it, {holder, item});
    }
    return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.not_carrying, {char, item});
  }
  isWorn(cmd, char, item, isMultiple) {
    if (item.getWorn() && item.isAtLoc(char.name, WorldStates.PARSER))
      return true;
    if (item.isAtLoc(char.name, WorldStates.PARSER))
      return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.not_wearing, {char, item});
    if (item.loc) {
      const holder = this.state.get(item.loc);
      if (holder.npc || holder.player)
        return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.char_has_it, {holder, item});
    }
    return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.not_carrying, {char, item});
  }
  isHeld(cmd, char, item, isMultiple) {
    if (item.isAtLoc(char.name, WorldStates.PARSER))
      return true;
    if (item.loc) {
      const holder = this.state.get(item.loc);
      if (holder.npc || holder.player)
        return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.char_has_it, {holder, item});
    }
    return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.not_carrying, {char, item});
  }
  isHere(cmd, char, item, isMultiple) {
    if (item.isAtLoc(char.loc, WorldStates.PARSER))
      return true;
    if (item.isAtLoc(char.name, WorldStates.PARSER))
      return true;
    if (item.loc) {
      const holder = this.state.get(item.loc);
      if (holder.npc || holder.player)
        return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.char_has_it, {holder, item});
    }
    if (item.scopeStatus === WorldStates.REACHABLE)
      return true;
    return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.not_here, {
      char,
      item
    });
  }
  isHereNotHeld(cmd, char, item, isMultiple, already) {
    if (item.isAtLoc(char.loc, WorldStates.PARSER))
      return true;
    if (item.loc) {
      const holder = this.state.get(item.loc);
      if (already && holder === this.game.player)
        return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.already_have, {char: holder, item});
      if (holder.npc || holder.player)
        return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.char_has_it, {holder, item});
    }
    if (item.scopeStatus === WorldStates.REACHABLE || item.multiLoc)
      return true;
    return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.not_here, {
      char,
      item
    });
  }
  isHereNotHeldAlready(cmd, char, item, isMultiple) {
    return this.isHereNotHeld(cmd, char, item, isMultiple, true);
  }
  canManipulate(cmd, char, item) {
    if (!char.canManipulate(item, cmd.name))
      return false;
    return true;
  }
  canTalkTo(cmd, char, item, isMultiple) {
    if (!char.canTalk(item))
      return false;
    if (!item.npc)
      return this.io.falsemsg(prefix(item, isMultiple) + this.lexicon.not_able_to_hear, {char, item});
    return true;
  }
  canPosture(cmd, char, item) {
    if (!char.canPosture(cmd.name))
      return false;
    return true;
  }
}
