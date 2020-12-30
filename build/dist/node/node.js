import {sentenceCase} from "../lib/tools/index.js";
import {Base} from "../lib/base.js";
import {Known, WorldStates} from "../lib/constants.js";
export class Node extends Base {
  constructor(quest, name, hash = {}) {
    super(quest);
    this.eventActive = false;
    this.eventCountdown = 0;
    this.getExits = (...params) => [];
    this.hidden = false;
    this.item = {};
    this.itemDropped = Known.NOOP;
    this.itemTaken = Known.NOOP;
    this.locked = false;
    this.onMove = Known.NOOP_TRUE;
    this.postLoad = Known.NOOP;
    this.preSave = Known.NOOP;
    this.pronouns = this.lexicon.pronouns.thirdperson;
    this.use = Known.NOOP;
    this.name = name;
    Object.assign(this, hash);
    this.init();
  }
  canReachThrough() {
    return false;
  }
  canSeeThrough() {
    return false;
  }
  canTalkPlayer() {
    return false;
  }
  complexIsAtLoc(...params) {
    return true;
  }
  eventCondition(...params) {
    return true;
  }
  eventScript(...params) {
    return true;
  }
  getContents(...params) {
    return this.utils.getContents(params);
  }
  getWorn(...params) {
  }
  hasExit(...params) {
    return false;
  }
  listContents(situation, modified) {
    return this.utils.listContents(situation, modified);
  }
  testForRecursion(char) {
    return this.utils.testForRecursion(char, this);
  }
  isLocked() {
    return this.locked;
  }
  isHidden() {
    return this.hidden || this.game.dark;
  }
  isAtLoc(loc, situation) {
    if (typeof loc !== "string")
      loc = loc.name;
    if (!this.state.exists(loc))
      this.io.errormsg(`The location name \`${loc}\`, does not match anything in the game.`);
    if (this.complexIsAtLoc) {
      if (!this.complexIsAtLoc(loc, situation))
        return false;
    } else if (this.loc !== loc)
      return false;
    if (situation === void 0)
      return true;
    if (situation === WorldStates.LOOK && this.scenery)
      return false;
    if (situation === WorldStates.SIDE_PANE && this.scenery)
      return false;
    return true;
  }
  isHere() {
    return this.isAtLoc(this.game.player.loc);
  }
  isHeld() {
    return this.isAtLoc(this.game.player.name);
  }
  isHereOrHeld() {
    return this.isHere() || this.isHeld();
  }
  countAtLoc(loc) {
    if (typeof loc !== "string")
      loc = loc.name;
    return this.isAtLoc(loc) ? 1 : 0;
  }
  getAlias() {
    return this.alias;
  }
  onCreation(...params) {
  }
  scopeSnapshot(visible) {
    if (this.scopeStatus)
      return;
    this.scopeStatus = visible ? WorldStates.VISIBLE : WorldStates.REACHABLE;
    if (!this.getContents && !this.componentHolder)
      return;
    let l;
    if (this.getContents) {
      if (!this.canSeeThrough() && !this.scopeStatusForRoom && this.name !== this.game.player.name) {
        return;
      }
      if (!this.canReachThrough() && this.scopeStatusForRoom !== WorldStates.REACHABLE && this.name !== this.game.player.name) {
        visible = true;
      }
      l = this.getContents(WorldStates.SCOPING);
    } else {
      l = [];
      this.state.forEach((key, val) => {
        if (val.loc.name === this.name)
          l.push(val);
      });
    }
    for (const el of l) {
      el.scopeSnapshot(visible);
    }
  }
  moveToFrom(toLoc, fromLoc, ...params) {
    if (fromLoc === void 0)
      fromLoc = this.loc;
    if (fromLoc === toLoc)
      return;
    if (!this.state.exists(fromLoc))
      this.io.errormsg(`The location name \`${fromLoc}\`, does not match anything in the game.`);
    if (!this.state.exists(toLoc))
      this.io.errormsg(`The location name \`${toLoc}\`, does not match anything in the game.`);
    this.loc = toLoc;
    this.state.get(fromLoc).itemTaken(this);
    this.state.get(toLoc).itemDropped(this);
    if (this.onMove !== void 0)
      this.onMove(toLoc, fromLoc);
  }
  templatePostLoad() {
    this.postLoad();
  }
  templatePreSave() {
    this.preSave();
  }
  getListAlias(...params) {
    return this.listAlias;
  }
  getSaveString() {
    this.templatePreSave();
    let s = "Object=";
    Object.keys(this).forEach((key) => {
      const item = this[key];
      if (typeof item !== "function") {
        if (key !== "name" && key !== "gameState") {
          s += this.saveLoad.encode(key, item);
        }
      }
    });
    return s;
  }
  eventIsActive() {
    return this.eventActive;
  }
  doEvent(turn) {
    if (!this.eventIsActive())
      return;
    if (this.eventCountdown > 1) {
      this.eventCountdown -= 1;
      return;
    }
    if (this.eventCondition && !this.eventCondition(turn))
      return;
    this.eventScript(turn);
    if (typeof this.eventPeriod === "number") {
      this.eventCountdown = this.eventPeriod;
    } else {
      this.eventActive = false;
    }
  }
  init() {
    if (this.game.world.isCreated && !this.settings.saveDisabled) {
      this.log.info(`Attempting to use createObject with \`${this.name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`);
      this.io.errormsg(`Attempting to use createObject with \`${this.name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`);
    }
    if (/\W/.test(this.name)) {
      this.log.info(`Attempting to use the disallowed name \`${this.name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`);
      this.io.errormsg(`Attempting to use the disallowed name \`${this.name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`);
    }
    if (this.state.exists(this.name)) {
      this.log.info(`Attempting to use the name \`${this.name}\` when there is already an item with that name in the world.`);
      this.io.errormsg(`Attempting to use the name \`${this.name}\` when there is already an item with that name in the world.`);
    }
    if (!this.alias)
      this.alias = this.name.replace(/_/g, " ");
    if (!this.listAlias)
      this.listAlias = sentenceCase(this.alias);
    if (!this.pluralAlias)
      this.pluralAlias = `${this.alias}s`;
    if (this.pluralAlias === "*")
      this.pluralAlias = this.alias;
    this.verbFunctions.push((o, verbList) => {
      verbList.push(this.lexicon.verbs.examine);
      if (o.use !== void 0)
        verbList.push(this.lexicon.verbs.use);
    });
    this.onCreation();
    this.state.set(this.name, this);
  }
}
