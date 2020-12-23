// Should all be language neutral

const NPC = function (isFemale) {
  // A whole bunch of defaults are the same as the player
  const res = { ...QuestJs._templates.CHARACTER(), ...CONSULTABLE(), ...AGENDA_FOLLOWER() };

  res.npc = true;
  res.isFemale = isFemale;
  res.pronouns = isFemale ? QuestJs._lang.pronouns.female : QuestJs._lang.pronouns.male;

  res.talktoCount = 0;
  res.askOptions = [];
  res.tellOptions = [];
  res.excludeFromAll = true;
  res.reactions = QuestJs._consts.NULL_FUNC;
  res.canReachThrough = () => false;
  res.icon = () => 'npc12';

  res.isAtLoc = function (loc, situation) {
    if (situation === QuestJs._world.LOOK && this.scenery) return false;
    if (situation === QuestJs._world.SIDE_PANE && this === QuestJs._game.player) return false;
    return this.loc === loc;
  };

  res.heading = function (dir) {
    return QuestJs._lang.go_successful;
  };

  // This does not work properly, it just gets all clothing!!!
  // But authors could replace as required
  res.getWearingVisible = function () {
    return this.getWearing();
  };

  res.getTopics = npc_utilities.getTopics;

  res.isHere = function () {
    return this.isAtLoc(QuestJs._game.player.loc);
  };

  res.msg = function (s, params) {
    if (this.isHere()) QuestJs._io.msg(s, params);
  };

  res.multiMsg = function (ary) {
    if (!this.isHere()) return;
    const counter = ary[0].replace(/[^a-z]/gi, '');
    if (this[counter] === undefined) this[counter] = -1;
    this[counter] += 1;
    if (this[counter] >= ary.length) this[counter] = ary.length - 1;
    if (ary[this[counter]]) QuestJs._io.msg(ary[this[counter]]);
  };

  res.inSight = function () {
    if (this.isHere()) return true;
    if (!this.loc) return false;
    const room = QuestJs._w[this.loc];
    if (room.visibleFrom === undefined) return false;
    if (typeof room.visibleFrom === 'function') return room.visibleFrom();
    for (const loc of room.visibleFrom) {
      if (QuestJs._game.player.loc === loc) return true;
    }
    return false;
  };

  res.setLeader = function (npc) {
    this.leaderName = npc.name;
    npc.followers.push(this);
  };

  res.doEvent = function () {
    if (this.dead) return;
    this.sayTakeTurn();
    this.doReactions();
    if (!this.paused && !this.suspended && this.agenda.length > 0) this.doAgenda();
  };

  res.doReactions = function () {
    if (this.isHere() || QuestJs._settings.npcReactionsAlways) {
      if (typeof this.reactions === 'function') {
        this.reactions();
      } else {
        if (!this.reactionFlags) this.reactionFlags = '';
        for (const key in this.reactions) {
          // QuestJs._log.info("key:" + key);
          if (this.reactionFlags.split(' ').includes(key)) continue;
          if (this.reactions[key].test()) {
            this.reactions[key].action();
            this.reactionFlags += ` ${key}`;
            if (this.reactions[key].override)
              this.reactionFlags += ` ${this.reactions[key].override}`;
            // QuestJs._log.info("this.reactionFlags:" + this.reactionFlags);
          }
        }
      }
    }
  };

  // Use this to move the NPC to tell the player
  // it is happening - if the player is somewhere that it can be seen
  res.moveWithDescription = function (dest) {
    if (typeof dest === 'object') dest = dest.name;
    const origin = this.loc;

    QuestJs._lang.npc_leaving_msg(this, dest);

    // Move NPC (and followers)
    this.loc = dest;
    for (const follower of this.followers) follower.loc = dest;

    QuestJs._lang.npc_entering_msg(this, origin);
  };

  res.talkto = npc_utilities.talkto;

  res.topics = function () {
    if (this.askOptions.length === 0 && this.tellOptions.length === 0) {
      QuestJs._io.metamsg(QuestJs._lang.topics_no_ask_tell);
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    }

    let flag = false;
    for (const action of ['ask', 'tell']) {
      const arr = QuestJs._util.getResponseList({ actor: this, action }, this[`${action}Options`]);
      const arr2 = [];
      for (const res of arr) {
        if (res.silent && !QuestJs._game.player.mentionedTopics.includes(res.name)) continue;
        arr2.push(res.name);
      }
      if (arr2.length !== 0) {
        QuestJs._io.metamsg(QuestJs._lang[`topics_${action}_list`], {
          item: this,
          list: arr2.sort().join('; '),
        });
        flag = true;
      }
    }

    if (!flag) {
      QuestJs._io.metamsg(QuestJs._lang.topics_none_found, { item: this });
    }

    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  };

  res.sayBonus = 0;
  res.sayPriority = 0;
  res.sayState = 0;
  res.sayUsed = ' ';
  res.sayResponse = function (s) {
    if (!this.sayResponses) return false;
    for (const res of this.sayResponses) {
      if (res.id && this.sayUsed.includes(` ${res.id} `)) continue;
      if (!res.regex.test(s)) continue;
      res.response();
      if (res.id) this.sayUsed += `${res.id} `;
      return true;
    }
    return false;
  };
  res.sayCanHear = function (actor, verb) {
    return actor.loc === this.loc;
  };
  res.askQuestion = function (questionName) {
    if (typeof questionName !== 'string') questionName = questionName.name;
    this.sayQuestion = questionName;
    this.sayQuestionCountdown = QuestJs._settings.turnsQuestionsLast;
    this.sayBonus = 100;
  };
  res.sayTakeTurn = function (questionName) {
    if (this.sayQuestionCountdown <= 0) return;
    this.sayQuestionCountdown -= 1;
    if (this.sayQuestionCountdown > 0) return;
    delete this.sayQuestion;
    this.sayBonus = 0;
  };

  return res;
};

