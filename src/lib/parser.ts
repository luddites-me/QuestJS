import { FnPrmAny } from "../../@types/fn";
import { INode } from "../node/INode";
import { Base } from "./base";
import { Command } from "./command/command";
import { WorldStates } from './constants';

// notes AND LIMITATIONS
// This can only handle single commands
// Lists of multiple objects must be separated by joiner_regex (i.e., "and" or comma)
// Item names cannot include the word "and" or commas
// Commands look in their specified scope first, then isVisible as the fallback.
// It will try to match the beginning of a word to the object name given.
//    If the player does GET H, then it will disambiguate between any objects beginning with H
// A match is scored by whether the objects are in the right place (+2), wrong place but here (+1).
// You can also give a command a score attribute to boost (or reduce) its success.

// Should all be language neutral (except the inspect function, which is just for debugging)

// @DOC
// ## Parser Functions
//
// Most of these are only for internal use!
// @UNDOC
export class Parser extends Base {

  currentCommand: Command;
  // Stores the current values for it, him, etc.
  // put hat in box
  // x it
  pronouns = {};
  debug = false;
  override;

  // @DOC
  // The "parse" function should be sent either the text the player typed or null.
  // If sent null it will continue to work with the current values in currentCommand.
  // This allows us to keep trying to process a single command until all the
  //  disambiguations have been resolved.
  parse(inputText) {
    this.msg(`Input string: ${inputText}`);

    // This allows the command system to be temporarily overriden,
    // say if the game asks a question
    if (this.override) {
      this.msg('Parser overriden');
      this.override(inputText);
      delete this.override;
      return;
    }

    if (inputText) {
      const res = this.convertInputTextToCommandCandidate(inputText);
      if (typeof res === 'string') {
        this.io.parsermsg(res);
        this.world.endTurn(WorldStates.PARSER_FAILURE);
        return;
      }
      this.currentCommand = res;
    }

    // Need to disambiguate, until each of the lowest level lists has exactly one member
    let flag = false;
    for (let i = 0; i < this.currentCommand.objects.length; i += 1) {
      for (let j = 0; j < this.currentCommand.objects[i].length; j += 1) {
        if (this.currentCommand.objects[i][j] instanceof Array) {
          if (this.currentCommand.objects[i][j].length === 1) {
            this.currentCommand.objects[i][j] =
              this.currentCommand.objects[i][j][0];
          } else {
            flag = true;
            this.currentCommand.disambiguate1 = i;
            this.currentCommand.disambiguate2 = j;
            this.io.showMenuWithNumbers(
              this.lexicon.disambig_msg,
              this.currentCommand.objects[i][j],
              (result) => {
                this.currentCommand.objects[
                  this.currentCommand.disambiguate1
                ][this.currentCommand.disambiguate2] = result;
                this.parse(null);
              },
            );
          }
        }
      }
    }
    if (!flag) {
      this.execute();
    }
  }

  // @DOC
  // You can use this to bypass the parser altogether, for the next input the player types.
  // Instead, the given function will be used, sent the text the player typed.
  //
  // Used by askQuestion in this.io.
  overrideWith(fn) {
    this.override = fn;
  }

  // @DOC
  // You can use this to bypass all the text matching when you know what the object and command are.
  // Limited to commands with one object.
  //
  // Used by the panes when the player clicks on a verb for an item
  quickCmd(cmd: Command, item?: INode) {
    this.msg(`quickCmd: ${cmd.name}`);
    if (item) this.msg(`quickCmd: ${item.name}`);
    this.currentCommand = {
      cmdString: item ? `${cmd.name} ${item.name}` : cmd.name,
      cmd,
      objects: item ? [[item]] : [],
      matches: item ? [[item.alias]] : [],
    };
    this.execute();
  };

  // Do it!
  execute() {
    this.inspect();
    let inEndTurnFlag = false;
    try {
      if (
        this.currentCommand.objects.length > 0 &&
        typeof this.currentCommand.objects[0] === 'object'
      ) {
        for (const obj of this.currentCommand.objects[0]) {
          this.pronouns[obj.pronouns.objective] = obj;
        }
      }
      const outcome = this.currentCommand.cmd.script(
        this.currentCommand.objects,
        this.currentCommand.matches,
      );
      inEndTurnFlag = true;
      this.world.endTurn(outcome);
    } catch (err) {
      if (inEndTurnFlag) {
        this.log.error(
          'Hit a coding error trying to process world.endTurn after that command.'
        );
      } else {
        this.log.error(
          `Hit a coding error trying to process the command '${this.currentCommand.cmdString}'.`,
        );
      }
      this.log.info(
        'Look through the trace below to find the offending code. It is probably the first entry in the list, but may not be.'
      );
      this.log.info(err);
      this.io.print({
        tag: "p",
        cssClass: 'error',
        text: this.lexicon.error,
      });
    }
  }

