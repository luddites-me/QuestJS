"use strict";
// Should all be language neutral
const NPC = function (isFemale: any) {
    // A whole bunch of defaults are the same as the player
    const res = Object.assign({}, CHARACTER(), CONSULTABLE(), AGENDA_FOLLOWER());
    (res as any).npc = true;
    (res as any).isFemale = isFemale;
    (res as any).pronouns = isFemale ? lang.pronouns.female : lang.pronouns.male;
    (res as any).talktoCount = 0;
    (res as any).askOptions = [];
    (res as any).tellOptions = [];
    (res as any).excludeFromAll = true;
    (res as any).reactions = NULL_FUNC;
    res.canReachThrough = () => false;
    (res as any).icon = () => 'npc12';
    res.isAtLoc = function (loc, situation) {
        if (situation === world.LOOK && (this as any).scenery)
            return false;
        if (situation === world.SIDE_PANE && this === (game as any).player)
            return false;
        return ((this as any).loc === loc);
    };
    (res as any).heading = function (dir: any) {
        return lang.go_successful;
    };
    // This does not work properly, it just gets all clothing!!!
    // But authors could replace as required
    (res as any).getWearingVisible = function () {
        return this.getWearing();
    };
    (res as any).getTopics = npc_utilities.getTopics;
    (res as any).isHere = function () {
        return this.isAtLoc((game as any).player.loc);
    };
    res.msg = function (s, params) {
        if ((this as any).isHere())
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(s, params);
    };
    (res as any).multiMsg = function (ary: any) {
        if (!(this as any).isHere())
            return;
        const counter = ary[0].replace(/[^a-z]/ig, '');
        if (this[counter] === undefined)
            this[counter] = -1;
        this[counter]++;
        if (this[counter] >= ary.length)
            this[counter] = ary.length - 1;
        if (ary[this[counter]])
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(ary[this[counter]]);
    };
    (res as any).inSight = function () {
        if ((this as any).isHere())
            return true;
        if (!(this as any).loc)
            return false;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const room = w[(this as any).loc];
        if (room.visibleFrom === undefined)
            return false;
        if (typeof room.visibleFrom === 'function')
            return room.visibleFrom();
        for (let loc of room.visibleFrom) {
            if ((game as any).player.loc === loc)
                return true;
        }
        return false;
    };
    (res as any).setLeader = function (npc: any) {
        (this as any).leaderName = npc.name;
        npc.followers.push(this);
    };
    (res as any).doEvent = function () {
        if ((this as any).dead)
            return;
        (this as any).sayTakeTurn();
        (this as any).doReactions();
        if (!this.paused && !(this as any).suspended && (this as any).agenda.length > 0)
            (this as any).doAgenda();
    };
    (res as any).doReactions = function () {
        if ((this as any).isHere() || settings.npcReactionsAlways) {
            if (typeof (this as any).reactions === "function") {
                (this as any).reactions();
            }
            else {
                if (!(this as any).reactionFlags)
                    (this as any).reactionFlags = "";
                for (let key in (this as any).reactions) {
                    //console.log("key:" + key);
                    if ((this as any).reactionFlags.split(" ").includes(key))
                        continue;
                    if ((this as any).reactions[key].test()) {
                        (this as any).reactions[key].action();
                        (this as any).reactionFlags += " " + key;
                        if ((this as any).reactions[key].override)
                            (this as any).reactionFlags += " " + (this as any).reactions[key].override;
                        //console.log("this.reactionFlags:" + this.reactionFlags);
                    }
                }
            }
        }
    };
    // Use this to move the NPC to tell the player
    // it is happening - if the player is somewhere that it can be seen
    (res as any).moveWithDescription = function (dest: any) {
        if (typeof dest === "object")
            dest = dest.name;
        const origin = (this as any).loc;
        lang.npc_leaving_msg(this, dest);
        // Move NPC (and followers)
        (this as any).loc = dest;
        for (let follower of this.followers)
            (follower as any).loc = dest;
        lang.npc_entering_msg(this, origin);
    };
    (res as any).talkto = npc_utilities.talkto;
    (res as any).topics = function () {
        if ((this as any).askOptions.length === 0 && (this as any).tellOptions.length === 0) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(lang.topics_no_ask_tell);
            return world.SUCCESS_NO_TURNSCRIPTS;
        }
        let flag = false;
        for (let action of ['ask', 'tell']) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            const arr = getResponseList({ actor: this, action: action }, this[action + 'Options']);
            const arr2 = [];
            for (let res of arr) {
                if (res.silent && !(game as any).player.mentionedTopics.includes(res.name))
                    continue;
                arr2.push(res.name);
            }
            if (arr2.length !== 0) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                metamsg(lang['topics_' + action + '_list'], { item: this, list: arr2.sort().join('; ') });
                flag = true;
            }
        }
        if (!flag) {
            metamsg(lang.topics_none_found, { item: this });
        }
        return world.SUCCESS_NO_TURNSCRIPTS;
    };
    (res as any).sayBonus = 0;
    (res as any).sayPriority = 0;
    (res as any).sayState = 0;
    (res as any).sayUsed = " ";
    (res as any).sayResponse = function (s: any) {
        if (!(this as any).sayResponses)
            return false;
        for (let res of (this as any).sayResponses) {
            if (res.id && (this as any).sayUsed.includes(" " + res.id + " "))
                continue;
            if (!res.regex.test(s))
                continue;
            res.response();
            if (res.id)
                (this as any).sayUsed += res.id + " ";
            return true;
        }
        return false;
    };
    (res as any).sayCanHear = function (actor: any, verb: any) {
        return actor.loc === (this as any).loc;
    };
    (res as any).askQuestion = function (questionName: any) {
        if (typeof questionName !== "string")
            questionName = questionName.name;
        (this as any).sayQuestion = questionName;
        (this as any).sayQuestionCountdown = settings.turnsQuestionsLast;
        (this as any).sayBonus = 100;
    };
    (res as any).sayTakeTurn = function (questionName: any) {
        if ((this as any).sayQuestionCountdown <= 0)
            return;
        (this as any).sayQuestionCountdown--;
        if ((this as any).sayQuestionCountdown > 0)
            return;
        delete (this as any).sayQuestion;
        (this as any).sayBonus = 0;
    };
    return res;
};
const npc_utilities = {
    talkto: function () {
        if (!(game as any).player.canTalk(this)) {
            return false;
        }
        // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'true' since the... Remove this comment to see the full error message
        if (settings.noTalkTo !== false) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(settings.noTalkTo);
            return false;
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        const topics = this.getTopics(this);
        if (topics.length === 0)
            return failedmsg(lang.no_topics, { char: (game as any).player, item: this });
        topics.push(lang.never_mind);
        if (settings.dropdownForConv) {
            showDropDown(lang.speak_to_menu_title(this), topics, function (result: any) {
                if (result !== lang.never_mind) {
                    result.runscript();
                }
            });
        }
        else {
            showMenu(lang.speak_to_menu_title(this), topics, function (result: any) {
                if (result !== lang.never_mind) {
                    result.runscript();
                }
            });
        }
        return world.SUCCESS_NO_TURNSCRIPTS;
    },
    getTopics: function () {
        const list = [];
        for (let key in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[key].isTopicVisible && w[key].isTopicVisible(this)) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                list.push(w[key]);
            }
        }
        return list;
    },
};
const AGENDA_FOLLOWER = function () {
    const res = {};
    (res as any).agenda = [];
    (res as any).suspended = false;
    (res as any).followers = [];
    (res as any).inSight = function () { return false; };
    (res as any).doEvent = function () {
        if (!(this as any).paused && !(this as any).suspended && (this as any).agenda.length > 0)
            (this as any).doAgenda();
    };
    (res as any).setAgenda = function (agenda: any) {
        (this as any).agenda = agenda;
        (this as any).suspended = false;
        delete (this as any).agendaWaitCounter;
        delete (this as any).patrolCounter;
    };
    (res as any).doAgenda = function () {
        // If this NPC has followers, we fake it so it seems to be the group
        if ((this as any).followers.length !== 0) {
            (this as any).savedPronouns = (this as any).pronouns;
            (this as any).savedAlias = (this as any).alias;
            (this as any).pronouns = lang.pronouns.plural;
            (this as any).followers.unshift(this);
            (this as any).alias = formatList((this as any).followers, { lastJoiner: lang.list_and });
            (this as any).followers.shift();
        }
        const arr = (this as any).agenda[0].split(":");
        const fn = arr.shift();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (typeof agenda[fn] !== "function") {
            errormsg("Unknown function `" + fn + "' in agenda for " + (this as any).name);
            return;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const flag = agenda[fn](this, arr);
        if (flag)
            (this as any).agenda.shift();
        // If we are faking the group, reset
        if ((this as any).savedPronouns) {
            (this as any).pronouns = (this as any).savedPronouns;
            (this as any).alias = (this as any).savedAlias;
            delete (this as any).savedPronouns;
        }
    };
    (res as any).templatePreSave = function () {
        if ((this as any).agenda)
            (this as any).customSaveAgenda = (this as any).agenda.join("^");
        (this as any).preSave();
    };
    (res as any).templatePostLoad = function () {
        if ((this as any).customSaveAgenda)
            (this as any).agenda = (this as any).customSaveAgenda.split("^");
        delete (this as any).customSaveAgenda;
        if ((this as any).leaderName)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            w[(this as any).leaderName].followers.push(this);
        (this as any).postLoad();
    };
    (res as any).pause = function () {
        //debugmsg("pausing " + this.name);
        if ((this as any).leaderName) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            w[(this as any).leaderName].pause();
        }
        else {
            (this as any).paused = true;
        }
    };
    return res;
};
const agenda = {
    debug: function (s: any, npc: any, arr: any) {
        if ((settings as any).agendaDebugging && (settings as any).playMode === 'dev')
            debugmsg('AGENDA for ' + npc.name + ': ' + s + '; ' + formatList(arr, { doNotSort: true }));
    },
    debugS: function (s: any) {
        if ((settings as any).agendaDebugging && (settings as any).playMode === 'dev')
            debugmsg('AGENDA comment: ' + s);
    },
    // wait one turn
    pause: function (npc: any, arr: any) {
        return true;
    },
    // print the array as text if the player is here
    // otherwise this will be skipped
    // Used by several other functions, so this applies to them too
    text: function (npc: any, arr: any) {
        if (typeof npc[arr[0]] === "function") {
            this.debug("text (function)", npc, arr);
            const fn = arr.shift();
            const res = npc[fn](arr);
            return (typeof res === "boolean" ? res : true);
        }
        this.debug("text (string)", npc, arr);
        if (npc.inSight())
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(arr.join(':'));
        return true;
    },
    // Alias for text
    run: function (npc: any, arr: any) { return this.text(npc, arr); },
    // sets one attribute on the given item
    // it will guess if Boolean, integer or string
    setItemAtt: function (npc: any, arr: any) {
        this.debug("setItemAtt", npc, arr);
        const item = arr.shift();
        const att = arr.shift();
        let value = arr.shift();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[item])
            errormsg("Item '" + item + "' not recognised in the agenda of " + npc.name);
        if (value === "true")
            value = true;
        if (value === "false")
            value = false;
        if (/^\d+$/.test(value))
            value = parseInt(value);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[item][att] = value;
        this.text(npc, arr);
        return true;
    },
    // Wait n turns
    wait: function (npc: any, arr: any) {
        this.debug("wait", npc, arr);
        if (arr.length === 0)
            return true;
        if (isNaN(arr[0]))
            errormsg("Expected wait to be given a number in the agenda of '" + npc.name + "'");
        const count = parseInt(arr.shift());
        if (npc.agendaWaitCounter !== undefined) {
            npc.agendaWaitCounter++;
            if (npc.agendaWaitCounter >= count) {
                this.debugS("Pass");
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
    waitFor: function (npc: any, arr: any) {
        this.debug("waitFor", npc, arr);
        let name = arr.shift();
        if (typeof npc[name] === "function") {
            if (npc[name](arr)) {
                this.text(npc, arr);
                this.debugS("Pass");
                return true;
            }
            else {
                return false;
                ;
            }
        }
        else {
            if (name === "player")
                name = (game as any).player.name;
            if (npc.isHere()) {
                this.text(npc, arr);
                this.debugS("Pass");
                return true;
            }
            else {
                return false;
                ;
            }
        }
    },
    joinedBy: function (npc: any, arr: any) {
        this.debug("joinedBy", npc, arr);
        const followerName = arr.shift();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[followerName].setLeader(npc);
        this.text(npc, arr);
        return true;
    },
    joining: function (npc: any, arr: any) {
        this.debug("joining", npc, arr);
        const leaderName = arr.shift();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        npc.setLeader(w[leaderName]);
        this.text(npc, arr);
        return true;
    },
    disband: function (npc: any, arr: any) {
        this.debug("disband", npc, arr);
        for (let follower of npc.followers) {
            delete follower.leader;
        }
        npc.followers = [];
        this.text(npc, arr);
        return true;
    },
    // Move the given item directly to the given location, then print the rest of the array as text
    // Do not use for items with a funny location, such as COUNTABLES
    moveItem: function (npc: any, arr: any) {
        this.debug("moveItem", npc, arr);
        const item = arr.shift();
        const dest = arr.shift();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[item])
            errormsg("Item '" + item + "' was not recognised in the agenda of " + npc.name);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[dest])
            errormsg("Location '" + dest + "' was not recognised in the agenda of " + npc.name);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[item].moveToFrom(dest);
        this.text(npc, arr);
        return true;
    },
    // Move directly to the given location, then print the rest of the array as text
    // Use "player" to go directly to the room the player is in.
    // Use an item (i.e., an object not flagged as a room) to have the NPC move
    // to the room containing the item.
    moveTo: function (npc: any, arr: any) {
        this.debug("moveTo", npc, arr);
        const dest = arr.shift();
        if (dest === "player")
            // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'dest' because it is a constant.
            dest = (game as any).player.loc;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[dest])
            debugmsg("Location '" + dest + "' not recognised in the agenda of " + npc.name);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[dest].room)
            // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'dest' because it is a constant.
            dest = dest.loc;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[dest])
            errormsg("Location '" + dest + "' not recognized in the agenda of " + npc.name);
        npc.moveWithDescription(dest);
        this.text(npc, arr);
        return true;
    },
    patrol: function (npc: any, arr: any) {
        this.debug("patrol", npc, arr);
        if (npc.patrolCounter === undefined)
            npc.patrolCounter = -1;
        npc.patrolCounter = (npc.patrolCounter + 1) % arr.length;
        this.moveTo(npc, [arr[npc.patrolCounter]]);
        return false;
    },
    // Move to another room via a random, unlocked exit, then print the rest of the array as text
    walkRandom: function (npc: any, arr: any) {
        this.debug("walkRandom", npc, arr);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const exit = w[npc.loc].getRandomExit(true);
        if (exit === null) {
            this.text(npc, arr);
            return true;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[exit.name])
            errormsg("Location '" + exit.name + "' not recognised in the agenda of " + npc.name);
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
    walkTo: function (npc: any, arr: any) {
        this.debug("walkTo", npc, arr);
        let dest = arr.shift();
        if (dest === "player")
            dest = (game as any).player.loc;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (w[dest] === undefined) {
            errormsg("Location '" + dest + "' not recognised in the agenda of " + npc.name);
            return true;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[dest].room) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            dest = w[dest].loc;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[dest] === undefined) {
                errormsg("Object location '" + dest + "' not recognised in the agenda of " + npc.name);
                return true;
            }
        }
        if (npc.isAtLoc(dest)) {
            this.text(npc, arr);
            return true;
        }
        else {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const route = (agenda as any).findPath(w[npc.loc], w[dest]);
            if (!route)
                errormsg("Location '" + dest + "' not reachable in the agenda of " + npc.name);
            npc.moveWithDescription(route[0]);
            if (npc.isAtLoc(dest)) {
                this.text(npc, arr);
                return true;
            }
            else {
                return false;
            }
        }
    },
};
// start and end are the objects, not their names!
(agenda as any).findPath = function (start: any, end: any, maxlength: any) {
    if (start === end)
        return [];
    if (!(game as any).pathID)
        (game as any).pathID = 0;
    if (maxlength === undefined)
        maxlength = 999;
    (game as any).pathID++;
    let currentList = [start];
    let length = 0;
    let nextList, dest, exits;
    start.pathfinderNote = { id: (game as any).pathID };
    // At each iteration we look at the rooms linked from the previous one
    // Any new rooms go into nextList
    // Each room gets flagged with "pathfinderNote"
    while (currentList.length > 0 && length < maxlength) {
        nextList = [];
        length++;
        for (let room of currentList) {
            exits = room.getExits({ npc: true });
            for (let exit of exits) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                dest = w[exit.name];
                if (dest === undefined) {
                    errormsg("Dest is undefined: " + exit.name + ' (room ' + room.name + '). Giving up.');
                    console.log(this);
                    return false;
                }
                if (dest.pathfinderNote && dest.pathfinderNote.id === (game as any).pathID)
                    continue;
                dest.pathfinderNote = { jumpFrom: room, id: (game as any).pathID };
                if (dest === end)
                    return (agenda as any).extractPath(start, end);
                nextList.push(dest);
            }
        }
        currentList = nextList;
    }
    return false;
};
(agenda as any).extractPath = function (start: any, end: any) {
    let res = [end];
    let current = end;
    let count = 0;
    do {
        current = current.pathfinderNote.jumpFrom;
        res.push(current);
        count++;
    } while (current !== start && count < 99);
    res.pop(); // The last is the start location, which we do not ned
    return res.reverse();
};
const CONSULTABLE = function () {
    const res = {};
    (res as any).askabout = function (text1: any, text2: any) { return (this as any).asktellabout(text1, text2, lang.ask_about_intro, (this as any).askOptions, "ask"); },
        (res as any).tellabout = function (text1: any, text2: any) { return (this as any).asktellabout(text1, text2, lang.tell_about_intro, (this as any).tellOptions, "tell"); },
        (res as any).asktellabout = function (text1: any, text2: any, intro: any, list: any, action: any) {
            if (!(game as any).player.canTalk(this)) {
                return false;
            }
            // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'true' since the... Remove this comment to see the full error message
            if (settings.noAskTell !== false) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(settings.noAskTell);
                return false;
            }
            if (!list || list.length === 0) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(settings.noAskTell);
                return errormsg("No " + action + "Options set for " + (this as any).name + " and I think there should at least be default saying why.");
            }
            if (settings.givePlayerAskTellMsg)
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(intro(this, text1, text2));
            const params = {
                text: text1,
                text2: text2,
                actor: this,
                action: action,
            };
            return respond(params, list, (this as any).askTellDone);
        };
    (res as any).askTellDone = function (params: any, response: any) {
        if (!response) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(lang.npc_no_interest_in, params);
            return;
        }
        if (response.mentions) {
            for (let s of response.mentions) {
                if (!(game as any).player.mentionedTopics.includes(s))
                    (game as any).player.mentionedTopics.push(s);
            }
        }
        params.actor.pause();
    };
    return res;
};
const QUESTION = function () {
    const res = {
        sayResponse: function (actor: any, s: any) {
            for (let res of (this as any).responses) {
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
const TOPIC = function (fromStart: any) {
    const res = {
        conversationTopic: true,
        showTopic: fromStart,
        hideTopic: false,
        hideAfter: true,
        properName: true,
        nowShow: [],
        nowHide: [],
        count: 0,
        isAtLoc: () => false,
        eventPeriod: 1,
        eventActive: function () { this.showTopic && !this.hideTopic && (this as any).countdown; },
        eventScript: function () {
            (this as any).countdown--;
            if ((this as any).countdown < 0)
                this.hideTopic = true;
        },
        runscript: function () {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            let obj = w[(this as any).loc];
            obj.pause();
            this.hideTopic = this.hideAfter;
            (this as any).script(obj);
            if (typeof this.nowShow === "string")
                errormsg("nowShow for topic " + (this as any).name + " is a string.");
            for (let s of this.nowShow) {
                obj = w[s];
                if (obj === undefined)
                    errormsg("No topic called " + s + " found.");
                obj.showTopic = true;
            }
            if (typeof this.nowHide === "string")
                errormsg("nowHide for topic " + (this as any).name + " is a string.");
            for (let s of this.nowHide) {
                obj = w[s];
                if (obj === undefined)
                    errormsg("No topic called " + s + " found.");
                obj.hideTopic = true;
            }
            this.count++;
            world.endTurn(world.SUCCESS);
        },
        isTopicVisible: function (char: any) {
            return this.showTopic && !this.hideTopic && char.name === (this as any).loc;
        },
        show: function () {
            return this.showTopic = true;
        },
        hide: function () {
            return this.hideTopic = true;
        },
    };
    return res;
};