QuestJs._npc.NPC = NPC;

const npc_utilities = {
  talkto() {
    if (!QuestJs._game.player.canTalk(this)) {
      return false;
    }
    if (QuestJs._settings.noTalkTo !== false) {
      QuestJs._io.metamsg(QuestJs._settings.noTalkTo);
      return false;
    }

    const topics = this.getTopics(this);
    if (topics.length === 0)
      return QuestJs._io.failedmsg(QuestJs._lang.no_topics, {
        char: QuestJs._game.player,
        item: this,
      });

    topics.push(QuestJs._lang.never_mind);
    if (QuestJs._settings.dropdownForConv) {
      QuestJs._io.showDropDown(QuestJs._lang.speak_to_menu_title(this), topics, (result) => {
        if (result !== QuestJs._lang.never_mind) {
          result.runscript();
        }
      });
    } else {
      QuestJs._io.showMenu(QuestJs._lang.speak_to_menu_title(this), topics, (result) => {
        if (result !== QuestJs._lang.never_mind) {
          result.runscript();
        }
      });
    }

    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  },

  getTopics() {
    const list = [];
    for (const key in QuestJs._w) {
      if (QuestJs._w[key].isTopicVisible && QuestJs._w[key].isTopicVisible(this)) {
        list.push(QuestJs._w[key]);
      }
    }
    return list;
  },
};

QuestJs._npc_utilities = npc_utilities;

const AGENDA_FOLLOWER = function () {
  const res = {};
  res.agenda = [];
  res.suspended = false;
  res.followers = [];
  res.inSight = function () {
    return false;
  };
  res.doEvent = function () {
    if (!this.paused && !this.suspended && this.agenda.length > 0) this.doAgenda();
  };

  res.setAgenda = function (agenda) {
    this.agenda = agenda;
    this.suspended = false;
    delete this.agendaWaitCounter;
    delete this.patrolCounter;
  };

  res.doAgenda = function () {
    // If this NPC has followers, we fake it so it seems to be the group
    if (this.followers.length !== 0) {
      this.savedPronouns = this.pronouns;
      this.savedAlias = this.alias;
      this.pronouns = QuestJs._lang.pronouns.plural;
      this.followers.unshift(this);
      this.alias = QuestJs._tools.formatList(this.followers, {
        lastJoiner: QuestJs._lang.list_and,
      });
      this.followers.shift();
    }

    const arr = this.agenda[0].split(':');
    const fn = arr.shift();
    if (typeof agenda[fn] !== 'function') {
      QuestJs._io.errormsg(`Unknown function \`${fn}' in agenda for ${this.name}`);
      return;
    }
    const flag = agenda[fn](this, arr);
    if (flag) this.agenda.shift();

    // If we are faking the group, reset
    if (this.savedPronouns) {
      this.pronouns = this.savedPronouns;
      this.alias = this.savedAlias;
      delete this.savedPronouns;
    }
  };

  res.templatePreSave = function () {
    if (this.agenda) this.customSaveAgenda = this.agenda.join('^');
    this.preSave();
  };

  res.templatePostLoad = function () {
    if (this.customSaveAgenda) this.agenda = this.customSaveAgenda.split('^');
    delete this.customSaveAgenda;
    if (this.leaderName) QuestJs._w[this.leaderName].followers.push(this);
    this.postLoad();
  };

  res.pause = function () {
    // QuestJs._io.debugmsg("pausing " + this.name);
    if (this.leaderName) {
      QuestJs._w[this.leaderName].pause();
    } else {
      this.paused = true;
    }
  };

  return res;
};