  // This will return a dictionary, with these keys:
  // .inputString    the initial string
  // .cmdString      the sanitised string
  // .cmd            the matched command object
  // .objects        a list (of a list of a list), one member per capture group in the command regex
  // .objects[0]     a list (of a list), one member per object name given by the player for capture group 0
  // .objects[0][0]  a list of possible object matches for each object name given by the player for the
  //                      first object name in capture group 0
  convertInputTextToCommandCandidate(inputText) {
    // let s = inputText.toLowerCase().split(' ').filter(function(el) { return !IGnored_words.includes(el); }).join(' ');

    // remove multiple spaces, and any from the ends
    let cmdString = inputText.toLowerCase().trim().replace(/\s+/g, ' ');

    // convert numbers in weords to digits
    if (this.settings.convertNumbersInParser) {
      cmdString = this.processor.convertNumbers(cmdString);
    }

    // Get a list of candidate commands that match the regex
    const candidates = QuestJs._commands.filter((el) => {
      if (!Array.isArray(el.regexes)) this.log.info(el); // it will crash in the next line!
      for (const regex of el.regexes) {
        if (regex.test(cmdString)) return true;
      }
    });
    if (candidates.length === 0) {
      return this.lexicon.not_known_msg;
    }
    this.msg(`Number of commands that have a regex match:${candidates.length}`);

    // We now want to match potential objects
    // This will help us narrow down the candidates (maybe)
    // matchedCandidates is an array of dictionaries,
    // each one containing a command and some matched objects if applicable
    let error = this.lexicon.general_obj_error;
    const matchedCandidates = [];
    candidates.forEach((el) => {
      // matchItemsToCmd will attempt to fit the objects, returns a dictionary if successful
      // or an error message otherwise. Could have more than one object,
      // either because multiple were specified or because it was ambiguous (or both)
      // We just keep the last error message as hopefully the most relevant.
      // NB: Inside function so cannot use 'this'
      this.msg(`* Looking at candidate: ${el.name}`);
      const res = this.matchItemsToCmd(cmdString, el);
      if (!res) {
        this.msg('No result!');
        error = `Res is ${res}`;
      }
      this.msg(`Result score is: ${res.score}`);
      if (res.score === -1) {
        error = res.error;
      } else {
        this.msg('Candidate accepted!');
        matchedCandidates.push(res);
      }
    });
    this.msg(`Number of candidates accepted: ${matchedCandidates.length}`);
    if (matchedCandidates.length === 0) {
      this.msg(`No matches, returning error: ${error}`);
      return error;
    }
    // pick between matchedCandidates based on score
    let command = matchedCandidates[0];
    if (matchedCandidates.length > 1) {
      this.msg(
        `Need to pick just one; start with the first (score ${command.score}).`,
      );
      for (const candidate of matchedCandidates) {
        // give preference to earlier commands
        if (command.score < candidate.score) {
          this.msg(
            `This one is better:${command.cmd.name} (score ${candidate.score})`,
          );
          command = candidate;
        }
      }
    }
    if (!command) this.log.info(inputText);
    command.string = inputText;
    command.cmdString = cmdString;
    this.msg(`This is the one:${command.cmd.name}`);
    return command;
  }

