import {Known, WorldStates} from "../../lib/index.js";
import {Money} from "../items/money.js";
import {Node} from "../node.js";
export class Character extends Node {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.canReachThrough = Known.NOOP_TRUE;
    this.canSeeThrough = Known.NOOP_TRUE;
    this.getAgreement = Known.NOOP_TRUE;
    this.getContents = (situation) => this.utils.getContents(situation);
    this.pause = Known.NOOP_VOID;
    this.canManipulate = Known.NOOP_TRUE;
    this.canMove = Known.NOOP_TRUE;
    this.canPosture = Known.NOOP_TRUE;
    this.canTakeDrop = Known.NOOP_TRUE;
    this.mentionedTopics = [];
    this.canTalkFlag = true;
    this.onGoCheckList = [];
    this.onGoActionList = [];
    this.followers = [];
    this.player = false;
    this.onCreation = (o) => {
      o.nameModifierFunctions.push((o2, l) => {
        const state = o2.getStatusDesc();
        const held = o2.getHolding();
        const worn = o2.getWearingVisible();
        const list = [];
        if (state) {
          list.push(state);
        }
        if (held.length > 0) {
          list.push(`${this.lexicon.invHoldingPrefix} ${this.utils.formatList(held, {
            article: Known.INDEFINITE,
            lastJoiner: this.lexicon.list_and,
            modified: false,
            nothing: this.lexicon.list_nothing,
            loc: o2.name
          })}`);
        }
        if (worn.length > 0) {
          list.push(`${this.lexicon.invWearingPrefix} ${this.utils.formatList(worn, {
            article: Known.INDEFINITE,
            lastJoiner: this.lexicon.list_and,
            modified: false,
            nothing: this.lexicon.list_nothing,
            loc: o2.name
          })}`);
        }
        if (list.length > 0)
          l.push(list.join("; "));
      });
      o.verbFunctions.push((o2, verbList) => {
        verbList.shift();
        verbList.push(this.lexicon.verbs.lookat);
        if (!this.settings.noTalkTo)
          verbList.push(this.lexicon.verbs.talkto);
      });
    };
    this.pronouns = this.lexicon.pronouns.thirdperson;
    this.money = this.money || new Money(quest, `money-${name}`);
  }
  canTalk() {
    return this.canTalkFlag;
  }
  msg(str, ...params) {
    return this.io.msg(str, ...params);
  }
  getHolding() {
    return this.getContents(WorldStates.LOOK).filter((el) => !el.getWorn());
  }
  getWearing() {
    return this.getContents(WorldStates.LOOK).filter((el) => el.getWorn() && !el.ensemble);
  }
  getStatusDesc() {
    if (!this.posture)
      return false;
    return `${this.posture} ${this.postureAdverb} ${this.processor.getName(this.state.get(this.postureFurniture), {
      article: Known.DEFINITE
    })}`;
  }
  isAtLoc(loc, situation) {
    if (situation === WorldStates.LOOK)
      return false;
    if (situation === WorldStates.SIDE_PANE)
      return false;
    return this.loc === loc;
  }
  getOuterWearable(slot) {
    const clothing = this.getWearing().filter((el) => {
      if (typeof el.getSlots !== "function") {
        this.log.info("Item with worn set to true, but no getSlots function");
        this.log.info(el);
      }
      return el.getSlots().includes(slot);
    });
    if (clothing.length === 0) {
      return false;
    }
    let outer = clothing[0];
    for (const garment of clothing) {
      if (garment.wear_layer > outer.wear_layer) {
        outer = garment;
      }
    }
    return outer;
  }
}
