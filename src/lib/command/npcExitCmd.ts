import { FnPrmAny } from "../../@types/fn";
import { Quest } from "../../Quest";
import { WorldStates } from "../constants";
import { Cmd } from "./cmd";
import { DictionaryAny } from "../../@types/dictionary";

export class NpcExitCmd extends Cmd {
  exitCmd: boolean;
  dir: string;
  objects: { ignore?: boolean, scope?: FnPrmAny, attName?: string }[];

  constructor(quest: Quest, name: string, hash: DictionaryAny, dir: string) {
    super(quest, name, hash);
    this.exitCmd = true;
    this.dir = dir;
    this.objects = [
      { scope: this.parser.isHere, attName: 'npc' },
      { ignore: true },
      { ignore: true },
    ];
  }

  script(objects: any[][]) {
    const npc = objects[0][0];
    if (!this.game.room.hasExit(this.dir)) {
      this.io.failedmsg(this.lexicon.not_that_way, {
        char: npc,
        dir: this.dir,
      });
      return WorldStates.FAILED;
    }
    if (!npc.canMove(this.game.room[this.dir], this.dir)) {
      return WorldStates.FAILED;
    }
    if (npc.getAgreementGo && !npc.getAgreementGo(this.dir)) {
      return WorldStates.FAILED;
    }
    if (
      !npc.getAgreementGo &&
      npc.getAgreement &&
      !npc.getAgreement('Go', this.dir)
    ) {
      return WorldStates.FAILED;
    }
    const ex = this.game.room[this.dir];
    if (typeof ex === 'object') {
      const flag = ex.use(npc, this.dir);
      if (flag) npc.pause();
      return flag ? WorldStates.SUCCESS : WorldStates.FAILED;
    }
    this.io.errormsg('Unsupported type for direction');
    return WorldStates.FAILED;
  }

}
