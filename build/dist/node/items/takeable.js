import {prefix} from "../../lib/tools/tools.js";
import {allowable, Item} from "./item.js";
export class Takeable extends Item {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.take;
  }
  onCreation(o) {
    o.verbFunctions.push((o2, verbList) => {
      verbList.push(o2.isAtLoc(this.game.player.name) ? this.lexicon.verbs.drop : this.lexicon.verbs.take);
    });
  }
  drop(isMultiple, char) {
    const tpParams = {char, item: this};
    this.io.msg(prefix(this, isMultiple) + this.lexicon.drop_successful, tpParams);
    this.moveToFrom(char.loc, char.name);
    return true;
  }
  take(isMultiple, char) {
    const tpParams = {char, item: this};
    if (this.isAtLoc(char.name)) {
      this.io.msg(prefix(this, isMultiple) + this.lexicon.already_have, tpParams);
      return false;
    }
    if (!char.canManipulate(this, "take"))
      return false;
    this.io.msg(prefix(this, isMultiple) + this.lexicon.take_successful, tpParams);
    this.moveToFrom(char.name, this.takeFromLoc(char));
    if (this.scenery)
      delete this.scenery;
    return true;
  }
  takeFromLoc(char) {
    return this.loc;
  }
}
