"use strict";
// Comment necessary for require in QEdit
const settings = {
    // Functions for the side panes lists
    isHeldNotWorn: function (item: any) {
        return item.isAtLoc((game as any).player.name, world.SIDE_PANE) && world.ifNotDark(item) && !item.getWorn();
    },
    isHere: function (item: any) {
        return item.isAtLoc((game as any).player.loc, world.SIDE_PANE) && world.ifNotDark(item);
    },
    isWorn: function (item: any) {
        return item.isAtLoc((game as any).player.name, world.SIDE_PANE) && world.ifNotDark(item) && item.getWorn();
    },
    // Also title, author, thanks (option; array)
    // Files
    lang: "lang-en",
    customExits: false,
    files: ["code", "data"],
    libraries: ["_saveload", "_text", "_io", "_command", "_defaults", "_templates", "_world", "_npc", "_parser", "_commands"],
    customLibraries: [],
    imagesFolder: 'assets/images/',
    iconsFolder: 'assets/icons/',
    soundsFolder: 'assets/audio/',
    videosFolder: 'assets/video/',
    cssFolder: 'assets/css/',
    soundsFileExt: '.mp3',
    // The side panes
    panes: 'left',
    panesCollapseAt: 700,
    compassPane: true,
    statusPane: "Status",
    statusWidthLeft: 120,
    statusWidthRight: 40,
    status: [
        function () { return "<td>Health points:</td><td>" + (game as any).player.hitpoints + "</td>"; },
    ],
    // Other UI settings
    textInput: true,
    cursor: ">",
    cmdEcho: true,
    textEffectDelay: 25,
    roomTemplate: [
        "#{cap:{hereName}}",
        "{terse:{hereDesc}}",
        "{objectsHere:You can see {objects} here.}",
        "{exitsHere:You can go {exits}.}",
    ],
    silent: false,
    walkthroughMenuResponses: [],
    startingDialogEnabled: false,
    darkModeActive: false,
    mapAndImageCollapseAt: 1200,
    // Conversations settings
    dropdownForConv: true,
    noTalkTo: "TALK TO is not a feature in this game.",
    noAskTell: "ASK/TELL ABOUT is not a feature in this game.",
    npcReactionsAlways: false,
    turnsQuestionsLast: 5,
    givePlayerSayMsg: true,
    givePlayerAskTellMsg: true,
    // Other game play settings
    failCountsAsTurn: false,
    lookCountsAsTurn: false,
    // When save is disabled, objects can be created during game play
    saveDisabled: false,
    // Date and time settings
    dateTime: {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        secondsPerTurn: 60,
        locale: 'en-GB',
        start: new Date('February 14, 2019 09:43:00'),
    },
    // Other settings
    // The parser will convert "two" to 2" in player input (can slow down the game)
    convertNumbersInParser: true,
    tests: false,
    maxUndo: 10,
    moneyFormat: "$!",
    version: '1.0',
    questVersion: '0.3',
    author: 'Anonymous',
    title: 'My New Game Needs A Title',
    mapStyle: { right: '0', top: '200px', width: '300px', height: '300px', 'background-color': 'beige' },
    writeScript: function (folder: any) {
        (settings as any).folder = folder ? folder + '/' : '';
        document.writeln('<link rel="shortcut icon" type="image/png" href="' + settings.iconsFolder + 'favicon.png"/>');
        document.writeln('<link rel="stylesheet" href="' + settings.cssFolder + 'default.css"/>');
        if ((settings as any).themes) {
            for (let file of (settings as any).themes) {
                document.writeln('<link rel="stylesheet" href="' + settings.cssFolder + file + '.css"/>');
            }
        }
        if ((settings as any).styleFile) {
            document.writeln('<link rel="stylesheet" href="' + (settings as any).folder + (settings as any).styleFile + '.css"/>');
        }
        if (settings.tests) {
            document.writeln('<script src="lib/test-lib.js"></scr' + "ipt>");
            document.writeln('<script src="' + (settings as any).folder + 'tests.js"></scr' + "ipt>");
        }
        document.writeln('<script src="' + (folder ? 'lang/' : '') + settings.lang + '.js"></scr' + "ipt>");
        if (settings.customExits) {
            document.writeln('<script src="' + (settings as any).folder + settings.customExits + '.js"></scr' + "ipt>");
        }
        for (let file of settings.libraries) {
            document.writeln('<script src="' + (folder ? 'lib/' : '') + file + '.js"></scr' + "ipt>");
        }
        for (let lib of settings.customLibraries) {
            for (let file of (lib as any).files) {
                document.writeln('<script src="' + (folder ? (lib as any).folder + '/' : '') + file + '.js"></scr' + "ipt>");
            }
        }
        for (let file of settings.files) {
            document.writeln('<script src="' + (settings as any).folder + file + '.js"></scr' + "ipt>");
        }
    }
};
(settings as any).inventoryPane = [
    { name: 'Items Held', alt: 'itemsHeld', test: settings.isHeldNotWorn, getLoc: function () { return (game as any).player.name; } },
    { name: 'Items Worn', alt: 'itemsWorn', test: settings.isWorn, getLoc: function () { return (game as any).player.name; } },
    { name: 'Items Here', alt: 'itemsHere', test: settings.isHere, getLoc: function () { return (game as any).player.loc; } },
];
// @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
$(function () {
    if (!settings.startingDialogEnabled) {
        if ((settings as any).startingDialogAlt)
            (settings as any).startingDialogAlt();
        (settings as any).delayStart = false;
        return;
    }
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const diag = $("#dialog");
    diag.prop("title", (settings as any).startingDialogTitle);
    diag.html((settings as any).startingDialogHtml);
    diag.dialog({
        modal: true,
        dialogClass: "no-close",
        width: (settings as any).startingDialogWidth,
        height: (settings as any).startingDialogHeight,
        buttons: [
            {
                text: "OK",
                click: function () {
                    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                    $(this).dialog("close");
                    (settings as any).startingDialogOnClick();
                    settings.startingDialogEnabled = false;
                    (game as any).begin();
                    if (settings.textInput) {
                        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                        $('#textbox').focus();
                    }
                }
            }
        ]
    });
    setTimeout(function () {
        if ((settings as any).startingDialogInit)
            (settings as any).startingDialogInit();
    }, 10);
});
// Used by the editor
try {
    util;
}
catch (e) {
    module.exports = { settings: settings };
}
