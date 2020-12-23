// Should all be language neutral (except the inspect function, which is just for debugging)

function Cmd(name, hash) {
  this.name = name;
  this.objects = [];
  this.rules = [];
  this.default = function (item, isMultiple, char) {
    if (typeof this.defmsg === 'string') {
      QuestJs._io.failedmsg(
        QuestJs._tools.prefix(item, isMultiple) + this.defmsg,
        {
          char,
          item,
        },
      );
    } else if (typeof this.defmsg === 'function') {
      QuestJs._io.failedmsg(
        QuestJs._tools.prefix(item, isMultiple) + this.defmsg(char, item),
        {
          char,
          item,
        },
      );
    } else {
      QuestJs._io.errormsg(`No default set for command '${this.name}'.`);
    }
    return false;
  };

  // This is the default script for commands
  // Assumes a verb and an object; the verb may or may not be the first object
  this.script = function (objects, matches) {
    let success = false;
    let suppressEndturn = false;
    let verb;
    if (objects.length > 1) verb = objects.shift();
    const multi =
      objects[0] &&
      (objects[0].length > 1 || QuestJs._parser.currentCommand.all);
    if (objects[0].length === 0) {
      QuestJs._io.metamsg(QuestJs._lang.nothing_msg);
      return QuestJs._world.FAILED;
    }
    for (let i = 0; i < objects[0].length; i += 1) {
      if (!objects[0][i][this.attName]) {
        this.default(objects[0][i], multi, QuestJs._game.player);
      } else {
        let result = this.processCommand(
          QuestJs._game.player,
          objects[0][i],
          multi,
          matches[0][i],
          verb,
        );
        if (result === QuestJs._world.SUCCESS_NO_TURNSCRIPTS) {
          suppressEndturn = true;
          result = true;
        }
        success = result || success;
      }
    }
    if (success) {
      return this.noTurnscripts || suppressEndturn
        ? QuestJs._world.SUCCESS_NO_TURNSCRIPTS
        : QuestJs._world.SUCCESS;
    }
    return QuestJs._world.FAILED;
  };

  this.processCommand = function (char, item, multi, match, verb) {
    for (const rule of this.rules) {
      if (typeof rule !== 'function') {
        QuestJs._io.errormsg(
          `Failed to process command '${this.name}' as one of its rules is not a function (F12 for more).`,
        );
        QuestJs._log.info(
          `Failed to process command '${this.name}' as one of its rules is not a function:`,
        );
        QuestJs._log.info(this);
        QuestJs._log.info(rule);
      }
      if (!rule(this, char, item, multi)) {
        return false;
      }
    }
    let result = QuestJs._tools.printOrRun(char, item, this.attName, {
      multi,
      match,
      verb,
    });
    if (
      typeof result !== 'boolean' &&
      result !== QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    ) {
      // Assume the author wants to return true from the verb
      result = true;
    }
    return result;
  };

  this.noobjecterror = function (s) {
    return QuestJs._lang.object_unknown_msg(s);
  };

  for (const key in hash) {
    this[key] = hash[key];
  }

  this.attName = this.attName ? this.attName : this.name.toLowerCase();
  for (const key in this.objects) {
    if (!this.objects[key].attName) {
      this.objects[key].attName = this.attName;
    }
  }
  if (!this.regex && !this.regexes) {
    this.regexes = Array.isArray(QuestJs._lang.regex[this.name])
      ? QuestJs._lang.regex[this.name]
      : [QuestJs._lang.regex[this.name]];
  }
}

QuestJs._command.Cmd = Cmd;

