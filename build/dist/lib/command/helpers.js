import {Base} from "../base.js";
import {WorldStates} from "../constants.js";
import {prefix} from "../tools/tools.js";
export class Helpers extends Base {
  handleFillWithLiquid(char, vessel, liquid) {
    const tpParams = {char, container: vessel, liquid};
    if (!vessel.vessel)
      return this.io.failedmsg(this.lexicon.not_vessel, tpParams);
    if (vessel.closed)
      return this.io.failedmsg(this.lexicon.container_closed, tpParams);
    if (!char.canManipulate(vessel, "fill"))
      return WorldStates.FAILED;
    if (!char.getAgreement("Fill", vessel))
      return WorldStates.FAILED;
    if (!vessel.isAtLoc(char.name))
      return this.io.failedmsg(this.lexicon.not_carrying, {
        char,
        item: vessel
      });
    return vessel.fill(false, char, liquid) ? WorldStates.SUCCESS : WorldStates.FAILED;
  }
  handlePutInContainer(char, objects) {
    let success = WorldStates.FAILED;
    const container = objects[1][0];
    const multiple = objects[0].length > 1 || this.parser.currentCommand.all;
    const tpParams = {char, container};
    if (!container.container)
      return this.io.failedmsg(this.lexicon.not_container, {
        char,
        container
      });
    if (container.closed)
      return this.io.failedmsg(this.lexicon.container_closed, tpParams);
    if (!char.canManipulate(objects[0], "put"))
      return WorldStates.FAILED;
    for (const obj of objects[0]) {
      let flag = true;
      if (!char.getAgreement("Put/in", obj)) {
        continue;
      }
      if (!container.testForRecursion(char, obj)) {
        flag = false;
      }
      if (container.testRestrictions) {
        flag = container.testRestrictions(obj, char);
      }
      if (flag) {
        if (!obj.isAtLoc(char.name)) {
          this.io.failedmsg(prefix(obj, multiple) + this.lexicon.not_carrying, {
            char,
            item: obj
          });
        } else {
          obj.moveToFrom(container.name, char.name);
          this.io.msg(prefix(obj, multiple) + this.lexicon.done_msg);
          success = WorldStates.SUCCESS;
        }
      }
    }
    if (success === WorldStates.SUCCESS)
      char.pause();
    return success ? WorldStates.SUCCESS : WorldStates.FAILED;
  }
  handleTakeFromContainer(char, objects) {
    let success = WorldStates.FAILED;
    const container = objects[1][0];
    const multiple = objects[0].length > 1 || this.parser.currentCommand.all;
    const tpParams = {char, container};
    if (!container.container) {
      this.io.failedmsg(this.processor.not_container(char, container));
      return WorldStates.FAILED;
    }
    if (container.closed) {
      this.io.failedmsg(this.lexicon.container_closed, tpParams);
      return WorldStates.FAILED;
    }
    if (!char.canManipulate(objects[0], "get")) {
      return WorldStates.FAILED;
    }
    for (const obj of objects[0]) {
      const flag = true;
      if (!char.getAgreement("Take", obj)) {
        continue;
      }
      if (flag) {
        if (!obj.isAtLoc(container.name)) {
          this.io.failedmsg(prefix(obj, multiple) + this.processor.not_inside(container, obj));
        } else {
          obj.moveToFrom(char.name, container.name);
          this.io.msg(prefix(obj, multiple) + this.lexicon.done_msg);
          success = WorldStates.SUCCESS;
        }
      }
    }
    if (success === WorldStates.SUCCESS)
      char.pause();
    return success ? WorldStates.SUCCESS : WorldStates.FAILED;
  }
  handleGiveToNpc(char, objects) {
    let success = WorldStates.FAILED;
    const npc = objects[1][0];
    const multiple = objects[0].length > 1 || this.parser.currentCommand.all;
    if (!npc.npc && npc !== this.game.player) {
      this.io.failedmsg(this.lexicon.not_npc_for_give, {char, item: npc});
      return WorldStates.FAILED;
    }
    for (const obj of objects[0]) {
      let flag = true;
      if (!char.getAgreement("Give", obj)) {
      }
      if (npc.testRestrictions) {
        flag = npc.testRestrictions(obj);
      }
      if (!npc.canManipulate(obj, "give")) {
        return WorldStates.FAILED;
      }
      if (flag) {
        if (!obj.isAtLoc(char.name)) {
          this.io.failedmsg(prefix(obj, multiple) + this.lexicon.not_carrying, {
            char,
            item: obj
          });
        } else {
          if (npc.giveReaction) {
            npc.giveReaction(obj, multiple, char);
          } else {
            this.io.msg(prefix(obj, multiple) + this.lexicon.done_msg);
            obj.moveToFrom(npc.name, char.name);
          }
          success = WorldStates.SUCCESS;
        }
      }
    }
    if (success === WorldStates.SUCCESS)
      char.pause();
    return success ? WorldStates.SUCCESS : WorldStates.FAILED;
  }
  handleStandUp(objects) {
    let char;
    if (objects.length === 0) {
      char = this.game.player;
    } else {
      const npc = objects[0][0];
      if (!npc.npc) {
        this.io.failedmsg(this.lexicon.not_npc, {
          char: this.game.player,
          item: npc
        });
        return WorldStates.FAILED;
      }
      if (!npc.posture) {
        this.io.failedmsg(this.lexicon.already, {item: npc});
        return WorldStates.FAILED;
      }
      if (npc.getAgreementPosture && !npc.getAgreementPosture("stand")) {
        return WorldStates.FAILED;
      }
      if (!npc.getAgreementPosture && npc.getAgreement && !npc.getAgreement("Posture", "stand")) {
        return WorldStates.FAILED;
      }
      char = npc;
    }
    if (!char.canPosture()) {
      return WorldStates.FAILED;
    }
    if (char.posture) {
      this.io.msg(this.processor.stop_posture(char));
      char.pause();
      return WorldStates.SUCCESS;
    }
  }
  handlePushExit(char, objects) {
    const verb = this.utils.getDir(objects[0]);
    const obj = objects[1][0];
    const dir = this.utils.getDir(objects[2]);
    const room = this.state.get(char.loc);
    const tpParams = {char, item: obj, dir, dest: {}};
    if (!obj.shiftable && obj.takeable) {
      this.io.msg(this.lexicon.take_not_push, tpParams);
      return WorldStates.FAILED;
    }
    if (!obj.shiftable) {
      this.io.msg(this.lexicon.cannot_push, tpParams);
      return WorldStates.FAILED;
    }
    if (!room[dir] || room[dir].isHidden()) {
      this.io.msg(this.lexicon.not_that_way, tpParams);
      return WorldStates.FAILED;
    }
    if (room[dir].isLocked()) {
      this.io.msg(this.processor.locked_exit(char, room[dir]));
      return WorldStates.FAILED;
    }
    if (typeof room[dir].noShiftingMsg === "function") {
      this.io.msg(room[dir].noShiftingMsg(char, obj));
      return WorldStates.FAILED;
    }
    if (typeof room[dir].noShiftingMsg === "string") {
      this.io.msg(room[dir].noShiftingMsg);
      return WorldStates.FAILED;
    }
    if (typeof obj.shift === "function") {
      const res = obj.shift(char, dir, verb);
      return res ? WorldStates.SUCCESS : WorldStates.FAILED;
    }
    if (dir === "up") {
      this.io.msg(this.lexicon.cannot_push_up, tpParams);
      return WorldStates.FAILED;
    }
    const dest = room[dir].name;
    obj.moveToFrom(dest);
    char.loc = dest;
    tpParams.dest = this.state.get(dest);
    this.io.msg(this.lexicon.push_exit_successful, tpParams);
    return WorldStates.SUCCESS;
  }
  handleTieTo(char, rope, obj2) {
    if (!rope.rope)
      return this.io.failedmsg("You cannot attach that to anything.", {
        rope
      });
    if (!obj2.attachable)
      return this.io.failedmsg("That is not something you can {rope.attachVerb} {nm:rope:the} to.", {rope});
    if (rope.tiedTo1 === obj2.name)
      return this.io.failedmsg("It already is.");
    if (rope.tiedTo2 === obj2.name)
      return this.io.failedmsg("It already is.");
    if (rope.tiedTo1 && rope.tiedTo2)
      return this.io.failedmsg("It is already {rope.attachedVerb} to {nm:obj1:the} and {nm:obj12:the}.", {
        rope: this.state.get(rope.tiedTo1),
        obj1: this.state.get(rope.tiedTo2),
        obj2: this.state.get(rope.tiedTo2)
      });
    this.io.msg(`{nv:char:${rope.attachVerb}:true} {nm:rope:the} to {nm:obj2:the}.`, {
      char,
      rope,
      obj2
    });
    rope.attachTo(obj2);
    return WorldStates.SUCCESS;
  }
  handleUntieFrom(char, rope, obj2) {
    if (rope !== this.state.get(rope))
      return this.io.failedmsg("You cannot attach that to - or detach it from - anything.", {
        rope
      });
    if (obj2 === void 0) {
      if (!rope.tiedTo1 && !rope.tiedTo2)
        return this.io.failedmsg("{nv:rope:be:true} not {rope.attachedVerb} to anything.", {
          rope
        });
      if (rope.tiedTo1 && !rope.tiedTo2) {
        obj2 = this.state.get(rope.tiedTo1);
      } else if (!rope.tiedTo1 && rope.tiedTo2) {
        obj2 = this.state.get(rope.tiedTo2);
      } else if (this.state.get(rope.tiedTo1).isHere() && !this.state.get(rope.tiedTo2).isHere()) {
        obj2 = this.state.get(rope.tiedTo1);
      } else if (!this.state.get(rope.tiedTo1).isHere() && this.state.get(rope.tiedTo2).isHere()) {
        obj2 = this.state.get(rope.tiedTo2);
      } else {
        return this.io.failedmsg("Which end of {nm:rope:the} do you want to {rope.detachVerb}?", {
          rope
        });
      }
    } else if (rope.tiedTo1 !== obj2.name && rope.tiedTo2 !== obj2.name) {
      return this.io.failedmsg("{nv:rope:be:true} not {rope.attachedVerb} to {nm:obj2:the}.", {
        rope,
        obj2
      });
    }
    if (obj2 === rope.tiedTo1 && rope.tethered)
      return this.io.failedmsg("{nv:char:can:true} not {rope.detachVerb} {nm:rope:the} from {nm:obj2:the}.", {char, rope, obj2});
    this.io.msg(`{nv:char:${rope.detachVerb}:true} {nm:rope:the} from {nm:obj2:the}.`, {
      char,
      rope,
      obj2
    });
    rope.detachFrom(obj2);
    return WorldStates.SUCCESS;
  }
}
