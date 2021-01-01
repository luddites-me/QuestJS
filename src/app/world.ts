import { Background } from '../node/background';
import { Base } from '../lib/base';
import { WorldStates } from '../lib/constants';
import { toInt } from '../lib/tools/tools';
import { Character } from '../node/actors/character';
import { Exit } from '../node/exit';
import { Loc } from '../node/locations/loc';

export class World extends Base {

  private _isCreated = false;
  get isCreated() { return this._isCreated; }

  // Returns true if bad lighting is not obscuring the item
  ifNotDark(item) {
    return !this.game.dark || item.lightSource > WorldStates.LIGHT_NONE;
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
    // Sort out the player
    let player = this.game.player;
    if(!player) {
      this.state.forEach((key, val) => {
        if (val.player) {
          player = val as Character;
        }
      })
      if (!player) {
        this.io.errormsg(
          'No player object found. This is probably due to an error in data.js. Do [Ctrl][Shft]-I to open the developer tools, and go to the console tab, and look at the first error in the list (if it mentions jQuery, skip it and look at the second one). It should tell you exactly which line in which file. But also check one object is actually flagged as the player.'
        );
        return;
      }
      this.game.update(player);
    }
    // Create a background item if it does not exist
    // This handles the player wanting to interact with things in room descriptions
    // that are not implemented by changing its regex when a room is entered.
    let background = this.state.get('background-default_background_object');
    if (!background) {
      background = new Background(this._quest, 'default_background_object');
    }
    if (!background.background) {
      this.io.errormsg(
        "It looks like an item has been named 'background`, but is not set as the background item. If you intended to do this, ensure the background property is set to true.",
      );
    }
    this.state.forEach((key, val) => this.initItem(val));
    this._isCreated = true;

    // Go through each command
    // QuestJs._command.initCommands();

    // Set up the UI
    // this.io.endTurnUI();
    if (this.settings.playMode === 'beta') {
      this.processor.betaTestIntro();
    }
    this.io.msgHeading(this.settings.title, 2);
    if (this.settings.subtitle)
      this.io.msgHeading(this.settings.subtitle, 3);
    this.io.setTitleAndInit(this.settings.title);

    this.game.ticker = setInterval(() => { this.game.gameTimer() }, 1000);
    this.state.get(this.game.player.loc.name).visited += 1;
  }

  // Every item or room should have this called for them.
  // That will be done at the start, but you need to do it yourself
  // if creating items on the fly (but you should not be doing that anyway!).
  initItem(item) {
    if (this.settings.playMode === 'dev' && item.loc && !this.state.exists(item.loc)) {
      this.log.info(
        `ERROR: The item \`${item.name}\` is in an unknown location (${item.loc})`,
      );
    }

    if (item._setup) item._setup();
    if (item.setup) item.setup();
    this.lexicon.exit_list.forEach(exit => {
      const ex = item[exit.name];
      if (ex) {
        ex.origin = item;
        ex.dir = exit.name;
        if (ex.alsoDir) {
          for (const dir of ex.alsoDir) {
            item[dir] = new Exit(ex.name, ex);
            item[dir].scenery = true;
          }
        }
      }
    });

    if (this.settings.playMode === 'dev') {
      const dirs = this.lexicon.exit_list
        .filter((el) => el.type !== 'nocmd')
        .map((el) => el.name);
      // this.log.info(dirs)
      item.forEach(key => {
        if (dirs.includes(key)) {
          if (!(item[key] instanceof Exit))
            this.log.info(
              `ERROR: Exit ${key} of ${item.name} is not an Exit instance.`,
            );
          if (item[key].name !== '_' && !this.state.exists(item[key].name))
            this.log.info(
              `ERROR: Exit ${key} of ${item.name} goes to an unknown location (${item[key].name}).`,
            );
        } else if (item[key] instanceof Exit)
          this.log.info(
            `ERROR: Attribute ${key} of ${item.name} is an Exit instance and probably should not.`,
          );
      });
    }
  }

