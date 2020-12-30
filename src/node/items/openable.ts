import { prefix } from "../../lib/tools/tools";
import { FnPrmVoid } from "../../@types/fn";
import { Quest } from "../../Quest";
import { allowable, Item } from "./item";

export class Openable extends Item {
  onOpen: FnPrmVoid;
  onClose: FnPrmVoid;

  constructor(quest: Quest, name: string, hash: Partial<Openable> = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.open;
  }

  onCreation(o) {
    // this.log.info('openable: ' + o.name)
    o.verbFunctions.push((o, verbList) => {
      verbList.push(
        o.closed ? this.lexicon.verbs.open : this.lexicon.verbs.close,
      );
    });
    o.nameModifierFunctions.push((o, list) => {
      if (!o.closed) list.push(this.lexicon.invModifiers.open);
    });
  };

  open(isMultiple, char) {
    const tpParams = { char, container: this };
    if (!this.openable) {
      this.io.msg(
        prefix(this, isMultiple) + this.lexicon.cannot_open,
        {
          item: this,
        },
      );
      return false;
    }
    if (!this.closed) {
      this.io.msg(
        prefix(this, isMultiple) + this.lexicon.already,
        {
          item: this,
        },
      );
      return false;
    }
    if (this.locked) {
      if (this.testKeys(char, !this.locked)) {
        this.locked = false;
        this.closed = false;
        this.io.msg(
          prefix(this, isMultiple) +
            this.lexicon.unlock_successful,
          tpParams,
        );
        this.openMsg(isMultiple, tpParams);
        return true;
      }
      this.io.msg(
        prefix(this, isMultiple) + this.lexicon.locked,
        tpParams,
      );
      return false;
    }
    this.closed = false;
    this.openMsg(isMultiple, tpParams);
    if (this.onOpen) this.onOpen(char);
    return true;
  }

  close(isMultiple, char) {
    const tpParams = { char, container: this };
    if (!this.openable) {
      this.io.msg(
        prefix(this, isMultiple) + this.lexicon.cannot_close,
        {
          item: this,
        },
      );
      return false;
    }
    if (this.closed) {
      this.io.msg(
        prefix(this, isMultiple) + this.lexicon.already,
        {
          item: this,
        },
      );
      return false;
    }
    this.closed = true;
    this.closeMsg(isMultiple, tpParams);
    if (this.onClose) this.onClose(char);
    return true;
  }

  closeMsg(isMultiple, tpParams) {
    this.io.msg(
      prefix(this, isMultiple) + this.lexicon.close_successful,
      tpParams,
    );
  }

  openMsg(isMultiple, tpParams) {
    this.io.msg(
      prefix(this, isMultiple) + this.lexicon.open_successful,
      tpParams,
    );
  }
}
