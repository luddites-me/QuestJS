import {toInt, sentenceCase} from "../../index.js";
import {Known, prefix, WorldStates} from "../../lib/index.js";
import {allowable, Item} from "./item.js";
export class Countable extends Item {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.count;
    this.multiLoc = true;
  }
  extractNumber(cmdMatch = "") {
    const md = /^(\d+)/.exec(cmdMatch);
    if (!md) {
      return false;
    }
    return toInt(md[1]);
  }
  templatePreSave() {
    const l = [];
    for (const key in this.countableLocs) {
      l.push(`${key}=${this.countableLocs[key]}`);
    }
    this.customSaveCountableLocs = l.join(",");
    this.preSave();
  }
  templatePostLoad() {
    const l = this.customSaveCountableLocs.split(",");
    this.countableLocs = {};
    for (const el of l) {
      const parts = el.split("=");
      this.countableLocs[parts[0]] = toInt(parts[1]);
    }
    delete this.customSaveCountableLocs;
    this.postLoad();
  }
  getListAlias(loc) {
    return `${sentenceCase(this.pluralAlias ? this.pluralAlias : `${this.listAlias}s`)} (${this.countAtLoc(loc)})`;
  }
  isAtLoc(loc, situation) {
    if (!this.countableLocs[loc]) {
      return false;
    }
    if (situation === WorldStates.LOOK && this.scenery)
      return false;
    if (situation === WorldStates.SIDE_PANE && this.scenery)
      return false;
    return this.countableLocs[loc] > 0;
  }
  countAtLoc(loc) {
    if (!this.countableLocs[loc]) {
      return 0;
    }
    return this.countableLocs[loc];
  }
  moveToFrom(toLoc, fromLoc, count) {
    if (!count)
      count = this.extractNumber();
    if (!count)
      count = this.countAtLoc(fromLoc);
    this.takeFrom(fromLoc, count);
    this.giveTo(toLoc, count);
  }
  takeFrom(loc, count) {
    if (this.countableLocs[loc] !== Known.INFINITY)
      this.countableLocs[loc] -= count;
    if (this.countableLocs[loc] <= 0) {
      delete this.countableLocs[loc];
    }
    this.state.get(loc.name).itemTaken(this, count);
  }
  giveTo(loc, count) {
    if (!this.countableLocs[loc]) {
      this.countableLocs[loc] = 0;
    }
    if (this.countableLocs[loc] !== Known.INFINITY) {
      this.countableLocs[loc] += count;
    }
    this.state.get(loc.name).itemDropped(this, count);
  }
  findSource(sourceLoc, tryContainers) {
    if (this.isAtLoc(sourceLoc)) {
      return sourceLoc;
    }
    if (tryContainers) {
      const containers = this.scope.scopeReachable().filter((el) => el.container);
      for (const container of containers) {
        if (container.closed)
          continue;
        if (this.isAtLoc(container.name))
          return container.name;
      }
    }
    return false;
  }
  take(isMultiple, char) {
    const tpParams = {char, item: this};
    const sourceLoc = this.findSource(char.loc, true);
    if (!sourceLoc) {
      this.io.msg(prefix(this, isMultiple) + this.lexicon.none_here, tpParams);
      return false;
    }
    let n = this.extractNumber();
    const m = this.countAtLoc(sourceLoc);
    if (!n) {
      n = m;
    }
    if (n > m) {
      n = m;
    }
    tpParams[`${this.name}_count`] = n;
    this.io.msg(prefix(this, isMultiple) + this.lexicon.take_successful, tpParams);
    this.takeFrom(sourceLoc, n);
    this.giveTo(char.name, n);
    if (this.scenery)
      delete this.scenery;
    return true;
  }
  drop(isMultiple, char) {
    const tpParams = {char, item: this};
    let n = this.extractNumber();
    const m = this.countAtLoc(char.name);
    if (m === 0) {
      this.io.msg(prefix(this, isMultiple) + this.lexicon.none_held, tpParams);
      return false;
    }
    if (!n) {
      m === Known.INFINITY ? 1 : n = m;
    }
    if (n > m) {
      n = m;
    }
    tpParams[`${this.name}_count`] = n;
    this.io.msg(prefix(this, isMultiple) + this.lexicon.drop_successful, tpParams);
    this.takeFrom(char.name, n);
    this.giveTo(char.loc, n);
    return true;
  }
}