QuestJs._npc.AGENDA_FOLLOWER = AGENDA_FOLLOWER;

const agenda = {
  debug(s, npc, arr) {
    if (QuestJs._settings.agendaDebugging && QuestJs._settings.playMode === 'dev')
      QuestJs._io.debugmsg(
        `AGENDA for ${npc.name}: ${s}; ${QuestJs._tools.formatList(arr, { doNotSort: true })}`,
      );
  },
  debugS(s) {
    if (QuestJs._settings.agendaDebugging && QuestJs._settings.playMode === 'dev')
      QuestJs._io.debugmsg(`AGENDA comment: ${s}`);
  },

  // wait one turn
  pause(npc, arr) {
    return true;
  },

  // print the array as text if the player is here
  // otherwise this will be skipped
  // Used by several other functions, so this applies to them too
  text(npc, arr) {
    if (typeof npc[arr[0]] === 'function') {
      this.debug('text (function)', npc, arr);
      const fn = arr.shift();
      const res = npc[fn](arr);
      return typeof res === 'boolean' ? res : true;
    }
    this.debug('text (string)', npc, arr);

    if (npc.inSight()) QuestJs._io.msg(arr.join(':'));
    return true;
  },

  // Alias for text
  run(npc, arr) {
    return this.text(npc, arr);
  },

  // sets one attribute on the given item
  // it will guess if Boolean, integer or string
  setItemAtt(npc, arr) {
    this.debug('setItemAtt', npc, arr);
    const item = arr.shift();
    const att = arr.shift();
    let value = arr.shift();
    if (!QuestJs._w[item])
      QuestJs._io.errormsg(`Item '${item}' not recognised in the agenda of ${npc.name}`);
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    if (/^\d+$/.test(value)) value = parseInt(value);
    QuestJs._w[item][att] = value;
    this.text(npc, arr);
    return true;
  },

  // Wait n turns
  wait(npc, arr) {
    this.debug('wait', npc, arr);
    if (arr.length === 0) return true;
    if (isNaN(arr[0]))
      QuestJs._io.errormsg(`Expected wait to be given a number in the agenda of '${npc.name}'`);
    const count = parseInt(arr.shift());
    if (npc.agendaWaitCounter !== undefined) {
      npc.agendaWaitCounter += 1;
      if (npc.agendaWaitCounter >= count) {
        this.debugS('Pass');
        this.text(npc, arr);
        return true;
      }
      return false;
    }
    npc.agendaWaitCounter = 1;
    return false;
  },

  // Wait until ...
  // This may be repeated any number of times
  waitFor(npc, arr) {
    this.debug('waitFor', npc, arr);
    let name = arr.shift();
    if (typeof npc[name] === 'function') {
      if (npc[name](arr)) {
        this.text(npc, arr);
        this.debugS('Pass');
        return true;
      }
      return false;
    }
    if (name === 'player') name = QuestJs._game.player.name;
    if (npc.isHere()) {
      this.text(npc, arr);
      this.debugS('Pass');
      return true;
    }
    return false;
  },

  joinedBy(npc, arr) {
    this.debug('joinedBy', npc, arr);
    const followerName = arr.shift();
    QuestJs._w[followerName].setLeader(npc);
    this.text(npc, arr);
    return true;
  },

  joining(npc, arr) {
    this.debug('joining', npc, arr);
    const leaderName = arr.shift();
    npc.setLeader(QuestJs._w[leaderName]);
    this.text(npc, arr);
    return true;
  },

  disband(npc, arr) {
    this.debug('disband', npc, arr);
    for (const follower of npc.followers) {
      delete follower.leader;
    }
    npc.followers = [];
    this.text(npc, arr);
    return true;
  },

  // Move the given item directly to the given location, then print the rest of the array as text
  // Do not use for items with a funny location, such as COUNTABLES
  moveItem(npc, arr) {
    this.debug('moveItem', npc, arr);
    const item = arr.shift();
    const dest = arr.shift();
    if (!QuestJs._w[item])
      QuestJs._io.errormsg(`Item '${item}' was not recognised in the agenda of ${npc.name}`);
    if (!QuestJs._w[dest])
      QuestJs._io.errormsg(`Location '${dest}' was not recognised in the agenda of ${npc.name}`);
    QuestJs._w[item].moveToFrom(dest);
    this.text(npc, arr);
    return true;
  },

  // Move directly to the given location, then print the rest of the array as text
  // Use "player" to go directly to the room the player is in.
  // Use an item (i.e., an object not flagged as a room) to have the NPC move
  // to the room containing the item.
  moveTo(npc, arr) {
    this.debug('moveTo', npc, arr);
    const dest = arr.shift();
    if (dest === 'player') dest = QuestJs._game.player.loc;
    if (!QuestJs._w[dest])
      QuestJs._io.debugmsg(`Location '${dest}' not recognised in the agenda of ${npc.name}`);
    if (!QuestJs._w[dest].room) dest = dest.loc;
    if (!QuestJs._w[dest])
      QuestJs._io.errormsg(`Location '${dest}' not recognized in the agenda of ${npc.name}`);
    npc.moveWithDescription(dest);
    this.text(npc, arr);
    return true;
  },

  patrol(npc, arr) {
    this.debug('patrol', npc, arr);
    if (npc.patrolCounter === undefined) npc.patrolCounter = -1;
    npc.patrolCounter = (npc.patrolCounter + 1) % arr.length;
    this.moveTo(npc, [arr[npc.patrolCounter]]);
    return false;
  },

  // Move to another room via a random, unlocked exit, then print the rest of the array as text
  walkRandom(npc, arr) {
    this.debug('walkRandom', npc, arr);
    const exit = QuestJs._w[npc.loc].getRandomExit(true);
    if (exit === null) {
      this.text(npc, arr);
      return true;
    }
    if (!QuestJs._w[exit.name])
      QuestJs._io.errormsg(`Location '${exit.name}' not recognised in the agenda of ${npc.name}`);
    npc.moveWithDescription(exit.name);
    return false;
  },

  // Move to the given location, using available, unlocked exits, one room per turn
  // then print the rest of the array as text
  // Use "player" to go to the room the player is in (if the player moves, the NPC will head
  // to the new position, but will be omniscient!).
  // Use an item (i.e., an object not flagged as a room) to have the NPC move
  // to the room containing the item.
  // This may be repeated any number of turns
  walkTo(npc, arr) {
    this.debug('walkTo', npc, arr);
    let dest = arr.shift();
    if (dest === 'player') dest = QuestJs._game.player.loc;
    if (QuestJs._w[dest] === undefined) {
      QuestJs._io.errormsg(`Location '${dest}' not recognised in the agenda of ${npc.name}`);
      return true;
    }
    if (!QuestJs._w[dest].room) {
      dest = QuestJs._w[dest].loc;
      if (QuestJs._w[dest] === undefined) {
        QuestJs._io.errormsg(
          `Object location '${dest}' not recognised in the agenda of ${npc.name}`,
        );
        return true;
      }
    }
    if (npc.isAtLoc(dest)) {
      this.text(npc, arr);
      return true;
    }
    const route = agenda.findPath(QuestJs._w[npc.loc], QuestJs._w[dest]);
    if (!route)
      QuestJs._io.errormsg(`Location '${dest}' not reachable in the agenda of ${npc.name}`);
    npc.moveWithDescription(route[0]);
    if (npc.isAtLoc(dest)) {
      this.text(npc, arr);
      return true;
    }
    return false;
  },
};