  // Call after the player takes a turn, sending it a result, SUCCESS, SUCCESS_NO_TURNSCRIPTS or FAILED
  endTurn(result) {
    if (result === true)
      this.io.debugmsg(
        "That command returned 'true', rather than the proper result code.",
      );
    if (result === false)
      this.io.debugmsg(
        "That command returned 'false', rather than the proper result code.",
      );
    this.utils.handleChangeListeners();
    if (
      result === WorldStates.SUCCESS ||
      (this.settings.failCountsAsTurn && result === WorldStates.FAILED)
    ) {
      this.game.turnCount += 1;
      //this.game.elapsedTime += this.settings.dateTime.secondsPerTurn;
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
    })
  }

  // scopeStatus is used to track what the player can see and reach; it is a lot faster than working
  // it out each time, as this needs to be used several times every turn.
  scopeSnapshot() {
    // reset every object
    this.state.forEach((key, val) => {
      delete val.scopeStatus;
      delete val.scopeStatusForRoom;
    })

    // start from the current room
    let room = this.game.player.loc;
    if (room === undefined) {
      this.io.errormsg(
        'Error in scopeSnapshot; the location assigned to the player does not exist.'
      );
      this.log.info(
        `Error in scopeSnapshot; the location assigned to the player does not exist ('${this.game.player.loc}').`,
      );
      this.log.info(
        `Is it possible the location is in a file not loaded? Loaded files are: ${this.settings.files}`,
      );
      return;
    }
    room.scopeStatusForRoom = WorldStates.REACHABLE;
    // crawl up the room hierarchy to the topmost visible
    // while (room.loc && room.canReachThrough()) {
    //   room = this.state.get(room.loc.name);
    //   room.scopeStatusForRoom = WorldStates.REACHABLE;
    // }
    // room is now the top level applicable, so now work downwards from here (recursively)

    room.scopeSnapshot(false);

    // Also want to go further upwards if room is transparent
    // while (room.loc && room.canSeeThrough()) {
    //   room = this.state.get(room.loc.name);
    //   room.scopeStatusForRoom = WorldStates.VISIBLE;
    // }
    // room is now the top level applicable

    room.scopeSnapshot(true);
  }

  // Sets the current room to the one named
  //
  // Can also be used to move an NPC, but just gives a message and set "loc"
  // however, this does make it char-neutral.
  // Also calls onCarry, so rope works!
  // Suppress output (if done elsewhere) by sending false for dir
  // Force the move to happen even if the room name is the same by setting forced to true
  setRoom(char: Character, obj: Loc | string, dir = '', forced = false) {
    let room: Loc;
    let roomName: string;
    if (typeof obj === 'string') {
      room = this.state.get<Loc>(obj);
      if (room === undefined) {
        this.io.errormsg(`Failed to find room: ${obj}.`);
        return false;
      }
    } else {
      if (obj.name === undefined) {
        this.io.errormsg(
          `Not sure what to do with this room: ${obj} (a ${typeof obj}).`,
        );
        return false;
      }
      room = obj;
      roomName = room.name;
    }

    if (dir) {
      // if dir is false, assume already done
      char.onGoCheckList.forEach(el => {
        if (!this.state.get(el).onGoCheck(char, roomName, dir)) return false;
      });
    }

    if (char !== this.game.player) {
      if (dir) {
        this.io.msg(this.processor.stop_posture(char));
        this.io.msg(this.lexicon.go_successful, { char, dir });
      }
      char.previousLoc = char.loc;
      char.loc = room;
      char.onGoActionList.forEach(el => {
        this.log.info(el);
        if (!this.state.get(el).onGoAction(char, roomName, dir)) return false;
      });
      return true;
    }

    if (!forced && this.game.player.loc.name === roomName) {
      // Already here, do nothing
      return false;
    }

    if (this.settings.clearScreenOnRoomEnter) this.io.clearScreen();

    this.game.room.onExit();

    char.previousLoc = char.loc;
    char.loc = room;
    this.game.update();
    this.setBackground();
    if (dir !== 'suppress') {
      this.enterRoom();
    }
    for (const el of char.onGoActionList) {
      if (!this.state[el].onGoAction(char, roomName, dir)) return false;
    }
    return true;
  }

  // Runs the script and gives the description
  enterRoom() {
    if (this.game.room.beforeEnter === undefined) {
      this.io.errormsg(
        `This room, ${this.game.room.name}, has no 'beforeEnter\` function defined.  This is probably because it is not actually a room (it was not created with 'createRoom' and has not got the QuestJs._defaults.DEFAULT_ROOM template), but it an item. It is not clear what state the game will continue in.`,
      );
      return;
    }
    this.game.room.beforeEnter();
    if (this.game.room.visited === 0) {
      this.game.room.beforeFirstEnter();
    }
    this.enterRoomAfterScripts();
  }

  // Called when entering a new room, after beforeEnter and beforeFirstEnter re done
  enterRoomAfterScripts() {
    this.game.room.description();
    this.game.player.followers.forEach(follower => {
      if (follower.loc !== this.game.player.loc)
        follower.moveWithDescription(this.game.room.name);
    });
    this.game.room.afterEnter();
    if (this.game.room.visited === 0) {
      this.game.room.afterFirstEnter();
    }
    this.game.room.afterEnterIf.forEach(key => {
      // if already done, skip
      if (this.game.room.afterEnterIfFlags.split(' ').includes(key)) return;
      if (this.game.room.afterEnterIf[key].test()) {
        this.game.room.afterEnterIf[key].action();
        this.game.room.afterEnterIfFlags += ` ${key}`;
      }
    });
    this.game.room.visited += 1;
  }

  // Call this when entering a new room
  // It will set the regex of the ubiquitous background object
  // to any objects highlighted in the room description.
  setBackground() {
    let md;
    if (typeof this.game.room.desc === 'string') {
      if (!this.game.room.backgroundNames) {
        this.game.room.backgroundNames = [];
        while ((md = WorldStates.BACK_REGEX.exec(this.game.room.desc))) {
          // yes it is an assignment!
          const arr = md[0].substring(1, md[0].length - 1).split(':');
          this.game.room.desc = this.game.room.desc.replace(md[0], arr[0]);
          arr.forEach(el => this.game.room.backgroundNames.push(el));
        }
      }
    }
    this.state.get('background').regex =
      this.game.room.backgroundNames && this.game.room.backgroundNames.length > 0
        ? new RegExp(this.game.room.backgroundNames.join('|'))
        : false;
  }
}