// Use only for NPC commands that you are not giving your
// own custom script attribute. Commands must be an order to a single
// NPC in the form verb-object.
function NpcCmd(name, hash) {
  Cmd.call(this, name, hash);
  if (!this.cmdCategory) this.cmdCategory = name;
  this.script = function (objects) {
    const npc = objects[0][0];
    if (!npc.npc) {
      QuestJs._io.failedmsg(QuestJs._lang.not_npc, {
        char: QuestJs._game.player,
        item: npc,
      });
      return QuestJs._world.FAILED;
    }
    let success = false;
    let handled;
    if (objects.length !== 2) {
      QuestJs._io.errormsg(
        `The command ${name} is trying to use a facility for NPCs to do it, but there is no object list; this facility is only for commands in the form verb-object.`,
      );
      return QuestJs._world.FAILED;
    }
    const multi = objects[1].length > 1 || QuestJs._parser.currentCommand.all;
    for (const obj of objects[1]) {
      if (
        npc[`getAgreement${this.cmdCategory}`] &&
        !npc[`getAgreement${this.cmdCategory}`](obj, this.name)
      ) {
        // The getAgreement should give the response
        continue;
      }
      if (
        !npc[`getAgreement${this.cmdCategory}`] &&
        npc.getAgreement &&
        !npc.getAgreement(this.cmdCategory, obj)
      ) {
        continue;
      }
      if (!obj[this.attName]) {
        this.default(obj, multi, npc);
      } else {
        let result = this.processCommand(npc, obj, multi);
        if (result === QuestJs._world.SUCCESS_NO_TURNSCRIPTS) {
          result = true;
        }
        success = result || success;
      }
    }
    if (success) {
      npc.pause();
      return this.noTurnscripts
        ? QuestJs._world.SUCCESS_NO_TURNSCRIPTS
        : QuestJs._world.SUCCESS;
    }
    return QuestJs._world.FAILED;
  };
}

QuestJs._command.NpcCmd = NpcCmd;

function ExitCmd(name, dir, hash) {
  Cmd.call(this, name, hash);
  this.exitCmd = true;
  this.dir = dir;
  (this.objects = [{ ignore: true }, { ignore: true }]),
    (this.script = function (objects) {
      if (!QuestJs._game.room.hasExit(this.dir)) {
        QuestJs._io.failedmsg(QuestJs._lang.not_that_way, {
          char: QuestJs._game.player,
          dir: this.dir,
        });
        return QuestJs._world.FAILED;
      }
      const ex = QuestJs._game.room[this.dir];
      if (typeof ex === 'object') {
        if (!QuestJs._game.player.canMove(ex, this.dir)) {
          return QuestJs._world.FAILED;
        }
        if (typeof ex.use !== 'function') {
          QuestJs._io.errormsg(
            "Exit's 'use' attribute is not a function (or does not exist). Press F12 for more.",
          );
          QuestJs._log.info('Bad exit:');
          QuestJs._log.info(ex);
          return QuestJs._world.FAILED;
        }
        const flag = ex.use(QuestJs._game.player, this.dir);
        if (typeof flag !== 'boolean') {
          QuestJs._io.errormsg(
            "Exit failed to return a Boolean value, indicating success of failure; assuming success"
          );
          return QuestJs._world.SUCCESS;
        }
        if (flag && ex.extraTime) QuestJs._game.elapsedTime += ex.extraTime;
        return flag ? QuestJs._world.SUCCESS : QuestJs._world.FAILED;
      }
      QuestJs._io.errormsg('Unsupported type for direction');
      return QuestJs._world.FAILED;
    });
}

QuestJs._command.ExitCmd = ExitCmd;

function NpcExitCmd(name, dir, hash) {
  Cmd.call(this, name, hash);
  this.exitCmd = true;
  this.dir = dir;
  (this.objects = [
    { scope: QuestJs._parser.isHere, attName: 'npc' },
    { ignore: true },
    { ignore: true },
  ]),
    (this.script = function (objects) {
      const npc = objects[0][0];
      if (!QuestJs._game.room.hasExit(this.dir)) {
        QuestJs._io.failedmsg(QuestJs._lang.not_that_way, {
        char: npc,
        dir  : this.dir,
      });
        return QuestJs._world.FAILED;
      }
      if (!npc.canMove(QuestJs._game.room[this.dir], this.dir)) {
        return QuestJs._world.FAILED;
      }
      if (npc.getAgreementGo && !npc.getAgreementGo(dir)) {
        return QuestJs._world.FAILED;
      }
      if (
      !npc.getAgreementGo &&
        npc.getAgreement &&
        !npc.getAgreement('Go', dir)
    ) {
        return QuestJs._world.FAILED;
      }
      const ex = QuestJs._game.room[this.dir];
      if (typeof ex === 'object') {
        const flag = ex.use(npc, this.dir);
        if (flag) npc.pause();
        return flag ? QuestJs._world.SUCCESS : QuestJs._world.FAILED;
      }
      QuestJs._io.errormsg('Unsupported type for direction');
      return QuestJs._world.FAILED;
    });
}

