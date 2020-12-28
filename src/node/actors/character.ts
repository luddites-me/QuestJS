import { Quest } from "../..";
import { PronounIdentifier } from "../../lang";
import { Known, WorldStates } from "../../lib";
import { INode } from "../INode";
import { Money } from "../items/money";
import { Node } from "../node";

// The following are used also both player and NPCs, so we can use the same functions for both
export class Character extends Node {
  canReachThrough = Known.NOOP_TRUE;
  canSeeThrough = Known.NOOP_TRUE;
  getAgreement = Known.NOOP_TRUE;
  getContents = (situation) => this.utils.getContents(situation);
  pause = Known.NOOP_VOID;
  canManipulate = Known.NOOP_TRUE;
  canMove = Known.NOOP_TRUE;
  canPosture = Known.NOOP_TRUE;
  canTakeDrop = Known.NOOP_TRUE;
  hitpoints: number;
  mentionedTopics: any[] = [];
  canTalkFlag = true;
  canTalk() {
    return this.canTalkFlag;
  }
  onGoCheckList = [];
  onGoActionList = [];
  followers = []
  money: Money;
  npcAlias: string;
  npcPronouns: PronounIdentifier;
  player: boolean = false;
  posture;
  postureAdverb: string;
  postureFurniture: string;
  regex: RegExp;
  useProperName: boolean;

  constructor(quest: Quest, name: string, hash: Partial<Character> = {}) {
    super(quest, name, hash);
    this.pronouns = this.lexicon.pronouns.thirdperson;
    this.money = this.money || new Money(quest, `money-${name}`);
  }

  msg(str: string, ...params) {
    return this.io.msg(str, ...params);
  }

  getHolding() {
    return this.getContents(WorldStates.LOOK).filter(
      (el) => !el.getWorn(),
    );
  }

  getWearing() {
    return this.getContents(WorldStates.LOOK).filter(
      (el) => el.getWorn() && !el.ensemble,
    );
  }

  getStatusDesc() {
    if (!this.posture) return false;
    return `${this.posture} ${this.postureAdverb} ${this.processor.getName(
      this.state.get(this.postureFurniture),
      {
        article: Known.DEFINITE,
      },
    )}`;
  }

  isAtLoc(loc: INode, situation?: number) {
    if (situation === WorldStates.LOOK) return false;
    if (situation === WorldStates.SIDE_PANE) return false;
    return this.loc === loc;
  }

  getOuterWearable(slot) {
    const clothing = this.getWearing().filter((el) => {
      if (typeof el.getSlots !== 'function') {
        this.log.info(
          'Item with worn set to true, but no getSlots function'
        );
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

  onCreation = (o: INode) => {
    o.nameModifierFunctions.push((o, l) => {
      const state = o.getStatusDesc();
      const held = o.getHolding();
      const worn = o.getWearingVisible();

      const list = [];
      if (state) {
        list.push(state);
      }
      if (held.length > 0) {
        list.push(
          `${this.lexicon.invHoldingPrefix} ${QuestJs._tools.formatList(
            held,
            {
              article: Known.INDEFINITE,
              lastJoiner: this.lexicon.list_and,
              modified: false,
              nothing: this.lexicon.list_nothing,
              loc: o.name,
              npc: true,
            },
          )}`,
        );
      }
      if (worn.length > 0) {
        list.push(
          `${this.lexicon.invWearingPrefix} ${QuestJs._tools.formatList(
            worn,
            {
              article: Known.INDEFINITE,
              lastJoiner: this.lexicon.list_and,
              modified: false,
              nothing: this.lexicon.list_nothing,
              loc: o.name,
              npc: true,
            },
          )}`,
        );
      }
      if (list.length > 0) l.push(list.join('; '));
    });
    o.verbFunctions.push((o, verbList) => {
      verbList.shift();
      verbList.push(this.lexicon.verbs.lookat);
      if (!this.settings.noTalkTo)
        verbList.push(this.lexicon.verbs.talkto);
    });
  }
}
