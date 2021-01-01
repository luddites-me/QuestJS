import { Character } from "../node/actors/character";
import { INode } from "../node/INode";
import { Base } from "./base";
import { Known, WorldStates } from "./constants";
import { DateTime } from "./ISettings";
import { List } from "./tools/array";
import { Scope } from './tools/scope';
import { prefix, toInt } from "./tools/tools";

export type Options = {
  add?: number;
  article?: number;
  doNotSort?: boolean;
  is?: number;
  lastJoiner?: string;
  loc?: any;
  match?: any;
  modified?: boolean;
  multi?: boolean;
  noBrackets?: boolean;
  nothing?: string;
  sep?: string;
  separateEnsembles?: string;
  verb?: any;
}

const defaultOptions: Options = {
  multi: false,
  add: 0,
  is: 0,
}

export class Utils extends Base {

  private _scope;
  get scope() {
    return this._scope = this._scope || new Scope(this._quest);
  }

  name: string;
  doorName: string;
  door;

  // @DOC
  // If the given attribute is a string it is printed, if it is a
  // function it is called. Otherwise an error is generated.
  // It isMultiple is true, the object name is prefixed.
  // TODO: test array with function
  printOrRun(char: INode, item: INode, attname: string, options: Options = defaultOptions) {

    if (typeof item[attname] === 'string') {
      // The attribute is a string
      let s = prefix(item, options.multi) + item[attname];
      if (item[`${attname}Addendum`]) s += item[`${attname}Addendum`](char);
      this.io.msg(s, { char, item });
      return true;
    }
    if (typeof item[attname] === 'function') {
      // The attribute is a function
      return item[attname](options.multi, char, options);
    }
    const s = `Unsupported type for printOrRun (${attname} is a ${typeof item[
      attname
    ]}).`;
    this.io.errormsg(`${s} F12 for more.`);
    throw new Error(s);
  }

  getContents(loc: INode, situation: number) {
    const list = [];
    if(loc?.name) {
      this.state.forEach((key, val) => {
        if (val.isAtLoc(loc.name, situation)) {
          list.push(val);
        }
      });
    }
    return list;
  };

  // Is this container already inside the given object, and hence
  // putting the object in the container will destroy the universe
  testForRecursion(char, item) {
    let contName = this.name;
    while (this.state.get(contName)) {
      if (this.state.get(contName).loc.name === item.name)
        return this.io.falsemsg(this.lexicon.container_recursion, {
          char,
          container: this,
          item,
        });
      contName = this.state.get(contName).loc.name;
    }
    return true;
  };

  nameModifierFunctionForContainer(o, list) {
    // this.log.info("here")
    const contents = o.getContents(WorldStates.LOOK);
    // this.log.info(contents)
    if (contents.length > 0 && (!o.closed || o.transparent)) {
      list.push(
        this.lexicon.contentsForData[o.contentsType].prefix +
        o.listContents(WorldStates.LOOK) +
        this.lexicon.contentsForData[o.contentsType].suffix,
      );
    }
    // this.log.info(list)
  };

  changeListeners = [];

  // This is used in world.endTurn, before turn events are run, and after too (just once if no turn events). Also after timer events if one fired
  handleChangeListeners() {
    this.changeListeners.forEach(el => {
      if (el.test(el.object, el.attName, el.oldValue)) el.func(el.object);
    });
  };

  defaultChangeListenerTest(object, attName, oldValue) {
    return object[attName] != oldValue;
  };

  addChangeListener(
    object,
    attName,
    func,
    test = this.defaultChangeListenerTest,
  ) {
    if (this.world.isCreated && !this.settings.saveDisabled) {
      this.io.errormsg('Attempting to use addChangeListener after set up.');
      return;
    }
    this.changeListeners.push({
      object,
      attName,
      func,
      test,
      oldValue: object[attName],
    });
  };

  // ============  Response Utilities  =======================================

  // @DOC
  // ## The Respond Function
  // @UNDOC

