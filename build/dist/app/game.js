import {WorldStates} from "../lib/constants.js";
import {Node} from "../node/index.js";
import {Player} from "../node/actors/player.js";
import {World} from "./world.js";
import {toInt} from "../lib/tools/tools.js";
export class Game extends Node {
  constructor(quest, name = "built-in_game_object", hash = {}) {
    super(quest, name, hash);
    this.extraTime = 0;
    this.eventFunctions = {};
    this.gameState = [];
    this.spoken = false;
    this.timerEvents = [];
    this.turnCount = 0;
    this.verbosity = WorldStates.VERBOSE;
    this.preSave = () => {
      const arr = [];
      for (const el of this.timerEvents) {
        if (el.triggerTime) {
          arr.push(`${el.eventName}/${el.triggerTime}/${el.interval ? el.interval : "-"}`);
        }
      }
      this.timeSaveAttribute = arr.join(" ");
    };
    this.postLoad = () => {
      this.timerEvents = [];
      const arr = this.timeSaveAttribute.split(" ");
      for (const el of arr) {
        const params = el.split("/");
        const interval = params[2] === "-" ? void 0 : toInt(params[2]);
        this.timerEvents.push({
          eventName: params[0],
          triggerTime: toInt(params[1]),
          interval
        });
      }
      this.timeSaveAttribute = "";
    };
    this.startTime = new Date();
    this.init();
  }
  get elapsedTime() {
    return new Date().getTime() - this.startTime.getTime() + this.extraTime;
  }
  get world() {
    return this._world = this._world || new World(this._quest);
  }
  isAtLoc() {
    return false;
  }
  init() {
    this.world.init();
    this.player = this.player || new Player(this._quest, "built-in_player");
    this.update(this.player);
    this.saveGameState();
    this.world.setBackground();
  }
  begin() {
    if (this.settings.startingDialogEnabled)
      return;
    if (typeof this.settings.intro === "string") {
      this.io.msg(this.settings.intro);
    } else if (this.settings.intro) {
      Object.keys(this.settings.intro).forEach((key) => this.io.msg(this.settings.intro[key]));
    }
    if (typeof this.settings.setup === "function")
      this.settings.setup();
    this.world.enterRoom();
  }
  update(player2 = this.player) {
    if (player2 !== void 0) {
      this.state.set(this.player.name, player2);
      this.player = player2;
    }
    if (!this.player) {
      this.io.errormsg("No player object found. This will not go well...");
      return;
    }
    if (!this.player.loc || !this.state.get(this.player.loc.name)) {
      this.io.errormsg(this.player.loc === void 0 ? "No player location set." : `Player location set to '${this.player.loc}', which does not exist.`);
      this.io.errormsg("If this is when you load a game: This is likely to be because of an error in one of the .js files. Press F12, and go to the 'Console' tab (if not already open), to see the error. Look at the very first error (but ignore any that mentions 'jquery'). It should tell you the file and line number that is causing the problem.");
      this.io.errormsg("If this is when player moves: This is likely to be because of an error in the exit being used.");
    }
    this.room = this.state.get(this.player.loc.name);
    this.world.scopeSnapshot();
    let light = WorldStates.LIGHT_NONE;
    this.state.forEach((key, val) => {
      if (val.scopeStatus) {
        if (light < val.lightSource()) {
          light = val.lightSource();
        }
      }
    });
    this.dark = light < WorldStates.LIGHT_MEAGRE;
  }
  saveGameState() {
    if (this.settings.maxUndo > 0) {
      this.gameState.push(this.saveLoad.getSaveBody());
      if (this.gameState.length > this.settings.maxUndo)
        this.gameState.shift();
    }
  }
  registerEvent(eventName, func) {
    if (this.world.isCreated && !this.settings.saveDisabled) {
      this.io.errormsg("Attempting to use registerEvent after set up.");
      return;
    }
    this.eventFunctions[eventName] = func;
  }
  registerTimedEvent(eventName, triggerTime, interval) {
    if (this.world.isCreated && !this.settings.saveDisabled) {
      this.io.errormsg("Attempting to use registerTimedEvent after set up.");
      return;
    }
    this.timerEvents.push({
      eventName,
      triggerTime: triggerTime + this.elapsedRealTime,
      interval
    });
  }
  gameTimer() {
    this.elapsedRealTime += 1;
    let somethingHappened = false;
    for (const el of this.timerEvents) {
      if (el.triggerTime && el.triggerTime < this.elapsedRealTime) {
        if (typeof this.eventFunctions[el.eventName] === "function") {
          const flag = this.eventFunctions[el.eventName]();
          if (el.interval && !flag) {
            el.triggerTime += el.interval;
          } else {
            delete el.triggerTime;
          }
          somethingHappened = true;
        } else {
          this.io.errormsg(`A timer is trying to call event '${el.eventName}' but no such function is registered.`);
        }
      }
    }
    if (somethingHappened)
      this.utils.handleChangeListeners();
  }
}