QuestJs._command.NpcExitCmd = ExitCmd;

// Should be called during the initialisation process
function initCommands() {
  const newCmds = [];
  for (const el of QuestJs._commands) {
    if (el.regex) {
      el.regexes = [el.regex];
    }
    if (el.npcCmd) {
      if (!Array.isArray(el.regexes)) QuestJs._log.info(el);
      // QuestJs._log.info("creating NPC command for " + el.name)
      const regexAsStr = el.regexes[0].source.substr(1); // lose the ^ at the start, as we will prepend to it
      const objects = el.objects.slice();
      objects.unshift({ scope: QuestJs._parser.isHere, attName: 'npc' });

      const data = {
        objects,
        attName: el.attName,
        default: el.default,
        defmsg: el.defmsg,
        rules: el.rules,
        score: el.score,
        cmdCategory: el.cmdCategory ? el.cmdCategory : el.name,
        forNpc: true,
      };

      const cmd = new NpcCmd(`Npc${el.name}`, data);
      cmd.regexes = [];
      for (const key in QuestJs._lang.tell_to_prefixes) {
        cmd.regexes.push(
          new RegExp(`^${QuestJs._lang.tell_to_prefixes[key]}${regexAsStr}`),
        );
      }
      if (el.useThisScriptForNpcs) cmd.script = el.script;
      cmd.scope = [];
      for (const el2 of el.objects) {
        cmd.scope.push(
          el2 === QuestJs._parser.isHeld ? QuestJs._parser.isHeldByNpc : el2,
        );
        cmd.scope.push(
          el2 === QuestJs._parser.isWorn ? QuestJs._parser.isWornByNpc : el2,
        );
      }
      newCmds.push(cmd);
    }
  }

  QuestJs._commands.push.apply(QuestJs._commands, newCmds);

  for (const el of QuestJs._lang.exit_list) {
    if (el.type !== 'nocmd') {
      let regex = `(${QuestJs._lang.go_pre_regex})(${
        el.name
      }|${el.abbrev.toLowerCase()}`;
      if (el.alt) {
        regex += `|${el.alt}`;
      }
      regex += ')$';
      QuestJs._commands.push(
        new ExitCmd(`Go${QuestJs._tools.sentenceCase(el.name)}`, el.name, {
          regexes: [new RegExp(`^${regex}`)],
        }),
      );

      const regexes = [];
      for (const key in QuestJs._lang.tell_to_prefixes) {
        regexes.push(
          new RegExp(`^${QuestJs._lang.tell_to_prefixes[key]}${regex}`),
        );
      }
      QuestJs._commands.push(
        new NpcExitCmd(
          `NpcGo${QuestJs._tools.sentenceCase(el.name)}2`,
          el.name,
          {
            regexes,
          },
        ),
      );
    }
  }
}

QuestJs._command.initCommands = initCommands;

// Useful in a command's script when handling NPCs as well as the player
function extractChar(cmd, objects) {
  let char;
  if (cmd.forNpc) {
    char = objects[0][0];
    if (!char.npc) {
      QuestJs._io.failedmsg(QuestJs._lang.not_npc, {
        char: QuestJs._game.player,
        item: char,
      });
      return QuestJs._world.FAILED;
    }
    objects.shift();
  } else {
    char = QuestJs._game.player;
  }
  return char;
}

QuestJs._command.extractChar = extractChar;

function findCmd(name) {
  return QuestJs._commands.find((el) => el.name === name);
}

QuestJs._command.findCmd = findCmd;

const cmdRules = {};

