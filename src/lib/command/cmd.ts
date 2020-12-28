import { Quest } from "../../Quest";
import { Base } from "../base";
import { WorldStates } from "../constants";
import { Dictionary } from "./command";
import { prefix } from '../tools/tools';

export class Cmd extends Base {
  attName: string;
  category: string;
  defmsg: string | ((...params) => string);
  hash: Dictionary;
  name: string;
  npcCmd: boolean;
  noTurnscripts: boolean;
  objects: any[] = [];
  regex: RegExp;
  regexes: RegExp[];
  rules: any[] = [];
  scope: any[] = [];
  score: number;
  useThisScriptForNpcs?: boolean;

  constructor(quest: Quest, name: string, hash: Dictionary) {
    super(quest);
    this.name = name;
    this.hash = hash;
    this.init();
  }

  default(item, isMultiple, char) {
    if (typeof this.defmsg === 'string') {
      this.io.failedmsg(
        prefix(item, isMultiple) + this.defmsg,
        {
          char,
          item,
        },
      );
    } else if (typeof this.defmsg === 'function') {
      this.io.failedmsg(
        prefix(item, isMultiple) + this.defmsg(char, item),
        {
          char,
          item,
        },
      );
    } else {
      this.io.errormsg(`No default set for command '${this.name}'.`);
    }
    return false;
  };

  // This is the default script for commands
  // Assumes a verb and an object; the verb may or may not be the first object
  script(objects, matches) {
    let success = false;
    let suppressEndturn = false;
    let verb;
    if (objects.length > 1) verb = objects.shift();
    const multi =
      objects[0] &&
      (objects[0].length > 1 || this.parser.currentCommand.all);
    if (objects[0].length === 0) {
      this.io.metamsg(this.lexicon.nothing_msg);
      return WorldStates.FAILED;
    }
    for (let i = 0; i < objects[0].length; i += 1) {
      if (!objects[0][i][this.attName]) {
        this.default(objects[0][i], multi, this.game.player);
      } else {
        let result = this.processCommand(
          this.game.player,
          objects[0][i],
          multi,
          matches[0][i],
          verb,
        );
        if (result === WorldStates.SUCCESS_NO_TURNSCRIPTS) {
          suppressEndturn = true;
          result = true;
        }
        success = result || success;
      }
    }
    if (success) {
      return this.noTurnscripts || suppressEndturn
        ? WorldStates.SUCCESS_NO_TURNSCRIPTS
        : WorldStates.SUCCESS;
    }
    return WorldStates.FAILED;
  };

  processCommand(char, item, multi = false, match = false, verb = '') {
    this.rules.forEach(rule => {
      if (typeof rule !== 'function') {
        this.io.errormsg(
          `Failed to process command '${this.name}' as one of its rules is not a function (F12 for more).`,
        );
        this.log.info(
          `Failed to process command '${this.name}' as one of its rules is not a function:`,
        );
        this.log.info(this);
        this.log.info(rule);
      }
      if (!rule(this, char, item, multi)) {
        return false;
      }
    });
    let result = this.utils.printOrRun(char, item, this.attName, {
      multi,
      match,
      verb,
    });
    if (
      typeof result !== 'boolean' &&
      result !== WorldStates.SUCCESS_NO_TURNSCRIPTS
    ) {
      // Assume the author wants to return true from the verb
      result = true;
    }
    return result;
  }

  noobjecterror(s) {
    return this.processor.object_unknown_msg(s);
  }

  init() {
    Object.keys(this.hash).forEach(key => this[key] = this.hash[key]);

    this.attName = this.attName ? this.attName : this.name.toLowerCase();
    Object.keys(this.objects).forEach(key => {
      if (!this.objects[key].attName) {
        this.objects[key].attName = this.attName;
      }
    })
    if (!this.regex && !this.regexes) {
      this.regexes = Array.isArray(this.lexicon.regex[this.name])
        ? this.lexicon.regex[this.name]
        : [this.lexicon.regex[this.name]];
    }
  }
}
