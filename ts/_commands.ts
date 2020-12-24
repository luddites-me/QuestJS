// A command has an arbitrary name, a regex or pattern, 
// and a script as a minimum.
// regex           A regex to match against
// objects         An array of matches in the regex (see wiki)
// script          This will be run on a successful match
// attName         If there is no script, then this attribute on the object will be used
// nothingForAll   If the player uses ALL and there is nothing there, use this error message
// noobjecterror   If the player specifies an object
// noTurnscripts   Set to true to prevent turnscripts firing even when this command is successful
"use strict";
const cmdDirections = [];
for (let exit of lang.exit_list) {
    if (exit.type === 'nocmd')
        continue;
    cmdDirections.push(exit.name);
    cmdDirections.push(exit.abbrev.toLowerCase());
    if (exit.alt)
        cmdDirections.push(exit.alt);
}
const commands = [
    // ----------------------------------
    // Single word commands
    // Cannot just set the script to helpScript as we need to allow the
    // author to change it in code.js, which is loaded after this.
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaHelp', {
        script: lang.helpScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaHint', {
        script: lang.hintScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaCredits', {
        script: lang.aboutScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaDarkMode', {
        script: (io as any).toggleDarkMode,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaSilent', {
        script: function () {
            if (settings.silent) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.mode_silent_off);
                settings.silent = false;
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.mode_silent_on);
                settings.silent = true;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
                ambient();
            }
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaWarnings', {
        script: lang.warningsScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaSpoken', {
        script: function () {
            if (io.spoken) {
                io.spoken = false;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.spoken_off);
            }
            else {
                io.spoken = true;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.spoken_on);
            }
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaIntro', {
        script: function () {
            io.spoken = true;
            if (typeof (settings as any).intro === "string") {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg((settings as any).intro);
            }
            else {
                for (let el of (settings as any).intro)
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                    msg(el);
            }
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaBrief', {
        script: function () {
            (game as any).verbosity = world.BRIEF;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(lang.mode_brief);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTerse', {
        script: function () {
            (game as any).verbosity = world.TERSE;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(lang.mode_terse);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaVerbose', {
        script: function () {
            (game as any).verbosity = world.VERBOSE;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(llang.mode_verbose);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTranscript', {
        script: lang.transcriptScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTranscriptOn', {
        script: function () {
            if (io.transcript) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.transcript_already_on);
                return world.FAILED;
            }
            io.scriptStart();
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTranscriptOff', {
        script: function () {
            if (!io.transcript) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.transcript_already_off);
                return world.FAILED;
            }
            io.scriptEnd();
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTranscriptClear', {
        script: function () {
            io.scriptClear();
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTranscriptShow', {
        script: function () {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
            io.scriptShow();
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTranscriptShowWithOptions', {
        script: function (arr: any) {
            io.scriptShow(arr[0]);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaTranscriptToWalkthrough', {
        script: function () {
            io.scriptShow('w');
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaPlayerComment', {
        script: function (arr: any) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg("Comment: " + arr[0]);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { text: true },
        ]
    }),
    // ----------------------------------
    // File system commands
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaSave', {
        script: lang.saveLoadScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaSaveGame', {
        script: function (arr: any) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            saveLoad.saveGame(arr[0]);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaLoad', {
        script: lang.saveLoadScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaLoadGame', {
        script: function (arr: any) {
            saveLoad.loadGame(arr[0]);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaDir', {
        script: function () {
            saveLoad.dirGame();
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaDeleteGame', {
        script: function (arr: any) {
            saveLoad.deleteGame(arr[0]);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaUndo', {
        script: function () {
            if (settings.maxUndo === 0) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.undo_disabled);
                return world.FAILED;
            }
            if ((game as any).gameState.length < 2) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(lang.undo_not_available);
                return world.FAILED;
            }
            (game as any).gameState.pop();
            const gameState = (game as any).gameState[(game as any).gameState.length - 1];
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(lang.undo_done);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            saveLoad.loadTheWorld(gameState);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            w[(game as any).player.loc].description();
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaAgain', {
        script: function () {
            return (io as any).againOrOops(true);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaOops', {
        script: function () {
            return (io as any).againOrOops(false);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaRestart', {
        script: function () {
            askQuestion(lang.restart_are_you_sure, function (result: any) {
                if (result.match(lang.yes_regex)) {
                    location.reload();
                }
                else {
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                    metamsg(lang.restart_no);
                }
            });
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaPronouns', {
        script: function () {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg('See the developer console (F12) for the current pronouns');
            console.log((parser as any).pronouns);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('MetaScore', {
        script: function () {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(lang.scores_not_implemented);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Look', {
        script: function () {
            (game as any).room.description();
            return settings.lookCountsAsTurn ? world.SUCCESS : world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Exits', {
        script: function () {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(lang.can_go);
            return settings.lookCountsAsTurn ? world.SUCCESS : world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Wait', {
        script: function () {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(lang.wait_msg);
            return world.SUCCESS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('TopicsNote', {
        script: lang.topicsScript,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Inv', {
        script: function () {
            const listOfOjects = (game as any).player.getContents(world.INVENTORY);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(lang.inventory_prefix + " " + formatList(listOfOjects, { article: INDEFINITE, lastJoiner: lang.list_and, modified: true, nothing: lang.list_nothing, loc: (game as any).player.name }) + ".");
            return settings.lookCountsAsTurn ? world.SUCCESS : world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Map', {
        script: function () {
            if (typeof showMap !== 'undefined') {
                showMap();
                return settings.lookCountsAsTurn ? world.SUCCESS : world.SUCCESS_NO_TURNSCRIPTS;
            }
            else {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                const zone = w[(game as any).player.loc];
                if (!zone.zone) {
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                    return failedmsg(lang.no_map);
                }
                else {
                    const flag = zone.drawMap();
                    if (!flag)
                        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                        return failedmsg(lang.no_map);
                    return world.SUCCESS_NO_TURNSCRIPTS;
                }
            }
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Smell', {
        script: function () {
            if ((game as any).room.onSmell) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
                printOrRun((game as any).player, (game as any).room, "onSmell");
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(lang.no_smell, { char: (game as any).player });
            }
            return world.SUCCESS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Listen', {
        script: function () {
            if ((game as any).room.onListen) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
                printOrRun((game as any).player, (game as any).room, "onListen");
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(lang.no_listen, { char: (game as any).player });
            }
            return world.SUCCESS;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('PurchaseFromList', {
        script: function () {
            const l = [];
            for (let key in w) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if ((parser as any).isForSale(w[key])) {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    const price = w[key].getBuyingPrice((game as any).player);
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    const row = [sentenceCase(w[key].getName()), (world as any).Money(price)];
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    row.push(price > (game as any).player.money ? "-" : "{cmd:buy " + w[key].alias + ":" + buy + "}");
                    l.push(row);
                }
            }
            if (l.length === 0) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                return failedmsg(lang.nothing_for_sale);
            }
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(current_money + ": " + (world as any).Money((game as any).player.money));
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msgTable(l, buy_headings);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }),
    // ----------------------------------
    // Verb-object commands
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Examine', {
        npcCmd: true,
        objects: [
            { scope: (parser as any).isPresent, multiple: true }
        ],
        defmsg: lang.default_examine,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('LookAt', {
        npcCmd: true,
        attName: 'examine',
        objects: [
            { scope: (parser as any).isPresentOrMe }
        ],
        defmsg: lang.default_examine,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('LookOut', {
        npcCmd: true,
        rules: [(cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent }
        ],
        attName: "lookout",
        defmsg: lang.cannot_look_out,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('LookBehind', {
        npcCmd: true,
        rules: [(cmdRules as any).isHere],
        attName: "lookbehind",
        objects: [
            { scope: (parser as any).isPresent }
        ],
        defmsg: lang.nothing_there,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('LookUnder', {
        npcCmd: true,
        rules: [(cmdRules as any).isHere],
        attName: "lookunder",
        objects: [
            { scope: (parser as any).isPresent }
        ],
        defmsg: lang.nothing_there,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('LookInside', {
        npcCmd: true,
        rules: [(cmdRules as any).isHere],
        attName: "lookinside",
        objects: [
            { scope: (parser as any).isPresent }
        ],
        defmsg: lang.nothing_inside,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Search', {
        npcCmd: true,
        rules: [(cmdRules as any).isHere],
        attName: "search",
        objects: [
            { scope: (parser as any).isPresent }
        ],
        defmsg: lang.nothing_there,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Take', {
        npcCmd: true,
        rules: [(cmdRules as any).isHereNotHeldAlready, (cmdRules as any).canManipulate],
        objects: [
            { scope: (parser as any).isHereOrContained, multiple: true },
        ],
        defmsg: lang.cannot_take,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Drop', {
        npcCmd: true,
        rules: [(cmdRules as any).isHeldNotWorn, (cmdRules as any).canManipulate],
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: function (char: any, item: any) {
            if (item.isAtLoc(char))
                return lang.cannot_drop;
            return lang.not_carrying;
        }
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Wear2', {
        npcCmd: true,
        rules: [(cmdRules as any).isHeldNotWorn, (cmdRules as any).isHeld, (cmdRules as any).canManipulate],
        attName: "wear",
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: function (char: any, item: any) {
            return item.ensemble ? lang.cannot_wear_ensemble : lang.cannot_wear;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Wear', {
        npcCmd: true,
        rules: [(cmdRules as any).isHeldNotWorn, (cmdRules as any).canManipulate],
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: function (char: any, item: any) {
            return item.ensemble ? lang.cannot_wear_ensemble : lang.cannot_wear;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Remove', {
        npcCmd: true,
        rules: [(cmdRules as any).isWorn, (cmdRules as any).canManipulate],
        objects: [
            { scope: (parser as any).isWorn, multiple: true },
        ],
        defmsg: function (char: any, item: any) {
            return item.ensemble ? lang.cannot_wear_ensemble : lang.not_wearing;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Remove2', {
        npcCmd: true,
        rules: [(cmdRules as any).isWorn, (cmdRules as any).canManipulate],
        attName: "remove",
        objects: [
            { scope: (parser as any).isWorn, multiple: true },
        ],
        defmsg: function (char: any, item: any) {
            return item.ensemble ? lang.cannot_wear_ensemble : lang.not_wearing;
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Read', {
        npcCmd: true,
        rules: [(cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: lang.cannot_read,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Eat', {
        npcCmd: true,
        rules: [(cmdRules as any).isHeldNotWorn, (cmdRules as any).canManipulate],
        objects: [
            { scope: (parser as any).isHeld, multiple: true, attName: "ingest" },
        ],
        defmsg: lang.cannot_eat,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Purchase', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate],
        objects: [
            { scope: (parser as any).isForSale },
        ],
        defmsg: lang.cannot_purchase_here,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Sell', {
        npcCmd: true,
        rules: [(cmdRules as any).isHeldNotWorn, (cmdRules as any).canManipulate],
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: lang.cannot_sell_here,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Smash', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: lang.cannot_smash,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('SwitchOn', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        attName: "switchon",
        cmdCategory: "SwitchOn",
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: lang.cannot_switch_on,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('SwitchOn2', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        attName: "switchon",
        cmdCategory: "SwitchOn",
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
        ],
        defmsg: lang.cannot_switch_on,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('SwitchOff2', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        attName: "switchoff",
        cmdCategory: "SwitchOff",
        objects: [
            { scope: (parser as any).isHeld, multiple: true, attName: "switchon" },
        ],
        defmsg: lang.cannot_switch_off,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('SwitchOff', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        attName: "switchoff",
        cmdCategory: "SwitchOff",
        objects: [
            { scope: (parser as any).isHeld, multiple: true, attName: "switchoff" },
        ],
        defmsg: lang.cannot_switch_off,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Open', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent, multiple: true, attName: "open" },
        ],
        defmsg: lang.cannot_open,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Close', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent, multiple: true, attName: "close" },
        ],
        defmsg: lang.cannot_close,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Lock', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent, multiple: true, attName: "lock" },
        ],
        defmsg: lang.cannot_lock,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Unlock', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent, multiple: true, attName: "unlock" },
        ],
        defmsg: lang.cannot_unlock,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Push', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent },
        ],
        defmsg: lang.nothing_useful,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Pull', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent },
        ],
        defmsg: lang.nothing_useful,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Fill', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { scope: (parser as any).isPresent },
        ],
        defmsg: (lang as any).cannot_fill,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Empty', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { scope: (parser as any).isPresent },
        ],
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'cannot_empty' does not exist on type '{ ... Remove this comment to see the full error message
        defmsg: lang.cannot_empty,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('SmellItem', {
        npcCmd: true,
        attName: "smell",
        objects: [
            { scope: (parser as any).isPresent, attName: "smell" },
        ],
        defmsg: lang.cannot_smell,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('ListenToItem', {
        npcCmd: true,
        attName: "listen",
        objects: [
            { scope: (parser as any).isPresent, attName: "listen" },
        ],
        defmsg: lang.cannot_listen,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Eat', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { text: true },
            { scope: (parser as any).isPresent, attName: "ingest" },
        ],
        defmsg: lang.cannot_eat,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Drink', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { text: true },
            { scope: (parser as any).isPresent, attName: "ingest" },
        ],
        defmsg: lang.cannot_drink,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Ingest', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { text: true },
            { scope: (parser as any).isPresent, attName: "ingest" },
        ],
        defmsg: (lang as any).cannot_ingest,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('SitOn', {
        npcCmd: true,
        cmdCategory: "Posture",
        rules: [(cmdRules as any).canPosture, (cmdRules as any).isHereNotHeld],
        attName: "siton",
        objects: [
            { scope: (parser as any).isHere, attName: "assumePosture" },
        ],
        defmsg: lang.cannot_sit_on,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('StandOn', {
        npcCmd: true,
        cmdCategory: "Posture",
        rules: [(cmdRules as any).canPosture, (cmdRules as any).isHereNotHeld],
        attName: "standon",
        objects: [
            { scope: (parser as any).isHere, attName: "assumePosture" },
        ],
        defmsg: lang.cannot_stand_on,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('ReclineOn', {
        npcCmd: true,
        cmdCategory: "Posture",
        rules: [(cmdRules as any).canPosture, (cmdRules as any).isHereNotHeld],
        attName: "reclineon",
        objects: [
            { scope: (parser as any).isHere, attName: "assumePosture" },
        ],
        defmsg: lang.cannot_recline_on,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('GetOff', {
        npcCmd: true,
        cmdCategory: "Posture",
        score: 5,
        rules: [(cmdRules as any).canPosture, (cmdRules as any).isHereNotHeld],
        attName: "getoff",
        // @ts-expect-error ts-migrate(1117) FIXME: An object literal cannot have multiple properties ... Remove this comment to see the full error message
        cmdCategory: "Posture",
        objects: [
            { scope: (parser as any).isHere, attName: "assumePosture" },
        ],
        defmsg: lang.already,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Use', {
        npcCmd: true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent },
        ],
        script: function (objects: any, matches: any) {
            const obj = objects[0][0];
            if (obj.use) {
                const result = this.processCommand((game as any).player, obj, false, matches[0][0]);
                return result ? world.SUCCESS : world.FAILED;
            }
            if (obj.useDefaultsTo) {
                const cmd = findCmd(obj.useDefaultsTo());
                if (cmd) {
                    const result = cmd.processCommand((game as any).player, obj, false, matches[0][0]);
                    return result ? world.SUCCESS : world.FAILED;
                }
                else {
                    throw new Error("USE command defaulting to unknown command " + obj.useDefaultsTo);
                }
            }
            this.default(obj, false, (game as any).player);
            return world.FAILED;
        },
        defmsg: lang.cannot_use,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('TalkTo', {
        rules: [(cmdRules as any).canTalkTo],
        attName: "talkto",
        objects: [
            { scope: (parser as any).isNpcAndHere },
        ],
        default: function (item: any) {
            return failedmsg(lang.cannot_talk_to, { char: (game as any).player, item: item });
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Topics', {
        attName: "topics",
        objects: [
            { scope: (parser as any).isNpcAndHere },
        ],
        default: function (item: any) {
            return failedmsg(lang.no_topics, { char: (game as any).player, item: item });
        },
    }),
    // ----------------------------------
    // Complex commands
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Say', {
        script: function (arr: any) {
            const l = [];
            for (let key in w) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (w[key].sayCanHear && w[key].sayCanHear((game as any).player, arr[0]))
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    l.push(w[key]);
            }
            l.sort(function (a, b) { return (b.sayPriority + b.sayBonus) - (a.sayPriority + b.sayBonus); });
            if (l.length === 0) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(lang.say_no_one_here((game as any).player, arr[0], arr[1]));
                return world.SUCCESS;
            }
            if (settings.givePlayerSayMsg)
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(lang.nounVerb((game as any).player, arr[0], true) + ", '" + sentenceCase(arr[1]) + ".'");
            for (let chr of l) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (chr.sayQuestion && w[chr.sayQuestion].sayResponse(chr, arr[1]))
                    return world.SUCCESS;
                if (chr.sayResponse && chr.sayResponse(arr[1], arr[0]))
                    return world.SUCCESS;
            }
            if (settings.givePlayerSayMsg) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(lang.say_no_response((game as any).player, arr[0], arr[1]));
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(lang.say_no_response_full((game as any).player, arr[0], arr[1]));
            }
            return world.SUCCESS;
        },
        objects: [
            { text: true },
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Stand', {
        rules: [(cmdRules as any).canPosture],
        script: handleStandUp,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcStand', {
        rules: [(cmdRules as any).canPosture],
        cmdCategory: "Posture",
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
        ],
        script: handleStandUp,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('FillWith', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { scope: (parser as any).isHeld },
            { scope: (parser as any).isLiquid },
        ],
        script: function (objects: any) {
            return handleFillWithLiquid((game as any).player, objects[0][0], objects[1][0]);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcFillWith', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        cmdCategory: "FillWith",
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { scope: (parser as any).isHeld },
            { scope: (parser as any).isLiquid },
        ],
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handleFillWithLiquid(npc, objects[0][0], objects[1][0]);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('PutIn', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
            { scope: (parser as any).isPresent, attName: "container" },
        ],
        script: function (objects: any) {
            return handlePutInContainer((game as any).player, objects);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcPutIn', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        cmdCategory: "PutIn",
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { scope: (parser as any).isHeldByNpc, multiple: true },
            { scope: (parser as any).isPresent, attName: "container" },
        ],
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handlePutInContainer(npc, objects);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('TakeOut', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isContained, multiple: true },
            { scope: (parser as any).isPresent, attName: "container" },
        ],
        script: function (objects: any) {
            return handleTakeFromContainer((game as any).player, objects);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcTakeOut', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        cmdCategory: "TakeOut",
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { scope: (parser as any).isContained, multiple: true },
            { scope: (parser as any).isPresent, attName: "container" },
        ],
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handleTakeFromContainer(npc, objects);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('GiveTo', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        objects: [
            { scope: (parser as any).isHeld, multiple: true },
            { scope: (parser as any).isPresent, attName: "npc" },
        ],
        script: function (objects: any) {
            return handleGiveToNpc((game as any).player, objects);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcGiveTo', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        cmdCategory: "Give",
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { scope: (parser as any).isHeldByNpc, multiple: true },
            { scope: (parser as any).isPresentOrMe, attName: "npc" },
        ],
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handleGiveToNpc(npc, objects);
        },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('PushExit', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHereNotHeld],
        cmdCategory: "Push",
        script: function (objects: any) {
            return handlePushExit((game as any).player, objects);
        },
        objects: [
            { text: true },
            { scope: (parser as any).isHere, attName: "shiftable" },
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcPushExit', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHereNotHeld],
        cmdCategory: "Push",
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handlePushExit(npc, objects);
        },
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { text: true },
            { scope: (parser as any).isHere, attName: "shiftable" },
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('TieTo', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        cmdCategory: "Tie",
        objects: [
            { scope: (parser as any).isHeld, attName: "rope" },
            { scope: (parser as any).isHere, attName: "attachable" },
        ],
        script: function (objects: any) { return handleTieTo((game as any).player, objects[0][0], objects[1][0]); },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcTieTo', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHeld],
        cmdCategory: "Tie",
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handleTieTo(npc, objects[0][0], objects[1][0]);
        },
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { text: true },
            { scope: (parser as any).isHere, attName: "shiftable" },
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('Untie', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        cmdCategory: "Untie",
        objects: [
            { scope: (parser as any).isHere, attName: "rope" },
        ],
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        script: function (objects: any) { handleUntieFrom((game as any).player, objects[0][0]); },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcUntie', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        cmdCategory: "Tie",
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handleUntieFrom(npc, objects[0][0], objects[1][0]);
        },
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { text: true },
            { scope: (parser as any).isHere, attName: "shiftable" },
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('UntieFrom', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        cmdCategory: "Untie",
        objects: [
            { scope: (parser as any).isHere, attName: "rope" },
            { scope: (parser as any).isHere, attName: "attachable" },
        ],
        script: function (objects: any) { handleUntieFrom((game as any).player, objects[0][0], objects[1][0]); },
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('NpcUntieFrom', {
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        cmdCategory: "Tie",
        script: function (objects: any) {
            const npc = objects[0][0];
            if (!npc.npc)
                return failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            objects.shift();
            return handleUntieFrom(npc, objects[0][0], objects[1][0]);
        },
        objects: [
            { scope: (parser as any).isHere, attName: "npc" },
            { text: true },
            { scope: (parser as any).isHere, attName: "shiftable" },
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('UseWith', {
        //npcCmd:true,
        rules: [(cmdRules as any).canManipulate, (cmdRules as any).isHere],
        objects: [
            { scope: (parser as any).isPresent },
            { scope: (parser as any).isPresent },
        ],
        script: function (objects: any, matches: any) {
            const obj = objects[0][0];
            const obj2 = objects[1][0];
            if (obj.useWith) {
                const result = obj.useWith((game as any).player, obj2);
                return result ? world.SUCCESS : world.FAILED;
            }
            if (obj2.withUse) {
                const result = obj2.withUse((game as any).player, obj);
                return result ? world.SUCCESS : world.FAILED;
            }
            if (obj.useWithDefaultsTo) {
                const cmd = findCmd(obj.useWithDefaultsTo());
                if (cmd) {
                    const result = cmd.script(objects, matches);
                    return result ? world.SUCCESS : world.FAILED;
                }
                else {
                    throw new Error("USE command defaulting to unknown command " + obj.useWithDefaultsTo);
                }
            }
            if (obj2.withUseDefaultsTo) {
                const cmd = findCmd(obj2.withUseDefaultsTo());
                if (cmd) {
                    const result = cmd.script(objects, matches);
                    return result ? world.SUCCESS : world.FAILED;
                }
                else {
                    throw new Error("USE command defaulting to unknown command " + obj2.withUseDefaultsTo);
                }
            }
            this.default(obj, false, (game as any).player);
            return world.FAILED;
        },
        defmsg: lang.cannot_use,
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('AskAbout', {
        rules: [(cmdRules as any).canTalkTo],
        script: function (arr: any) {
            if (!(game as any).player.canTalk())
                return false;
            if (!arr[0][0].askabout)
                return failedmsg(lang.cannot_ask_about, { char: (game as any).player, item: arr[0][0], text: arr[2] });
            return arr[0][0].askabout(arr[2], arr[1]) ? world.SUCCESS : world.FAILED;
        },
        objects: [
            { scope: (parser as any).isNpcAndHere },
            { text: true },
            { text: true },
        ]
    }),
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    new Cmd('TellAbout', {
        rules: [(cmdRules as any).canTalkTo],
        script: function (arr: any) {
            if (!(game as any).player.canTalk())
                return false;
            if (!arr[0][0].tellabout)
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cannot_tell_about'.
                return failedmsg(cannot_tell_about, { char: (game as any).player, item: arr[0][0], text: arr[1] });
            return arr[0][0].tellabout(arr[2], arr[1]) ? world.SUCCESS : world.FAILED;
        },
        objects: [
            { scope: (parser as any).isNpcAndHere },
            { text: true },
            { text: true },
        ]
    }),
];
// DEBUG commands
if ((settings as any).playMode === 'dev') {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugWalkThrough', {
        objects: [
            { text: true },
        ],
        script: function (objects: any) {
            if (typeof walkthroughs === "undefined")
                return errormsg("No walkthroughs set");
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const wt = walkthroughs[objects[0]];
            if (wt === undefined)
                return errormsg("No walkthrough found called " + objects[0]);
            for (let el of wt) {
                if (typeof el === "string") {
                    (io as any).msgInputText(el);
                    (parser as any).parse(el);
                }
                else {
                    settings.walkthroughMenuResponses = Array.isArray(el.menu) ? el.menu : [el.menu];
                    console.log(el.cmd);
                    console.log(settings.walkthroughMenuResponses);
                    (io as any).msgInputText(el.cmd);
                    (parser as any).parse(el.cmd);
                    settings.walkthroughMenuResponses = [];
                }
            }
        },
    }));
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugInspect', {
        script: function (arr: any) {
            const item = arr[0][0];
            debugmsg("See the console for details on the object " + item.name + " (press F12 to world. the console)");
            console.log(item);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { scope: (parser as any).isInWorld },
        ],
    }));
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugInspectByName', {
        script: function (arr: any) {
            const item_name = arr[0];
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (!w[item_name]) {
                debugmsg("No object called " + item_name);
                return world.FAILED;
            }
            debugmsg("See the console for details on the object " + item_name + " (press F12 to world. the console)");
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            console.log(w[item_name]);
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { text: true },
        ],
    }));
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugTest', {
        script: function () {
            if (!settings.tests) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg('The TEST command is for unit testing during game development, and is not activated (F12 for more).');
                console.log('To activate testing in your game, set settings.tests to true. More details here: https://github.com/ThePix/QuestJS/wiki/Unit-testing');
                return world.SUCCESS_NO_TURNSCRIPTS;
            }
            if (typeof (test as any).runTests !== 'function') {
                console.log(test);
                return world.FAILED;
            }
            (test as any).runTests();
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }));
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugInspectCommand', {
        script: function (arr: any) {
            debugmsg("Looking for " + arr[0]);
            for (let cmd of commands) {
                if (cmd.name.toLowerCase() === arr[0] || (cmd.cmdCategory && cmd.cmdCategory.toLowerCase() === arr[0])) {
                    debugmsg("Name: " + cmd.name);
                    for (let key in cmd) {
                        if (cmd.hasOwnProperty(key)) {
                            debugmsg("--" + key + ": " + cmd[key]);
                        }
                    }
                }
            }
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [
            { text: true },
        ],
    }));
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugListCommands', {
        script: function (arr: any) {
            let count = 0;
            for (let cmd of commands) {
                if (!cmd.name.match(/\d$/)) {
                    let s = cmd.name + " (" + cmd.regex;
                    let altCmd;
                    let n = 2;
                    do {
                        altCmd = commands.find(el => el.name === cmd.name + n);
                        if (altCmd)
                            s += " or " + altCmd.regex;
                        n++;
                    } while (altCmd);
                    s += ")";
                    const npcCmd = commands.find(el => el.name === "Npc" + cmd.name + "2");
                    if (npcCmd)
                        s += " - NPC too";
                    debugmsg(s);
                    count++;
                }
            }
            debugmsg("... Found " + count + " commands.");
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [],
    }));
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugListCommands2', {
        script: function (arr: any) {
            let count = 0;
            for (let cmd of commands) {
                let s = cmd.name + " (" + cmd.regex + ")";
                debugmsg(s);
                count++;
            }
            debugmsg("... Found " + count + " commands.");
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [],
    }));
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.push(new Cmd('DebugParserToggle', {
        script: function (arr: any) {
            if ((parser as any).debug) {
                (parser as any).debug = false;
                debugmsg("Parser debugging messages are off.");
            }
            else {
                (parser as any).debug = true;
                debugmsg("Parser debugging messages are on.");
            }
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
        objects: [],
    }));
}
// Functions used by commands 
// (but not in the commands array)
// Cannot handle multiple vessels
function handleFillWithLiquid(char: any, vessel: any, liquid: any) {
    const tpParams = { char: char, container: vessel, liquid: liquid };
    if (!vessel.vessel)
        return failedmsg((lang as any).not_vessel, tpParams);
    if (vessel.closed)
        return failedmsg(lang.container_closed, tpParams);
    if (!char.canManipulate(vessel, "fill"))
        return world.FAILED;
    if (!char.getAgreement("Fill", vessel))
        return world.FAILED;
    if (!vessel.isAtLoc(char.name))
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'obj'.
        return failedmsg(lang.not_carrying, { char: char, item: obj });
    return vessel.fill(false, char, liquid) ? world.SUCCESS : world.FAILED;
}
function handlePutInContainer(char: any, objects: any) {
    let success = false;
    const container = objects[1][0];
    const multiple = objects[0].length > 1 || (parser as any).currentCommand.all;
    const tpParams = { char: char, container: container };
    if (!container.container)
        return failedmsg(lang.not_container, { char, container });
    if (container.closed)
        return failedmsg(lang.container_closed, tpParams);
    if (!char.canManipulate(objects[0], "put"))
        return world.FAILED;
    for (let obj of objects[0]) {
        let flag = true;
        if (!char.getAgreement("Put/in", obj)) {
            // The getAgreement should give the response
            continue;
        }
        if (!container.testForRecursion(char, obj)) {
            flag = false;
        }
        if (container.testRestrictions) {
            flag = container.testRestrictions(obj, char);
        }
        if (flag) {
            if (!obj.isAtLoc(char.name)) {
                failedmsg(prefix(obj, multiple) + lang.not_carrying, { char: char, item: obj });
            }
            else {
                obj.moveToFrom(container.name, char.name);
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(prefix(obj, multiple) + lang.done_msg);
                success = true;
            }
        }
    }
    // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
    if (success === world.SUCCESS)
        char.pause();
    return success ? world.SUCCESS : world.FAILED;
}
function handleTakeFromContainer(char: any, objects: any) {
    let success = false;
    const container = objects[1][0];
    const multiple = objects[0].length > 1 || (parser as any).currentCommand.all;
    const tpParams = { char: char, container: container };
    if (!container.container) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        failedmsg(lang.not_container(char, container));
        return world.FAILED;
    }
    if (container.closed) {
        failedmsg(lang.container_closed, tpParams);
        return world.FAILED;
    }
    if (!char.canManipulate(objects[0], "get")) {
        return world.FAILED;
    }
    for (let obj of objects[0]) {
        let flag = true;
        if (!char.getAgreement("Take", obj)) {
            // The getAgreement should give the response
            continue;
        }
        if (flag) {
            if (!obj.isAtLoc(container.name)) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                failedmsg(prefix(obj, multiple) + lang.not_inside(container, obj));
            }
            else {
                obj.moveToFrom(char.name, container.name);
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                msg(prefix(obj, multiple) + lang.done_msg);
                success = true;
            }
        }
    }
    // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
    if (success === world.SUCCESS)
        char.pause();
    return success ? world.SUCCESS : world.FAILED;
}
function handleGiveToNpc(char: any, objects: any) {
    let success = false;
    const npc = objects[1][0];
    const multiple = objects[0].length > 1 || (parser as any).currentCommand.all;
    if (!npc.npc && npc !== (game as any).player) {
        failedmsg(lang.not_npc_for_give, { char: char, item: npc });
        return world.FAILED;
    }
    for (let obj of objects[0]) {
        let flag = true;
        if (!char.getAgreement("Give", obj)) {
            // The getAgreement should give the response
        }
        if (npc.testRestrictions) {
            flag = npc.testRestrictions(obj);
        }
        if (!npc.canManipulate(obj, "give")) {
            return world.FAILED;
        }
        if (flag) {
            if (!obj.isAtLoc(char.name)) {
                failedmsg(prefix(obj, multiple) + lang.not_carrying, { char: char, item: obj });
            }
            else {
                if (npc.giveReaction) {
                    npc.giveReaction(obj, multiple, char);
                }
                else {
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                    msg(prefix(obj, multiple) + lang.done_msg);
                    obj.moveToFrom(npc.name, char.name);
                }
                success = true;
            }
        }
    }
    // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
    if (success === world.SUCCESS)
        char.pause();
    return success ? world.SUCCESS : world.FAILED;
}
function handleStandUp(objects: any) {
    let char;
    if (objects.length === 0) {
        char = (game as any).player;
    }
    else {
        const npc = objects[0][0];
        if (!npc.npc) {
            failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            return world.FAILED;
        }
        if (!npc.posture) {
            failedmsg(lang.already, { item: npc });
            return world.FAILED;
        }
        if (npc.getAgreementPosture && !npc.getAgreementPosture("stand")) {
            // The getAgreement should give the response
            return world.FAILED;
        }
        else if (!npc.getAgreementPosture && npc.getAgreement && !npc.getAgreement("Posture", "stand")) {
            return world.FAILED;
        }
        char = npc;
    }
    if (!char.canPosture()) {
        return world.FAILED;
    }
    if (char.posture) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(lang.stop_posture(char));
        char.pause();
        return world.SUCCESS;
    }
}
// we know the char can manipulate, we know the obj is here and not held
function handlePushExit(char: any, objects: any) {
    const verb = getDir(objects[0]);
    const obj = objects[1][0];
    const dir = getDir(objects[2]);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const room = w[char.loc];
    const tpParams = { char: char, item: obj, dir: dir };
    if (!obj.shiftable && obj.takeable) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.take_not_push, tpParams);
        return world.FAILED;
    }
    if (!obj.shiftable) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.cannot_push, tpParams);
        return world.FAILED;
    }
    if (!room[dir] || room[dir].isHidden()) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.not_that_way, tpParams);
        return world.FAILED;
    }
    if (room[dir].isLocked()) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(lang.locked_exit(char, room[dir]));
        return world.FAILED;
    }
    if (typeof room[dir].noShiftingMsg === "function") {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(room[dir].noShiftingMsg(char, item));
        return world.FAILED;
    }
    if (typeof room[dir].noShiftingMsg === "string") {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(room[dir].noShiftingMsg);
        return world.FAILED;
    }
    if (typeof obj.shift === "function") {
        const res = obj.shift(char, dir, verb);
        return res ? world.SUCCESS : world.FAILED;
    }
    // by default, objects cannot be pushed up
    if (dir === "up") {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.cannot_push_up, tpParams);
        return world.FAILED;
    }
    // not using moveToFrom; if there are 
    const dest = room[dir].name;
    obj.moveToFrom(dest);
    char.loc = dest;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    (tpParams as any).dest = w[dest];
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    msg(lang.push_exit_successful, tpParams);
    return world.SUCCESS;
}
const handleTieTo = function (char: any, rope: any, obj2: any) {
    if (!rope.rope)
        return failedmsg("You cannot attach that to anything.", { rope: rope });
    if (!obj2.attachable)
        return failedmsg("That is not something you can {rope.attachVerb} {nm:rope:the} to.", { rope: rope });
    if (rope.tiedTo1 === obj2.name)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        return failedmsg("It already is.");
    if (rope.tiedTo2 === obj2.name)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        return failedmsg("It already is.");
    if (rope.tiedTo1 && rope.tiedTo2)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return failedmsg("It is already {rope.attachedVerb} to {nm:obj1:the} and {nm:obj12:the}.", { rope: w[rope.tiedTo1], obj1: w[rope.tiedTo2], obj2: w[rope.tiedTo2] });
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    msg("{nv:char:" + rope.attachVerb + ":true} {nm:rope:the} to {nm:obj2:the}.", { char: char, rope: rope, obj2: obj2 });
    rope.attachTo(obj2);
    return world.SUCCESS;
};
const handleUntieFrom = function (char: any, rope: any, obj2: any) {
    if (rope !== (w as any).rope)
        return failedmsg("You cannot attach that to - or detach it from - anything.", { rope: rope });
    if (obj2 === undefined) {
        // obj2 not set; can we guess it?
        if (!rope.tiedTo1 && !rope.tiedTo2)
            return failedmsg("{nv:rope:be:true} not {rope.attachedVerb} to anything.", { rope: rope });
        if (rope.tiedTo1 && !rope.tiedTo2) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            obj2 = w[rope.tiedTo1];
        }
        else if (!rope.tiedTo1 && rope.tiedTo2) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            obj2 = w[rope.tiedTo2];
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        else if (w[rope.tiedTo1].isHere() && !w[rope.tiedTo2].isHere()) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            obj2 = w[rope.tiedTo1];
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        else if (!w[rope.tiedTo1].isHere() && w[rope.tiedTo2].isHere()) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            obj2 = w[rope.tiedTo2];
        }
        else {
            return failedmsg("Which end of {nm:rope:the} do you want to {rope.detachVerb}?", { rope: rope });
        }
    }
    else {
        if (rope.tiedTo1 !== obj2.name && rope.tiedTo2 !== obj2.name) {
            return failedmsg("{nv:rope:be:true} not {rope.attachedVerb} to {nm:obj2:the}.", { rope: rope, obj2: obj2 });
        }
    }
    if (obj2 === rope.tiedTo1 && rope.tethered)
        return failedmsg("{nv:char:can:true} not {rope.detachVerb} {nm:rope:the} from {nm:obj2:the}.", { char: char, rope: rope, obj2: obj2 });
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    msg("{nv:char:" + rope.detachVerb + ":true} {nm:rope:the} from {nm:obj2:the}.", { char: char, rope: rope, obj2: obj2 });
    rope.detachFrom(obj2);
    return world.SUCCESS;
};
