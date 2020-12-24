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
"use strict";
//@DOC
// ## Parser Functions
//
// Most of these are only for internal use!
//@UNDOC
const parser = {};
(parser as any).currentCommand;
// Stores the current values for it, him, etc.
// put hat in box
// x it
(parser as any).pronouns = {};
(parser as any).debug = false;
//@DOC
// The "parse" function should be sent either the text the player typed or null.
// If sent null it will continue to work with the current values in currentCommand.
// This allows us to keep trying to process a single command until all the
//  disambiguations have been resolved.
(parser as any).parse = function (inputText: any) {
    (parser as any).msg("Input string: " + inputText);
    // This allows the command system to be temporarily overriden,
    // say if the game asks a question
    if ((parser as any).override) {
        (parser as any).msg("Parser overriden");
        (parser as any).override(inputText);
        delete (parser as any).override;
        return;
    }
    if (inputText) {
        const res = (parser as any).convertInputTextToCommandCandidate(inputText);
        if (typeof res === "string") {
            parsermsg(res);
            world.endTurn(world.PARSER_FAILURE);
            return;
        }
        (parser as any).currentCommand = res;
    }
    // Need to disambiguate, until each of the lowest level lists has exactly one member
    let flag = false;
    for (let i = 0; i < (parser as any).currentCommand.objects.length; i++) {
        for (let j = 0; j < (parser as any).currentCommand.objects[i].length; j++) {
            if ((parser as any).currentCommand.objects[i][j] instanceof Array) {
                if ((parser as any).currentCommand.objects[i][j].length === 1) {
                    (parser as any).currentCommand.objects[i][j] = (parser as any).currentCommand.objects[i][j][0];
                }
                else {
                    flag = true;
                    (parser as any).currentCommand.disambiguate1 = i;
                    (parser as any).currentCommand.disambiguate2 = j;
                    showMenuWithNumbers(lang.disambig_msg, (parser as any).currentCommand.objects[i][j], function (result: any) {
                        (parser as any).currentCommand.objects[(parser as any).currentCommand.disambiguate1][(parser as any).currentCommand.disambiguate2] = result;
                        (parser as any).parse(null);
                    });
                }
            }
        }
    }
    if (!flag) {
        (parser as any).execute();
    }
};
//@DOC
// You can use this to bypass the parser altogether, for the next input the player types.
// Instead, the given function will be used, sent the text the player typed.
//
// Used by askQuestion in io.
(parser as any).overrideWith = function (fn: any) {
    (parser as any).override = fn;
};
//@DOC
// You can use this to bypass all the text matching when you know what the object and command are.
// Limited to commands with one object.
//
// Used by the panes when the player clicks on a verb for an item
(parser as any).quickCmd = function (cmd: any, item: any) {
    (parser as any).msg("quickCmd: " + cmd.name);
    if (item)
        (parser as any).msg("quickCmd: " + item.name);
    (parser as any).currentCommand = {
        cmdString: (item ? cmd.name + " " + item.name : cmd.name),
        cmd: cmd,
        objects: (item ? [[item]] : []),
        matches: (item ? [[item.alias]] : []),
    };
    (parser as any).execute();
};
// Do it!
(parser as any).execute = function () {
    (parser as any).inspect();
    let inEndTurnFlag = false;
    try {
        if ((parser as any).currentCommand.objects.length > 0 && typeof (parser as any).currentCommand.objects[0] === "object") {
            for (let obj of (parser as any).currentCommand.objects[0]) {
                (parser as any).pronouns[obj.pronouns.objective] = obj;
            }
        }
        const outcome = (parser as any).currentCommand.cmd.script((parser as any).currentCommand.objects, (parser as any).currentCommand.matches);
        inEndTurnFlag = true;
        world.endTurn(outcome);
    }
    catch (err) {
        if (inEndTurnFlag) {
            console.error("Hit a coding error trying to process world.endTurn after that command.");
        }
        else {
            console.error("Hit a coding error trying to process the command `" + (parser as any).currentCommand.cmdString + "'.");
        }
        console.log('Look through the trace below to find the offending code. It is probably the first entry in the list, but may not be.');
        console.log(err);
        (io as any).print({ tag: 'p', cssClass: "error", text: lang.error });
    }
};
// This will return a dictionary, with these keys:
// .inputString    the initial string
// .cmdString      the sanitised string
// .cmd            the matched command object
// .objects        a list (of a list of a list), one member per capture group in the command regex
// .objects[0]     a list (of a list), one member per object name given by the player for capture group 0
// .objects[0][0]  a list of possible object matches for each object name given by the player for the
//                      first object name in capture group 0
(parser as any).convertInputTextToCommandCandidate = function (inputText: any) {
    //let s = inputText.toLowerCase().split(' ').filter(function(el) { return !IGnored_words.includes(el); }).join(' ');
    // remove multiple spaces, and any from the ends
    let cmdString = inputText.toLowerCase().trim().replace(/\s+/g, ' ');
    // convert numbers in weords to digits
    if (settings.convertNumbersInParser) {
        cmdString = lang.convertNumbers(cmdString);
    }
    // Get a list of candidate commands that match the regex
    const candidates = commands.filter(function (el) {
        if (!Array.isArray(el.regexes))
            console.log(el); // it will crash in the next line!
        for (let regex of el.regexes) {
            if (regex.test(cmdString))
                return true;
        }
    });
    if (candidates.length === 0) {
        return lang.not_known_msg;
    }
    (parser as any).msg("Number of commands that have a regex match:" + candidates.length);
    // We now want to match potential objects
    // This will help us narrow down the candidates (maybe)
    // matchedCandidates is an array of dictionaries,
    // each one containing a command and some matched objects if applicable
    let error = lang.general_obj_error;
    const matchedCandidates: any = [];
    candidates.forEach(function (el) {
        // matchItemsToCmd will attempt to fit the objects, returns a dictionary if successful
        // or an error message otherwise. Could have more than one object,
        // either because multiple were specified or because it was ambiguous (or both)
        // We just keep the last error message as hopefully the most relevant.
        // NB: Inside function so cannot use 'this'
        (parser as any).msg("* Looking at candidate: " + el.name);
        const res = (parser as any).matchItemsToCmd(cmdString, el);
        if (!res) {
            (parser as any).msg("No result!");
            error = "Res is " + res;
        }
        (parser as any).msg("Result score is: " + res.score);
        if (res.score === -1) {
            error = res.error;
        }
        else {
            (parser as any).msg("Candidate accepted!");
            matchedCandidates.push(res);
        }
    });
    (parser as any).msg("Number of candidates accepted: " + matchedCandidates.length);
    if (matchedCandidates.length === 0) {
        (parser as any).msg("No matches, returning error: " + error);
        return error;
    }
    // pick between matchedCandidates based on score
    let command = matchedCandidates[0];
    if (matchedCandidates.length > 1) {
        (parser as any).msg("Need to pick just one; start with the first (score " + command.score + ").");
        for (let candidate of matchedCandidates) {
            // give preference to earlier commands
            if (command.score < candidate.score) {
                (parser as any).msg("This one is better:" + command.cmd.name + " (score " + candidate.score + ")");
                command = candidate;
            }
        }
    }
    if (!command)
        console.log(inputText);
    command.string = inputText;
    command.cmdString = cmdString;
    (parser as any).msg("This is the one:" + command.cmd.name);
    return command;
};
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
(parser as any).matchItemsToCmd = function (s: any, cmd: any) {
    const res = { cmd: cmd, objectTexts: [], objects: [], matches: [] };
    (res as any).score = cmd.score ? cmd.score : 0;
    const arr = cmd.regexes.find((el: any) => el.test(s)).exec(s);
    //for (let regex of el.regexes) {
    //  if (regex.test(cmdString)) arr = regex.exec(s)
    //}
    const fallbackScope = (parser as any).scope((parser as any).isVisible);
    arr.shift(); // first element is the whole match, so discard
    (parser as any).msg("..Base score: " + (res as any).score);
    for (let i = 0; i < arr.length; i++) {
        if (!cmd.objects[i]) {
            errormsg("That command seems to have an error. It has more capture groups than there are elements in the 'objects' attribute.");
            return false;
        }
        if (cmd.objects[i].ignore) {
            // this capture group has been flagged to be ignored
            continue;
        }
        let objectNames, score = 0;
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
        res.objectTexts.push(arr[i]);
        if (cmd.objects[i].text) {
            // this capture group has been flagged to be text
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
            res.objects.push(arr[i]);
            score = 1;
        }
        else if (lang.all_regex.test(arr[i]) || lang.all_exclude_regex.test(arr[i])) {
            // Handle ALL and ALL BUT
            if (!cmd.objects[i].scope)
                console.log("WARNING: Command without scope - " + cmd.name);
            let list = cmd.objects[i].scope ? (parser as any).scope(cmd.objects[i].scope) : fallbackScope;
            let exclude = [(game as any).player];
            // anything flagged as scenery should be excluded
            for (let item of list) {
                if (item.scenery || item.excludeFromAll) {
                    exclude.push(item);
                }
            }
            if (lang.all_exclude_regex.test(arr[i])) {
                // if this is ALL BUT we need to remove some things from the list
                // excludes must be in isVisible
                // if it is ambiguous or not recognised it does not get added to the list
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'all_exclude_regex'.
                let s = arr[i].replace(all_exclude_regex, "").trim();
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'joiner_regex'.
                objectNames = s.split(joiner_regex).map(function (el: any) { return el.trim(); });
                for (let s in objectNames) {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'items'.
                    items = (parser as any).findInList(s, fallbackScope);
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'items'.
                    if (items.length === 1) {
                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'items'.
                        exclude.push(items[0]);
                    }
                }
            }
            list = list.filter(function (el: any) { return !exclude.includes(el); });
            if (list.length > 1 && !cmd.objects[i].multiple) {
                (res as any).error = lang.no_multiples_msg;
                (res as any).score = -1;
                return res;
            }
            if (list.length === 0) {
                (res as any).error = cmd.nothingForAll ? cmd.nothingForAll : lang.nothing_msg;
                (res as any).score = -1;
                return res;
            }
            score = 2;
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
            res.objects.push(list.map(function (el: any) { return [el]; }));
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
            res.matches.push(arr[i]);
            (res as any).all = true;
        }
        else {
            objectNames = arr[i].split(lang.joiner_regex).map(function (el: any) { return el.trim(); });
            if (objectNames.length > 1 && !cmd.objects[i].multiple) {
                (res as any).error = lang.no_multiples_msg;
                (res as any).score = -1;
                return res;
            }
            if (!cmd.objects[i].scope)
                console.log("WARNING: No scope (or scope not found) in command " + cmd.name);
            let scopes = cmd.objects[i].scope ? [(parser as any).scope(cmd.objects[i].scope), fallbackScope] : [fallbackScope];
            //console.log(scopes)
            let objs = [], matches = [];
            let objs2, n;
            for (let s of objectNames) {
                const objNameMatch = lang.article_filter_regex.exec(s);
                if (objNameMatch === null) {
                    errormsg("Failed to match to article_filter_regex with '" + s + "', - probably an error in article_filter_regex!");
                    return null;
                }
                [objs2, n] = (this as any).findInScope(objNameMatch[1], scopes, cmd.objects[i]);
                if (n === 0) {
                    (res as any).error = cmd.noobjecterror(s);
                    (res as any).score = -1;
                    return res;
                }
                else {
                    if (n > score) {
                        score = n;
                    }
                    objs.push(objs2);
                    matches.push(s);
                }
            }
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any[]' is not assignable to para... Remove this comment to see the full error message
            res.objects.push(objs);
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any[]' is not assignable to para... Remove this comment to see the full error message
            res.matches.push(matches);
        }
        (parser as any).msg("...Adding to the score: " + score);
        (res as any).score += score;
    }
    return res;
};
// Tries to match objects to the given string
// It will return a list of matching objects (to be disambiguated if more than 1),
// plus the score, depending on which list the object(s) was found in
// (if there are three lists, the score will be 3 if found in the first list, 2 in the second,
// or 1 if in the third list).
// If not found the score will be 0, and an empty array returned.
(parser as any).findInScope = function (s: any, listOfLists: any, cmdParams: any) {
    (parser as any).msg("Now matching: " + s);
    // First handle IT etc.
    for (let key in lang.pronouns) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (s === lang.pronouns[key].objective && (parser as any).pronouns[lang.pronouns[key].objective]) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return [(parser as any).pronouns[lang.pronouns[key].objective], 1];
        }
    }
    for (let i = 0; i < listOfLists.length; i++) {
        (parser as any).msg("..Looking for a match for: " + s + " (scope " + (i + 1) + ")");
        let objs = (this as any).findInList(s, listOfLists[i], cmdParams);
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
(parser as any).findInList = function (s: any, list: any, cmdParams: any) {
    let res = [];
    let score = 0;
    let n;
    for (let item of list) {
        (parser as any).msg("-> Considering: " + item.name);
        n = (this as any).scoreObjectMatch(s, item, cmdParams);
        if (n >= 0)
            (parser as any).msg(item.name + " scores " + n);
        if (n > score) {
            res = [];
            score = n;
        }
        if (n >= score) {
            res.push(item);
        }
    }
    (parser as any).msg(res.length > 1 ? "Cannot decide between: " + res.map(el => el.name).join(", ") : (res.length === 1 ? "..Going with: " + res[0].name : "Found no suitable objects"));
    return res;
};
(parser as any).scoreObjectMatch = function (s: any, item: any, cmdParams: any) {
    if (!item.parserOptionsSet) {
        // Do we need to do this when the saved game is reloaded???
        item.parserOptionsSet = true;
        item.parserItemName = item.alias.toLowerCase();
        item.parserItemNameParts = item.parserItemName.split(' ');
        if (item.pattern) {
            if (!item.regex)
                item.regex = new RegExp("^(" + item.pattern + ")$");
            if (!item.parserAltNames)
                item.parserAltNames = item.pattern.split('|');
        }
        if (item.parserAltNames) {
            item.parserAltNames.forEach(function (el: any) {
                if (el.includes(' ')) {
                    item.parserItemNameParts = item.parserItemNameParts.concat(el.split(' '));
                }
            });
        }
    }
    const itemName = item.alias.toLowerCase();
    let res = -1;
    if (cmdParams.items && cmdParams.items.includes(item.name)) {
        // does this pay any attention to what the player typed????
        (parser as any).msg('The command specifically mentions this item, so highest priority, score 100');
        res = 100;
    }
    else if (s === item.parserItemName) {
        (parser as any).msg('The player has used the exact alias, score 60');
        res = 60;
    }
    else if (item.regex && item.regex.test(s)) {
        (parser as any).msg('The player has used the exact string allowed in the regex, score 60');
        (parser as any).msg('' + item.regex);
        (parser as any).msg('>' + s + '<');
        res = 55;
    }
    else if (item.parserItemNameParts && item.parserItemNameParts.some(function (el: any) { return el === s; })) {
        (parser as any).msg('The player has matched a complete word, but not the full phrase, score 50');
        res = 50;
    }
    else if (item.parserItemName.startsWith(s)) {
        (parser as any).msg('the player has used a string that matches the start of the alias, score length + 15');
        res = s.length + 15;
    }
    else if (item.parserAltNames && item.parserAltNames.some(function (el: any) { return el.startsWith(s); })) {
        (parser as any).msg('the player has used a string that matches the start of an alt name, score length + 10');
        res = s.length + 10;
    }
    else if (item.parserItemNameParts && item.parserItemNameParts.some(function (el: any) { return el.startsWith(s); })) {
        (parser as any).msg('the player has used a string that matches the start of an alt name, score length');
        res = s.length;
    }
    else {
        return -1;
    }
    if (item[cmdParams.attName]) {
        (parser as any).msg('bonus 20 as item has attribute ' + cmdParams.attName);
        res += 20;
    }
    if (item.parsePriority) {
        (parser as any).msg('item.parsePriority is ' + item.parsePriority);
        res += item.parsePriority;
    }
    // note what we matched against in case a command wants to use it later
    // This is a little risky as at this point it is only a suggestion,
    // but I cannot think of a situation where it would fail.
    // Used by COUNTABLE
    item.cmdMatch = s;
    return res;
};
// For debugging only
// Prints details about the parser.currentCommand so you can
// see what the parser has made of the player's input
(parser as any).inspect = function () {
    if (!(parser as any).debug)
        return;
    let s = "PARSER RESULT:<br/>";
    s += "Input text: " + (parser as any).currentCommand.string + "<br/>";
    s += "Matched command: " + (parser as any).currentCommand.cmd.name + "<br/>";
    s += "Matched regex: " + (parser as any).currentCommand.cmd.regex + "<br/>";
    s += "Match score: " + (parser as any).currentCommand.score + "<br/>";
    if ((parser as any).currentCommand.all) {
        s += "Player typed ALL<br/>";
    }
    s += "Objects/texts (" + (parser as any).currentCommand.objects.length + "):" + "<br/>";
    for (let obj of (parser as any).currentCommand.objects) {
        if (typeof obj === "string") {
            s += "&nbsp;&nbsp;&nbsp;&nbsp;Text: " + obj + "<br/>";
        }
        else {
            s += "&nbsp;&nbsp;&nbsp;&nbsp;Objects:" + obj.map(function (el: any) { return el.name; }).join(", ") + "<br/>";
        }
    }
    debugmsg(s);
};
// @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'ary' implicitly has an 'any[]' typ... Remove this comment to see the full error message
(parser as any).msg = function (...ary) {
    if ((parser as any).debug) {
        for (let s of ary)
            debugmsg("PARSER&gt; " + s);
    }
};
(parser as any).scope = function (fn: any, options: any) {
    const list = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (fn(w[key], options)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            list.push(w[key]);
        }
    }
    return list;
};
// This set is used in the objects attribute of commands
// The "is" functions are for looking at a specific place
// Anywhere in the world
(parser as any).isInWorld = function (item: any) {
    return true;
};
// Anywhere in the world
(parser as any).isReachable = function (item: any) {
    return item.scopeStatus === world.REACHABLE && world.ifNotDark(item);
};
// Anywhere in the location (used by the parser for the fallback)
(parser as any).isVisible = function (item: any) {
    return item.scopeStatus && world.ifNotDark(item);
};
// Held or here, but not in a container
(parser as any).isPresent = function (item: any) {
    return (parser as any).isHere(item) || (parser as any).isHeld(item);
};
// Used by examine, so the player can X ME, even if something called metalhead is here.
(parser as any).isPresentOrMe = function (item: any) {
    return (parser as any).isHere(item) || (parser as any).isHeld(item) || item === (game as any).player;
};
// ... but not in a container
(parser as any).isHeldNotWorn = function (item: any) {
    return item.isAtLoc((game as any).player.name, world.PARSER) && world.ifNotDark(item) && !item.getWorn();
};
(parser as any).isHeld = function (item: any) {
    return item.isAtLoc((game as any).player.name, world.PARSER) && world.ifNotDark(item);
};
(parser as any).isHeldByNpc = function (item: any) {
    const npcs = (parser as any).scope((parser as any).isReachable).filter((el: any) => el.npc);
    for (let npc of npcs) {
        if (item.isAtLoc(npc.name, world.PARSER))
            return true;
    }
    return false;
};
(parser as any).isWorn = function (item: any) {
    return item.isAtLoc((game as any).player.name, world.PARSER) && world.ifNotDark(item) && item.getWorn();
};
(parser as any).isWornByNpc = function (item: any) {
    const npcs = (parser as any).scope((parser as any).isReachable).filter((el: any) => el.npc);
    for (let npc of npcs) {
        if (item.isAtLoc(npc.name, world.PARSER) && item.getWorn())
            return true;
    }
    return false;
};
(parser as any).isNpcOrHere = function (item: any) {
    return (item.isAtLoc((game as any).player.loc, world.PARSER) && world.ifNotDark(item)) || item.npc || item.player;
};
(parser as any).isNpcAndHere = function (item: any) {
    return item.isAtLoc((game as any).player.loc, world.PARSER) && (item.npc || item.player);
};
(parser as any).isHere = function (item: any) {
    return item.isAtLoc((game as any).player.loc, world.PARSER) && world.ifNotDark(item);
};
(parser as any).isForSale = function (item: any) {
    return item.isForSale && item.isForSale((game as any).player.loc) && world.ifNotDark(item);
};
//parser.isInside = function(item, options) {
//  return item.isAtLoc(options.container.name, world.PARSER) && world.ifNotDark(item);
//}
//parser.isRoom = function(item) {
//  return item.room;
//}
(parser as any).isContained = function (item: any) {
    const containers = (parser as any).scope((parser as any).isReachable).filter((el: any) => el.container);
    for (let container of containers) {
        if (container.closed)
            continue;
        if (item.isAtLoc(container.name, world.PARSER))
            return true;
    }
    return false;
};
(parser as any).isHereOrContained = function (item: any) {
    if ((parser as any).isHere(item))
        return true;
    if ((parser as any).isContained(item))
        return true;
    return false;
};
(parser as any).isLiquid = function (item: any, options: any) {
    return item.liquid;
};