  // @DOC
  // Searchs the given list for a suitable response, according to the given params, and runs that response.
  // This is a big topic, see [here](https://github.com/ThePix/QuestJS/wiki/The-respond-function) for more.
  respondrespond(params, list, func) {
    // this.log.info(params)
    // if (!params.action) throw "No action in params"
    // if (!params.actor) throw "No action in params"
    // if (!params.target) throw "No action in params"
    const response = this.findResponse(params, list);
    if (!response) {
      if (func) func(params);
      this.io.errormsg('Failed to find a response');
      this.log.info(params);
      this.log.info(list);
      return false;
    }
    // this.log.info(response)
    if (response.script) response.script(params);
    if (response.msg) {
      if (params.actor) {
        params.actor.msg(response.msg, params);
      } else {
        this.io.msg(response.msg, params);
      }
    }
    if (!response.script && !response.msg && !response.failed) {
      this.io.errormsg('No script or this.io.msg for response');
      this.log.info(response);
    }
    if (func) func(params, response);
    return !response.failed;
  };

  getResponseList(params, list: any[], result) {
    if (!result) result = [];
    list.forEach(item => {
      if (item.name) {
        params.text = item.name.toLowerCase();
        // this.log.info("check item: " + item.name)
        if (item.test) {
          if (!result.includes(item) && item.test(params)) result.push(item);
        } else if (!result.includes(item)) result.push(item);
        // this.log.info("item is good: " + item.name)
      }
      if (item.responses)
        result = this.getResponseList(params, item.responses, result);
      // this.log.info("done")
    });
    return result;
  };

  findResponse(params, list: any[]) {
    let ret;
    list.forEach(item => {
      if (item.test && !item.test(params)) return;
      if (item.responses) ret = this.findResponse(params, item.responses);
      ret = ret || item;
    });
    return ret;
  };

  addResponse(route, data, list) {
    this.addResponseToList(route, data, list);
  };

  addResponseToList(route, data, list) {
    const sublist = this.getResponseSubList(route, list);
    sublist.unshift(data);
  };

  getResponseSubList(route, list) {
    const s = route.shift();
    if (s) {
      const sublist = list.find((el) => el.name === s);
      if (!sublist) throw `Failed to add sub-list with ${s}`;
      return this.getResponseSubList(route, sublist.responses);
    }
    return list;
  };

  verifyResponses(list: any[], level) {
    //  this.log.info(list)
    if (level === undefined) level = 1;
    if (list[list.length - 1].test) {
      this.log.info(
        `WARNING: Last entry at depth ${level} has a test condition:`,
      );
      this.log.info(list);
    }
    list.forEach(item => {
      if (item.responses) {
        // this.log.info(item.name)
        if (item.responses.length === 0) {
          this.log.info(`Zero responses at depth ${level} for: ${item.name}`);
        } else {
          this.verifyResponses(item.responses, level + 1);
        }
      }
    });
  };

  listContents(situation, modified = true) {
    return this.formatList(this.getContents(null, situation), {
      article: Known.INDEFINITE,
      lastJoiner: this.lexicon.list_and,
      modified,
      nothing: this.lexicon.list_nothing,
      loc: this.name,
    });
  };

  niceDirection(dir) {
    const dirObj = this.lexicon.exit_list.find((el) => el.name === dir);
    return dirObj.niceDir ? dirObj.niceDir : dirObj.name;
  };

  reverseDirection(dir) {
    const dirObj = this.lexicon.exit_list.find((el) => el.name === dir);
    return dirObj.opp;
  };

  reverseDirectionObj(dir) {
    return this.lexicon.exit_list.find(
      (el) => el.name === this.reverseDirection(dir),
    );
  };

  exitList(char = this.game.player) {
    const list = [];
    const room = this.state.get(char.loc.name);
    this.lexicon.exit_list.forEach(exit => {
      if (room.hasExit(exit.name)) {
        list.push(exit.name);
      }
    });
    return list;
  };

  // @DOC
  // Returns the number of the internal the given number falls in
  // For example, if intervals
  // Unit tested.
  getByInterval(intervals, n) {
    let count = 0;
    while (count < intervals.length) {
      if (n < intervals[count]) return count;
      n -= intervals[count];
      count += 1;
    }
    return false;
  };

  // @DOC
  // Returns a string formatted in CSS from the given dictionary.
  // If includeCurlyBraces is true, you get curly braces too.
  dictionaryToCss(d, includeCurlyBraces) {
    const ary = [];
    for (const key in d) ary.push(`${key}:${d[key]}`);
    return includeCurlyBraces ? `{${ary.join(';')}}` : ary.join(';');
  };

