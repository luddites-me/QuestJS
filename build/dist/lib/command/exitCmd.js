import {WorldStates} from "../constants.js";
import {Cmd} from "./cmd.js";
export class ExitCmd extends Cmd {
  constructor(quest, name, hash, dir) {
    super(quest, name, hash);
    this.exitCmd = true;
    this.dir = dir;
    this.objects = [{ignore: true}, {ignore: true}];
  }
  script(objects) {
    if (!this.game.room.hasExit(this.dir)) {
      this.io.failedmsg(this.lexicon.not_that_way, {
        char: this.game.player,
        dir: this.dir
      });
      return WorldStates.FAILED;
    }
    const ex = this.game.room[this.dir];
    if (typeof ex === "object") {
      if (!this.game.player.canMove(ex, this.dir)) {
        return WorldStates.FAILED;
      }
      if (typeof ex.use !== "function") {
        this.io.errormsg("Exit's 'use' attribute is not a function (or does not exist). Press F12 for more.");
        this.log.info("Bad exit:");
        this.log.info(ex);
        return WorldStates.FAILED;
      }
      const flag = ex.use(this.game.player, this.dir);
      if (typeof flag !== "boolean") {
        this.io.errormsg("Exit failed to return a Boolean value, indicating success of failure; assuming success");
        return WorldStates.SUCCESS;
      }
      if (flag && ex.extraTime)
        this.game.extraTime += ex.extraTime;
      return flag ? WorldStates.SUCCESS : WorldStates.FAILED;
    }
    this.io.errormsg("Unsupported type for direction");
    return WorldStates.FAILED;
  }
}
