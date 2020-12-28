import { FnPrmAny } from "../../../@types/fn";
import { WorldStates } from "../../lib";
import { Quest } from "../../Quest";
import { Openable } from "./openable"
import { Takeable } from "./takeable";

export class Container extends Openable {
  container = true;
  contentsType = 'container';
  transparent = false;

  constructor(quest: Quest, name: string, hash: Partial<Openable> = {}) {
    super(quest, name, hash);
  }

  onCreation(o) {
    // this.log.info('container: ' + o.name)
    o.verbFunctions.push((o, verbList) => {
      if (o.openable) {
        verbList.push(
          o.closed ? this.lexicon.verbs.open : this.lexicon.verbs.close,
        );
      }
    });
    // this.log.info(o.verbFunctions.length)
    o.nameModifierFunctions.push(
      QuestJs._util.nameModifierFunctionForContainer,
    );
    // this.log.info(o.nameModifierFunctions)
  }
  
  lookinside(isMultiple, char) {
    const tpParams = { char, container: this, list: [] };
    if (this.closed && !this.transparent) {
      this.io.msg(
        prefix(this, isMultiple) +
        this.lexicon.nothing_inside,
        {
          char,
        },
      );
      return false;
    }
    // tpParams.list = formatList(this.getContents(WorldStates.LOOK), {article:Known.INDEFINITE, lastJoiner:this.lexicon.list_and, nothing:this.lexicon.list_nothing})
    tpParams.list = this.listContents(WorldStates.LOOK, true);
    this.io.msg(
      prefix(this, isMultiple) + this.lexicon.look_inside,
      tpParams,
    );
    return true;
  }

  openMsg(isMultiple, tpParams) {
    tpParams.list = this.listContents(WorldStates.LOOK);
    this.io.msg(
      `${prefix(this, isMultiple) + this.lexicon.open_successful
      } ${tpParams.list === this.lexicon.list_nothing
        ? this.lexicon.it_is_empty
        : this.lexicon.look_inside
      }`,
      tpParams,
    );
  }

  icon() {
    return this.closed ? 'closed12' : 'opened12';
  }

  canReachThrough() {
    return !this.closed;
  };
  canSeeThrough() {
    return !this.closed || this.transparent;
  };
}
