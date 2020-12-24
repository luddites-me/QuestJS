// ============  Output  =======================================
"use strict";
if ((settings as any).playMode !== 'dev') {
    window.onbeforeunload = function (event: any) {
        event.returnValue = "Are you sure?";
    };
}
//@DOC
// ##Output functions
//
// The idea is that you can have them world. differently - or not at all -
// so error messages can be world.ed in red, meta-data (help., etc)
// is grey, and debug messages can be turned on and off as required.
//
// Note that not all use the text processor (so if there is an issue with
// the text processor, we can use the others to report it). Also unit tests
// capture output with msg and errormsg, but not debugmsg or headings.
//
// Should all be language neutral
//@UNDOC
/*
tag   required
action  required
cssClass
printBlank
*/
function _msg(s: any, params: any, options: any) {
    if (options.tag === undefined)
        options.tag = 'p';
    if (options.cssClass === undefined)
        options.cssClass = 'default-' + options.tag.toLowerCase();
    const processed = params ? processText(s, params).trim() : s.trim();
    if (processed === "" && !options.printBlank)
        return;
    if ((test as any).testing) {
        (test as any).testOutput.push(processed);
        return;
    }
    const lines = processed.split('|');
    for (let line of lines) {
        // can add effects
        const data = options;
        data.text = line;
        if (!data.action)
            data.action = 'output';
        (io as any).addToOutputQueue(data);
    }
}
//@DOC
// Adds the given string to the print queue.
// This allows you to add any HTML you want to the output queue.
function rawPrint(s: any) {
    _msg(s, {}, {});
}
//@DOC
// Output a standard message, as an HTML paragraph element (P).
// The string will first be passed through the text processor.
// Additional data can be put in the optional params dictionary.
// You can specify a CSS class to use.
// During unit testing, messages will be saved and tested
function msg(s: any, params: any, cssClass: any) {
    //if (!params) params = {}
    const lines = s.split('|');
    for (let line of lines) {
        const tag = (/^#/.test(line) ? 'h4' : 'p');
        line = line.replace(/^#/, '');
        _msg(line, params || {}, { cssClass: cssClass, tag: tag });
    }
}
//@DOC
// As `msg`, but the string is presented as an HTML heading (H1 to H6).
// The level of the heading is determined by `level`, with 1 being the top, and 6 the bottom.
// Headings are ignored during unit testing.
function msgBlankLine() {
    _msg('', false, { tag: 'p', printBlank: true });
}
//@DOC
// As `msg`, but handles an array of strings. Each string is put in its own HTML paragraph,
// and the set is put in an HTML division (DIV). The cssClass is applied to the division.
function msgDiv(arr: any, params: any, cssClass: any) {
    let s = '';
    for (let item of arr) {
        s += '  <p>' + item + "</p>\n";
    }
    _msg(s, params || {}, { cssClass: cssClass, tag: 'div' });
}
//@DOC
// As `msg`, but handles an array of strings in a list. Each string is put in its own HTML list item (LI),
// and the set is put in an HTML order list (OL) or unordered list (UL), depending on the value of `ordered`.
function msgList(arr: any, ordered: any, params: any) {
    let s = '';
    for (let item of arr) {
        s += '  <li>' + item + "</li>\n";
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cssClass'.
    _msg(s, params || {}, { cssClass: cssClass, tag: ordered ? '</ol>' : '</ul>' });
}
//@DOC
// As `msg`, but handles an array of arrays of strings in a list. This is laid out in an HTML table.
// If `headings` is present, this array of strings is used as the column headings.
function msgTable(arr: any, headings: any, params: any) {
    let s = '';
    if (headings) {
        s += '  <tr>\n';
        for (let item of headings) {
            s += "    <th>" + item + "</th>\n";
        }
        s += '  </tr>\n';
    }
    for (let row of arr) {
        s += '  <tr>\n';
        for (let item of row) {
            // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'processed'. Did you mean 'proces... Remove this comment to see the full error message
            s += "    <td>" + processed + "</td>\n";
        }
        s += "  </tr>\n";
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cssClass'.
    _msg(s, params || {}, { cssClass: cssClass, tag: 'table' });
}
//@DOC
// As `msg`, but the string is presented as an HTML heading (H1 to H6).
// The level of the heading is determined by `level`, with 1 being the top, and 6 the bottom.
// Headings are ignored during unit testing.
function msgHeading(s: any, level: any, params: any) {
    _msg(s, params || {}, { tag: 'h' + level });
}
//@DOC
// Output a picture, as an HTML image element (IMG).
// If width and height are omitted, the size of the image is used.
// If height is omitted, the height will be proportional to the given width.
// The file name should include the path. For a local image, that would probably be the images folder,
// but it could be the web address of an image hosted elsewhere.
function picture(filename: any, width: any, height: any) {
    const src = filename.includes('/') ? filename : settings.imagesFolder + filename;
    _msg('', {}, { action: 'output', width: width, height: height, tag: 'img', src: src, printBlank: true });
}
function image(filename: any, width: any, height: any) {
    const src = filename.includes('/') ? filename : settings.imagesFolder + filename;
    _msg('', {}, { action: 'output', width: width, height: height, tag: 'img', src: src, cssClass: 'centred', printBlank: true, destination: 'quest-image' });
}
//@DOC
// Plays a sound. The filename must include the extension, and the file should be in the folder specified by audioFolder (defaults to the game folder).
function sound(filename: any) {
    //console.log(settings.ssFolder)
    _msg('Your browser does not support the <code>audio</code> element.', {}, { action: 'sound', name: filename });
}
function ambient(filename: any, volume: any) {
    //console.log(settings.ssFolder)
    _msg('Your browser does not support the <code>audio</code> element.', {}, { action: 'ambient', name: filename, volume: volume });
}
//@DOC
// Plays a video. The filename must include the extension, and the file should be in the folder specified by audioFolder (defaults to the game folder).
// There are some issues about codecs and formats; use at your discretion.
function video(filename: any) {
    //console.log(settings.ssFolder)
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'videoFolder' does not exist on type '{ i... Remove this comment to see the full error message
    _msg('Your browser does not support the <code>video</code> element.', {}, { action: 'output', autoplay: true, tag: 'video', src: settings.videoFolder + '/' + filename });
}
//@DOC
// Draw an image in the main window, embedded in the text.
// This uses SVG, which is a standard web drawing system.
// The first and second parameters are the width and height of the image.
// The third parameter is an array of strings, each element being an SVG primitive.
// The image will be added to the output queue in the same way text is.
function draw(width: any, height: any, data: any, options: any) {
    if (!options)
        options = {};
    //console.log(options)
    let s = '<svg width="' + width + '" height="' + height + '" viewBox="';
    s += options.x ? ('' + options.x + ' ' + options.y) : '0 0';
    s += ' ' + width + ' ' + height + '" ';
    if (options.background)
        s += 'style="background:' + options.background + '" ';
    s += 'xmlns="http://www.w3.org/2000/svg">';
    s += data.join('') + '</svg>';
    if ((settings as any).reportAllSvg)
        console.log(s.replace(/></g, '>\n<'));
    if (options.destination) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#' + options.destination).html(s);
    }
    else {
        rawPrint(s);
    }
}
//@DOC
// Just the same as msg, but adds the "failed" CSS class. This allows failed command responses to be differentiated.
// Returns the value FAILED, allowing commands to give a message and give up
//     if (notAllowed) return failedmsg("That is not allowed.")
function failedmsg(s: any, params: any) {
    _msg(s, params || {}, { cssClass: "failed", tag: 'p' });
    return world.FAILED;
}
//@DOC
// Just the same as msg, but adds the "failed" CSS class. This allows failed command responses to be differentiated.
// Returns the value false, allowing commands to give a message and give up
//     if (notAllowed) return falsemsg("That is not allowed.")
function falsemsg(s: any, params: any) {
    _msg(s, params || {}, { cssClass: "failed", tag: 'p' });
    return false;
}
//@DOC
// Output a meta-message - a message to inform the player about something outside the game world,
// such as hints and help messages.
// The string will first be passed through the text processor.
// Additional data can be put in the optional params dictionary.
// During unit testing, messages will be saved and tested
function metamsg(s: any, params: any) {
    _msg(s, params || {}, { cssClass: "meta", tag: 'p' });
}
//@DOC
// Output a message from the parser indicating the input text could not be parsed.
// During unit testing, messages will be saved and tested.
// Does not use the text processor.
function parsermsg(s: any) {
    _msg(s, false, { cssClass: "parser", tag: 'p' });
    return false;
}
//@DOC
// Output an error message.
// Use for when something has gone wrong, but not when the player types something odd -
// if you see this during play, there is a bug in your game (or my code!), it is not the player
// to blame.
//
// This bypasses the normal output system. It will not wait for other text to be output (for example
// after wait). During unit testing, error messages will be output to screen as they occur.
// It does not use the text processor.
function errormsg(s: any) {
    if (world.isCreated) {
        (io as any).print({ tag: 'p', cssClass: "error", text: lang.error });
    }
    console.error("ERROR: " + s);
    console.log('Look through the trace below to find the offending code. The first entry in the list will be "errormsg", which is me, the next will the code that detected the error and called the "errormsg" message. You may need to look further down to find the root cause. If you get to the "jquery" lines you have gone too far.');
    console.trace();
    return false;
}
//@DOC
// Output a debug message.
// Debug messages are ignored if DEBUG is false.
// You should also consider using `console.log` when debugging; it gives a message in the console,
// and outputs objects and array far better.
//
// This bypasses the normal output system. It will not wait for other text to be output (for example
// after wait). During unit testing, error messages will be output to screen as they occur.
// It does not use the text processor.
function debugmsg(s: any) {
    if ((settings as any).playMode === 'dev' || (settings as any).playMode === 'meta') {
        (io as any).print({ tag: 'p', cssClass: "debug", text: s });
    }
}
//@DOC
// Clears the screen.
function clearScreen() {
    //io.outputQueue.push({action:'clear'})
    (io as any).addToOutputQueue({ action: 'clear' });
}
//@DOC
// Stops outputting whilst waiting for the player to click.
function wait(delay: any, text: any) {
    if ((test as any).testing)
        return;
    if (delay === undefined) {
        (io as any).addToOutputQueue({ action: 'wait', text: text, cssClass: 'continue' });
    }
    else {
        (io as any).addToOutputQueue({ action: 'delay', delay: delay, text: text, cssClass: 'continue' });
    }
}
function askQuestion(title: any, fn: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    msg(title);
    (parser as any).overrideWith(fn);
}
//@DOC
// Use like this:
//      showMenu('What is your favourite color?', ['Blue', 'Red', 'Yellow', 'Pink'], function(result) {
//        msg("You picked " + result + ".");
//      });
function showMenu(title: any, options: any, fn: any) {
    const opts = { article: DEFINITE, capital: true };
    (io as any).input(title, options, false, fn, function (options: any) {
        for (let i = 0; i < options.length; i++) {
            let s = '<a class="menu-option" onclick="io.menuResponse(' + i + ')">';
            s += (typeof options[i] === 'string' ? options[i] : lang.getName(options[i], opts));
            s += '</a>';
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(s);
        }
    });
}
function showMenuWithNumbers(title: any, options: any, fn: any) {
    const opts = { article: DEFINITE, capital: true };
    (parser as any).overrideWith(function (s: any) { (io as any).menuResponse(s); });
    (io as any).input(title, options, true, fn, function (options: any) {
        for (let i = 0; i < options.length; i++) {
            let s = (i + 1) + '. <a class="menu-option" onclick="io.menuResponse(' + i + ')">';
            s += (typeof options[i] === 'string' ? options[i] : lang.getName(options[i], opts));
            s += '</a>';
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(s);
        }
    });
}
function showDropDown(title: any, options: any, fn: any) {
    const opts = { article: DEFINITE, capital: true };
    (io as any).input(title, options, false, fn, function (options: any) {
        let s = '<select id="menu-select" class="custom-select" style="width:400px;" ';
        s += 'onchange=\"io.menuResponse($(\'#menu-select\').find(\':selected\').val())\">';
        s += '<option value="-1">-- Select one --</option>';
        for (let i = 0; i < options.length; i++) {
            s += '<option value="' + i + '">';
            s += (typeof options[i] === 'string' ? options[i] : lang.getName(options[i], opts));
            s += '</option>';
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(s + "</select>");
        //$('#menu-select').selectmenu();
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#menu-select').focus();
    });
}
function showYesNoMenu(title: any, fn: any) {
    showMenu(title, lang.yesNo, fn);
}
function showYesNoMenuWithNumbers(title: any, fn: any) {
    showMenuWithNumbers(title, lang.yesNo, fn);
}
function showYesNoDropDown(title: any, fn: any) {
    showDropDown(title, lang.yesNo, fn);
}
// This should be called after each turn to ensure we are at the end of the page and the text box has the focus
function endTurnUI(update: any) {
    if (settings.panes !== 'none' && update) {
        // set the lang.exit_list
        for (let exit of lang.exit_list) {
            if ((game as any).room.hasExit(exit.name, { excludeScenery: true }) || exit.type === 'nocmd') {
                // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                $('#exit-' + exit.name).show();
            }
            else {
                // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                $('#exit-' + exit.name).hide();
            }
        }
        (io as any).updateStatus();
        if ((settings as any).updateCustomUI)
            (settings as any).updateCustomUI();
    }
    for (let o of io.modulesToUpdate) {
        (o as any).update(update);
    }
    (io as any).updateUIItems();
    // scroll to end
    setTimeout((io as any).scrollToEnd, 1);
    // give focus to command bar
    if (settings.textInput) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#textbox').focus();
    }
}
function createPaneBox(position: any, title: any, content: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $("div.pane-div:nth-child(" + position + ")").before('<div class="pane-div"><h4 class="side-pane-heading">' + title + '</h4><div class="">' + content + '</div></div>');
}
// Create Toolbar
function createToolbar() {
    let html = "";
    html += '<div class="toolbar button" id="toolbar">';
    html += '<div class="status">';
    if ((settings as any).toolbar.content)
        html += ' <div>' + (settings as any).toolbar.content() + '</div>';
    html += '</div>';
    html += '<div class="room">';
    if ((settings as any).toolbar.roomdisplay) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        html += ' <div>' + sentenceCase(lang.getName(w[(game as any).player.loc], { article: DEFINITE })) + '</div>';
    }
    html += '</div>';
    html += '<div class="links">';
    for (let link of (settings as any).toolbar.buttons) {
        const js = link.cmd ? "runCmd('" + link.cmd + "')" : link.onclick;
        html += ` <a class="link" onclick="${js}"><i class="fas ${link.icon}" title="${link.title}"></i></a>`;
    }
    html += '</div>';
    html += '</div>';
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $("#output").before(html);
}
// ============  Hidden from creators!  =======================================
const io = {
    // Each line that is output is given an id, n plus an id number.
    nextid: 0,
    // A list of names for items currently world. in the inventory panes
    currentItemList: [],
    modulesToUpdate: [],
    modulesToInit: [],
    spoken: false,
    // TRANSCRIPT SUPPORT
    transcript: false,
    transcriptFlag: false,
    transcriptText: [],
    scriptStart: function () {
        this.transcript = true;
        this.transcriptFlag = true;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg("Transcript is now on.");
    },
    scriptEnd: function () {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg("Transcript is now off.");
        this.transcript = false;
    },
    scriptShow: function (opts: any) {
        if (opts === undefined)
            opts = '';
        if (opts === 'w') {
            const lines = [];
            for (let el of this.transcriptText) {
                if ((el as any).cssClass === 'input' && !(el as any).text.match(/^(tran)?script/)) {
                    lines.push('    "' + (el as any).text + '",');
                }
                if ((el as any).cssClass === 'menu') {
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{} | undefined' is not assignable to type 's... Remove this comment to see the full error message
                    const previous = lines.pop();
                    if (typeof previous === 'string') {
                        const d = {};
                        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                        (d as any).cmd = /^ +\"(.+)\"/.exec(previous)[1];
                        (d as any).menu = [parseInt((el as any).n)];
                        lines.push(d);
                    }
                    else {
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        previous.menu.push(parseInt((el as any).n));
                        lines.push(previous);
                    }
                }
            }
            console.log(lines);
            const wt = lines.map(el => typeof el === 'string' ? el : '    ' + JSON.stringify(el) + ',').join('\n');
            (io as any).copyTextToClipboard('  recorded:[\n' + wt + '\n  ],\n');
        }
        else {
            let html = '';
            html += '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Quest 6 Transcript for ';
            html += settings.title;
            html += '</title></head><body><h2>Quest 6 Transcript for "';
            html += settings.title + '" (version ' + settings.version;
            html += ')</h2>';
            for (let el of this.transcriptText) {
                switch ((el as any).cssClass) {
                    case 'default-p':
                        html += '<p>' + (el as any).text + '</p>';
                        break;
                    case 'meta':
                        if (!opts.includes('m')) {
                            html += '<p style="color:blue">' + (el as any).text + '</p>';
                        }
                        break;
                    case 'error':
                        if (!opts.includes('e')) {
                            html += '<p style="color:red">' + (el as any).text + '</p>';
                        }
                        break;
                    case 'debug':
                        if (!opts.includes('d')) {
                            html += '<p style="color:grey">' + (el as any).text + '</p>';
                        }
                        break;
                    case 'parser':
                        if (!opts.includes('p')) {
                            html += '<p style="color:magenta">' + (el as any).text + '</p>';
                        }
                        break;
                    case 'input':
                        if (!opts.includes('i')) {
                            html += '<p style="color:cyan">' + (el as any).text + '</p>';
                        }
                        break;
                    case 'menu':
                        if (!opts.includes('o')) {
                            html += '<p style="color:green">Menu option ' + (el as any).n + ': ' + (el as any).text + '</p>';
                        }
                        break;
                    case 'html':
                        html += (el as any).text;
                        break;
                    default: html += '<' + (el as any).tag + '>' + (el as any).text + '</' + (el as any).tag + '>';
                }
            }
            html += '</body></html>';
            const tab = window.open('about:blank', '_blank');
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            tab.document.write(html);
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            tab.document.close();
        }
    },
    scriptClear: function () {
        this.transcriptText = [];
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg("Transcript cleared.");
    },
    scriptAppend: function (data: any) {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
        this.transcriptText.push(data);
    },
};
(io as any).input = function (title: any, options: any, allowText: any, reactFunction: any, displayFunction: any) {
    (io as any).menuStartId = io.nextid;
    (io as any).menuFn = reactFunction;
    (io as any).menuOptions = options;
    if ((test as any).testing) {
        if ((test as any).menuResponseNumber === undefined) {
            debugmsg("Error when testing menu (possibly due to disambiguation?), test.menuResponseNumber = " + (test as any).menuResponseNumber);
        }
        else {
            (io as any).menuResponse((test as any).menuResponseNumber);
            delete (test as any).menuResponseNumber;
        }
        return;
    }
    if (settings.walkthroughMenuResponses.length > 0) {
        const response = settings.walkthroughMenuResponses.shift();
        console.log("Using response: " + response);
        console.log("settings.walkthroughMenuResponses.length: " + settings.walkthroughMenuResponses.length);
        (io as any).menuResponse(response);
        return;
    }
    (io as any).disable(allowText ? 2 : 3);
    msg(title, {}, 'menu-title');
    displayFunction(options);
};
// The output system is quite complicated...
// https://github.com/ThePix/QuestJS/wiki/The-Output-Queue
(io as any).outputQueue = [];
(io as any).outputSuspended = false;
// Stops the current pause immediately (no effect if not paused)
(io as any).unpause = function () {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.continue').remove();
    (io as any).outputSuspended = false;
    (io as any).outputFromQueue();
    if (settings.textInput)
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#textbox').focus();
};
(io as any).addToOutputQueue = function (data: any) {
    data.id = io.nextid;
    (io as any).outputQueue.push(data);
    io.nextid++;
    (io as any).outputFromQueue();
};
(io as any).forceOutputFromQueue = function () {
    (io as any).outputSuspended = false;
    (io as any).outputFromQueue();
};
(io as any).outputFromQueue = function () {
    if ((io as any).outputSuspended)
        return;
    if ((io as any).outputQueue.length === 0) {
        (io as any).enable();
        return;
    }
    //if (settings.textInput) $('#input').show()
    const data = (io as any).outputQueue.shift();
    if (data.action === 'wait') {
        (io as any).disable();
        (io as any).outputSuspended = true;
        //if (settings.textInput) $('#input').hide()
        data.tag = 'p';
        data.onclick = "io.unpause()";
        if (!data.text)
            data.text = lang.click_to_continue;
        (io as any).print(data);
    }
    if (data.action === 'delay') {
        (io as any).disable();
        (io as any).outputSuspended = true;
        if (data.text) {
            data.tag = 'p';
            (io as any).print(data);
        }
        setTimeout((io as any).unpause, data.delay * 1000);
    }
    if (data.action === 'output') {
        const html = (io as any).print(data);
        if (io.spoken)
            (io as any).speak(html);
        if (io.transcript)
            io.scriptAppend(data);
        (io as any).outputFromQueue();
    }
    if (data.action === 'effect') {
        (io as any).disable();
        // need a way to handle spoken and transcript here
        data.effect(data);
    }
    if (data.action === 'clear') {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#output').empty();
        (io as any).outputFromQueue();
    }
    if (data.action === 'sound') {
        console.log("PLAY SOUND " + data.name);
        if (!settings.silent) {
            const el = document.getElementById(data.name);
            (el as any).currentTime = 0;
            (el as any).play();
        }
    }
    if (data.action === 'ambient') {
        console.log("PLAY AMBIENT " + data.name);
        // @ts-expect-error ts-migrate(2495) FIXME: Type 'HTMLCollectionOf<HTMLAudioElement>' is not a... Remove this comment to see the full error message
        for (let el of document.getElementsByTagName('audio'))
            el.pause();
        if (!settings.silent && data.name) {
            const el = document.getElementById(data.name);
            (el as any).currentTime = 0;
            (el as any).loop = true;
            (el as any).play();
            if (data.volume)
                (el as any).volume = data.volume / 10;
        }
    }
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    window.scrollTo(0, document.getElementById('main').scrollHeight);
};
(io as any).allowedHtmlAttrs = ['width', 'height', 'onclick', 'src', 'autoplay'];
(io as any).print = function (data: any) {
    let html;
    if (typeof data === 'string') {
        html = data;
    }
    if (data.html) {
        html = data.html;
    }
    else {
        html = '<' + data.tag + ' id="n' + data.id + '"';
        if (data.cssClass)
            html += ' class="' + data.cssClass + '"';
        for (let s of (io as any).allowedHtmlAttrs)
            if (data[s])
                html += ' ' + s + '="' + data[s] + '"';
        html += '>' + data.text + "</" + data.tag + '>';
    }
    if (data.destination) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#" + data.destination).html(html);
    }
    else {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#output").append(html);
    }
    return html;
};
(io as any).typewriterEffect = function (data: any) {
    if (!data.position) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#output").append('<' + data.tag + ' id="n' + data.id + '" class=\"typewriter\"></' + data.tag + '>');
        data.position = 0;
        data.text = processText(data.text, data.params);
    }
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const el = $('#n' + data.id);
    el.html(data.text.slice(0, data.position) + "<span class=\"typewriter-active\">" + data.text.slice(data.position, data.position + 1) + "</span>");
    data.position++;
    if (data.position <= data.text.length) {
        (io as any).outputQueue.unshift(data);
        (io as any).outputSuspended = true;
    }
    setTimeout((io as any).forceOutputFromQueue, settings.textEffectDelay);
};
(io as any).unscrambleEffect = function (data: any) {
    // Set up the system
    if (!data.count) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#output").append('<' + data.tag + ' id="n' + data.id + '" class="typewriter"></' + data.tag + '>');
        data.count = 0;
        data.text = processText(data.text, data.params);
        if (!data.pick)
            data.pick = (io as any).unscamblePick;
        data.mask = '';
        data.scrambled = '';
        for (let i = 0; i < data.text.length; i++) {
            if (data.text.charAt(i) === ' ' && !data.incSpaces) {
                data.scrambled += ' ';
                data.mask += ' ';
            }
            else {
                data.scrambled += data.pick(i);
                data.mask += 'x';
                data.count++;
            }
        }
    }
    if (data.randomPlacing) {
        let pos = (random as any).int(0, data.count - 1);
        let newMask = '';
        for (let i = 0; i < data.mask.length; i++) {
            if (data.mask.charAt(i) === ' ') {
                newMask += ' ';
            }
            else if (pos === 0) {
                newMask += ' ';
                pos--;
            }
            else {
                newMask += 'x';
                pos--;
            }
        }
        data.mask = newMask;
    }
    else {
        data.mask = data.mask.replace('x', ' ');
    }
    data.count--;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $("#n" + data.id).html((io as any).unscambleScramble(data));
    if (data.count > 0) {
        (io as any).outputQueue.unshift(data);
        (io as any).outputSuspended = true;
    }
    setTimeout((io as any).forceOutputFromQueue, settings.textEffectDelay);
};
(io as any).unscamblePick = function () {
    let c = String.fromCharCode((random as any).int(33, 125));
    return c === '<' ? '~' : c;
};
(io as any).unscambleScramble = function (data: any) {
    let s = '';
    for (let i = 0; i < data.text.length; i++) {
        s += (data.mask.charAt(i) === ' ' ? data.text.charAt(i) : data.pick(i));
    }
    return s;
};
(io as any).cmdlink = function (command: any, str: any) {
    return `<a class="cmd-link" onclick="parser.parse('${command}')">${str}</a>`;
};
(io as any).scrollToEnd = function () {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    window.scrollTo(0, document.getElementById('main').scrollHeight);
};
(io as any).setTitleAndInit = function (s: any) {
    document.title = s;
    for (let o of io.modulesToInit) {
        (o as any).init();
    }
    (io as any).calcMargins();
};
(io as any).calcMargins = function () {
    //How much space do we need for images and map?
    let mapImageWidth = 0;
    if (typeof map !== 'undefined') {
        if (!(settings as any).hideMap)
            mapImageWidth = (settings as any).mapWidth;
    }
    if (typeof imagePane !== 'undefined') {
        if (!(settings as any).hideImagePane && (settings as any).imageWidth > mapImageWidth)
            mapImageWidth = (settings as any).imageWidth;
    }
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#main').css('margin-left', '40px');
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#main').css('margin-right', '40px');
    // Do we show the side panes?
    if (settings.panes !== 'none') {
        const margin = settings.panes === 'left' ? 'margin-left' : 'margin-right';
        if ((io as any).resizePanesListener.matches) { // If media query matches
            // hide sidepane
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#main').css(margin, ((io as any).mainGutter) + 'px');
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#panes').css('display', 'none');
        }
        else {
            // show sidepane
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#main').css(margin, ((io as any).panesWidth + (io as any).mainGutter) + 'px');
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#panes').css('display', 'block');
        }
    }
    let margin = settings.panes === 'right' ? 'margin-left' : 'margin-right';
    if ((settings as any).mapImageSide)
        margin = (settings as any).mapImageSide === 'left' ? 'margin-left' : 'margin-right';
    if ((io as any).resizeMapImageListener.matches) { // If media query matches
        // hide image
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#main').css(margin, ((io as any).mainGutter) + 'px');
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#quest-image').css('display', 'none');
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#quest-map').css('display', 'none');
    }
    else {
        // show image
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#main').css(margin, (mapImageWidth + (io as any).mainGutter) + 'px');
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#quest-image').css('display', 'block');
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#quest-map').css('display', 'block');
    }
};
(io as any).mainGutter = 20;
(io as any).panesWidth = 160;
(io as any).resizePanesListener = window.matchMedia('(max-width: ' + settings.panesCollapseAt + 'px)');
(io as any).resizeMapImageListener = window.matchMedia('(max-width: ' + settings.mapAndImageCollapseAt + 'px)');
(io as any).resizePanesListener.addListener((io as any).calcMargins); // Attach listener function on state changes
(io as any).resizeMapImageListener.addListener((io as any).calcMargins); // Attach listener function on state changes
// 0: not disabled at all
// 1: disable until output is done
// 2: awaiting special input, eg from menu, including text
// 3: awaiting special input, eg from menu, excluding text
(io as any).disableLevel = 0;
(io as any).disable = function (level: any) {
    if (!level)
        level = 1;
    if (level <= (io as any).disableLevel)
        return;
    (io as any).disableLevel = level;
    if (level !== 2)
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#input').hide();
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.compass-button .dark-body').css('color', '#808080');
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.item').css('color', '#808080');
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.item-action').css('color', '#808080');
};
(io as any).enable = function (level: any) {
    //console.log('enable ' + level + ' (' + io.disableLevel + ')')
    if (!level)
        level = 1;
    if (!(io as any).disableLevel || level < (io as any).disableLevel)
        return;
    (io as any).disableLevel = 0;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#input').show();
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.compass-button').css('color', (io as any).textColour);
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.item').css('color', (io as any).textColour);
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.item-action').css('color', (io as any).textColour);
};
(io as any).updateUIItems = function () {
    if (settings.panes === 'none' || !(settings as any).inventoryPane) {
        return;
    }
    for (let inv of (settings as any).inventoryPane) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#' + inv.alt).empty();
    }
    io.currentItemList = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const item = w[key];
        for (let inv of (settings as any).inventoryPane) {
            const loc = inv.getLoc();
            if (inv.test(item) && !item.inventorySkip) {
                (io as any).appendItem(item, inv.alt, loc);
            }
        }
    }
    (io as any).clickItem('');
};
(io as any).updateStatus = function () {
    if (settings.statusPane) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#status-pane").empty();
        for (let st of settings.status) {
            if (typeof st === "string") {
                if ((game as any).player[st] !== undefined) {
                    let s = '<tr><td width="' + settings.statusWidthLeft + '">' + sentenceCase(st) + "</td>";
                    s += '<td width="' + settings.statusWidthRight + '">' + (game as any).player[st] + "</td></tr>";
                    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                    $("#status-pane").append(s);
                }
            }
            else if (typeof st === "function") {
                // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                $("#status-pane").append("<tr>" + st() + "</tr>");
            }
        }
    }
    if ((settings as any).toolbar) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#toolbar").remove();
        createToolbar();
    }
};
(io as any).menuResponse = function (n: any) {
    if (typeof n === 'string' && n.match(/^\d+$/))
        n = parseInt(n) - 1;
    if (typeof n === 'string') {
        const s = n;
        n = (io as any).menuOptions.findIndex((el: any) => {
            console.log(el);
            if (typeof el === 'string')
                return el.includes(s);
            return el.name.includes(s);
        });
    }
    (io as any).enable(5);
    (parser as any).overrideWith();
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#input').css('world.', "block");
    for (let i = (io as any).menuStartId; i < io.nextid; i++)
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#n' + i).remove();
    if (n === undefined) {
        (io as any).menuFn();
    }
    else if (n !== -1) {
        if (io.transcript)
            io.scriptAppend({ cssClass: 'menu', text: ((io as any).menuOptions[n].alias ? (io as any).menuOptions[n].alias : (io as any).menuOptions[n]), n: n });
        (io as any).menuFn((io as any).menuOptions[n]);
    }
    endTurnUI(true);
    if (settings.textInput)
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#textbox').focus();
};
(io as any).clickExit = function (dir: any) {
    if ((io as any).disableLevel)
        return;
    let failed = false;
    (io as any).msgInputText(dir);
    let cmd = (io as any).getCommand("Go" + sentenceCase(dir));
    if (!cmd)
        cmd = (io as any).getCommand(sentenceCase(dir));
    if (!cmd)
        cmd = (io as any).getCommand("Meta" + sentenceCase(dir));
    (parser as any).quickCmd(cmd);
};
(io as any).clickItem = function (itemName: any) {
    if ((io as any).disableLevel)
        return;
    for (let item of io.currentItemList) {
        if (item === itemName) {
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('.' + item + '-actions').toggle();
        }
        else {
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('.' + item + '-actions').hide();
        }
    }
};
(io as any).clickItemAction = function (itemName: any, action: any) {
    if ((io as any).disableLevel)
        return;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const item = w[itemName];
    const cmd = action.includes('%') ? action.replace('%', item.alias) : action + ' ' + item.alias;
    (io as any).msgInputText(cmd);
    (parser as any).parse(cmd);
};
// Add the item to the DIV named htmlDiv
// The item will be given verbs from its attName attribute
(io as any).appendItem = function (item: any, htmlDiv: any, loc: any, isSubItem: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#' + htmlDiv).append('<div id="' + item.name + '-item"><p class="item' + (isSubItem ? ' sub-item' : '') + '" onclick="io.clickItem(\'' + item.name + '\')">' + (io as any).getIcon(item) + item.getListAlias(loc) + "</p></div>");
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
    io.currentItemList.push(item.name);
    const verbList = item.getVerbs(loc);
    if (verbList === undefined) {
        errormsg("No verbs for " + item.name);
        console.log(item);
    }
    for (let verb of verbList) {
        if (typeof verb === 'string')
            verb = { name: verb, action: verb };
        let s = '<div class="' + item.name + '-actions item-action" onclick="io.clickItemAction(\'' + item.name + '\', \'' + verb.action + '\')">';
        s += verb.name;
        s += '</div>';
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#' + htmlDiv).append(s);
    }
    if (item.container && !item.closed) {
        if (typeof item.getContents !== 'function') {
            console.log("item flagged as container but no getContents function:");
            console.log(item);
        }
        const l = item.getContents(world.SIDE_PANE);
        for (let el of l) {
            (io as any).appendItem(el, htmlDiv, item.name, true);
        }
    }
};
// Creates the panes on the left or right
// Should only be called once, when the page is first built
(io as any).createPanes = function () {
    if (!['right', 'left', 'none'].includes(settings.panes)) {
        console.error('ERROR: Your settings.panes value is "' + settings.panes + '". It must be one of "right", "left" or "none" (all lower-case). It is probably set in the file setiings.js.');
        return;
    }
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#input').html('<span id="cursor">' + settings.cursor + '</span><input type="text" name="textbox" id="textbox"  autofocus/>');
    if (settings.panes === 'none') {
        return;
    }
    document.writeln('<div id="panes" class="side-panes side-panes' + settings.panes + ' panes-narrow">');
    if (settings.compassPane) {
        document.writeln('<div class="pane-div">');
        document.writeln('<table id="compass-table">');
        for (let i = 0; i < 3; i++) {
            document.writeln('<tr>');
            (io as any).writeExit(0 + 5 * i);
            (io as any).writeExit(1 + 5 * i);
            (io as any).writeExit(2 + 5 * i);
            document.writeln('<td></td>');
            (io as any).writeExit(3 + 5 * i);
            (io as any).writeExit(4 + 5 * i);
            document.writeln('</tr>');
        }
        document.writeln('</table>');
        document.writeln('</div>');
    }
    if (settings.statusPane) {
        document.writeln('<div class="pane-div">');
        document.writeln('<h4 class="side-pane-heading">' + settings.statusPane + '</h4>');
        document.writeln('<table id="status-pane">');
        document.writeln('</table>');
        document.writeln('</div>');
    }
    if ((settings as any).inventoryPane) {
        for (let inv of (settings as any).inventoryPane) {
            document.writeln('<div class="pane-div">');
            document.writeln('<h4 class="side-pane-heading">' + inv.name + '</h4>');
            document.writeln('<div id="' + inv.alt + '">');
            document.writeln('</div>');
            document.writeln('</div>');
        }
    }
    document.writeln('<div class="pane-div-finished">');
    document.writeln(lang.game_over_html);
    document.writeln('</div>');
    document.writeln('</div>');
    if ((settings as any).customUI)
        (settings as any).customUI();
};
(io as any).writeExit = function (n: any) {
    document.write('<td class="compass-button" title="' + lang.exit_list[n].name + '">');
    document.write('<span class="compass-button" id="exit-' + lang.exit_list[n].name);
    document.write('" onclick="io.clickExit(\'' + lang.exit_list[n].name + '\')">');
    document.write((settings as any).symbolsForCompass ? (io as any).displayIconsCompass(lang.exit_list[n]) : lang.exit_list[n].abbrev);
    document.write('</span></td>');
};
// Gets the command with the given name
(io as any).getCommand = function (name: any) {
    const found = commands.find(function (el) {
        return el.name === name;
    });
    return found;
};
(io as any).msgInputText = function (s: any) {
    if (!settings.cmdEcho || s === '')
        return;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $("#output").append('<p id="n' + io.nextid + '" class="input-text">&gt; ' + s + "</p>");
    io.nextid++;
    if (io.spoken)
        (io as any).speak(s, true);
    if (io.transcript)
        io.scriptAppend({ cssClass: 'input', text: s });
};
(io as any).savedCommands = ['help'];
(io as any).savedCommandsPos = 0;
// @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
$(document).ready(function () {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#textbox').keydown(function (event: any) {
        const keycode = (event.keyCode ? event.keyCode : event.which);
        for (let exit of lang.exit_list) {
            if (exit.key && exit.key === keycode) {
                (io as any).msgInputText(exit.name);
                (parser as any).parse(exit.name);
                // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                $('#textbox').val('');
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        }
        if (keycode === 13) {
            // enter
            if (event.ctrlKey && ((settings as any).playMode === 'dev' || (settings as any).playMode === 'beta')) {
                (parser as any).parse("script show");
            }
            else {
                // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                const s = $('#textbox').val();
                (io as any).msgInputText(s);
                if (s) {
                    if ((io as any).savedCommands[(io as any).savedCommands.length - 1] !== s) {
                        (io as any).savedCommands.push(s);
                    }
                    (io as any).savedCommandsPos = (io as any).savedCommands.length;
                    (parser as any).parse(s);
                    if ((io as any).doNotEraseLastCommand) {
                        (io as any).doNotEraseLastCommand = false;
                    }
                    else {
                        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                        $('#textbox').val('');
                    }
                }
            }
        }
        if (keycode === 38) {
            // up arrow
            (io as any).savedCommandsPos -= 1;
            if ((io as any).savedCommandsPos < 0) {
                (io as any).savedCommandsPos = 0;
            }
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#textbox').val((io as any).savedCommands[(io as any).savedCommandsPos]);
            // Get cursor to end of text
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            const el = $('#textbox')[0];
            if (el.setSelectionRange) {
                setTimeout(function () { el.setSelectionRange(9999, 9999); }, 0);
            }
            else if (typeof el.selectionStart == "number") {
                el.selectionStart = el.selectionEnd = el.value.length;
            }
            else if (typeof el.createTextRange != "undefined") {
                el.focus();
                var range = el.createTextRange();
                range.collapse(false);
                range.select();
            }
        }
        if (keycode === 40) {
            // down arrow
            (io as any).savedCommandsPos += 1;
            if ((io as any).savedCommandsPos >= (io as any).savedCommands.length) {
                (io as any).savedCommandsPos = (io as any).savedCommands.length - 1;
            }
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#textbox').val((io as any).savedCommands[(io as any).savedCommandsPos]);
        }
        if (keycode === 27) {
            // ESC
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#textbox').val('');
        }
        if (keycode === 96 && ((settings as any).playMode === 'dev' || (settings as any).playMode === 'beta')) {
            if (event.ctrlKey && event.altKey) {
                (parser as any).parse("wt b");
            }
            else if (event.altKey) {
                (parser as any).parse("wt a");
            }
            else if (event.ctrlKey) {
                (parser as any).parse("wt c");
            }
            else {
                (parser as any).parse("test");
            }
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            setTimeout(function () { $('#textbox').val(''); }, 1);
        }
        if (keycode === 90 && event.ctrlKey) {
            (parser as any).parse("undo");
        }
    });
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    (io as any).textColour = $(".side-panes").css("color");
    if ((settings as any).soundFiles) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        const main = $('#main');
        for (let el of (settings as any).soundFiles) {
            main.append('<audio id="' + el + '" src="' + settings.soundsFolder + el + settings.soundsFileExt + '"/>');
        }
    }
    (game as any).initialise();
    endTurnUI(true);
    (game as any).begin();
});
(io as any).synth = window.speechSynthesis;
(io as any).voice = null;
(io as any).voice2 = null;
(io as any).speak = function (str: any, altVoice: any) {
    if (!(io as any).voice) {
        (io as any).voice = (io as any).synth.getVoices().find(function (el: any) {
            return /UK/.test(el.name) && /Female/.test(el.name);
        });
        if (!(io as any).voice)
            (io as any).voice = (io as any).synth.getVoices()[0];
    }
    if (!(io as any).voice2) {
        (io as any).voice2 = (io as any).synth.getVoices().find(function (el: any) {
            return /UK/.test(el.name) && /Male/.test(el.name);
        });
        if (!(io as any).voice2)
            (io as any).voice2 = (io as any).synth.getVoices()[0];
    }
    const utterThis = new SpeechSynthesisUtterance(str);
    utterThis.onend = function (event) {
        //console.log('SpeechSynthesisUtterance.onend');
    };
    utterThis.onerror = function (event) {
        //console.error('SpeechSynthesisUtterance.onerror: ' + event.name);
    };
    utterThis.voice = altVoice ? (io as any).voice2 : (io as any).voice;
    // I think these can vary from 0 to 2
    utterThis.pitch = 1;
    utterThis.rate = 1;
    (io as any).synth.speak(utterThis);
};
(io as any).dialogShowing = false;
//@DOC
// Appends an HTML DIV, with the given title and content,
// and shows it as a dialog. Used by the transcript
// (and really only useful for displaying data).
(io as any).showHtml = function (title: any, html: any) {
    if ((io as any).dialogShowing)
        return false;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('body').append('<div id="showHtml" title="' + title + '">' + html + '</div>');
    (io as any).dialogShowing = true;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $("#showHtml").dialog({
        width: 860,
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        close: function () { $("#showHtml").remove(); (io as any).dialogShowing = false; },
    });
    return true;
};
(io as any).finish = function () {
    (io as any).finished = true;
    settings.textInput = false;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#input').hide();
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.pane-div').hide();
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.pane-div-finished').show();
    if ((settings as any).onFinish)
        (settings as any).onFinish();
    if (io.transcriptFlag)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg("To see the transcript, click {cmd:SCRIPT SHOW:here}.");
};
(io as any).toggleDarkMode = function () {
    settings.darkModeActive = !settings.darkModeActive;
    if (settings.darkModeActive) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('body').addClass("dark-body");
    }
    else {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('body').removeClass("dark-body");
    }
    if ((settings as any).onDarkToggle)
        (settings as any).onDarkToggle();
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    (io as any).textColour = $(".side-panes").css("color");
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    msg(lang.done_msg);
    return world.SUCCESS_NO_TURNSCRIPTS;
};
(io as any).copyTextToClipboard = function (text: any) {
    // from: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    const textArea = document.createElement("textarea");
    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string'.
    textArea.style.top = 0;
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string'.
    textArea.style.left = 0;
    // Styling just in case it gets displayed to make is as unobstrusive as possible
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string'.
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg('Copying text command was ' + (successful ? 'successful' : 'unsuccessful'));
    }
    catch (err) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
};
(io as any).addSlider = function (id: any, values: any, func: any) {
    if (!(settings as any).sliders)
        (settings as any).sliders = {};
    const name = sentenceCase(id.replace('-', ' '));
    const max = typeof values === 'number' ? values : values.length - 1;
    (settings as any).sliders[id] = { name: name, max: max, func: func };
    if (typeof values !== 'number')
        (settings as any).sliders[id].values = values;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const slider = $('#' + id);
    slider.append('<p id="' + id + '-text">' + name + ': ' + (typeof values === 'number' ? 0 : values[0]) + '</p>');
    if (func)
        func(0);
    slider.append('<div id="' + id + '-slider"></div>');
    slider.css('padding-left', '10px');
    slider.css('padding-right', '10px');
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#' + id + '-slider').slider({ max: max });
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#' + id + '-slider').slider({
        slide: function (event: any, ui: any) {
            const id = event.target.id.replace('-slider', '');
            const value = ui.value;
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#' + id + '-text').html((settings as any).sliders[id].name + ': ' + ((settings as any).sliders[id].values ? (settings as any).sliders[id].values[value] : value));
            if ((settings as any).sliders[id].func) {
                (settings as any).sliders[id].func(value);
            }
            else {
                // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                $('#' + id + '-text').html((settings as any).sliders[id].name + ': ' + ((settings as any).sliders[id].values ? (settings as any).sliders[id].values[value] : value));
            }
        }
    });
};
(io as any).getIcon = function (item: any) {
    // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
    if (settings.iconsFolder === false)
        return '';
    if (!item.icon)
        return '';
    if (item.icon() === '')
        return '';
    return '<img src="' + settings.iconsFolder + (settings.darkModeActive ? 'l_' : 'd_') + item.icon() + '.png" />';
};
(io as any).againOrOops = function (isAgain: any) {
    if ((io as any).savedCommands.length === 0) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg(lang.again_not_available);
        return world.FAILED;
    }
    (io as any).savedCommands.pop(); // do not save AGAIN/OOPS
    if (isAgain) {
        (parser as any).parse((io as any).savedCommands[(io as any).savedCommands.length - 1]);
    }
    else {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#textbox').val((io as any).savedCommands[(io as any).savedCommands.length - 1]);
        (io as any).doNotEraseLastCommand = true;
    }
    return world.SUCCESS_NO_TURNSCRIPTS;
};
// Display Icons for compas
(io as any).displayIconsCompass = function (exit: any) {
    const datatransform = exit.rotate ? ' style="transform: rotate(40deg)"' : '';
    return '<i class="fas ' + exit.symbol + '"' + datatransform + '></i>';
};