  getNameModifiers(item, options = defaultOptions) {
    if (!options.modified) return '';
    const list = [];
    for (const f of item.nameModifierFunctions) f(item, list);
    if (item.nameModifierFunction) item.nameModifierFunction(list);
    if (list.length === 0) return '';
    if (options.noBrackets) return ` ${list.join('; ')}`;
    return ` (${list.join('; ')})`;
  };

  // @DOC
  // Returns the game time as a string. The game time is game.elapsedTime seconds after game.startTime.
  getDateTime(options = defaultOptions): string {
    if (!this.settings.dateTime.formats) {
      const time = new Date(
        this.game.elapsedTime * 1000 + this.game.startTime.getTime(),
      );
      return time.toLocaleString(
        this.settings.dateTime.locale,
        this.settings.dateTime,
      );
    }

    return this.getCustomDateTime(options);
  };

  getDateTimeDict(options = defaultOptions): DateTime {
    return this.settings.dateTime.formats
      ? this.getCustomDateTimeDict(options)
      : this.getStdDateTimeDict(options);
  };

  getStdDateTimeDict(options = defaultOptions): DateTime {

    let timeInSeconds = this.game.elapsedTime;
    if (options.add) timeInSeconds += options.add;
    const time = new Date(
      timeInSeconds * 1000 + this.game.startTime.getTime(),
    );
    const dict: DateTime = {
      second: `${time.getSeconds()}`,
      minute: `${time.getMinutes()}`,
      hour: `${time.getHours()}`,
      date: time.getDate(),
      weekday: time.toLocaleString('default', { weekday: 'long' }),
      month: time.toLocaleString('default', { month: 'long' }),
      year: `${time.getFullYear()}`,
    }
    return dict;
  };

  getCustomDateTimeDict(options = defaultOptions): DateTime {
    const dict: DateTime = {};
    let time = this.game.elapsedTime;
    if (options.is) time = this.settings.dateTime.start.getTime() + options.is;
    if (options.add) time += options.add;
    Object.keys(this.settings.dateTime.data).forEach(key => {
      const el = this.settings.dateTime.data[key];
      dict[el.name] = time % el.number;
      time = Math.floor(time / el.number);
    })
    return dict;
  };

  getCustomDateTime(options): string {
    if (!options) options = {};
    const dict = this.getCustomDateTimeDict(options);
    let s = options.format
      ? this.settings.dateTime.formats[options.format]
      : this.settings.dateTime.formats.def;
    for (const key in this.settings.dateTime.functions) {
      s = s.replace(`%${key}%`, this.settings.dateTime.functions[key](dict));
    }
    return s;
  };

  seconds(seconds, minutes = 0, hours = 0, days = 0): number {
    if (this.settings.dateTime.convertSeconds)
      return this.settings.dateTime.convertSeconds(
        seconds,
        minutes,
        hours,
        days,
      );
    return ((days * 24 + hours) * 60 + minutes) * 60 + seconds;
  };

  elapsed(seconds, minutes = 0, hours = 0, days = 0) {
    return (
      this.seconds(seconds, minutes, hours, days) >= this.game.elapsedTime
    );
  };

  isAfter(timeString) {
    if (typeof timeString === 'number')
      return this.game.elapsedTime > timeString;

    if (timeString.match(/^\d\d\d\d$/)) {
      // This is a 24h clock time, so a daily
      const dict = this.getDateTimeDict();

      const hour = toInt(timeString.substring(0, 2));
      const minute = toInt(timeString.substring(2, 4));
      if (hour < toInt(dict.hour)) return true;
      if (hour > toInt(dict.hour)) return false;
      return minute < toInt(dict.minute);
    }

    const nowTime = new Date(
      this.game.elapsedTime * 1000 + this.game.startTime.getTime(),
    ).getTime();
    const targetTime = Date.parse(timeString);
    if (targetTime) return nowTime > targetTime;
    return this.io.errormsg(
      `Failed to parse date-time string: ${timeString}`,
    );
  };

  changePOV(char: Character | string, pronouns) {
    let character: Character;
    if (typeof char === 'string') {
      if (!this.state.exists(char))
        return this.io.errormsg(
          `Failed to change POV, no object called '${char}'`,
        );
      character = this.state.get<Character>(char);
    } else if (!char)
      this.io.errormsg('Failed to change POV, char not defined.');

    if (this.game.player) {
      this.game.player.player = false;
      this.game.player.pronouns = this.game.player.npcPronouns;
      this.game.player.regex = new RegExp(
        `^(${character.npcAlias ? character.npcAlias : character.alias})$`,
      );
    }
    character.player = true;
    character.npcPronouns = character.pronouns;
    character.pronouns = pronouns || this.lexicon.pronouns.secondperson;
    character.regex = new RegExp(
      `^(me|myself|player|${character.npcAlias ? character.npcAlias : character.alias})$`,
    );
    this.game.player = character;
    this.game.update();
    if (this.state.get('background')) this.world.setBackground();
  };