  // We want to see if this command is a good match to the string
  // This will involve trying to matching objects, according to the
  // values in the command
  // Returns a dictionary containing:
  // cmd - the command
  // objectTexts - the matched object names from the player input
  // objects - the matched objects (lists of lists ready to be disabiguated)
  // score - a rating of how good the match is
  // error - a string to report why it failed, if it did!
  //
  // objects will be an array for each object role (so PUT HAT IN BOX is two),
  // of arrays for each object listed (so GET HAT, TEAPOT AND GUN is three),
  // of possible object matches (so GET HAT is four if there are four hats in the room)
  matchItemsToCmd(s, cmd: Command): Command {
    const res: Command = {
      cmd,
      objectTexts: [],
      objects: [],
      matches: [],
      score: cmd.score ? cmd.score : 0,
      error: '',
      all: false,
    };

    const arr = cmd.regexes.find((el) => el.test(s)).exec(s);
    // for (let regex of el.regexes) {
    //  if (regex.test(cmdString)) arr = regex.exec(s)
    // }

    const fallbackScope = this.scope(this.isVisible);
    arr.shift(); // first element is the whole match, so discard

    this.msg(`..Base score: ${res.score}`);

    for (let i = 0; i < arr.length; i += 1) {
      if (!cmd.objects[i]) {
        this.io.errormsg(
          "That command seems to have an error. It has more capture groups than there are elements in the 'objects' attribute.",
        );
        return null;
      }
      if (cmd.objects[i].ignore) {
        // this capture group has been flagged to be ignored
        continue;
      }
      let objectNames;
      let score = 0;
      res.objectTexts.push(arr[i]);
      if (cmd.objects[i].text) {
        // this capture group has been flagged to be text
        res.objects.push(arr[i]);
        score = 1;
      } else if (
        this.lexicon.all_regex.test(arr[i]) ||
        this.lexicon.all_exclude_regex.test(arr[i])
      ) {
        // Handle ALL and ALL BUT
        if (!cmd.objects[i].scope)
          this.log.info(`WARNING: Command without scope - ${cmd.name}`);
        let list = cmd.objects[i].scope
          ? this.scope(cmd.objects[i].scope)
          : fallbackScope;
        const exclude = [this.game.player];

        // anything flagged as scenery should be excluded
        for (const item of list) {
          if (item.scenery || item.excludeFromAll) {
            exclude.push(item);
          }
        }

        if (this.lexicon.all_exclude_regex.test(arr[i])) {
          // if this is ALL BUT we need to remove some things from the list
          // excludes must be in isVisible
          // if it is ambiguous or not recognised it does not get added to the list
          const s = arr[i].replace(this.lexicon.all_exclude_regex, '').trim();
          objectNames = s.split(this.lexicon.joiner_regex).map((el) => el.trim());
          for (const s in objectNames) {
            const items = this.findInList(s, fallbackScope);
            if (items.length === 1) {
              exclude.push(items[0]);
            }
          }
        }
        list = list.filter((el) => !exclude.includes(el));
        if (list.length > 1 && !cmd.objects[i].multiple) {
          res.error = this.lexicon.no_multiples_msg;
          res.score = -1;
          return res;
        }
        if (list.length === 0) {
          res.error = cmd.nothingForAll
            ? `${cmd.nothingForAll}`
            : this.lexicon.nothing_msg;
          res.score = -1;
          return res;
        }
        score = 2;
        res.objects.push(list.map((el) => [el]));
        res.matches.push(arr[i]);
        res.all = true;
      } else {
        objectNames = arr[i]
          .split(this.lexicon.joiner_regex)
          .map((el) => el.trim());
        if (objectNames.length > 1 && !cmd.objects[i].multiple) {
          res.error = this.lexicon.no_multiples_msg;
          res.score = -1;
          return res;
        }
        if (!cmd.objects[i].scope)
          this.log.info(
            `WARNING: No scope (or scope not found) in command ${cmd.name}`,
          );
        const scopes = cmd.objects[i].scope
          ? [this.scope(cmd.objects[i].scope), fallbackScope]
          : [fallbackScope];
        // this.log.info(scopes)

        const objs = [];
        const matches = [];
        let objs2;
        let n;
        for (const s of objectNames) {
          const objNameMatch = this.lexicon.article_filter_regex.exec(s);
          if (objNameMatch === null) {
            this.io.errormsg(
              `Failed to match to article_filter_regex with '${s}', - probably an error in article_filter_regex!`,
            );
            return null;
          }
          [objs2, n] = this.findInScope(objNameMatch[1], scopes, cmd.objects[i]);
          if (n === 0) {
            res.error = cmd.noobjecterror(s);
            res.score = -1;
            return res;
          }
          if (n > score) {
            score = n;
          }
          objs.push(objs2);
          matches.push(s);
        }
        res.objects.push(objs);
        res.matches.push(matches);
      }
      this.msg(`...Adding to the score: ${score}`);
      res.score += score;
    }
    return res;
  };

  // Tries to match objects to the given string
  // It will return a list of matching objects (to be disambiguated if more than 1),
  // plus the score, depending on which list the object(s) was found in
  // (if there are three lists, the score will be 3 if found in the first list, 2 in the second,
  // or 1 if in the third list).
  // If not found the score will be 0, and an empty array returned.
  findInScope(s, listOfLists, cmdParams) {
    this.msg(`Now matching: ${s}`);
    // First handle IT etc.
    for (const key in this.lexicon.pronouns) {
      if (
        s === this.lexicon.pronouns[key].objective &&
        this.pronouns[this.lexicon.pronouns[key].objective]
      ) {
        return [this.pronouns[this.lexicon.pronouns[key].objective], 1];
      }
    }

    for (let i = 0; i < listOfLists.length; i += 1) {
      this.msg(`..Looking for a match for: ${s} (scope ${i + 1})`);
      const objs = this.findInList(s, listOfLists[i], cmdParams);
      if (objs.length > 0) {
        return [objs, listOfLists.length - i];
      }
    }
    return [[], 0];
  };

