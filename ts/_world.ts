"use strict";
// This is where the world exist!
const w = {};
//@DOC
// ## World Functions
//
// These are functions for creating objects in the game world
//@UNDOC
//@DOC
// Use this to create a new item (as opposed to a room).
// It adds various defaults that apply only to items.
// The first argument should be a string - a unique name for this object, composed only of letters, numbers and underscores.
// It will than take any number of dictionaries that will be combined to set the properties.
// Generally objects should not be created during play as they will not be saved properly.
// Either keep the object hodden until required or clone existing objects.
function createItem() {
    const args = Array.prototype.slice.call(arguments);
    const name = args.shift();
    args.unshift(DEFAULT_ITEM);
    return createObject(name, args);
}
//@DOC
// Use this to create a new room (as opposed to an item).
// It adds various defaults that apply only to items
// The first argument should be a string - a unique name for this object, composed only of letters, numbers and underscores.
// It will than take any number of dictionaries that will be combined to set the properties.
// Generally objects should not be created during play as they will not be saved properly.
// Either keep the object hodden until required or clone existing objects.
function createRoom() {
    const args = Array.prototype.slice.call(arguments);
    const name = args.shift();
    args.unshift(DEFAULT_ROOM);
    return createObject(name, args);
}
//@DOC
// Use this to create new items during play. The given item will be cloned at the given location.
// The `newName` isoptional, one will be generated if not supplied. If you do supply one bear inmid that
// every clone must have a unique name.
function cloneObject(item: any, loc: any, newName: any) {
    if (item === undefined) {
        console.log("Item is not defined.");
    }
    if (typeof item === 'string') {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const o = w[item];
        if (o === undefined) {
            console.log("No item called '" + item + "' found in cloneObject.");
        }
        item = o;
    }
    const clone = {};
    for (let key in item)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        clone[key] = item[key];
    (clone as any).name = newName === undefined ? world.findUniqueName(item.name) : newName;
    if (!(clone as any).clonePrototype) {
        (clone as any).clonePrototype = item;
    }
    if (loc !== undefined) {
        (clone as any).loc = loc;
    }
    (clone as any).getSaveString = function (item: any) {
        (this as any).templatePreSave();
        let s = "Clone:" + (this as any).clonePrototype.name + "=";
        for (let key in this) {
            if (typeof this[key] !== "function" && typeof this[key] !== "object") {
                if (key !== "desc" && key !== "examine" && key !== "name") {
                    s += saveLoad.encode(key, this[key]);
                }
                if (key === "desc" && (this as any).mutableDesc) {
                    s += saveLoad.encode(key, this[key]);
                }
                if (key === "examine" && (this as any).mutableExamine) {
                    s += saveLoad.encode(key, this[key]);
                }
            }
        }
        return s;
    };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    w[(clone as any).name] = clone;
    return clone;
}
//@DOC
// Creates a basic object. Generally it is better to use CreateItem or CreateRoom.
function createObject(name: any, listOfHashes: any) {
    if (world.isCreated && !settings.saveDisabled) {
        console.log("Attempting to use createObject with `" + name + "` after set up. To ensure games save properly you should use cloneObject to create ites during play.");
        errormsg("Attempting to use createObject with `" + name + "` after set up. To ensure games save properly you should use cloneObject to create ites during play.");
        return null;
    }
    if (/\W/.test(name)) {
        console.log("Attempting to use the disallowed name `" + name + "`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.");
        errormsg("Attempting to use the disallowed name `" + name + "`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.");
        return null;
    }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (w[name]) {
        console.log("Attempting to use the name `" + name + "` when there is already an item with that name in the world.");
        errormsg("Attempting to use the name `" + name + "` when there is already an item with that name in the world.");
        return null;
    }
    if (typeof listOfHashes.unshift !== 'function') {
        console.log("The list of hashes for `" + name + "` is not what I was expecting. Found:");
        console.log(listOfHashes);
        console.log('Maybe you meant to use createItem?');
        errormsg("The list of hashes for `" + name + "` is not what I was expecting. Look at the console for more.");
        return null;
    }
    listOfHashes.unshift(DEFAULT_OBJECT);
    const item = {
        name: name,
    };
    for (let hash of listOfHashes) {
        for (let key in hash) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            item[key] = hash[key];
        }
    }
    // Give every object an alias and list alias (used in the inventories)
    if (!(item as any).alias)
        (item as any).alias = item.name.replace(/_/g, " ");
    if (!(item as any).listalias)
        (item as any).listalias = sentenceCase((item as any).alias);
    if (!(item as any).getListAlias)
        (item as any).getListAlias = function (loc: any) { return (this as any).listalias; };
    if (!(item as any).pluralAlias)
        (item as any).pluralAlias = (item as any).alias + "s";
    if ((item as any).pluralAlias === '*')
        (item as any).pluralAlias = (item as any).alias;
    (item as any).verbFunctions = [function (o: any, verbList: any) {
            verbList.push(lang.verbs.examine);
            if (o.use !== undefined)
                verbList.push(lang.verbs.use);
        }];
    (item as any).nameModifierFunctions = [];
    for (let hash of listOfHashes) {
        if (hash.onCreation)
            hash.onCreation(item);
    }
    //world.data.push(item);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    w[name] = item;
    return item;
}
const world = {
    VISIBLE: 1,
    REACHABLE: 2,
    // constants for lighting levels
    LIGHT_NONE: 0,
    LIGHT_SELF: 1,
    LIGHT_MEAGRE: 2,
    LIGHT_FULL: 3,
    LIGHT_EXTREME: 4,
    // constants for verbosity of room descriptions
    BRIEF: 1,
    TERSE: 2,
    VERBOSE: 3,
    // constants for isAtLoc situations
    ALL: 0,
    LOOK: 1,
    PARSER: 2,
    INVENTORY: 3,
    SIDE_PANE: 4,
    SCOPING: 5,
    // constants for command responses
    // (but a verb will return true or false, so the command that uses it
    // can in turn return one of these - a verb is an attribute of an object)
    SUCCESS: 1,
    SUCCESS_NO_TURNSCRIPTS: 2,
    FAILED: -1,
    PARSER_FAILURE: -2,
    isCreated: false,
    // @ts-expect-error ts-migrate(7023) FIXME: 'findUniqueName' implicitly has return type 'any' ... Remove this comment to see the full error message
    findUniqueName: function (s: any) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[s]) {
            return (s);
        }
        else {
            const res = /(\d+)$/.exec(s);
            if (!res) {
                return world.findUniqueName(s + "0");
            }
            const n = parseInt(res[0]) + 1;
            return world.findUniqueName(s.replace(/(\d+)$/, "" + n));
        }
    },
    init: function () {
        // Sort out the player
        let player;
        for (let key in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[key].player) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                player = w[key];
            }
        }
        if (!player) {
            errormsg("No player object found. This is probably due to an error in data.js. Do [Ctrl][Shft]-I to open the developer tools, and go to the console tab, and look at the first error in the list (if it mentions jQuery, skip it and look at the second one). It should tell you exactly which line in which file. But also check one object is actually flagged as the player.");
            return;
        }
        (game as any).update(player);
        // Create a background item if it does not exist
        // This handles the player wanting to interact with things in room descriptions
        // that are not implemented by changing its regex when a room is entered.
        if ((w as any).background === undefined) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
            (w as any).background = createItem("background", {
                scenery: true,
                examine: lang.default_description,
                background: true,
                name: 'default_background_object',
                lightSource: function () { return world.LIGHT_NONE; },
                isAtLoc: function (loc: any, situation: any) {
                    if (typeof loc !== "string")
                        loc = loc.name;
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    if (!w[loc])
                        errormsg("Unknown location: " + loc);
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    return w[loc] && w[loc].room && situation === world.PARSER;
                },
            });
        }
        if (!(w as any).background.background) {
            errormsg("It looks like an item has been named 'background`, but is not set as the background item. If you intended to do this, ensure the background property is set to true.");
        }
        for (let key in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            world.initItem(w[key]);
        }
        this.isCreated = true;
        // Go through each command
        initCommands();
        // Set up the UI
        //endTurnUI();
        if ((settings as any).playMode === 'beta') {
            lang.betaTestIntro();
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msgHeading(settings.title, 2);
        if ((settings as any).subtitle)
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msgHeading((settings as any).subtitle, 3);
        (io as any).setTitleAndInit(settings.title);
        (game as any).ticker = setInterval((game as any).gameTimer, 1000);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[(game as any).player.loc].visited++;
    },
    // Every item or room should have this called for them.
    // That will be done at the start, but you need to do it yourself 
    // if creating items on the fly (but you should not be doing that anyway!).
    initItem: function (item: any) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if ((settings as any).playMode === 'dev' && item.loc && !w[item.loc]) {
            console.log("ERROR: The item `" + item.name + "` is in an unknown location (" + item.loc + ")");
        }
        if (item._setup)
            item._setup();
        if (item.setup)
            item.setup();
        for (let exit of lang.exit_list) {
            const ex = item[exit.name];
            if (ex) {
                ex.origin = item;
                ex.dir = exit.name;
                if (ex.alsoDir) {
                    for (let dir of ex.alsoDir) {
                        // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                        item[dir] = new Exit(ex.name, ex);
                        item[dir].scenery = true;
                    }
                }
            }
        }
        if ((settings as any).playMode === 'dev') {
            const dirs = lang.exit_list.filter(el => el.type !== 'nocmd').map(el => el.name);
            //console.log(dirs)
            for (let key in item) {
                if (dirs.includes(key)) {
                    // @ts-expect-error ts-migrate(2358) FIXME: The left-hand side of an 'instanceof' expression m... Remove this comment to see the full error message
                    if (!item[key] instanceof Exit)
                        console.log("ERROR: Exit " + key + " of " + item.name + " is not an Exit instance.");
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    if (item[key].name !== '_' && !w[item[key].name])
                        console.log("ERROR: Exit " + key + " of " + item.name + " goes to an unknown location (" + item[key].name + ").");
                }
                else {
                    if (item[key] instanceof Exit)
                        console.log("ERROR: Attribute " + key + " of " + item.name + " is an Exit instance and probably should not.");
                }
            }
        }
    },
    // Call after the player takes a turn, sending it a result, SUCCESS, SUCCESS_NO_TURNSCRIPTS or FAILED
    endTurn: function (result: any) {
        if (result === true)
            debugmsg("That command returned 'true', rather than the proper result code.");
        if (result === false)
            debugmsg("That command returned 'false', rather than the proper result code.");
        (util as any).handleChangeListeners();
        if (result === world.SUCCESS || (settings.failCountsAsTurn && result === world.FAILED)) {
            (game as any).turnCount++;
            (game as any).elapsedTime += settings.dateTime.secondsPerTurn;
            for (let key in w)
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                w[key].doEvent();
            (util as any).handleChangeListeners();
            world.resetPauses();
            (game as any).update();
            (game as any).saveGameState();
            endTurnUI(true);
        }
        else {
            endTurnUI(false);
        }
    },
    resetPauses: function () {
        for (let key in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[key].paused) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                delete w[key].paused;
            }
        }
    },
    // Returns true if bad lighting is not obscuring the item
    ifNotDark: function (item: any) {
        return (!(game as any).dark || item.lightSource() > world.LIGHT_NONE);
    },
    // scopeStatus is used to track what the player can see and reach; it is a lot faster than working 
    // it out each time, as this needs to be used several times every turn.
    scopeSnapshot: function () {
        // reset every object
        for (let key in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            delete w[key].scopeStatus;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            delete w[key].scopeStatusForRoom;
        }
        // start from the current room
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const room = w[(game as any).player.loc];
        if (room === undefined) {
            errormsg("Error in scopeSnapshot; the location assigned to the player does not exist.");
            console.log("Error in scopeSnapshot; the location assigned to the player does not exist ('" + (game as any).player.loc + "').");
            console.log("Is it possible the location is in a file not loaded? Loaded files are: " + settings.files);
            return;
        }
        room.scopeStatusForRoom = world.REACHABLE;
        // crawl up the room hierarchy to the topmost visible
        while (room.loc && room.canReachThrough()) {
            // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'room' because it is a constant.
            room = w[room.loc];
            room.scopeStatusForRoom = world.REACHABLE;
        }
        // room is now the top level applicable, so now work downwards from here (recursively)
        room.scopeSnapshot(false);
        // Also want to go further upwards if room is transparent
        while (room.loc && room.canSeeThrough()) {
            // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'room' because it is a constant.
            room = w[room.loc];
            room.scopeStatusForRoom = world.VISIBLE;
        }
        // room is now the top level applicable
        room.scopeSnapshot(true);
    },
    // Sets the current room to the one named
    //
    // Can also be used to move an NPC, but just gives a message and set "loc"
    // however, this does make it char-neutral.
    // Also calls onCarry, so rope works!
    // Suppress output (if done elsewhere) by sending false for dir
    // Force the move to happen even if the room name is the same by setting forced to true
    setRoom: function (char: any, roomName: any, dir: any, forced: any) {
        let room;
        if (typeof roomName === 'string') {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            room = w[roomName];
            if (room === undefined) {
                errormsg("Failed to find room: " + roomName + ".");
                return false;
            }
        }
        else {
            if (roomName.name === undefined) {
                errormsg("Not sure what to do with this room: " + roomName + " (a " + (typeof roomName) + ").");
                return false;
            }
            room = roomName;
            roomName = room.name;
        }
        if (dir) { // if dir is false, assume already done
            for (let el of char.onGoCheckList) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (!w[el].onGoCheck(char, roomName, dir))
                    return false;
            }
        }
        if (char !== (game as any).player) {
            if (dir) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(lang.stop_posture(char));
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(lang.go_successful, { char: char, dir: dir });
            }
            char.previousLoc = char.loc;
            char.loc = roomName;
            for (let el of char.onGoActionList) {
                console.log(el);
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (!w[el].onGoAction(char, roomName, dir))
                    return false;
            }
            return true;
        }
        if (!forced && (game as any).player.loc === roomName) {
            // Already here, do nothing
            return false;
        }
        if ((settings as any).clearScreenOnRoomEnter)
            clearScreen();
        (game as any).room.onExit();
        char.previousLoc = char.loc;
        char.loc = room.name;
        (game as any).update();
        world.setBackground();
        if (dir !== "suppress") {
            world.enterRoom();
        }
        for (let el of char.onGoActionList) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (!w[el].onGoAction(char, roomName, dir))
                return false;
        }
        return true;
    },
    // Runs the script and gives the description
    enterRoom: function () {
        if ((game as any).room.beforeEnter === undefined) {
            errormsg("This room, " + (game as any).room.name + ", has no 'beforeEnter` function defined.  This is probably because it is not actually a room (it was not created with 'createRoom' and has not got the DEFAULT_ROOM template), but it an item. It is not clear what state the game will continue in.");
            return;
        }
        (game as any).room.beforeEnter();
        if ((game as any).room.visited === 0) {
            (game as any).room.beforeFirstEnter();
        }
        world.enterRoomAfterScripts();
    },
    // Called when entering a new room, after beforeEnter and beforeFirstEnter re done
    enterRoomAfterScripts: function () {
        (game as any).room.description();
        for (let follower of (game as any).player.followers) {
            if (follower.loc !== (game as any).player.loc)
                follower.moveWithDescription((game as any).room.name);
        }
        (game as any).room.afterEnter();
        if ((game as any).room.visited === 0) {
            (game as any).room.afterFirstEnter();
        }
        for (let key in (game as any).room.afterEnterIf) {
            // if already done, skip
            if ((game as any).room.afterEnterIfFlags.split(" ").includes(key))
                continue;
            if ((game as any).room.afterEnterIf[key].test()) {
                (game as any).room.afterEnterIf[key].action();
                (game as any).room.afterEnterIfFlags += " " + key;
            }
        }
        (game as any).room.visited++;
    },
    // Call this when entering a new room
    // It will set the regex of the ubiquitous background object
    // to any objects highlighted in the room description.
    setBackground: function () {
        let md;
        if (typeof (game as any).room.desc === 'string') {
            if (!(game as any).room.backgroundNames) {
                (game as any).room.backgroundNames = [];
                while (md = world.BACK_REGEX.exec((game as any).room.desc)) { // yes it is an assignment!
                    let arr = md[0].substring(1, md[0].length - 1).split(":");
                    (game as any).room.desc = (game as any).room.desc.replace(md[0], arr[0]);
                    for (let el of arr)
                        (game as any).room.backgroundNames.push(el);
                }
            }
        }
        (w as any).background.regex = ((game as any).room.backgroundNames && (game as any).room.backgroundNames.length > 0) ? new RegExp((game as any).room.backgroundNames.join("|")) : false;
    },
    BACK_REGEX: /\[.+?\]/,
};
const game = createObject("game", [{
        verbosity: world.VERBOSE,
        spoken: false,
        turnCount: 0,
        elapsedTime: 0,
        elapsedRealTime: 0,
        startTime: settings.dateTime.start,
        gameState: [],
        name: 'built-in_game_object',
        isAtLoc: function () { return false; },
        initialise: function () {
            world.init();
            (game as any).update();
            (game as any).saveGameState();
            world.setBackground();
        },
        begin: function () {
            if (settings.startingDialogEnabled)
                return;
            if (typeof (settings as any).intro === "string") {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg((settings as any).intro);
            }
            else if ((settings as any).intro) {
                for (let el of (settings as any).intro)
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                    msg(el);
            }
            if (typeof (settings as any).setup === "function")
                (settings as any).setup();
            world.enterRoom();
        },
        // Updates the game world, specifically...
        // Sets game.player and game.room
        // Sets the scoping snapshot
        // Sets the light/dark
        update: function (player: any) {
            //debugmsg("update");
            if (player !== undefined) {
                (this as any).player = player;
            }
            if (!(this as any).player) {
                errormsg("No player object found. This will not go well...");
                return;
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (!(this as any).player.loc || !w[(this as any).player.loc]) {
                errormsg((this as any).player.loc === undefined ? "No player location set." : "Player location set to '" + (this as any).player.loc + "', which does not exist.");
                errormsg("If this is when you load a game: This is likely to be because of an error in one of the .js files. Press F12, and go to the 'Console' tab (if not already open), to see the error. Look at the very first error (but ignore any that mentions 'jquery'). It should tell you the file and line number that is causing the problem.");
                errormsg("If this is when player moves: This is likely to be because of an error in the exit being used.");
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            (this as any).room = w[(this as any).player.loc];
            world.scopeSnapshot();
            let light = world.LIGHT_NONE;
            for (let key in w) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (w[key].scopeStatus) {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    if (light < w[key].lightSource()) {
                        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                        light = w[key].lightSource();
                    }
                }
            }
            (this as any).dark = (light < world.LIGHT_MEAGRE);
            (this as any).dark = (light < world.LIGHT_MEAGRE);
            //endTurnUI();
            //io.updateUIItems();
        },
        // UNDO SUPPORT
        saveGameState: function () {
            if (settings.maxUndo > 0) {
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
                this.gameState.push(saveLoad.getSaveBody());
                if (this.gameState.length > settings.maxUndo)
                    this.gameState.shift();
            }
        },
        timerEvents: [],
        eventFunctions: {},
        registerEvent: function (eventName: any, func: any) {
            if (world.isCreated && !settings.saveDisabled) {
                errormsg("Attempting to use registerEvent after set up.");
                return;
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            this.eventFunctions[eventName] = func;
        },
        registerTimedEvent: function (eventName: any, triggerTime: any, interval: any) {
            if (world.isCreated && !settings.saveDisabled) {
                errormsg("Attempting to use registerTimedEvent after set up.");
                return;
            }
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
            this.timerEvents.push({ eventName: eventName, triggerTime: triggerTime + (game as any).elapsedRealTime, interval: interval });
        },
        gameTimer: function () {
            // Note that this gets added to window by setInterval, so 'this' does not refer to the game object
            (game as any).elapsedRealTime++;
            let somethingHappened = false;
            for (let el of (game as any).timerEvents) {
                if (el.triggerTime && el.triggerTime < (game as any).elapsedRealTime) {
                    if (typeof ((game as any).eventFunctions[el.eventName]) === 'function') {
                        const flag = (game as any).eventFunctions[el.eventName]();
                        if (el.interval && !flag) {
                            el.triggerTime += el.interval;
                        }
                        else {
                            delete el.triggerTime;
                        }
                        somethingHappened = true;
                    }
                    else {
                        errormsg("A timer is trying to call event '" + el.eventName + "' but no such function is registered.");
                        //console.log(game.eventFunctions);
                    }
                }
            }
            if (somethingHappened)
                (util as any).handleChangeListeners();
        },
        preSave: function () {
            const arr = [];
            for (let el of (game as any).timerEvents) {
                if (el.triggerTime) {
                    arr.push(el.eventName + "/" + el.triggerTime + "/" + (el.interval ? el.interval : '-'));
                }
            }
            (game as any).timeSaveAttribute = arr.join(" ");
        },
        postLoad: function () {
            (game as any).timerEvents = [];
            const arr = (game as any).timeSaveAttribute.split(' ');
            for (let el of arr) {
                const params = el.split('/');
                const interval = params[2] === '-' ? undefined : parseInt(params[2]);
                (game as any).timerEvents.push({ eventName: params[0], triggerTime: parseInt(params[1]), interval: interval });
            }
            (game as any).timeSaveAttribute = '';
        },
    }]);
function Exit(name: any, hash: any) {
    if (!hash)
        hash = {};
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.name = name;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.use = (util as any).defaultExitUse;
    // These two will not be saved!!! 
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.isLocked = function () { return this.locked; };
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.isHidden = function () { return this.hidden || (game as any).dark; };
    for (let key in hash) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this[key] = hash[key];
    }
}
