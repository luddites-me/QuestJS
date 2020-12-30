import {Known, WorldStates} from "../../index.js";
import {Node} from "../node.js";
export class Loc extends Node {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.room = false;
    this.beforeEnter = Known.NOOP;
    this.beforeFirstEnter = Known.NOOP;
    this.afterEnter = Known.NOOP;
    this.afterEnterIf = {};
    this.afterEnterIfFlags = "";
    this.afterFirstEnter = Known.NOOP;
    this.onExit = Known.NOOP;
    this.visited = 0;
    this.getExits = (options) => {
      const list = [];
      for (const exit of this.lexicon.exit_list) {
        if (this.hasExit(exit.name, options)) {
          list.push(this[exit.name]);
        }
      }
      return list;
    };
    this.hasExit = (dir, options = {excludeLocked: false, excludeScenery: false}) => {
      if (!this[dir])
        return false;
      if (options.excludeLocked && this[dir].isLocked())
        return false;
      if (options.excludeScenery && this[dir].scenery)
        return false;
      return !this[dir].isHidden();
    };
  }
  lightSource() {
    return WorldStates.LIGHT_FULL;
  }
  description() {
    if (this.game.dark) {
      this.utils.printOrRun(this.game.player, this, "darkDesc");
      return true;
    }
    for (const line of this.settings.roomTemplate) {
      this.io.msg(line);
    }
    return true;
  }
  examine() {
    if (this.game.dark) {
      this.utils.printOrRun(this.game.player, this, "darkDesc");
      return true;
    }
    this.io.msg(typeof this.desc === "string" ? this.desc : this.desc());
    return true;
  }
  darkDescription() {
    return this.io.msg("It is dark.");
  }
  getRandomExit(options) {
    return this.random.fromArray(this.getExits(options));
  }
  findExit(dest, options) {
    if (typeof dest === "object")
      dest = dest.name;
    for (const exit of this.lexicon.exit_list) {
      if (this.hasExit(exit.name, options) && this[exit.name].name === dest) {
        return this[exit.name];
      }
    }
    return null;
  }
  setExitLock(dir, locked) {
    if (!this[dir]) {
      return false;
    }
    this[dir].locked = locked;
    return true;
  }
  setExitHide(dir, hidden) {
    if (!this[dir]) {
      return false;
    }
    this[dir].hidden = hidden;
    return true;
  }
  templatePreSave() {
    this.preSave();
  }
  templatePostLoad() {
    for (const exit of this.lexicon.exit_list) {
      const dir = exit.name;
      if (this[`customSaveExit${dir}`]) {
        this[dir].locked = /locked/.test(this[`customSaveExit${dir}`]);
        this[dir].hidden = /hidden/.test(this[`customSaveExit${dir}`]);
        delete this[`customSaveExit${dir}`];
        if (this.saveExitDests) {
          this[dir].name = this[`customSaveExitDest${dir}`];
          delete this[`customSaveExitDest${dir}`];
        }
      }
    }
    this.postLoad();
  }
  getReverseExit(dir) {
    const reverseDir = this.lexicon.exit_list.find((el) => el.name === dir);
    const dest = this[dir];
    return dest[reverseDir.name];
  }
}
;