  // Tries to match an object to the given string
  // But if there are more than 1 with the same score, it returns them all
  // s is the string to match
  // list is an array of items to match again
  findInList(s, list, cmdParams = {}) {
    let res = [];
    let score = 0;
    let n;
    for (const item of list) {
      this.msg(`-> Considering: ${item.name}`);
      n = this.scoreObjectMatch(s, item, cmdParams);
      if (n >= 0) this.msg(`${item.name} scores ${n}`);
      if (n > score) {
        res = [];
        score = n;
      }
      if (n >= score) {
        res.push(item);
      }
    }
    this.msg(
      res.length > 1
        ? `Cannot decide between: ${res.map((el) => el.name).join(', ')}`
        : res.length === 1
          ? `..Going with: ${res[0].name}`
          : 'Found no suitable objects'
    );
    return res;
  };

  scoreObjectMatch(s, item, cmdParams) {
    if (!item.parserOptionsSet) {
      // Do we need to do this when the saved game is reloaded???
      item.parserOptionsSet = true;
      item.parserItemName = item.alias.toLowerCase();
      item.parserItemNameParts = item.parserItemName.split(' ');
      if (item.pattern) {
        if (!item.regex) item.regex = new RegExp(`^(${item.pattern})$`);
        if (!item.parserAltNames) item.parserAltNames = item.pattern.split('|');
      }
      if (item.parserAltNames) {
        item.parserAltNames.forEach((el) => {
          if (el.includes(' ')) {
            item.parserItemNameParts = item.parserItemNameParts.concat(
              el.split(' '),
            );
          }
        });
      }
    }
    const itemName = item.alias.toLowerCase();
    let res = -1;
    if (cmdParams.items && cmdParams.items.includes(item.name)) {
      // does this pay any attention to what the player typed????
      this.msg(
        'The command specifically mentions this item, so highest priority, score 100'
      );
      res = 100;
    } else if (s === item.parserItemName) {
      this.msg('The player has used the exact alias, score 60');
      res = 60;
    } else if (item.regex && item.regex.test(s)) {
      this.msg(
        'The player has used the exact string allowed in the regex, score 60'
      );
      this.msg(`${item.regex}`);
      this.msg(`>${s}<`);
      res = 55;
    } else if (
      item.parserItemNameParts &&
      item.parserItemNameParts.some((el) => el === s)
    ) {
      this.msg(
        'The player has matched a complete word, but not the full phrase, score 50'
      );
      res = 50;
    } else if (item.parserItemName.startsWith(s)) {
      this.msg(
        'the player has used a string that matches the start of the alias, score length + 15'
      );
      res = s.length + 15;
    } else if (
      item.parserAltNames &&
      item.parserAltNames.some((el) => el.startsWith(s))
    ) {
      this.msg(
        'the player has used a string that matches the start of an alt name, score length + 10'
      );
      res = s.length + 10;
    } else if (
      item.parserItemNameParts &&
      item.parserItemNameParts.some((el) => el.startsWith(s))
    ) {
      this.msg(
        'the player has used a string that matches the start of an alt name, score length'
      );
      res = s.length;
    } else {
      return -1;
    }

    if (item[cmdParams.attName]) {
      this.msg(`bonus 20 as item has attribute ${cmdParams.attName}`);
      res += 20;
    }
    if (item.parsePriority) {
      this.msg(`item.parsePriority is ${item.parsePriority}`);
      res += item.parsePriority;
    }

    // note what we matched against in case a command wants to use it later
    // This is a little risky as at this point it is only a suggestion,
    // but I cannot think of a situation where it would fail.
    // Used by QuestJs._templates.COUNTABLE
    item.cmdMatch = s;
    return res;
  };

