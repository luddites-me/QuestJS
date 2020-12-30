import { Known, Quest, WorldStates } from "../..";
import { FnPrmAny } from "../../@types/fn";
import { INode } from "../INode";
import { Node } from "../node";

export class Loc extends Node {
  room = false;
  beforeEnter = Known.NOOP;
  beforeFirstEnter = Known.NOOP;
  afterEnter = Known.NOOP;
  afterEnterIf = {};
  afterEnterIfFlags = '';
  afterFirstEnter = Known.NOOP;
  onExit = Known.NOOP;
  visited = 0;
  desc;
  preSave: FnPrmAny;
  saveExitDests;
  postLoad: FnPrmAny;
  lightSource() { return WorldStates.LIGHT_FULL; }

  constructor(quest: Quest, name: string, hash: Partial<Loc> = {}) {
    super(quest, name, hash);
  }

  description() {
    if (this.game.dark) {
      this.utils.printOrRun(this.game.player, this, 'darkDesc');
      return true;
    }
    for (const line of this.settings.roomTemplate) {
      this.io.msg(line);
    }
    return true;
  }

  examine() {
    if (this.game.dark) {
      this.utils.printOrRun(this.game.player, this, 'darkDesc');
      return true;
    }
    this.io.msg(typeof this.desc === 'string' ? this.desc : this.desc());
    return true;
  }

  darkDescription() { return this.io.msg('It is dark.'); }

  getExits = (options) => {
    const list: INode[] = [];
    for (const exit of this.lexicon.exit_list) {
      if (this.hasExit(exit.name, options)) {
        list.push(this[exit.name]);
      }
    }
    return list;
  }

  // returns null if there are no exits
  getRandomExit(options) {
    return this.random.fromArray(this.getExits(options));
  }

  hasExit = (dir, options = { excludeLocked: false, excludeScenery: false }) => {
    // this.log.info(this.name)
    // this.log.info(dir)
    if (!this[dir]) return false;
    // this.log.info(this[dir])
    if (options.excludeLocked && this[dir].isLocked()) return false;
    if (options.excludeScenery && this[dir].scenery) return false;
    return !this[dir].isHidden();
  }

  findExit(dest, options) {
    if (typeof dest === 'object') dest = dest.name;
    for (const exit of this.lexicon.exit_list) {
      if (this.hasExit(exit.name, options) && this[exit.name].name === dest) {
        return this[exit.name];
      }
    }
    return null;
  }

  // Lock or unlock the exit indicated
  // Returns false if the exit does not exist or is not an Exit object
  // Returns true if successful
  setExitLock(dir, locked) {
    if (!this[dir]) {
      return false;
    }
    this[dir].locked = locked;
    return true;
  }

  // Hide or unhide the exit indicated
  // Returns false if the exit does not exist or is not an Exit object
  // Returns true if successful
  setExitHide(dir, hidden) {
    if (!this[dir]) {
      return false;
    }
    this[dir].hidden = hidden;
    return true;
  }

  templatePreSave() {
    /* for (let i = 0; i < this.lexicon.exit_list.length; i += 1) {
      const dir = this.lexicon.exit_list[i].name;
      if (this[dir] !== undefined) {
        this["customSaveExit" + dir] = (this[dir].locked ? "locked" : "");
        this["customSaveExit" + dir] += "/" + (this[dir].hidden ? "hidden" : "");
        if (this.saveExitDests) this["customSaveExitDest" + dir] = this[dir].name;
      }
    } */
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
          // this.log.info("Just set " + dir + " in " + this.name + " to " + this["customSaveExitDest" + dir])
          delete this[`customSaveExitDest${dir}`];
        }
      }
    }
    this.postLoad();
  }

  getReverseExit(dir: string) {
    const reverseDir = this.lexicon.exit_list.find((el) => el.name === dir);
    const dest = this[dir];
    return dest[reverseDir.name];
  }
};
