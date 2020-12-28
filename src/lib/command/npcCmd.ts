import { Base } from "../base";
import { WorldStates } from "../constants";
import { Cmd } from "./cmd";

// Use only for NPC commands that you are not giving your
// own custom script attribute. Commands must be an order to a single
// NPC in the form verb-object.
export class NpcCmd extends Cmd {
  category: string;
  forNpc: boolean;
  
  constructor(quest, name, hash) {
    super(quest, name, hash);
    if (!this.category) this.category = name;
  }

  script(objects: any[][]) {
    const npc = objects[0][0];
    if (!npc.npc) {
      this.io.failedmsg(this.lexicon.not_npc, {
        char: this.game.player,
        item: npc,
      });
      return WorldStates.FAILED;
    }
    let success = false;
    let handled;
    if (objects.length !== 2) {
      this.io.errormsg(
        `The command ${this.name} is trying to use a facility for NPCs to do it, but there is no object list; this facility is only for commands in the form verb-object.`,
      );
      return WorldStates.FAILED;
    }
    const multi = objects[1].length > 1 || this.parser.currentCommand.all;
    for (const obj of objects[1]) {
      if (
        npc[`getAgreement${this.category}`] &&
        !npc[`getAgreement${this.category}`](obj, this.name)
      ) {
        // The getAgreement should give the response
        continue;
      }
      if (
        !npc[`getAgreement${this.category}`] &&
        npc.getAgreement &&
        !npc.getAgreement(this.category, obj)
      ) {
        continue;
      }
      if (!obj[this.attName]) {
        this.default(obj, multi, npc);
      } else {
        let result = this.processCommand(npc, obj, multi);
        if (result === WorldStates.SUCCESS_NO_TURNSCRIPTS) {
          result = true;
        }
        success = result || success;
      }
    }
    if (success) {
      npc.pause();
      return this.noTurnscripts
        ? WorldStates.SUCCESS_NO_TURNSCRIPTS
        : WorldStates.SUCCESS;
    }
    return WorldStates.FAILED;
  };
}