// Item's location is the char and it is not worn
cmdRules.isHeldNotWorn = function (cmd, char, item, isMultiple) {
  if (!item.getWorn() && item.isAtLoc(char.name, QuestJs._world.PARSER))
    return true;

  if (item.isAtLoc(char.name, QuestJs._world.PARSER))
    return QuestJs._io.falsemsg(
      QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.already_wearing,
      { char, garment: item },
    );

  if (item.loc) {
    const holder = QuestJs._w[item.loc];
    if (holder.npc || holder.player)
      return QuestJs._io.falsemsg(
        QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.char_has_it,
        { holder, item },
      );
  }

  return QuestJs._io.falsemsg(
    QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.not_carrying,
    { char, item },
  );
};

// Item's location is the char and it is worn
cmdRules.isWorn = function (cmd, char, item, isMultiple) {
  if (item.getWorn() && item.isAtLoc(char.name, QuestJs._world.PARSER))
    return true;

  if (item.isAtLoc(char.name, QuestJs._world.PARSER))
    return QuestJs._io.falsemsg(
      QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.not_wearing,
      { char, item },
    );

  if (item.loc) {
    const holder = QuestJs._w[item.loc];
    if (holder.npc || holder.player)
      return QuestJs._io.falsemsg(
        QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.char_has_it,
        { holder, item },
      );
  }

  return QuestJs._io.falsemsg(
    QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.not_carrying,
    { char, item },
  );
};

// Item's location is the char
cmdRules.isHeld = function (cmd, char, item, isMultiple) {
  if (item.isAtLoc(char.name, QuestJs._world.PARSER)) return true;

  if (item.loc) {
    const holder = QuestJs._w[item.loc];
    if (holder.npc || holder.player)
      return QuestJs._io.falsemsg(
        QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.char_has_it,
        { holder, item },
      );
  }

  return QuestJs._io.falsemsg(
    QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.not_carrying,
    { char, item },
  );
};

// Item's location is the char's location or the char
// or item is reachable, but not held by someone else
cmdRules.isHere = function (cmd, char, item, isMultiple) {
  if (item.isAtLoc(char.loc, QuestJs._world.PARSER)) return true;
  if (item.isAtLoc(char.name, QuestJs._world.PARSER)) return true;

  if (item.loc) {
    const holder = QuestJs._w[item.loc];
    // Has a specific location and held by someone
    if (holder.npc || holder.player)
      return QuestJs._io.falsemsg(
        QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.char_has_it,
        { holder, item },
      );
  }

  if (item.scopeStatus === QuestJs._world.REACHABLE) return true;

  return QuestJs._io.falsemsg(
    QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.not_here,
    {
      char,
      item,
    },
  );
};

// Item's location is the char's location or the char
// or item is reachable, but not held by someone else
cmdRules.isHereNotHeld = function (cmd, char, item, isMultiple, already) {
  if (item.isAtLoc(char.loc, QuestJs._world.PARSER)) return true;

  if (item.loc) {
    const holder = QuestJs._w[item.loc];
    if (already && holder === QuestJs._game.player)
      return QuestJs._io.falsemsg(
        QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.already_have,
        { char: holder, item },
      );
    if (holder.npc || holder.player)
      return QuestJs._io.falsemsg(
        QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.char_has_it,
        { holder, item },
      );
  }

  if (item.scopeStatus === QuestJs._world.REACHABLE || item.multiLoc)
    return true;
  return QuestJs._io.falsemsg(
    QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.not_here,
    {
      char,
      item,
    },
  );
};

// Used by take to note if player already holding
cmdRules.isHereNotHeldAlready = function (cmd, char, item, isMultiple) {
  return cmdRules.isHereNotHeld(cmd, char, item, isMultiple, true);
};

cmdRules.canManipulate = function (cmd, char, item) {
  if (!char.canManipulate(item, cmd.name)) return false;
  return true;
};

cmdRules.canTalkTo = function (cmd, char, item) {
  if (!char.canTalk(item)) return false;
  if (!item.npc)
    return QuestJs._io.falsemsg(
      QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.not_able_to_hear,
      { char, item },
    );
  return true;
};

cmdRules.canPosture = function (cmd, char, item) {
  if (!char.canPosture(cmd.name)) return false;
  return true;
};

QuestJs.cmdRules = cmdRules;
