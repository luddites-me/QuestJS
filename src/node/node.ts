import { FnPrmAny } from "../../@types/fn";
import { Base } from "../lib/base";
import { Known, WorldStates } from "../lib/constants";
import { Quest } from "../Quest";
import { INode } from "./INode";

export abstract class Node extends Base implements INode {
  alias: string;
  canReachThrough() { return false; };
  canSeeThrough() { return false; };
  canTalkPlayer() { return false; };
  clonePrototype: INode;
  complexIsAtLoc(...params) { return true; };
  componentHolder;
  eventActive = false;
  eventCondition(...params) { return true; };
  eventCountdown = 0;
  eventPeriod: number;
  eventScript(...params) { return true; };
  getContents(...params) { return this.utils.getContents(params); };
  getExits: (...params) => INode[] = (...params) => [];
  getWorn(...params) { }
  hasExit(...params) { return false; };
  hidden = false;
  item: Partial<INode> = {};
  itemDropped = Known.NOOP;
  itemTaken = Known.NOOP;
  listAlias: string;
  listContents(situation, modified?: boolean) { return this.utils.listContents(situation, modified); }
  loc: INode;
  previousLoc: INode;
  locked = false;
  name: string;
  nameModifierFunctions: ((...params) => void)[];
  onMove: FnPrmAny = Known.NOOP_TRUE;
  pluralAlias: string;
  postLoad = Known.NOOP;
  preSave = Known.NOOP;
  pronouns = this.lexicon.pronouns.thirdperson;
  scenery;
  scopeStatus;
  scopeStatusForRoom;
  testForRecursion(char) { return this.utils.testForRecursion(char, this); }
  use: FnPrmAny = Known.NOOP;
  verbFunctions: ((...params) => void)[];
  [key: string]: any;

  constructor(quest: Quest, name: string, hash: Partial<INode> = {}) {
    super(quest);
    this.name = name;
    Object.assign(this, hash);
    this.init();
  }

  isLocked() {
    return this.locked;
  }

  isHidden() {
    return this.hidden || this.game.dark;
  }

  isAtLoc(loc, situation?: number) {
    if (typeof loc !== 'string') loc = loc.name;
    if (!this.state.exists(loc))
      this.io.errormsg(
        `The location name \`${loc}\`, does not match anything in the game.`,
      );
    if (this.complexIsAtLoc) {
      if (!this.complexIsAtLoc(loc, situation)) return false;
    } else if (this.loc !== loc) return false;
    if (situation === undefined) return true;
    if (situation === WorldStates.LOOK && this.scenery) return false;
    if (situation === WorldStates.SIDE_PANE && this.scenery) return false;
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
    if (typeof loc !== 'string') loc = loc.name;
    return this.isAtLoc(loc) ? 1 : 0;
  }

  getAlias() {
    return this.alias;
  }

  onCreation(...params) {

  }


  scopeSnapshot(visible) {
    if (this.scopeStatus) return; // already done this one

    this.scopeStatus = visible
      ? WorldStates.VISIBLE
      : WorldStates.REACHABLE; // set the value

    if (!this.getContents && !this.componentHolder) return; // no lower levels so done

    let l;
    if (this.getContents) {
      // this is a container, so get the contents
      if (
        !this.canSeeThrough() &&
        !this.scopeStatusForRoom &&
        this.name !== this.game.player.name
      ) {
        // cannot see or reach contents
        return;
      }
      if (
        !this.canReachThrough() &&
        this.scopeStatusForRoom !== WorldStates.REACHABLE &&
        this.name !== this.game.player.name
      ) {
        // can see but not reach contents
        visible = true;
      }
      l = this.getContents(WorldStates.SCOPING);
    } else {
      // this has components, so get them
      l = [];
      this.state.forEach((key, val) => {
        if (val.loc.name === this.name) l.push(val);
      });
    }
    for (const el of l) {
      // go through them
      el.scopeSnapshot(visible);
    }
  };