QuestJs._npc.agenda = agenda;

// start and end are the objects, not their names!
agenda.findPath = function (start, end, maxlength) {
  if (start === end) return [];

  if (!QuestJs._game.pathID) QuestJs._game.pathID = 0;
  if (maxlength === undefined) maxlength = 999;
  QuestJs._game.pathID += 1;
  let currentList = [start];
  let length = 0;
  let nextList;
  let dest;
  let exits;
  start.pathfinderNote = { id: QuestJs._game.pathID };

  // At each iteration we look at the rooms linked from the previous one
  // Any new rooms go into nextList
  // Each room gets flagged with "pathfinderNote"
  while (currentList.length > 0 && length < maxlength) {
    nextList = [];
    length += 1;
    for (const room of currentList) {
      exits = room.getExits({ npc: true });
      for (const exit of exits) {
        dest = QuestJs._w[exit.name];
        if (dest === undefined) {
          QuestJs._io.errormsg(`Dest is undefined: ${exit.name} (room ${room.name}). Giving up.`);
          QuestJs._log.info(this);
          return false;
        }
        if (dest.pathfinderNote && dest.pathfinderNote.id === QuestJs._game.pathID) continue;
        dest.pathfinderNote = { jumpFrom: room, id: QuestJs._game.pathID };
        if (dest === end) return agenda.extractPath(start, end);
        nextList.push(dest);
      }
    }
    currentList = nextList;
  }
  return false;
};

