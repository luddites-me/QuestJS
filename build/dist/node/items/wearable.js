import {prefix} from "../../lib/tools/tools.js";
import {allowable} from "./item.js";
import {Takeable} from "./takeable.js";
export class Wearable extends Takeable {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.icon = () => "garment12";
    this.allowed |= allowable.take | allowable.wear;
    this.armour = 0;
    this.slots = [];
  }
  useDefaultsTo(char) {
    return char === this.game.player ? "Wear" : "NpcWear";
  }
  getSlots() {
    return this.slots;
  }
  getWorn(...params) {
    return this.worn;
  }
  getArmour() {
    return this.armour;
  }
  onCreation(o) {
    o.verbFunctions.push((o2, verbList) => {
      if (!o2.isAtLoc(this.game.player.name)) {
        verbList.push(this.lexicon.verbs.take);
      } else if (o2.getWorn()) {
        if (!o2.getWearRemoveBlocker(this.game.player, false))
          verbList.push(this.lexicon.verbs.remove);
      } else {
        verbList.push(this.lexicon.verbs.drop);
        if (!o2.getWearRemoveBlocker(this.game.player, true))
          verbList.push(this.lexicon.verbs.wear);
      }
    });
    o.nameModifierFunctions.push((o2, list) => {
      if (o2.worn && o2.isAtLoc(this.game.player.name))
        list.push(this.lexicon.invModifiers.worn);
    });
  }
  getWearRemoveBlocker(char, toWear) {
    if (!this.wear_layer) {
      return false;
    }
    const slots = this.getSlots();
    for (const slot of slots) {
      const outer = char.getOuterWearable(slot);
      if (outer && outer !== this && (outer.wear_layer >= this.wear_layer || outer.wear_layer === 0)) {
        return outer;
      }
    }
    return false;
  }
  canWearRemove(char, toWear) {
    const outer = this.getWearRemoveBlocker(char, toWear);
    if (outer) {
      const tpParams = {char, garment: this, outer};
      if (toWear) {
        this.io.msg(this.lexicon.cannot_wear_over, tpParams);
      } else {
        this.io.msg(this.lexicon.cannot_remove_under, tpParams);
      }
      return false;
    }
    return true;
  }
  wear(isMultiple, char) {
    if (!this.canWearRemove(char, true)) {
      return false;
    }
    if (!char.canManipulate(this, "wear")) {
      return false;
    }
    if (this.wearMsg) {
      this.io.msg(prefix(this, isMultiple) + this.wearMsg(char, this), {
        garment: this,
        actor: char
      });
    } else {
      this.io.msg(prefix(this, isMultiple) + this.lexicon.wear_successful, {
        garment: this,
        char
      });
    }
    this.worn = true;
    if (this.onWear)
      this.onWear(char);
    return true;
  }
  remove(isMultiple, char) {
    if (!this.canWearRemove(char, false)) {
      return false;
    }
    if (!char.canManipulate(this, "remove")) {
      return false;
    }
    if (this.removeMsg) {
      this.io.msg(prefix(this, isMultiple) + this.removeMsg(char, this), {
        garment: this,
        actor: char
      });
    } else {
      this.io.msg(prefix(this, isMultiple) + this.lexicon.remove_successful, {
        garment: this,
        char
      });
    }
    this.worn = false;
    if (this.onRemove)
      this.onRemove(char);
    return true;
  }
}
