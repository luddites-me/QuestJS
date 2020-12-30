import { prefix } from "../../lib/tools/tools";
import { Quest } from "../../Quest";
import { allowable, Item } from "./item";

export class Takeable extends Item {

  constructor(quest: Quest, name: string, hash: Partial<Takeable> = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.take;
  }

  onCreation(o) {
    // this.log.info('takeable: ' + o.name)
    o.verbFunctions.push((o, verbList) => {
      verbList.push(
        o.isAtLoc(this.game.player.name)
          ? this.lexicon.verbs.drop
          : this.lexicon.verbs.take,
      );
    });
    // this.log.info(o.verbFunctions.length)
  }

  drop(isMultiple, char) {
    const tpParams = { char, item: this };
    this.io.msg(
      prefix(this, isMultiple) + this.lexicon.drop_successful,
      tpParams,
    );
    this.moveToFrom(char.loc, char.name);
    return true;
  }

  take(isMultiple, char) {
    const tpParams = { char, item: this };
    if (this.isAtLoc(char.name)) {
      this.io.msg(
        prefix(this, isMultiple) + this.lexicon.already_have,
        tpParams,
      );
      return false;
    }
    if (!char.canManipulate(this, 'take')) return false;
    this.io.msg(
      prefix(this, isMultiple) + this.lexicon.take_successful,
      tpParams,
    );
    this.moveToFrom(char.name, this.takeFromLoc(char));
    if (this.scenery) delete this.scenery;
    return true;
  }

  // This returns the location from which the item is to be taken
  // (and does not do taking from a location).
  // This can be useful for weird objects, such as ropes
  takeFromLoc(char) {
    return this.loc;
  }
}