agenda.extractPath = function (start, end) {
  const res = [end];
  let current = end;
  let count = 0;

  do {
    current = current.pathfinderNote.jumpFrom;
    res.push(current);
    count += 1;
  } while (current !== start && count < 99);
  res.pop(); // The last is the start location, which we do not ned
  return res.reverse();
};

const CONSULTABLE = function () {
  const res = {};

  (res.askabout = function (text1, text2) {
    return this.asktellabout(text1, text2, QuestJs._lang.ask_about_intro, this.askOptions, 'ask');
  }),
    (res.tellabout = function (text1, text2) {
      return this.asktellabout(
        text1,
        text2,
        QuestJs._lang.tell_about_intro,
        this.tellOptions,
        'tell',
      );
    }),
    (res.asktellabout = function (text1, text2, intro, list, action) {
      if (!QuestJs._game.player.canTalk(this)) {
        return false;
      }
      if (QuestJs._settings.noAskTell !== false) {
        QuestJs._io.metamsg(QuestJs._settings.noAskTell);
        return false;
      }
      if (!list || list.length === 0) {
        QuestJs._io.metamsg(QuestJs._settings.noAskTell);
        return QuestJs._io.errormsg(
          `No ${action}Options set for ${this.name} and I think there should at least be default saying why.`,
        );
      }
      if (QuestJs._settings.givePlayerAskTellMsg) QuestJs._io.msg(intro(this, text1, text2));

      const params = {
        text: text1,
        text2,
        actor: this,
        action,
      };
      return QuestJs._util.respond(params, list, this.askTellDone);
    });
  res.askTellDone = function (params, response) {
    if (!response) {
      QuestJs._io.msg(QuestJs._lang.npc_no_interest_in, params);
      return;
    }
    if (response.mentions) {
      for (const s of response.mentions) {
        if (!QuestJs._game.player.mentionedTopics.includes(s))
          QuestJs._game.player.mentionedTopics.push(s);
      }
    }
    params.actor.pause();
  };

  return res;
};

const QUESTION = function () {
  const res = {
    sayResponse(actor, s) {
      for (const res of this.responses) {
        if (!res.regex || res.regex.test(s)) {
          actor.sayBonus = 0;
          delete actor.sayQuestion;
          res.response(s);
          return true;
        }
      }
      return false;
    },
  };
  return res;
};

QuestJs._npc.QUESTION = QUESTION;

const TOPIC = function (fromStart) {
  const res = {
    conversationTopic: true,
    showTopic: fromStart,
    hideTopic: false,
    hideAfter: true,
    properName: true, // we do not want "the" prepended
    nowShow: [],
    nowHide: [],
    count: 0,
    isAtLoc: () => false,
    eventPeriod: 1,
    eventActive() {
      this.showTopic && !this.hideTopic && this.countdown;
    },
    eventScript() {
      this.countdown -= 1;
      if (this.countdown < 0) this.hideTopic = true;
    },
    runscript() {
      let obj = QuestJs._w[this.loc];
      obj.pause();
      this.hideTopic = this.hideAfter;
      this.script(obj);
      if (typeof this.nowShow === 'string')
        QuestJs._io.errormsg(`nowShow for topic ${this.name} is a string.`);
      for (const s of this.nowShow) {
        obj = QuestJs._w[s];
        if (obj === undefined) QuestJs._io.errormsg(`No topic called ${s} found.`);
        obj.showTopic = true;
      }
      if (typeof this.nowHide === 'string')
        QuestJs._io.errormsg(`nowHide for topic ${this.name} is a string.`);
      for (const s of this.nowHide) {
        obj = QuestJs._w[s];
        if (obj === undefined) QuestJs._io.errormsg(`No topic called ${s} found.`);
        obj.hideTopic = true;
      }
      this.count += 1;
      QuestJs._world.endTurn(QuestJs._world.SUCCESS);
    },
    isTopicVisible(char) {
      return this.showTopic && !this.hideTopic && char.name === this.loc;
    },
    show() {
      return (this.showTopic = true);
    },
    hide() {
      return (this.hideTopic = true);
    },
  };
  return res;
};

QuestJs._npc.TOPIC = TOPIC;