  defaultExitUse(char, dir, exit) {
    if (!exit) exit = this;
    if (char.testMobility && !char.testMobility()) {
      return false;
    }

    if (exit.isLocked()) {
      if (exit.lockedmsg) {
        this.io.msg(exit.lockedmsg);
      } else {
        this.io.msg(this.processor.locked_exit(char, exit));
      }
      return false;
    }

    if (exit.isUnlocked && !exit.isUnlocked(char, dir)) return false;

    for (const el of char.onGoCheckList) {
      if (!this.state.get(el).onGoCheck(char, exit.name, dir)) return false;
    }

    this.io.msg(this.processor.stop_posture(char));
    if (exit.msg) {
      this.printOrRun(char, exit, 'this.io.msg');
    } else {
      this.io.msg(this.lexicon.go_successful, { char, dir });
    }
    this.world.setRoom(char, exit.name, dir, false);
    return true;
  };

  // Helper function for exits.
  // You must set "door" and can optionally set "doorName" in the exit attributes
  useWithDoor(char, dir) {
    const obj = this.state.get(this.door);
    if (obj === undefined) {
      this.io.errormsg(
        `Not found an object called '${this.door}'. Any exit that uses the 'useWithDoor' function must also set a 'door' attribute.`,
      );
    }
    const tpParams = { char, doorName: this.doorName ? this.doorName : 'door' };
    if (!obj.closed) {
      this.world.setRoom(char, this.name, dir);
      return true;
    }
    if (!obj.locked) {
      obj.closed = false;
      this.io.msg(this.lexicon.open_and_enter, tpParams);
      this.world.setRoom(char, this.name, dir, false);
      return true;
    }
    if (obj.testKeys(char)) {
      obj.closed = false;
      obj.locked = false;
      this.io.msg(this.lexicon.unlock_and_enter, tpParams);
      this.world.setRoom(char, this.name, dir, false);
      return true;
    }
    this.io.msg(this.lexicon.try_but_locked, tpParams);
    return false;
  };

  // Helper function for exits.
  // You can optionally set "this.io.msg" in the exit attributes
  cannotUse(char, dir) {
    const tpParams = { char };
    this.io.msg(
      this.lexicon.try_but_locked,
      tpParams,
    );
    return false;
  };

  // @DOC
  // Returns the given number as a string formatted as per the control string.
  // The control string is made up of five parts.
  // The first is a sequence of characters that are not digits that will be added to the start of the string, and is optional.
  // The second is a sequence of digits and it the number of characters left of the decimal point; this is padded with zeros to make it longer.
  // The third is a single non-digit character; the decimal marker.
  // The fourth is a sequence of digits and it the number of characters right of the decimal point; this is padded with zeros to make it longer.
  // The fifth is a sequence of characters that are not digits that will be added to the end of the string, and is optional.
  displayNumber(n, control) {
    n = Math.abs(n); // must be positive
    const regex = /^(\D*)(\d+)(\D)(\d*)(\D*)$/;
    if (!regex.test(control)) {
      this.io.errormsg(
        `Unexpected format in displayNumber (${control}). Should be a number, followed by a single character separator, followed by a number.`,
      );
      return `${n}`;
    }
    const options = regex.exec(control);
    const places = toInt(options[4]); // eg 2
    let padding = toInt(options[2]); // eg 3
    if (places > 0) {
      // We want a decimal point, so the padding, the total length, needs that plus the places
      padding = padding + 1 + places; // eg 6
    }
    const factor = Math.pow(10, places); // eg 100
    const base = (n / factor).toFixed(places); // eg "12.34"
    const decimal = base.replace('.', options[3]); // eg "12,34"
    return options[1] + decimal.padStart(padding, '0') + options[5]; // eg "(012,34)"
  }

