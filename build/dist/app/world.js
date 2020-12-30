import {Base} from "../lib/base.js";
import {WorldStates} from "../lib/constants.js";
import {toInt} from "../lib/tools/tools.js";
import {Exit} from "../node/exit.js";
export class World extends Base {
  constructor() {
    super(...arguments);
    this._isCreated = false;
  }
  get isCreated() {
    return this._isCreated;
  }
  ifNotDark(item) {
    return !this.game.dark || item.lightSource() > WorldStates.LIGHT_NONE;
  }
  findUniqueName(s) {
    if (!this.state.exists(s)) {
      return s;
    }
    const res = /(\d+)$/.exec(s);
    if (!res) {
      return this.findUniqueName(`${s}0`);
    }
    const n = toInt(res[0]) + 1;
    return this.findUniqueName(s.replace(/(\d+)$/, `${n}`));
  }
  init() {
    let player;
    this.state.forEach((key, val) => {
      if (val.player) {
        player = val;
      }
    });
    if (!player) {
      this.io.errormsg("No player object found. This is probably due to an error in data.js. Do [Ctrl][Shft]-I to open the developer tools, and go to the console tab, and look at the first error in the list (if it mentions jQuery, skip it and look at the second one). It should tell you exactly which line in which file. But also check one object is actually flagged as the player.");
      return;
    }
    this.game.update(player);
    if (this.state.get("background") === void 0) {
      this.state.set("background", this.state.createItem("background", {
        scenery: true,
        examine: this.lexicon.default_description,
        background: true,
        name: "default_background_object",
        lightSource: () => {
          return WorldStates.LIGHT_NONE;
        },
        isAtLoc: (loc2, situation) => {
          if (typeof loc2 !== "string")
            loc2 = loc2.name;
          if (!this.state.exists(loc2))
            this.io.errormsg(`Unknown location: ${loc2}`);
          return this.state.get(loc2)?.room && situation === WorldStates.PARSER;
        }
      }));
    }
    if (!this.state.get("background")?.background) {
      this.io.errormsg("It looks like an item has been named 'background`, but is not set as the background item. If you intended to do this, ensure the background property is set to true.");
    }
    this.state.forEach((key, val) => this.initItem(val));
    this._isCreated = true;
    if (this.settings.playMode === "beta") {
      this.processor.betaTestIntro();
    }
    this.io.msgHeading(this.settings.title, 2);
    if (this.settings.subtitle)
      this.io.msgHeading(this.settings.subtitle, 3);
    this.io.setTitleAndInit(this.settings.title);
    this.game.ticker = setInterval(this.game.gameTimer, 1e3);
    this.state.get(this.game.player.loc.name).visited += 1;
  }
  initItem(item) {
    if (this.settings.playMode === "dev" && item.loc && !this.state.exists(item.loc)) {
      this.log.info(`ERROR: The item \`${item.name}\` is in an unknown location (${item.loc})`);
    }
    if (item._setup)
      item._setup();
    if (item.setup)
      item.setup();
    this.lexicon.exit_list.forEach((exit2) => {
      const ex = item[exit2.name];
      if (ex) {
        ex.origin = item;
        ex.dir = exit2.name;
        if (ex.alsoDir) {
          for (const dir of ex.alsoDir) {
            item[dir] = new Exit(ex.name, ex);
            item[dir].scenery = true;
          }
        }
      }
    });
    if (this.settings.playMode === "dev") {
      const dirs = this.lexicon.exit_list.filter((el) => el.type !== "nocmd").map((el) => el.name);
      item.forEach((key) => {
        if (dirs.includes(key)) {
          if (!(item[key] instanceof Exit))
            this.log.info(`ERROR: Exit ${key} of ${item.name} is not an Exit instance.`);
          if (item[key].name !== "_" && !this.state.exists(item[key].name))
            this.log.info(`ERROR: Exit ${key} of ${item.name} goes to an unknown location (${item[key].name}).`);
        } else if (item[key] instanceof Exit)
          this.log.info(`ERROR: Attribute ${key} of ${item.name} is an Exit instance and probably should not.`);
      });
    }
  }
  endTurn(result) {
    if (result === true)
      this.io.debugmsg("That command returned 'true', rather than the proper result code.");
    if (result === false)
      this.io.debugmsg("That command returned 'false', rather than the proper result code.");
    this.utils.handleChangeListeners();
    if (result === WorldStates.SUCCESS || this.settings.failCountsAsTurn && result === WorldStates.FAILED) {
      this.game.turnCount += 1;
      this.state.forEach((key, val) => val.doEvent(key));
      this.utils.handleChangeListeners();
      this.resetPauses();
      this.game.update();
      this.game.saveGameState();
      this.io.endTurnUI(true);
    } else {
      this.io.endTurnUI(false);
    }
  }
  resetPauses() {
    this.state.forEach((key, val) => {
      if (val.paused) {
        delete val.paused;
      }
    });
  }
  scopeSnapshot() {
    this.state.forEach((key, val) => {
      delete val.scopeStatus;
      delete val.scopeStatusForRoom;
    });
    let room = this.state.get(this.game.player.loc.name);
    if (room === void 0) {
      this.io.errormsg("Error in scopeSnapshot; the location assigned to the player does not exist.");
      this.log.info(`Error in scopeSnapshot; the location assigned to the player does not exist ('${this.game.player.loc}').`);
      this.log.info(`Is it possible the location is in a file not loaded? Loaded files are: ${this.settings.files}`);
      return;
    }
    room.scopeStatusForRoom = WorldStates.REACHABLE;
    while (room.loc && room.canReachThrough()) {
      room = this.state.get(room.loc.name);
      room.scopeStatusForRoom = WorldStates.REACHABLE;
    }
    room.scopeSnapshot(false);
    while (room.loc && room.canSeeThrough()) {
      room = this.state.get(room.loc.name);
      room.scopeStatusForRoom = WorldStates.VISIBLE;
    }
    room.scopeSnapshot(true);
  }
  setRoom(char, obj, dir = "", forced = false) {
    let room;
    let roomName;
    if (typeof obj === "string") {
      room = this.state.get(obj);
      if (room === void 0) {
        this.io.errormsg(`Failed to find room: ${obj}.`);
        return false;
      }
    } else {
      if (obj.name === void 0) {
        this.io.errormsg(`Not sure what to do with this room: ${obj} (a ${typeof obj}).`);
        return false;
      }
      room = obj;
      roomName = room.name;
    }
    if (dir) {
      char.onGoCheckList.forEach((el) => {
        if (!this.state.get(el).onGoCheck(char, roomName, dir))
          return false;
      });
    }
    if (char !== this.game.player) {
      if (dir) {
        this.io.msg(this.processor.stop_posture(char));
        this.io.msg(this.lexicon.go_successful, {char, dir});
      }
      char.previousLoc = char.loc;
      char.loc = room;
      char.onGoActionList.forEach((el) => {
        this.log.info(el);
        if (!this.state.get(el).onGoAction(char, roomName, dir))
          return false;
      });
      return true;
    }
    if (!forced && this.game.player.loc.name === roomName) {
      return false;
    }
    if (this.settings.clearScreenOnRoomEnter)
      this.io.clearScreen();
    this.game.room.onExit();
    char.previousLoc = char.loc;
    char.loc = room;
    this.game.update();
    this.setBackground();
    if (dir !== "suppress") {
      this.enterRoom();
    }
    for (const el of char.onGoActionList) {
      if (!this.state[el].onGoAction(char, roomName, dir))
        return false;
    }
    return true;
  }
  enterRoom() {
    if (this.game.room.beforeEnter === void 0) {
      this.io.errormsg(`This room, ${this.game.room.name}, has no 'beforeEnter\` function defined.  This is probably because it is not actually a room (it was not created with 'createRoom' and has not got the QuestJs._defaults.DEFAULT_ROOM template), but it an item. It is not clear what state the game will continue in.`);
      return;
    }
    this.game.room.beforeEnter();
    if (this.game.room.visited === 0) {
      this.game.room.beforeFirstEnter();
    }
    this.enterRoomAfterScripts();
  }
  enterRoomAfterScripts() {
    this.game.room.description();
    this.game.player.followers.forEach((follower) => {
      if (follower.loc !== this.game.player.loc)
        follower.moveWithDescription(this.game.room.name);
    });
    this.game.room.afterEnter();
    if (this.game.room.visited === 0) {
      this.game.room.afterFirstEnter();
    }
    this.game.room.afterEnterIf.forEach((key) => {
      if (this.game.room.afterEnterIfFlags.split(" ").includes(key))
        return;
      if (this.game.room.afterEnterIf[key].test()) {
        this.game.room.afterEnterIf[key].action();
        this.game.room.afterEnterIfFlags += ` ${key}`;
      }
    });
    this.game.room.visited += 1;
  }
  setBackground() {
    let md;
    if (typeof this.game.room.desc === "string") {
      if (!this.game.room.backgroundNames) {
        this.game.room.backgroundNames = [];
        while (md = WorldStates.BACK_REGEX.exec(this.game.room.desc)) {
          const arr = md[0].substring(1, md[0].length - 1).split(":");
          this.game.room.desc = this.game.room.desc.replace(md[0], arr[0]);
          arr.forEach((el) => this.game.room.backgroundNames.push(el));
        }
      }
    }
    this.state.get("background").regex = this.game.room.backgroundNames && this.game.room.backgroundNames.length > 0 ? new RegExp(this.game.room.backgroundNames.join("|")) : false;
  }
}
