import {WorldStates} from "../constants.js";
import {Cmd} from "./cmd.js";
export class NpcCmd extends Cmd {
  constructor(quest, name, hash) {
    super(quest, name, hash);
    if (!this.category)
      this.category = name;
  }
  script(objects) {
    const npc = objects[0][0];
    if (!npc.npc) {
      this.io.failedmsg(this.lexicon.not_npc, {
        char: this.game.player,
        item: npc
      });
      return WorldStates.FAILED;
    }
    let success = false;
    if (objects.length !== 2) {
      this.io.errormsg(`The command ${this.name} is trying to use a facility for NPCs to do it, but there is no object list; this facility is only for commands in the form verb-object.`);
      return WorldStates.FAILED;
    }
    const multi = objects[1].length > 1 || this.parser.currentCommand.all;
    for (const obj of objects[1]) {
      if (npc[`getAgreement${this.category}`] && !npc[`getAgreement${this.category}`](obj, this.name)) {
        continue;
      }
      if (!npc[`getAgreement${this.category}`] && npc.getAgreement && !npc.getAgreement(this.category, obj)) {
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
      return this.noTurnscripts ? WorldStates.SUCCESS_NO_TURNSCRIPTS : WorldStates.SUCCESS;
    }
    return WorldStates.FAILED;
  }
}