  // @DOC
  // Returns the given number as a string formatted as money. The formatting is defined by this.settings.moneyFormat.
  displayMoney(n) {
    if (typeof this.settings.moneyFormat === 'undefined') {
      this.io.errormsg(
        'No format for money set (set this.settings.moneyFormat in this.settings.js).'
      );
      return `${n}`;
    }
    const ary = this.settings.moneyFormat.split('!');
    if (ary.length === 2) {
      return this.settings.moneyFormat.replace('!', `${n}`);
    }
    if (ary.length === 3) {
      const negative = n < 0;
      n = Math.abs(n);
      let options = ary[1];
      const showsign = options.startsWith('+');
      if (showsign) {
        options = options.substring(1);
      }
      let number = this.displayNumber(n, options);
      if (negative) {
        number = `-${number}`;
      } else if (n !== 0 && showsign) {
        number = `+${number}`;
      }
      return ary[0] + number + ary[2];
    }
    if (ary.length === 4) {
      const options = n < 0 ? ary[2] : ary[1];
      return ary[0] + this.displayNumber(n, options) + ary[3];
    }
    this.io.errormsg(
      'this.settings.moneyFormat in this.settings.js expected to have either 1, 2 or 3 exclamation marks.'
    );
    return `${n}`;
  }

  // @DOC
  // Creates a string from an array. If the array element is a string, that is used, if it is an item, `QuestJs._lang.getName` is used (and passed the `options`). Items are sorted alphabetically, based on the "name" attribute.
  //
  // Options:
  //
  // * article:    DEFINITE (for "the") or INDEFINITE (for "a"), defaults to none (see `QuestJs._lang.getName`)
  // * sep:        separator (defaults to comma)
  // * lastJoiner: separator for last two items (just separator if not provided); you should not include any spaces
  // * modified:   item aliases modified (see `QuestJs._lang.getName`) (defaults to false)
  // * nothing:    return this if the list is empty (defaults to empty string)
  // * count:      if this is a number, the name will be prefixed by that (instead of the article)
  // * doNotSort   if true the list is not sorted
  // * separateEnsembles:  if true, ensembles are listed as the separate items
  //
  // For example:
  //
  // ```
  // formatList(listOfOjects, {article:INDEFINITE, lastJoiner:"and"})
  // -> "a hat, Mary and some boots"
  //
  // formatList(list, {lastJoiner:"or", nothing:"nowhere");
  // -> north, east or up
  // ```
  //
  formatList(itemArray, options = defaultOptions) {
    if (itemArray.length === 0) {
      return options.nothing ? options.nothing : '';
    }

    if (!options.sep) options.sep = ',';

    if (!options.separateEnsembles) {
      const toRemove = [];
      const toAdd = [];
      for (const item of itemArray) {
        if (item.ensembleMaster && item.ensembleMaster.isAllTogether()) {
          toRemove.push(item);
          if (!toAdd.includes(item.ensembleMaster))
            toAdd.push(item.ensembleMaster);
        }
      }
      itemArray = List.subtract(itemArray, toRemove);
      itemArray = itemArray.concat(toAdd);
    }

    // sort the list alphabetically on name
    if (!options.doNotSort) {
      itemArray.sort((a, b) => {
        if (a.name) a = a.name;
        if (b.name) b = b.name;
        return a.localeCompare(b);
      });
    }

    const l = itemArray.map((el) =>
      // if (el === undefined) return "[undefined]";
      typeof el === 'string' ? el : this.processor.getName(el, options),
    );

    let s = '';
    if (this.settings.oxfordComma && l.length === 2 && options.lastJoiner)
      return `${l[0]} ${options.lastJoiner} ${l[1]}`;
    do {
      s += l.shift();
      if (l.length === 1 && options.lastJoiner) {
        if (this.settings.oxfordComma) s += options.sep;
        s += ` ${options.lastJoiner} `;
      } else if (l.length > 0) s += `${options.sep} `;
    } while (l.length > 0);

    return s;
  }

  // @DOC
  // Converts the string to the standard direction name, so "down", "dn" and "d" will all return "down".
  // Uses the EXITS array, so language neutral.
  getDir(s) {
    for (const exit of this.lexicon.exit_list) {
      if (exit.type === 'nocmd') continue;
      if (exit.name === s) return exit.name;
      if (exit.abbrev.toLowerCase() === s) return exit.name;
      if (new RegExp(`^(${exit.alt})$`).test(s)) return exit.name;
    }
    return s;
  }
}