  // For debugging only
  // Prints details about the this.currentCommand so you can
  // see what the parser has made of the player's input
  inspect() {
    if (!this.debug) return;

    let s = 'PARSER RESULT:<br/>';
    s += `Input text: ${this.currentCommand.string}<br/>`;
    s += `Matched command: ${this.currentCommand.cmd.name}<br/>`;
    s += `Matched regex: ${this.currentCommand.cmd.regex}<br/>`;
    s += `Match score: ${this.currentCommand.score}<br/>`;
    if (this.currentCommand.all) {
      s += 'Player typed ALL<br/>';
    }
    s += `Objects/texts (${this.currentCommand.objects.length}):` + '<br/>';
    for (const obj of this.currentCommand.objects) {
      if (typeof obj === 'string') {
        s += `&nbsp;&nbsp;&nbsp;&nbsp;Text: ${obj}<br/>`;
      } else {
        s += `&nbsp;&nbsp;&nbsp;&nbsp;Objects:${obj
          .map((el) => el.name)
          .join(', ')}<br/>`;
      }
    }
    this.io.debugmsg(s);
  };

  msg(...ary) {
    if (this.debug) {
      for (const s of ary) this.io.debugmsg(`PARSER&gt; ${s}`);
    }
  };

  scope(fn: FnPrmAny, options: any = {}) {
    const list = [];
    this.state.forEach((key, val) => {
      if (fn(val, options)) {
        list.push(val);
      }
    })
    return list;
  };

  // This set is used in the objects attribute of commands
  // The "is" functions are for looking at a specific place

  // Anywhere in the world
  isInWorld(item) {
    return true;
  };

  // Anywhere in the world
  isReachable(item) {
    return (
      item.scopeStatus === WorldStates.REACHABLE &&
      this.world.ifNotDark(item)
    );
  };

  // Anywhere in the location (used by the parser for the fallback)
  isVisible(item) {
    return item.scopeStatus && this.world.ifNotDark(item);
  };

  // Held or here, but not in a container
  isPresent(item) {
    return this.isHere(item) || this.isHeld(item);
  };

  // Used by examine, so the player can X ME, even if something called metalhead is here.
  isPresentOrMe(item) {
    return (
      this.isHere(item) || this.isHeld(item) || item === this.game.player
    );
  };

  // ... but not in a container
  isHeldNotWorn(item) {
    return (
      item.isAtLoc(this.game.player.name, WorldStates.PARSER) &&
      this.world.ifNotDark(item) &&
      !item.getWorn()
    );
  };

  isHeld(item) {
    return (
      item.isAtLoc(this.game.player.name, WorldStates.PARSER) &&
      this.world.ifNotDark(item)
    );
  };

  isHeldByNpc(item) {
    const npcs = this.scope(this.isReachable).filter((el) => el.npc);
    for (const npc of npcs) {
      if (item.isAtLoc(npc.name, WorldStates.PARSER)) return true;
    }
    return false;
  };

  isWorn(item) {
    return (
      item.isAtLoc(this.game.player.name, WorldStates.PARSER) &&
      this.world.ifNotDark(item) &&
      item.getWorn()
    );
  };

  isWornByNpc(item) {
    const npcs = this.scope(this.isReachable).filter((el) => el.npc);
    for (const npc of npcs) {
      if (item.isAtLoc(npc.name, WorldStates.PARSER) && item.getWorn())
        return true;
    }
    return false;
  }

  isNpcOrHere(item) {
    return (
      (item.isAtLoc(this.game.player.loc, WorldStates.PARSER) &&
        this.world.ifNotDark(item)) ||
      item.npc ||
      item.player
    );
  }

  isNpcAndHere(item) {
    return (
      item.isAtLoc(this.game.player.loc, WorldStates.PARSER) &&
      (item.npc || item.player)
    );
  }

  isHere(item) {
    return (
      item.isAtLoc(this.game.player.loc, WorldStates.PARSER) &&
      this.world.ifNotDark(item)
    );
  }

  isForSale(item) {
    return (
      item.isForSale &&
      item.isForSale(this.game.player.loc) &&
      this.world.ifNotDark(item)
    );
  }

  // isInside(item, options) {
  //  return item.isAtLoc(options.container.name, WorldStates.PARSER) && this.world.ifNotDark(item);
  // }

  // isRoom(item) {
  //  return item.room;
  // }

  isContained(item) {
    const containers = this.parser
      .scope(this.isReachable)
      .filter((el) => el.container);
    for (const container of containers) {
      if (container.closed) continue;
      if (item.isAtLoc(container.name, WorldStates.PARSER)) return true;
    }
    return false;
  };

  isHereOrContained(item) {
    if (this.isHere(item)) return true;
    if (this.isContained(item)) return true;
    return false;
  };

  isLiquid(item) {
    return item.liquid;
  };

}
