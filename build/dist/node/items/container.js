import {prefix, WorldStates} from "../../lib/index.js";
import {Openable} from "./openable.js";
export class Container extends Openable {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.container = true;
    this.contentsType = "container";
    this.transparent = false;
  }
  onCreation(o) {
    o.verbFunctions.push((o2, verbList) => {
      if (o2.openable) {
        verbList.push(o2.closed ? this.lexicon.verbs.open : this.lexicon.verbs.close);
      }
    });
    o.nameModifierFunctions.push(this.utils.nameModifierFunctionForContainer);
  }
  lookinside(isMultiple, char) {
    const tpParams = {char, container: this, list: ""};
    if (this.closed && !this.transparent) {
      this.io.msg(prefix(this, isMultiple) + this.lexicon.nothing_inside, {
        char
      });
      return false;
    }
    tpParams.list = this.listContents(WorldStates.LOOK, true);
    this.io.msg(prefix(this, isMultiple) + this.lexicon.look_inside, tpParams);
    return true;
  }
  openMsg(isMultiple, tpParams) {
    tpParams.list = this.listContents(WorldStates.LOOK);
    this.io.msg(`${prefix(this, isMultiple) + this.lexicon.open_successful} ${tpParams.list === this.lexicon.list_nothing ? this.lexicon.it_is_empty : this.lexicon.look_inside}`, tpParams);
  }
  icon() {
    return this.closed ? "closed12" : "opened12";
  }
  canReachThrough() {
    return !this.closed;
  }
  canSeeThrough() {
    return !this.closed || this.transparent;
  }
}
