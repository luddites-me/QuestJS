import {Base} from "./base.js";
import {WorldStates} from "./constants.js";
export class Parser extends Base {
  constructor() {
    super(...arguments);
    this.pronouns = {};
    this.debug = false;
  }
  parse(inputText) {
    this.msg(`Input string: ${inputText}`);
    if (this.override) {
      this.msg("Parser overriden");
      this.override(inputText);
      delete this.override;
      return;
    }
    if (inputText) {
      const res = this.convertInputTextToCommandCandidate(inputText);
      if (typeof res === "string") {
        this.io.parsermsg(res);
        this.world.endTurn(WorldStates.PARSER_FAILURE);
        return;
      }
      this.currentCommand = res;
    }
    let flag = false;
    for (let i = 0; i < this.currentCommand.objects.length; i += 1) {
      for (let j = 0; j < this.currentCommand.objects[i].length; j += 1) {
        if (this.currentCommand.objects[i][j] instanceof Array) {
          if (this.currentCommand.objects[i][j].length === 1) {
            this.currentCommand.objects[i][j] = this.currentCommand.objects[i][j][0];
          } else {
            flag = true;
            this.currentCommand.disambiguate1 = i;
            this.currentCommand.disambiguate2 = j;
            this.io.showMenuWithNumbers(this.lexicon.disambig_msg, this.currentCommand.objects[i][j], (result) => {
              this.currentCommand.objects[this.currentCommand.disambiguate1][this.currentCommand.disambiguate2] = result;
              this.parse(null);
            });
          }
        }
      }
    }
    if (!flag) {
      this.execute();
    }
  }
  overrideWith(fn2) {
    this.override = fn2;
  }
  quickCmd(cmd, item) {
    this.msg(`quickCmd: ${cmd.name}`);
    if (item)
      this.msg(`quickCmd: ${item.name}`);
    this.currentCommand = {
      cmdString: item ? `${cmd.name} ${item.name}` : cmd.name,
      cmd,
      objects: item ? [[item]] : [],
      matches: item ? [[item.alias]] : []
    };
    this.execute();
  }
  execute() {
    this.inspect();
    let inEndTurnFlag = false;
    try {
      if (this.currentCommand.objects.length > 0 && typeof this.currentCommand.objects[0] === "object") {
        for (const obj of this.currentCommand.objects[0]) {
          this.pronouns[obj.pronouns.objective] = obj;
        }
      }
      const outcome = this.currentCommand.cmd.script(this.currentCommand.objects, this.currentCommand.matches);
      inEndTurnFlag = true;
      this.world.endTurn(outcome);
    } catch (err) {
      if (inEndTurnFlag) {
        this.log.error("Hit a coding error trying to process world.endTurn after that command.");
      } else {
        this.log.error(`Hit a coding error trying to process the command '${this.currentCommand.cmdString}'.`);
      }
      this.log.info("Look through the trace below to find the offending code. It is probably the first entry in the list, but may not be.");
      this.log.info(err);
      this.io.print({
        tag: "p",
        cssClass: "error",
        text: this.lexicon.error
      });
    }
  }
  convertInputTextToCommandCandidate(inputText) {
    let cmdString = inputText.toLowerCase().trim().replace(/\s+/g, " ");
    if (this.settings.convertNumbersInParser) {
      cmdString = this.processor.convertNumbers(cmdString);
    }
    const candidates = this.commandFactory.filter((el) => {
      if (!Array.isArray(el.regexes))
        this.log.info(el);
      for (const regex of el.regexes) {
        if (regex.test(cmdString))
          return true;
      }
    });
    if (candidates.length === 0) {
      return this.lexicon.not_known_msg;
    }
    this.msg(`Number of commands that have a regex match:${candidates.length}`);
    let error = this.lexicon.general_obj_error;
    const matchedCandidates = [];
    candidates.forEach((el) => {
      this.msg(`* Looking at candidate: ${el.name}`);
      const res = this.matchItemsToCmd(cmdString, el);
      if (!res) {
        this.msg("No result!");
        error = `Res is ${res}`;
      }
      this.msg(`Result score is: ${res.score}`);
      if (res.score === -1) {
        error = res.error;
      } else {
        this.msg("Candidate accepted!");
        matchedCandidates.push(res);
      }
    });
    this.msg(`Number of candidates accepted: ${matchedCandidates.length}`);
    if (matchedCandidates.length === 0) {
      this.msg(`No matches, returning error: ${error}`);
      return error;
    }
    let command2 = matchedCandidates[0];
    if (matchedCandidates.length > 1) {
      this.msg(`Need to pick just one; start with the first (score ${command2.score}).`);
      for (const candidate of matchedCandidates) {
        if (command2.score < candidate.score) {
          this.msg(`This one is better:${command2.cmd.name} (score ${candidate.score})`);
          command2 = candidate;
        }
      }
    }
    if (!command2)
      this.log.info(inputText);
    command2.string = inputText;
    command2.cmdString = cmdString;
    this.msg(`This is the one:${command2.cmd.name}`);
    return command2;
  }
  matchItemsToCmd(s, cmd) {
    const res = {
      cmd,
      objectTexts: [],
      objects: [],
      matches: [],
      score: cmd.score ? cmd.score : 0,
      error: "",
      all: false
    };
    const arr = cmd.regexes.find((el) => el.test(s)).exec(s);
    const fallbackScope = this.scope(this.isVisible);
    arr.shift();
    this.msg(`..Base score: ${res.score}`);
    for (let i = 0; i < arr.length; i += 1) {
      if (!cmd.objects[i]) {
        this.io.errormsg("That command seems to have an error. It has more capture groups than there are elements in the 'objects' attribute.");
        return null;
      }
      if (cmd.objects[i].ignore) {
        continue;
      }
      let objectNames;
      let score = 0;
      res.objectTexts.push(arr[i]);
      if (cmd.objects[i].text) {
        res.objects.push(arr[i]);
        score = 1;
      } else if (this.lexicon.all_regex.test(arr[i]) || this.lexicon.all_exclude_regex.test(arr[i])) {
        if (!cmd.objects[i].scope)
          this.log.info(`WARNING: Command without scope - ${cmd.name}`);
        let list = cmd.objects[i].scope ? this.scope(cmd.objects[i].scope) : fallbackScope;
        const exclude = [this.game.player];
        for (const item of list) {
          if (item.scenery || item.excludeFromAll) {
            exclude.push(item);
          }
        }
        if (this.lexicon.all_exclude_regex.test(arr[i])) {
          const s2 = arr[i].replace(this.lexicon.all_exclude_regex, "").trim();
          objectNames = s2.split(this.lexicon.joiner_regex).map((el) => el.trim());
          for (const s3 in objectNames) {
            const items = this.findInList(s3, fallbackScope);
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
          res.error = cmd.nothingForAll ? `${cmd.nothingForAll}` : this.lexicon.nothing_msg;
          res.score = -1;
          return res;
        }
        score = 2;
        res.objects.push(list.map((el) => [el]));
        res.matches.push(arr[i]);
        res.all = true;
      } else {
        objectNames = arr[i].split(this.lexicon.joiner_regex).map((el) => el.trim());
        if (objectNames.length > 1 && !cmd.objects[i].multiple) {
          res.error = this.lexicon.no_multiples_msg;
          res.score = -1;
          return res;
        }
        if (!cmd.objects[i].scope)
          this.log.info(`WARNING: No scope (or scope not found) in command ${cmd.name}`);
        const scopes = cmd.objects[i].scope ? [this.scope(cmd.objects[i].scope), fallbackScope] : [fallbackScope];
        const objs = [];
        const matches = [];
        let objs2;
        let n;
        for (const s2 of objectNames) {
          const objNameMatch = this.lexicon.article_filter_regex.exec(s2);
          if (objNameMatch === null) {
            this.io.errormsg(`Failed to match to article_filter_regex with '${s2}', - probably an error in article_filter_regex!`);
            return null;
          }
          [objs2, n] = this.findInScope(objNameMatch[1], scopes, cmd.objects[i]);
          if (n === 0) {
            res.error = cmd.noobjecterror(s2);
            res.score = -1;
            return res;
          }
          if (n > score) {
            score = n;
          }
          objs.push(objs2);
          matches.push(s2);
        }
        res.objects.push(objs);
        res.matches.push(matches);
      }
      this.msg(`...Adding to the score: ${score}`);
      res.score += score;
    }
    return res;
  }
  findInScope(s, listOfLists, cmdParams) {
    this.msg(`Now matching: ${s}`);
    for (const key in this.lexicon.pronouns) {
      if (s === this.lexicon.pronouns[key].objective && this.pronouns[this.lexicon.pronouns[key].objective]) {
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
  }
  findInList(s, list, cmdParams = {}) {
    let res = [];
    let score = 0;
    let n;
    for (const item of list) {
      this.msg(`-> Considering: ${item.name}`);
      n = this.scoreObjectMatch(s, item, cmdParams);
      if (n >= 0)
        this.msg(`${item.name} scores ${n}`);
      if (n > score) {
        res = [];
        score = n;
      }
      if (n >= score) {
        res.push(item);
      }
    }
    this.msg(res.length > 1 ? `Cannot decide between: ${res.map((el) => el.name).join(", ")}` : res.length === 1 ? `..Going with: ${res[0].name}` : "Found no suitable objects");
    return res;
  }
  scoreObjectMatch(s, item, cmdParams) {
    if (!item.parserOptionsSet) {
      item.parserOptionsSet = true;
      item.parserItemName = item.alias.toLowerCase();
      item.parserItemNameParts = item.parserItemName.split(" ");
      if (item.pattern) {
        if (!item.regex)
          item.regex = new RegExp(`^(${item.pattern})$`);
        if (!item.parserAltNames)
          item.parserAltNames = item.pattern.split("|");
      }
      if (item.parserAltNames) {
        item.parserAltNames.forEach((el) => {
          if (el.includes(" ")) {
            item.parserItemNameParts = item.parserItemNameParts.concat(el.split(" "));
          }
        });
      }
    }
    let res = -1;
    if (cmdParams.items && cmdParams.items.includes(item.name)) {
      this.msg("The command specifically mentions this item, so highest priority, score 100");
      res = 100;
    } else if (s === item.parserItemName) {
      this.msg("The player has used the exact alias, score 60");
      res = 60;
    } else if (item.regex && item.regex.test(s)) {
      this.msg("The player has used the exact string allowed in the regex, score 60");
      this.msg(`${item.regex}`);
      this.msg(`>${s}<`);
      res = 55;
    } else if (item.parserItemNameParts && item.parserItemNameParts.some((el) => el === s)) {
      this.msg("The player has matched a complete word, but not the full phrase, score 50");
      res = 50;
    } else if (item.parserItemName.startsWith(s)) {
      this.msg("the player has used a string that matches the start of the alias, score length + 15");
      res = s.length + 15;
    } else if (item.parserAltNames && item.parserAltNames.some((el) => el.startsWith(s))) {
      this.msg("the player has used a string that matches the start of an alt name, score length + 10");
      res = s.length + 10;
    } else if (item.parserItemNameParts && item.parserItemNameParts.some((el) => el.startsWith(s))) {
      this.msg("the player has used a string that matches the start of an alt name, score length");
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
    item.cmdMatch = s;
    return res;
  }
  inspect() {
    if (!this.debug)
      return;
    let s = "PARSER RESULT:<br/>";
    s += `Input text: ${this.currentCommand.string}<br/>`;
    s += `Matched command: ${this.currentCommand.cmd.name}<br/>`;
    s += `Matched regex: ${this.currentCommand.cmd.regex}<br/>`;
    s += `Match score: ${this.currentCommand.score}<br/>`;
    if (this.currentCommand.all) {
      s += "Player typed ALL<br/>";
    }
    s += `Objects/texts (${this.currentCommand.objects.length}):<br/>`;
    for (const obj of this.currentCommand.objects) {
      if (typeof obj === "string") {
        s += `&nbsp;&nbsp;&nbsp;&nbsp;Text: ${obj}<br/>`;
      } else {
        s += `&nbsp;&nbsp;&nbsp;&nbsp;Objects:${obj.map((el) => el.name).join(", ")}<br/>`;
      }
    }
    this.io.debugmsg(s);
  }
  msg(...ary) {
    if (this.debug) {
      for (const s of ary)
        this.io.debugmsg(`PARSER&gt; ${s}`);
    }
  }
  scope(fn2, options = {}) {
    const list = [];
    this.state.forEach((key, val) => {
      if (fn2(val, options)) {
        list.push(val);
      }
    });
    return list;
  }
  isInWorld(item) {
    return true;
  }
  isReachable(item) {
    return item.scopeStatus === WorldStates.REACHABLE && this.world.ifNotDark(item);
  }
  isVisible(item) {
    return item.scopeStatus && this.world.ifNotDark(item);
  }
  isPresent(item) {
    return this.isHere(item) || this.isHeld(item);
  }
  isPresentOrMe(item) {
    return this.isHere(item) || this.isHeld(item) || item === this.game.player;
  }
  isHeldNotWorn(item) {
    return item.isAtLoc(this.game.player.name, WorldStates.PARSER) && this.world.ifNotDark(item) && !item.getWorn();
  }
  isHeld(item) {
    return item.isAtLoc(this.game.player.name, WorldStates.PARSER) && this.world.ifNotDark(item);
  }
  isHeldByNpc(item) {
    const npcs = this.scope(this.isReachable).filter((el) => el.npc);
    for (const npc of npcs) {
      if (item.isAtLoc(npc.name, WorldStates.PARSER))
        return true;
    }
    return false;
  }
  isWorn(item) {
    return item.isAtLoc(this.game.player.name, WorldStates.PARSER) && this.world.ifNotDark(item) && item.getWorn();
  }
  isWornByNpc(item) {
    const npcs = this.scope(this.isReachable).filter((el) => el.npc);
    for (const npc of npcs) {
      if (item.isAtLoc(npc.name, WorldStates.PARSER) && item.getWorn())
        return true;
    }
    return false;
  }
  isNpcOrHere(item) {
    return item.isAtLoc(this.game.player.loc, WorldStates.PARSER) && this.world.ifNotDark(item) || item.npc || item.player;
  }
  isNpcAndHere(item) {
    return item.isAtLoc(this.game.player.loc, WorldStates.PARSER) && (item.npc || item.player);
  }
  isHere(item) {
    return item.isAtLoc(this.game.player.loc, WorldStates.PARSER) && this.world.ifNotDark(item);
  }
  isForSale(item) {
    return item.isForSale && item.isForSale(this.game.player.loc) && this.world.ifNotDark(item);
  }
  isContained(item) {
    const containers = this.parser.scope(this.isReachable).filter((el) => el.container);
    for (const container of containers) {
      if (container.closed)
        continue;
      if (item.isAtLoc(container.name, WorldStates.PARSER))
        return true;
    }
    return false;
  }
  isHereOrContained(item) {
    if (this.isHere(item))
      return true;
    if (this.isContained(item))
      return true;
    return false;
  }
  isLiquid(item) {
    return item.liquid;
  }
}