  moveToFrom(toLoc, fromLoc, ...params) {
    if (fromLoc === undefined) fromLoc = this.loc;
    if (fromLoc === toLoc) return;

    if (!this.state.exists(fromLoc))
      this.io.errormsg(
        `The location name \`${fromLoc}\`, does not match anything in the game.`,
      );
    if (!this.state.exists(toLoc))
      this.io.errormsg(
        `The location name \`${toLoc}\`, does not match anything in the game.`,
      );
    this.loc = toLoc;
    this.state.get(fromLoc).itemTaken(this);
    this.state.get(toLoc).itemDropped(this);
    if (this.onMove !== undefined) this.onMove(toLoc, fromLoc);
  }

  templatePostLoad() {
    this.postLoad();
  };

  templatePreSave() {
    this.preSave();
  };

  getListAlias(...params) {
    return this.listAlias;
  }

  getSaveString() {
    this.templatePreSave();
    let s = 'Object=';
    Object.keys(this).forEach(key => {
      const item = this[key];
      if (typeof item !== 'function') {
        if (key !== 'name' && key !== 'gameState') {
          s += this.saveLoad.encode(key, item);
        }
      }
    })
    return s;
  };

  eventIsActive() {
    return this.eventActive;
  }

  doEvent(turn) {
    // this.log.info("this=" + this.name);
    // Not active, so stop
    if (!this.eventIsActive()) return;
    // Countdown running, so stop
    if (this.eventCountdown > 1) {
      this.eventCountdown -= 1;
      return;
    }
    // If there is a condition and it is not met, stop
    // this.log.info("this=" + this.name);
    if (this.eventCondition && !this.eventCondition(turn)) return;
    // this.log.info("this=" + this.name);
    this.eventScript(turn);
    if (typeof this.eventPeriod === 'number') {
      this.eventCountdown = this.eventPeriod;
    } else {
      this.eventActive = false;
    }
  }

  init(): void {
    if (this.game.world.isCreated && !this.settings.saveDisabled) {
      this.log.info(
        `Attempting to use createObject with \`${this.name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`,
      );
      this.io.errormsg(
        `Attempting to use createObject with \`${this.name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`,
      );
    }

    if (/\W/.test(this.name)) {
      this.log.info(
        `Attempting to use the disallowed name \`${this.name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`,
      );
      this.io.errormsg(
        `Attempting to use the disallowed name \`${this.name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`,
      );
    }
    if (this.state.exists(this.name)) {
      this.log.info(
        `Attempting to use the name \`${this.name}\` when there is already an item with that name in the world.`,
      );
      this.io.errormsg(
        `Attempting to use the name \`${this.name}\` when there is already an item with that name in the world.`,
      );
    }
    // if (typeof hash.unshift !== 'function') {
    //   this.log.info(
    //     `The list of hashes for \`${this.name}\` is not what I was expecting. Found:`,
    //   );
    //   this.log.info(hash);
    //   this.log.info('Maybe you meant to use createItem?');
    //   this.io.errormsg(
    //     `The list of hashes for \`${this.name}\` is not what I was expecting. Look at the console for more.`,
    //   );
    //   return null;
    // }

    // this.item.name = this.name;

    // Object.keys(hash).forEach(key => {
    //   Object.keys(hash[key]).forEach(subKey => {
    //     this.item[subKey] = hash[key][subKey];
    //   });
    // });

    // Give every object an alias and list alias (used in the inventories)
    if (!this.alias) this.alias = this.name.replace(/_/g, ' ');
    if (!this.listAlias) this.listAlias = sentenceCase(this.alias);
    if (!this.pluralAlias) this.pluralAlias = `${this.alias}s`;
    if (this.pluralAlias === '*') this.pluralAlias = this.alias;

    this.verbFunctions.push(
      (o: INode, verbList: string[]) => {
        verbList.push(this.lexicon.verbs.examine);
        if (o.use !== undefined) verbList.push(this.lexicon.verbs.use);
      },
    );

    this.onCreation();
    this.state.set(this.name, this);
  }
}
