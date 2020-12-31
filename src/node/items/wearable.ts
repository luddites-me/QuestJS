import { prefix } from "../../lib/tools/tools";
import { Quest } from "../../Quest";
import { allowable } from "./item";
import { Takeable } from "./takeable";

export class Wearable extends Takeable {
  armour: number;
  onRemove;
  onWear;
  removeMsg;
  slots: any[];
  wear_layer: boolean;
  wearMsg;
  worn;

  constructor(quest: Quest, name: string, hash: Partial<Wearable> = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.take | allowable.wear;
    this.armour = 0;
    this.slots = [];
  }

  useDefaultsTo(char) {
    return char === this.game.player ? 'Wear' : 'NpcWear';
  }

  getSlots() {
    return this.slots;
  }

  getWorn(...params) {
    return this.worn;
  }

  getArmour() {
    return this.armour;
  };

  onCreation() {
    // this.log.info('wearable: ' + o.name)
    this.verbFunctions.push((o: INode, verbList: any[]) => {
      if (!o.isAtLoc(this.game.player.name)) {
        verbList.push(this.lexicon.verbs.take);
      } else if (o.getWorn()) {
        if (!o.getWearRemoveBlocker(this.game.player, false))
          verbList.push(this.lexicon.verbs.remove);
      } else {
        verbList.push(this.lexicon.verbs.drop);
        if (!o.getWearRemoveBlocker(this.game.player, true))
          verbList.push(this.lexicon.verbs.wear);
      }
    });
    // this.log.info(o.verbFunctions.length)

    o.nameModifierFunctions.push((o, list) => {
      if (o.worn && o.isAtLoc(this.game.player.name))
        list.push(this.lexicon.invModifiers.worn);
    });
  };

  icon = () => 'garment12';

  getWearRemoveBlocker(char, toWear) {
    if (!this.wear_layer) {
      return false;
    }
    const slots = this.getSlots();
    for (const slot of slots) {
      const outer = char.getOuterWearable(slot);
      if (
        outer &&
        outer !== this &&
        (outer.wear_layer >= this.wear_layer || outer.wear_layer === 0)
      ) {
        return outer;
      }
    }
    return false;
  };

  canWearRemove(char, toWear) {
    const outer = this.getWearRemoveBlocker(char, toWear);
    if (outer) {
      const tpParams = { char, garment: this, outer };
      if (toWear) {
        this.io.msg(this.lexicon.cannot_wear_over, tpParams);
      } else {
        this.io.msg(this.lexicon.cannot_remove_under, tpParams);
      }
      return false;
    }
    return true;
  };

  // Assumes the item is already held
  wear(isMultiple, char) {
    if (!this.canWearRemove(char, true)) {
      return false;
    }
    if (!char.canManipulate(this, 'wear')) {
      return false;
    }
    if (this.wearMsg) {
      this.io.msg(
        prefix(this, isMultiple) + this.wearMsg(char, this),
        {
          garment: this,
          actor: char,
        },
      );
    } else {
      this.io.msg(
        prefix(this, isMultiple) + this.lexicon.wear_successful,
        {
          garment: this,
          char,
        },
      );
    }
    this.worn = true;
    if (this.onWear) this.onWear(char);
    return true;
  };

  // Assumes the item is already held
  remove(isMultiple, char) {
    if (!this.canWearRemove(char, false)) {
      return false;
    }
    if (!char.canManipulate(this, 'remove')) {
      return false;
    }
    if (this.removeMsg) {
      this.io.msg(
        prefix(this, isMultiple) + this.removeMsg(char, this),
        {
          garment: this,
          actor: char,
        },
      );
    } else {
      this.io.msg(
        prefix(this, isMultiple) +
          this.lexicon.remove_successful,
        {
          garment: this,
          char,
        },
      );
    }
    this.worn = false;
    if (this.onRemove) this.onRemove(char);
    return true;
  };
}
