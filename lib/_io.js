const { QuestJs, $ } = window;

// ============  Output  =======================================

// @DOC
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
// @UNDOC

/*
tag   required
action  required
cssClass
printBlank
*/

function _msg(s, params, options) {
  if (options.tag === undefined) options.tag = 'p';
  if (options.cssClass === undefined) options.cssClass = `default-${options.tag.toLowerCase()}`;
  const processed = params
    ? QuestJs._text.processText(s, params).trim()
    : s.trim();
  if (processed === '' && !options.printBlank) return;

  if (QuestJs._test.testing) {
    QuestJs._test.testOutput.push(processed);
    return;
  }
  const lines = processed.split('|');
  for (const line of lines) {
    // can add effects
    const data = options;
    data.text = line;
    if (!data.action) data.action = 'output';
    QuestJs._IO.addToOutputQueue(data);
  }
}
QuestJs._io._msg = _msg;

// @DOC
// Adds the given string to the print queue.
// This allows you to add any HTML you want to the output queue.
function rawPrint(s) {
  _msg(s, {}, {});
}

// @DOC
// Output a standard message, as an HTML paragraph element (P).
// The string will first be passed through the text processor.
// Additional data can be put in the optional params dictionary.
// You can specify a CSS class to use.
// During unit testing, messages will be saved and tested
function msg(s, params, cssClass) {
  // if (!params) params = {}
  const lines = s.split('|');
  for (let line of lines) {
    const tag = /^#/.test(line) ? 'h4' : 'p';
    line = line.replace(/^#/, '');
    _msg(line, params || {}, { cssClass, tag });
  }
}

QuestJs._io.msg = msg;

// @DOC
// As `msg`, but the string is presented as an HTML heading (H1 to H6).
// The level of the heading is determined by `level`, with 1 being the top, and 6 the bottom.
// Headings are ignored during unit testing.
function msgBlankLine() {
  _msg('', false, { tag: 'p', printBlank: true });
}

// @DOC
// As `msg`, but handles an array of strings. Each string is put in its own HTML paragraph,
// and the set is put in an HTML division (DIV). The cssClass is applied to the division.
function msgDiv(arr, params, cssClass) {
  let s = '';
  for (const item of arr) {
    s += `  <p>${item}</p>\n`;
  }
  _msg(s, params || {}, { cssClass, tag: 'div' });
}

// @DOC
// As `msg`, but handles an array of strings in a list. Each string is put in its own HTML list item (LI),
// and the set is put in an HTML order list (OL) or unordered list (UL), depending on the value of `ordered`.
function msgList(arr, ordered, params) {
  let s = '';
  for (const item of arr) {
    s += `  <li>${item}</li>\n`;
  }
  _msg(s, params || {}, { cssClass, tag: ordered ? '</ol>' : '</ul>' });
}

// @DOC
// As `msg`, but handles an array of arrays of strings in a list. This is laid out in an HTML table.
// If `headings` is present, this array of strings is used as the column headings.
function msgTable(arr, headings, params) {
  let s = '';
  if (headings) {
    s += '  <tr>\n';
    for (const item of headings) {
      s += `    <th>${item}</th>\n`;
    }
    s += '  </tr>\n';
  }
  for (const row of arr) {
    s += '  <tr>\n';
    for (const item of row) {
      s += `    <td>${processed}</td>\n`;
    }
    s += '  </tr>\n';
  }
  _msg(s, params || {}, { cssClass, tag: 'table' });
}

QuestJs._io.msgTable = msgTable;

// @DOC
// As `msg`, but the string is presented as an HTML heading (H1 to H6).
// The level of the heading is determined by `level`, with 1 being the top, and 6 the bottom.
// Headings are ignored during unit testing.
function msgHeading(s, level, params) {
  _msg(s, params || {}, { tag: `h${level}` });
}

QuestJs._io.msgHeading = msgHeading;

// @DOC
// Output a picture, as an HTML image element (IMG).
// If width and height are omitted, the size of the image is used.
// If height is omitted, the height will be proportional to the given width.
// The file name should include the path. For a local image, that would probably be the images folder,
// but it could be the web address of an image hosted elsewhere.
function picture(filename, width, height) {
  const src = filename.includes('/')
    ? filename
    : QuestJs._settings.imagesFolder + filename;
  _msg(
    '',
    {},
    {
      action: 'output', width, height, tag: 'img', src, printBlank: true,
    },
  );
}

QuestJs._io.picture = picture;

function image(filename, width, height) {
  const src = filename.includes('/')
    ? filename
    : QuestJs._settings.imagesFolder + filename;
  _msg(
    '',
    {},
    {
      action      : 'output',
      width,
      height,
      tag         : 'img',
      src,
      cssClass    : 'centred',
      printBlank  : true,
      destination : 'quest-image',
    },
  );
}

// @DOC
// Plays a sound. The filename must include the extension, and the file should be in the folder specified by audioFolder (defaults to the game folder).
function sound(filename) {
  // QuestJs._log.info(QuestJs._settings.ssFolder)
  _msg(
    'Your browser does not support the <code>audio</code> element.',
    {},
    { action: 'sound', name: filename },
  );
}

QuestJs._io.sound = sound;

function ambient(filename, volume) {
  // QuestJs._log.info(QuestJs._settings.ssFolder)
  _msg(
    'Your browser does not support the <code>audio</code> element.',
    {},
    { action: 'ambient', name: filename, volume },
  );
}

QuestJs._io.ambient = ambient;

// @DOC
// Plays a video. The filename must include the extension, and the file should be in the folder specified by audioFolder (defaults to the game folder).
// There are some issues about codecs and formats; use at your discretion.
function video(filename) {
  // QuestJs._log.info(QuestJs._settings.ssFolder)
  _msg(
    'Your browser does not support the <code>video</code> element.',
    {},
    {
      action   : 'output',
      autoplay : true,
      tag      : 'video',
      src      : `${QuestJs._settings.videoFolder}/${filename}`,
    },
  );
}

// @DOC
// Draw an image in the main window, embedded in the text.
// This uses SVG, which is a standard web drawing system.
// The first and second parameters are the width and height of the image.
// The third parameter is an array of strings, each element being an SVG primitive.
// The image will be added to the output queue in the same way text is.
function draw(width, height, data, options) {
  if (!options) options = {};
  // QuestJs._log.info(options)
  let s = `<svg width="${width}" height="${height}" viewBox="`;
  s += options.x ? `${options.x} ${options.y}` : '0 0';
  s += ` ${width} ${height}" `;
  if (options.background) s += `style="background:${options.background}" `;
  s += 'xmlns="http://www.w3.org/2000/svg">';
  s += `${data.join('')}</svg>`;
  if (QuestJs._settings.reportAllSvg) QuestJs._log.info(s.replace(/></g, '>\n<'));
  if (options.destination) {
    $(`#${options.destination}`).html(s);
  } else {
    rawPrint(s);
  }
}

QuestJs._io.draw = draw;

// @DOC
// Just the same as msg, but adds the "failed" CSS class. This allows failed command responses to be differentiated.
// Returns the value FAILED, allowing commands to give a message and give up
//     if (notAllowed) return failedmsg("That is not allowed.")
function failedmsg(s, params) {
  _msg(s, params || {}, { cssClass: 'failed', tag: 'p' });
  return QuestJs._world.FAILED;
}

QuestJs._io.failedmsg = failedmsg;

// @DOC
// Just the same as msg, but adds the "failed" CSS class. This allows failed command responses to be differentiated.
// Returns the value false, allowing commands to give a message and give up
//     if (notAllowed) return falsemsg("That is not allowed.")
function falsemsg(s, params) {
  _msg(s, params || {}, { cssClass: 'failed', tag: 'p' });
  return false;
}

QuestJs._io.falsemsg = falsemsg;

// @DOC
// Output a meta-message - a message to inform the player about something outside the game world,
// such as hints and help messages.
// The string will first be passed through the text processor.
// Additional data can be put in the optional params dictionary.
// During unit testing, messages will be saved and tested
function metamsg(s, params) {
  _msg(s, params || {}, { cssClass: 'meta', tag: 'p' });
}

QuestJs._io.metamsg = metamsg;

// @DOC
// Output a message from the parser indicating the input text could not be parsed.
// During unit testing, messages will be saved and tested.
// Does not use the text processor.
function parsermsg(s) {
  _msg(s, false, { cssClass: 'parser', tag: 'p' });
  return false;
}

QuestJs._io.parsermsg = parsermsg;

// @DOC
// Output an error message.
// Use for when something has gone wrong, but not when the player types something odd -
// if you see this during play, there is a bug in your game (or my code!), it is not the player
// to blame.
//
// This bypasses the normal output system. It will not wait for other text to be output (for example
// after wait). During unit testing, error messages will be output to screen as they occur.
// It does not use the text processor.
function errormsg(s) {
  if (QuestJs._world.isCreated) {
    QuestJs._IO.print({
      tag      : 'p',
      cssClass : 'error',
      text     : QuestJs._lang.error,
    });
  }
  QuestJs._log.error(`ERROR: ${s}`);
  QuestJs._log.info(
    'Look through the trace below to find the offending code. The first entry in the list will be "errormsg", which is me, the next will the code that detected the error and called the "errormsg" message. You may need to look further down to find the root cause. If you get to the "jquery" lines you have gone too far.',
  );
  console.trace();
  return false;
}

QuestJs._io.errormsg = errormsg;

// @DOC
// Output a debug message.
// Debug messages are ignored if DEBUG is false.
// You should also consider using `QuestJs._log.info` when debugging; it gives a message in the console,
// and outputs objects and array far better.
//
// This bypasses the normal output system. It will not wait for other text to be output (for example
// after wait). During unit testing, error messages will be output to screen as they occur.
// It does not use the text processor.
function debugmsg(s) {
  if (
    QuestJs._settings.playMode === 'dev'
    || QuestJs._settings.playMode === 'meta'
  ) {
    QuestJs._IO.print({ tag: 'p', cssClass: 'debug', text: s });
  }
}

QuestJs._io.debugmsg = debugmsg;

// @DOC
// Clears the screen.
function clearScreen() {
  // QuestJs._IO.outputQueue.push({action:'clear'})
  QuestJs._IO.addToOutputQueue({ action: 'clear' });
}

QuestJs._io.clearScreen = clearScreen;

// @DOC
// Stops outputting whilst waiting for the player to click.
function wait(delay, text) {
  if (QuestJs._test.testing) return;
  if (delay === undefined) {
    QuestJs._IO.addToOutputQueue({
      action   : 'wait',
      text,
      cssClass : 'continue',
    });
  } else {
    QuestJs._IO.addToOutputQueue({
      action   : 'delay',
      delay,
      text,
      cssClass : 'continue',
    });
  }
}

QuestJs._io.wait = wait;

function askQuestion(title, fn) {
  msg(title);
  QuestJs._parser.overrideWith(fn);
}

QuestJs._io.askQuestion = askQuestion;

// @DOC
// Use like this:
//      showMenu('What is your favourite color?', ['Blue', 'Red', 'Yellow', 'Pink'], function(result) {
//        msg("You picked " + result + ".");
//      });
function showMenu(title, options, fn) {
  const opts = { article: QuestJs._consts.DEFINITE, capital: true };
  QuestJs._IO.input(title, options, false, fn, (options) => {
    for (let i = 0; i < options.length; i += 1) {
      let s = `<a class="menu-option" onclick="QuestJs._IO.menuResponse(${i})">`;
      s
        += typeof options[i] === 'string'
          ? options[i]
          : QuestJs._lang.getName(options[i], opts);
      s += '</a>';
      msg(s);
    }
  });
}

QuestJs._io.showMenu = showMenu;

function showMenuWithNumbers(title, options, fn) {
  const opts = { article: QuestJs._consts.DEFINITE, capital: true };
  QuestJs._parser.overrideWith((s) => {
    QuestJs._IO.menuResponse(s);
  });
  QuestJs._IO.input(title, options, true, fn, (options) => {
    for (let i = 0; i < options.length; i += 1) {
      let s = `${
        i + 1
      }. <a class="menu-option" onclick="QuestJs._IO.menuResponse(${i})">`;
      s
        += typeof options[i] === 'string'
          ? options[i]
          : QuestJs._lang.getName(options[i], opts);
      s += '</a>';
      msg(s);
    }
  });
}

QuestJs._io.showMenuWithNumbers = showMenuWithNumbers;

function showDropDown(title, options, fn) {
  const opts = { article: QuestJs._consts.DEFINITE, capital: true };
  QuestJs._IO.input(title, options, false, fn, (options) => {
    let s = '<select id="menu-select" class="custom-select" style="width:400px;" ';
    s
      += "onchange=\"QuestJs._IO.menuResponse($('#menu-select').find(':selected').val())\">";
    s += '<option value="-1"> -= 1 Select one  -= 1</option>';
    for (let i = 0; i < options.length; i += 1) {
      s += `<option value="${i}">`;
      s
        += typeof options[i] === 'string'
          ? options[i]
          : QuestJs._lang.getName(options[i], opts);
      s += '</option>';
    }
    msg(`${s}</select>`);
    // $('#menu-select').selectmenu();
    $('#menu-select').focus();
  });
}

QuestJs._io.showDropDown = showDropDown;

function showYesNoMenu(title, fn) {
  showMenu(title, QuestJs._lang.yesNo, fn);
}

QuestJs._io.showYesNoMenu = showYesNoMenu;

function showYesNoMenuWithNumbers(title, fn) {
  showMenuWithNumbers(title, QuestJs._lang.yesNo, fn);
}

function showYesNoDropDown(title, fn) {
  showDropDown(title, QuestJs._lang.yesNo, fn);
}

// This should be called after each turn to ensure we are at the end of the page and the text box has the focus
function endTurnUI(update) {
  if (QuestJs._settings.panes !== 'none' && update) {
    // set the QuestJs._lang.exit_list
    for (const exit of QuestJs._lang.exit_list) {
      if (
        QuestJs._game.room.hasExit(exit.name, { excludeScenery: true })
        || exit.type === 'nocmd'
      ) {
        $(`#exit-${exit.name}`).show();
      } else {
        $(`#exit-${exit.name}`).hide();
      }
    }
    QuestJs._IO.updateStatus();
    if (QuestJs._settings.updateCustomUI) QuestJs._settings.updateCustomUI();
  }
  for (const o of QuestJs._IO.modulesToUpdate) {
    o.update(update);
  }
  QuestJs._IO.updateUIItems();

  // scroll to end
  setTimeout(QuestJs._IO.scrollToEnd, 1);
  // give focus to command bar
  if (QuestJs._settings.textInput) {
    $('#textbox').focus();
  }
}

QuestJs._io.endTurnUI = endTurnUI;

function createPaneBox(position, title, content) {
  $(`div.pane-div:nth-child(${position})`).before(
    `<div class="pane-div"><h4 class="side-pane-heading">${title}</h4><div class="">${content}</div></div>`,
  );
}

QuestJs._io.createPaneBox = createPaneBox;

// Create Toolbar
function createToolbar() {
  let html = '';
  html += '<div class="toolbar button" id="toolbar">';
  html += '<div class="status">';
  if (QuestJs._settings.toolbar.content) html += ` <div>${QuestJs._settings.toolbar.content()}</div>`;
  html += '</div>';

  html += '<div class="room">';
  if (QuestJs._settings.toolbar.roomdisplay) {
    html += ` <div>${QuestJs._tools.sentenceCase(
      QuestJs._lang.getName(QuestJs._w[QuestJs._game.player.loc], {
        article: QuestJs._consts.DEFINITE,
      }),
    )}</div>`;
  }
  html += '</div>';

  html += '<div class="links">';
  for (const link of QuestJs._settings.toolbar.buttons) {
    const js = link.cmd ? `QuestJs._tools.runCmd('${link.cmd}')` : link.onclick;
    html += ` <a class="link" onclick="${js}"><i class="fas ${link.icon}" title="${link.title}"></i></a>`;
  }
  html += '</div>';
  html += '</div>';

  $('#output').before(html);
}

// ============  Hidden from creators!  =======================================

// Each line that is output is given an id, n plus an id number.
QuestJs._IO.nextid = 0;
// A list of names for items currently world. in the inventory panes
QuestJs._IO.currentItemList = [];

QuestJs._IO.modulesToUpdate = [];
QuestJs._IO.modulesToInit = [];
QuestJs._IO.spoken = false;

// TRANSCRIPT SUPPORT
QuestJs._IO.transcript = false;
QuestJs._IO.transcriptFlag = false;
QuestJs._IO.transcriptText = [];
QuestJs._IO.scriptStart = function () {
  this.transcript = true;
  this.transcriptFlag = true;
  metamsg('Transcript is now on.');
};

QuestJs._IO.scriptEnd = function () {
  metamsg('Transcript is now off.');
  this.transcript = false;
};
QuestJs._IO.scriptShow = function (opts) {
  if (opts === undefined) opts = '';
  if (opts === 'w') {
    const lines = [];
    for (const el of this.transcriptText) {
      if (el.cssClass === 'input' && !el.text.match(/^(tran)?script/)) {
        lines.push(`    "${el.text}",`);
      }
      if (el.cssClass === 'menu') {
        const previous = lines.pop();
        if (typeof previous === 'string') {
          const d = {};
          d.cmd = /^ +\"(.+)\"/.exec(previous)[1];
          d.menu = [parseInt(el.n)];
          lines.push(d);
        } else {
          previous.menu.push(parseInt(el.n));
          lines.push(previous);
        }
      }
    }
    QuestJs._log.info(lines);
    const wt = lines
      .map((el) => (typeof el === 'string' ? el : `    ${JSON.stringify(el)},`))
      .join('\n');
    QuestJs._IO.copyTextToClipboard(`  recorded:[\n${wt}\n  ],\n`);
  } else {
    let html = '';
    html
        += '<!DOCTYPE html><html QuestJs._lang="en"><head><meta charset="utf-8"/><title>Quest 6 Transcript for ';
    html += QuestJs._settings.title;
    html += '</title></head><body><h2>Quest 6 Transcript for "';
    html += `${QuestJs._settings.title}" (version ${QuestJs._settings.version}`;
    html += ')</h2>';
    for (const el of this.transcriptText) {
      switch (el.cssClass) {
      case 'default-p':
        html += `<p>${el.text}</p>`;
        break;
      case 'meta':
        if (!opts.includes('m')) {
          html += `<p style="color:blue">${el.text}</p>`;
        }
        break;
      case 'error':
        if (!opts.includes('e')) {
          html += `<p style="color:red">${el.text}</p>`;
        }
        break;
      case 'debug':
        if (!opts.includes('d')) {
          html += `<p style="color:grey">${el.text}</p>`;
        }
        break;
      case 'parser':
        if (!opts.includes('p')) {
          html += `<p style="color:magenta">${el.text}</p>`;
        }
        break;
      case 'input':
        if (!opts.includes('i')) {
          html += `<p style="color:cyan">${el.text}</p>`;
        }
        break;
      case 'menu':
        if (!opts.includes('o')) {
          html += `<p style="color:green">Menu option ${el.n}: ${el.text}</p>`;
        }
        break;
      case 'html':
        html += el.text;
        break;
      default:
        html += `<${el.tag}>${el.text}</${el.tag}>`;
      }
    }
    html += '</body></html>';
    const tab = window.open('about:blank', '_blank');
    tab.document.write(html);
    tab.document.close();
  }
};

QuestJs._IO.scriptClear = function () {
  this.transcriptText = [];
  metamsg('Transcript cleared.');
};

QuestJs._IO.scriptAppend = function (data) {
  this.transcriptText.push(data);
};

QuestJs._IO.input = function (
  title,
  options,
  allowText,
  reactFunction,
  displayFunction,
) {
  QuestJs._IO.menuStartId = QuestJs._IO.nextid;
  QuestJs._IO.menuFn = reactFunction;
  QuestJs._IO.menuOptions = options;

  if (QuestJs._test.testing) {
    if (QuestJs._test.menuResponseNumber === undefined) {
      debugmsg(
        `Error when testing menu (possibly due to disambiguation?), QuestJs._test.menuResponseNumber = ${QuestJs._test.menuResponseNumber}`,
      );
    } else {
      QuestJs._IO.menuResponse(QuestJs._test.menuResponseNumber);
      delete QuestJs._test.menuResponseNumber;
    }
    return;
  }

  if (QuestJs._settings.walkthroughMenuResponses.length > 0) {
    const response = QuestJs._settings.walkthroughMenuResponses.shift();
    QuestJs._log.info(`Using response: ${response}`);
    QuestJs._log.info(
      `QuestJs._settings.walkthroughMenuResponses.length: ${QuestJs._settings.walkthroughMenuResponses.length}`,
    );
    QuestJs._IO.menuResponse(response);
    return;
  }

  QuestJs._IO.disable(allowText ? 2 : 3);
  msg(title, {}, 'menu-title');
  displayFunction(options);
};

// The output system is quite complicated...
// https://github.com/ThePix/QuestJS/wiki/The-Output-Queue

QuestJs._IO.outputQueue = [];
QuestJs._IO.outputSuspended = false;

// Stops the current pause immediately (no effect if not paused)
QuestJs._IO.unpause = function () {
  $('.continue').remove();
  QuestJs._IO.outputSuspended = false;
  QuestJs._IO.outputFromQueue();
  if (QuestJs._settings.textInput) $('#textbox').focus();
};

QuestJs._IO.addToOutputQueue = function (data) {
  data.id = QuestJs._IO.nextid;
  QuestJs._IO.outputQueue.push(data);
  QuestJs._IO.nextid += 1;
  QuestJs._IO.outputFromQueue();
};

QuestJs._IO.forceOutputFromQueue = function () {
  QuestJs._IO.outputSuspended = false;
  QuestJs._IO.outputFromQueue();
};

QuestJs._IO.outputFromQueue = function () {
  if (QuestJs._IO.outputSuspended) return;
  if (QuestJs._IO.outputQueue.length === 0) {
    QuestJs._IO.enable();
    return;
  }

  // if (QuestJs._settings.textInput) $('#input').show()
  const data = QuestJs._IO.outputQueue.shift();
  if (data.action === 'wait') {
    QuestJs._IO.disable();
    QuestJs._IO.outputSuspended = true;
    // if (QuestJs._settings.textInput) $('#input').hide()
    data.tag = 'p';
    data.onclick = 'QuestJs._IO.unpause()';
    if (!data.text) data.text = QuestJs._lang.click_to_continue;
    QuestJs._IO.print(data);
  }
  if (data.action === 'delay') {
    QuestJs._IO.disable();
    QuestJs._IO.outputSuspended = true;
    if (data.text) {
      data.tag = 'p';
      QuestJs._IO.print(data);
    }
    setTimeout(QuestJs._IO.unpause, data.delay * 1000);
  }
  if (data.action === 'output') {
    const html = QuestJs._IO.print(data);
    if (QuestJs._IO.spoken) QuestJs._IO.speak(html);
    if (QuestJs._IO.transcript) QuestJs._IO.scriptAppend(data);
    QuestJs._IO.outputFromQueue();
  }
  if (data.action === 'effect') {
    QuestJs._IO.disable();
    // need a way to handle spoken and transcript here
    data.effect(data);
  }
  if (data.action === 'clear') {
    $('#output').empty();
    QuestJs._IO.outputFromQueue();
  }
  if (data.action === 'sound') {
    QuestJs._log.info(`PLAY SOUND ${data.name}`);
    if (!QuestJs._settings.silent) {
      const el = document.getElementById(data.name);
      el.currentTime = 0;
      el.play();
    }
  }
  if (data.action === 'ambient') {
    QuestJs._log.info(`PLAY AMBIENT ${data.name}`);
    for (const el of document.getElementsByTagName('audio')) el.pause();
    if (!QuestJs._settings.silent && data.name) {
      const el = document.getElementById(data.name);
      el.currentTime = 0;
      el.loop = true;
      el.play();
      if (data.volume) el.volume = data.volume / 10;
    }
  }

  window.scrollTo(0, document.getElementById('main').scrollHeight);
};

QuestJs._IO.allowedHtmlAttrs = [
  'width',
  'height',
  'onclick',
  'src',
  'autoplay',
];

QuestJs._IO.print = function (data) {
  let html;
  if (typeof data === 'string') {
    html = data;
  }
  if (data.html) {
    html = data.html;
  } else {
    html = `<${data.tag} id="n${data.id}"`;
    if (data.cssClass) html += ` class="${data.cssClass}"`;
    for (const s of QuestJs._IO.allowedHtmlAttrs) if (data[s]) html += ` ${s}="${data[s]}"`;
    html += `>${data.text}</${data.tag}>`;
  }
  if (data.destination) {
    $(`#${data.destination}`).html(html);
  } else {
    $('#output').append(html);
  }
  return html;
};

QuestJs._IO.typewriterEffect = function (data) {
  if (!data.position) {
    $('#output').append(
      `<${data.tag} id="n${data.id}" class="typewriter"></${data.tag}>`,
    );
    data.position = 0;
    data.text = QuestJs._text.processText(data.text, data.params);
  }
  const el = $(`#n${data.id}`);
  el.html(
    `${data.text.slice(
      0,
      data.position,
    )}<span class="typewriter-active">${data.text.slice(
      data.position,
      data.position + 1,
    )}</span>`,
  );
  data.position += 1;
  if (data.position <= data.text.length) {
    QuestJs._IO.outputQueue.unshift(data);
    QuestJs._IO.outputSuspended = true;
  }
  setTimeout(
    QuestJs._IO.forceOutputFromQueue,
    QuestJs._settings.textEffectDelay,
  );
};

QuestJs._IO.unscrambleEffect = function (data) {
  // Set up the system
  if (!data.count) {
    $('#output').append(
      `<${data.tag} id="n${data.id}" class="typewriter"></${data.tag}>`,
    );
    data.count = 0;
    data.text = QuestJs._text.processText(data.text, data.params);
    if (!data.pick) data.pick = QuestJs._IO.unscamblePick;
    data.mask = '';
    data.scrambled = '';
    for (let i = 0; i < data.text.length; i += 1) {
      if (data.text.charAt(i) === ' ' && !data.incSpaces) {
        data.scrambled += ' ';
        data.mask += ' ';
      } else {
        data.scrambled += data.pick(i);
        data.mask += 'x';
        data.count += 1;
      }
    }
  }

  if (data.randomPlacing) {
    let pos = QuestJs._random.int(0, data.count - 1);
    let newMask = '';
    for (let i = 0; i < data.mask.length; i += 1) {
      if (data.mask.charAt(i) === ' ') {
        newMask += ' ';
      } else if (pos === 0) {
        newMask += ' ';
        pos -= 1;
      } else {
        newMask += 'x';
        pos -= 1;
      }
    }
    data.mask = newMask;
  } else {
    data.mask = data.mask.replace('x', ' ');
  }
  data.count -= 1;
  $(`#n${data.id}`).html(QuestJs._IO.unscambleScramble(data));
  if (data.count > 0) {
    QuestJs._IO.outputQueue.unshift(data);
    QuestJs._IO.outputSuspended = true;
  }
  setTimeout(
    QuestJs._IO.forceOutputFromQueue,
    QuestJs._settings.textEffectDelay,
  );
};

QuestJs._IO.unscamblePick = function () {
  const c = String.fromCharCode(QuestJs._random.int(33, 125));
  return c === '<' ? '~' : c;
};

QuestJs._IO.unscambleScramble = function (data) {
  let s = '';
  for (let i = 0; i < data.text.length; i += 1) {
    s += data.mask.charAt(i) === ' ' ? data.text.charAt(i) : data.pick(i);
  }
  return s;
};

QuestJs._IO.cmdlink = function (command, str) {
  return `<a class="cmd-link" onclick="QuestJs._parser.parse('${command}')">${str}</a>`;
};

QuestJs._IO.scrollToEnd = function () {
  window.scrollTo(0, document.getElementById('main').scrollHeight);
};

QuestJs._IO.setTitleAndInit = function (s) {
  document.title = s;
  for (const o of QuestJs._IO.modulesToInit) {
    o.init();
  }
  QuestJs._IO.calcMargins();
};

QuestJs._IO.calcMargins = function () {
  // How much space do we need for images and map?
  let mapImageWidth = 0;
  if (typeof map !== 'undefined') {
    if (!QuestJs._settings.hideMap) mapImageWidth = QuestJs._settings.mapWidth;
  }
  if (typeof imagePane !== 'undefined') {
    if (
      !QuestJs._settings.hideImagePane
      && QuestJs._settings.imageWidth > mapImageWidth
    ) mapImageWidth = QuestJs._settings.imageWidth;
  }

  $('#main').css('margin-left', '40px');
  $('#main').css('margin-right', '40px');

  // Do we show the side panes?
  if (QuestJs._settings.panes !== 'none') {
    const margin = QuestJs._settings.panes === 'left' ? 'margin-left' : 'margin-right';
    if (QuestJs._IO.resizePanesListener.matches) {
      // If media query matches
      // hide sidepane
      $('#main').css(margin, `${QuestJs._IO.mainGutter}px`);
      $('#panes').css('display', 'none');
    } else {
      // show sidepane
      $('#main').css(
        margin,
        `${QuestJs._IO.panesWidth + QuestJs._IO.mainGutter}px`,
      );
      $('#panes').css('display', 'block');
    }
  }

  let margin = QuestJs._settings.panes === 'right' ? 'margin-left' : 'margin-right';
  if (QuestJs._settings.mapImageSide) {
    margin = QuestJs._settings.mapImageSide === 'left'
      ? 'margin-left'
      : 'margin-right';
  }
  if (QuestJs._IO.resizeMapImageListener.matches) {
    // If media query matches
    // hide image
    $('#main').css(margin, `${QuestJs._IO.mainGutter}px`);
    $('#quest-image').css('display', 'none');
    $('#quest-map').css('display', 'none');
  } else {
    // show image
    $('#main').css(margin, `${mapImageWidth + QuestJs._IO.mainGutter}px`);
    $('#quest-image').css('display', 'block');
    $('#quest-map').css('display', 'block');
  }
};

QuestJs._IO.mainGutter = 20;
QuestJs._IO.panesWidth = 160;
QuestJs._IO.resizePanesListener = window.matchMedia(
  `(max-width: ${QuestJs._settings.panesCollapseAt}px)`,
);
QuestJs._IO.resizeMapImageListener = window.matchMedia(
  `(max-width: ${QuestJs._settings.mapAndImageCollapseAt}px)`,
);
QuestJs._IO.resizePanesListener.addListener(QuestJs._IO.calcMargins); // Attach listener function on state changes
QuestJs._IO.resizeMapImageListener.addListener(QuestJs._IO.calcMargins); // Attach listener function on state changes

// 0: not disabled at all
// 1: disable until output is done
// 2: awaiting special input, eg from menu, including text
// 3: awaiting special input, eg from menu, excluding text
QuestJs._IO.disableLevel = 0;

QuestJs._IO.disable = function (level) {
  if (!level) level = 1;
  if (level <= QuestJs._IO.disableLevel) return;
  QuestJs._IO.disableLevel = level;
  if (level !== 2) $('#input').hide();
  $('.compass-button .dark-body').css('color', '#808080');
  $('.item').css('color', '#808080');
  $('.item-action').css('color', '#808080');
};

QuestJs._IO.enable = function (level) {
  // QuestJs._log.info('enable ' + level + ' (' + QuestJs._IO.disableLevel + ')')
  if (!level) level = 1;
  if (!QuestJs._IO.disableLevel || level < QuestJs._IO.disableLevel) return;
  QuestJs._IO.disableLevel = 0;
  $('#input').show();
  $('.compass-button').css('color', QuestJs._IO.textColour);
  $('.item').css('color', QuestJs._IO.textColour);
  $('.item-action').css('color', QuestJs._IO.textColour);
};

QuestJs._IO.updateUIItems = function () {
  if (QuestJs._settings.panes === 'none' || !QuestJs._settings.inventoryPane) {
    return;
  }

  for (const inv of QuestJs._settings.inventoryPane) {
    $(`#${inv.alt}`).empty();
  }

  QuestJs._IO.currentItemList = [];
  for (const key in QuestJs._w) {
    const item = QuestJs._w[key];
    for (const inv of QuestJs._settings.inventoryPane) {
      const loc = inv.getLoc();
      if (inv.test(item) && !item.inventorySkip) {
        QuestJs._IO.appendItem(item, inv.alt, loc);
      }
    }
  }
  QuestJs._IO.clickItem('');
};

QuestJs._IO.updateStatus = function () {
  if (QuestJs._settings.statusPane) {
    $('#status-pane').empty();
    for (const st of QuestJs._settings.status) {
      if (typeof st === 'string') {
        if (QuestJs._game.player[st] !== undefined) {
          let s = `<tr><td width="${
            QuestJs._settings.statusWidthLeft
          }">${QuestJs._tools.sentenceCase(st)}</td>`;
          s += `<td width="${QuestJs._settings.statusWidthRight}">${QuestJs._game.player[st]}</td></tr>`;
          $('#status-pane').append(s);
        }
      } else if (typeof st === 'function') {
        $('#status-pane').append(`<tr>${st()}</tr>`);
      }
    }
  }

  if (QuestJs._settings.toolbar) {
    $('#toolbar').remove();
    createToolbar();
  }
};

QuestJs._IO.menuResponse = function (n) {
  if (typeof n === 'string' && n.match(/^\d+$/)) n = parseInt(n) - 1;
  if (typeof n === 'string') {
    const s = n;
    n = QuestJs._IO.menuOptions.findIndex((el) => {
      QuestJs._log.info(el);
      if (typeof el === 'string') return el.includes(s);
      return el.name.includes(s);
    });
  }
  QuestJs._IO.enable(5);
  QuestJs._parser.overrideWith();
  $('#input').css('world.', 'block');
  for (let i = QuestJs._IO.menuStartId; i < QuestJs._IO.nextid; i += 1) $(`#n${i}`).remove();
  if (n === undefined) {
    QuestJs._IO.menuFn();
  } else if (n !== -1) {
    if (QuestJs._IO.transcript) {
      QuestJs._IO.scriptAppend({
        cssClass : 'menu',
        text     : QuestJs._IO.menuOptions[n].alias
          ? QuestJs._IO.menuOptions[n].alias
          : QuestJs._IO.menuOptions[n],
        n,
      });
    }
    QuestJs._IO.menuFn(QuestJs._IO.menuOptions[n]);
  }
  endTurnUI(true);
  if (QuestJs._settings.textInput) $('#textbox').focus();
};

QuestJs._IO.clickExit = function (dir) {
  if (QuestJs._IO.disableLevel) return;

  const failed = false;
  QuestJs._IO.msgInputText(dir);
  let cmd = QuestJs._IO.getCommand(`Go${QuestJs._tools.sentenceCase(dir)}`);
  if (!cmd) cmd = QuestJs._IO.getCommand(QuestJs._tools.sentenceCase(dir));
  if (!cmd) cmd = QuestJs._IO.getCommand(`Meta${QuestJs._tools.sentenceCase(dir)}`);
  QuestJs._parser.quickCmd(cmd);
};

QuestJs._IO.clickItem = function (itemName) {
  if (QuestJs._IO.disableLevel) return;

  for (const item of QuestJs._IO.currentItemList) {
    if (item === itemName) {
      $(`.${item}-actions`).toggle();
    } else {
      $(`.${item}-actions`).hide();
    }
  }
};

QuestJs._IO.clickItemAction = function (itemName, action) {
  if (QuestJs._IO.disableLevel) return;
  const item = QuestJs._w[itemName];
  const cmd = action.includes('%')
    ? action.replace('%', item.alias)
    : `${action} ${item.alias}`;
  QuestJs._IO.msgInputText(cmd);
  QuestJs._parser.parse(cmd);
};

// Add the item to the DIV named htmlDiv
// The item will be given verbs from its attName attribute
QuestJs._IO.appendItem = function (item, htmlDiv, loc, isSubItem) {
  $(`#${htmlDiv}`).append(
    `<div id="${item.name}-item"><p class="item${
      isSubItem ? ' sub-item' : ''
    }" onclick="QuestJs._IO.clickItem('${item.name}')">${QuestJs._IO.getIcon(
      item,
    )}${item.getListAlias(loc)}</p></div>`,
  );
  QuestJs._IO.currentItemList.push(item.name);
  const verbList = item.getVerbs(loc);
  if (verbList === undefined) {
    errormsg(`No verbs for ${item.name}`);
    QuestJs._log.info(item);
  }
  for (let verb of verbList) {
    if (typeof verb === 'string') verb = { name: verb, action: verb };
    let s = `<div class="${item.name}-actions item-action" onclick="QuestJs._IO.clickItemAction('${item.name}', '${verb.action}')">`;
    s += verb.name;
    s += '</div>';
    $(`#${htmlDiv}`).append(s);
  }
  if (item.container && !item.closed) {
    if (typeof item.getContents !== 'function') {
      QuestJs._log.info(
        'item flagged as container but no getContents function:',
      );
      QuestJs._log.info(item);
    }
    const l = item.getContents(QuestJs._world.SIDE_PANE);
    for (const el of l) {
      QuestJs._IO.appendItem(el, htmlDiv, item.name, true);
    }
  }
};

// Creates the panes on the left or right
// Should only be called once, when the page is first built
QuestJs._IO.createPanes = function () {
  if (!['right', 'left', 'none'].includes(QuestJs._settings.panes)) {
    QuestJs._log.error(
      `ERROR: Your QuestJs._settings.panes value is "${QuestJs._settings.panes}". It must be one of "right", "left" or "none" (all lower-case). It is probably set in the file setiings.js.`,
    );
    return;
  }

  $('#input').html(
    `<span id="cursor">${QuestJs._settings.cursor}</span><input type="text" name="textbox" id="textbox"  autofocus/>`,
  );

  if (QuestJs._settings.panes === 'none') {
    return;
  }
  document.writeln(
    `<div id="panes" class="side-panes side-panes${QuestJs._settings.panes} panes-narrow">`,
  );

  if (QuestJs._settings.compassPane) {
    document.writeln('<div class="pane-div">');
    document.writeln('<table id="compass-table">');
    for (let i = 0; i < 3; i += 1) {
      document.writeln('<tr>');
      QuestJs._IO.writeExit(0 + 5 * i);
      QuestJs._IO.writeExit(1 + 5 * i);
      QuestJs._IO.writeExit(2 + 5 * i);
      document.writeln('<td></td>');
      QuestJs._IO.writeExit(3 + 5 * i);
      QuestJs._IO.writeExit(4 + 5 * i);
      document.writeln('</tr>');
    }
    document.writeln('</table>');
    document.writeln('</div>');
  }

  if (QuestJs._settings.statusPane) {
    document.writeln('<div class="pane-div">');
    document.writeln(
      `<h4 class="side-pane-heading">${QuestJs._settings.statusPane}</h4>`,
    );
    document.writeln('<table id="status-pane">');
    document.writeln('</table>');
    document.writeln('</div>');
  }

  if (QuestJs._settings.inventoryPane) {
    for (const inv of QuestJs._settings.inventoryPane) {
      document.writeln('<div class="pane-div">');
      document.writeln(`<h4 class="side-pane-heading">${inv.name}</h4>`);
      document.writeln(`<div id="${inv.alt}">`);
      document.writeln('</div>');
      document.writeln('</div>');
    }
  }

  document.writeln('<div class="pane-div-finished">');
  document.writeln(QuestJs._lang.game_over_html);
  document.writeln('</div>');
  document.writeln('</div>');

  if (QuestJs._settings.customUI) QuestJs._settings.customUI();
};

QuestJs._IO.writeExit = function (n) {
  document.write(
    `<td class="compass-button" title="${QuestJs._lang.exit_list[n].name}">`,
  );
  document.write(
    `<span class="compass-button" id="exit-${QuestJs._lang.exit_list[n].name}`,
  );
  document.write(
    `" onclick="QuestJs._IO.clickExit('${QuestJs._lang.exit_list[n].name}')">`,
  );
  document.write(
    QuestJs._settings.symbolsForCompass
      ? QuestJs._IO.displayIconsCompass(QuestJs._lang.exit_list[n])
      : QuestJs._lang.exit_list[n].abbrev,
  );
  document.write('</span></td>');
};

// Gets the command with the given name
QuestJs._IO.getCommand = function (name) {
  return QuestJs._commands.find((el) => el.name === name);
};

QuestJs._IO.msgInputText = function (s) {
  if (!QuestJs._settings.cmdEcho || s === '') return;
  $('#output').append(
    `<p id="n${QuestJs._IO.nextid}" class="input-text">&gt; ${s}</p>`,
  );
  QuestJs._IO.nextid += 1;
  if (QuestJs._IO.spoken) QuestJs._IO.speak(s, true);
  if (QuestJs._IO.transcript) QuestJs._IO.scriptAppend({ cssClass: 'input', text: s });
};

QuestJs._IO.savedCommands = ['help'];
QuestJs._IO.savedCommandsPos = 0;
$(document).ready(() => {
  $('#textbox').keydown((event) => {
    const keycode = event.keyCode ? event.keyCode : event.which;
    for (const exit of QuestJs._lang.exit_list) {
      if (exit.key && exit.key === keycode) {
        QuestJs._IO.msgInputText(exit.name);
        QuestJs._parser.parse(exit.name);
        $('#textbox').val('');
        event.stopPropagation();
        event.preventDefault();
        return false;
      }
    }
    if (keycode === 13) {
      // enter
      if (
        event.ctrlKey
        && (QuestJs._settings.playMode === 'dev'
          || QuestJs._settings.playMode === 'beta')
      ) {
        QuestJs._parser.parse('script show');
      } else {
        const s = $('#textbox').val();
        QuestJs._IO.msgInputText(s);
        if (s) {
          if (
            QuestJs._IO.savedCommands[QuestJs._IO.savedCommands.length - 1]
            !== s
          ) {
            QuestJs._IO.savedCommands.push(s);
          }
          QuestJs._IO.savedCommandsPos = QuestJs._IO.savedCommands.length;
          QuestJs._parser.parse(s);
          if (QuestJs._IO.doNotEraseLastCommand) {
            QuestJs._IO.doNotEraseLastCommand = false;
          } else {
            $('#textbox').val('');
          }
        }
      }
    }
    if (keycode === 38) {
      // up arrow
      QuestJs._IO.savedCommandsPos -= 1;
      if (QuestJs._IO.savedCommandsPos < 0) {
        QuestJs._IO.savedCommandsPos = 0;
      }
      $('#textbox').val(
        QuestJs._IO.savedCommands[QuestJs._IO.savedCommandsPos],
      );
      // Get cursor to end of text
      const el = $('#textbox')[0];
      if (el.setSelectionRange) {
        setTimeout(() => {
          el.setSelectionRange(9999, 9999);
        }, 0);
      } else if (typeof el.selectionStart === 'number') {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else if (typeof el.createTextRange !== 'undefined') {
        el.focus();
        const range = el.createTextRange();
        range.collapse(false);
        range.select();
      }
    }
    if (keycode === 40) {
      // down arrow
      QuestJs._IO.savedCommandsPos += 1;
      if (QuestJs._IO.savedCommandsPos >= QuestJs._IO.savedCommands.length) {
        QuestJs._IO.savedCommandsPos = QuestJs._IO.savedCommands.length - 1;
      }
      $('#textbox').val(
        QuestJs._IO.savedCommands[QuestJs._IO.savedCommandsPos],
      );
    }
    if (keycode === 27) {
      // ESC
      $('#textbox').val('');
    }
    if (
      keycode === 96
      && (QuestJs._settings.playMode === 'dev'
        || QuestJs._settings.playMode === 'beta')
    ) {
      if (event.ctrlKey && event.altKey) {
        QuestJs._parser.parse('wt b');
      } else if (event.altKey) {
        QuestJs._parser.parse('wt a');
      } else if (event.ctrlKey) {
        QuestJs._parser.parse('wt c');
      } else {
        QuestJs._parser.parse('test');
      }
      setTimeout(() => {
        $('#textbox').val('');
      }, 1);
    }
    if (keycode === 90 && event.ctrlKey) {
      QuestJs._parser.parse('undo');
    }
  });
  QuestJs._IO.textColour = $('.side-panes').css('color');
  if (QuestJs._settings.soundFiles) {
    const main = $('#main');
    for (const el of QuestJs._settings.soundFiles) {
      main.append(
        `<audio id="${el}" src="${QuestJs._settings.soundsFolder}${el}${QuestJs._settings.soundsFileExt}"/>`,
      );
    }
  }
  QuestJs._game.initialise();
  endTurnUI(true);
  QuestJs._game.begin();
});

QuestJs._IO.synth = window.speechSynthesis;
QuestJs._IO.voice = null;
QuestJs._IO.voice2 = null;

QuestJs._IO.speak = function (str, altVoice) {
  if (!QuestJs._IO.voice) {
    QuestJs._IO.voice = QuestJs._IO.synth
      .getVoices()
      .find((el) => /UK/.test(el.name) && /Female/.test(el.name));
    if (!QuestJs._IO.voice) QuestJs._IO.voice = QuestJs._IO.synth.getVoices()[0];
  }
  if (!QuestJs._IO.voice2) {
    QuestJs._IO.voice2 = QuestJs._IO.synth
      .getVoices()
      .find((el) => /UK/.test(el.name) && /Male/.test(el.name));
    if (!QuestJs._IO.voice2) QuestJs._IO.voice2 = QuestJs._IO.synth.getVoices()[0];
  }

  const utterThis = new SpeechSynthesisUtterance(str);
  utterThis.onend = function (event) {
    // QuestJs._log.info('SpeechSynthesisUtterance.onend');
  };
  utterThis.onerror = function (event) {
    // QuestJs._log.error('SpeechSynthesisUtterance.onerror: ' + event.name);
  };
  utterThis.voice = altVoice ? QuestJs._IO.voice2 : QuestJs._IO.voice;
  // I think these can vary from 0 to 2
  utterThis.pitch = 1;
  utterThis.rate = 1;
  QuestJs._IO.synth.speak(utterThis);
};

QuestJs._IO.dialogShowing = false;
// @DOC
// Appends an HTML DIV, with the given title and content,
// and shows it as a dialog. Used by the transcript
// (and really only useful for displaying data).
QuestJs._IO.showHtml = function (title, html) {
  if (QuestJs._IO.dialogShowing) return false;
  $('body').append(`<div id="showHtml" title="${title}">${html}</div>`);
  QuestJs._IO.dialogShowing = true;
  $('#showHtml').dialog({
    width: 860,
    close() {
      $('#showHtml').remove();
      QuestJs._IO.dialogShowing = false;
    },
  });
  return true;
};

QuestJs._IO.finish = function () {
  QuestJs._IO.finished = true;
  QuestJs._settings.textInput = false;
  $('#input').hide();
  $('.pane-div').hide();
  $('.pane-div-finished').show();
  if (QuestJs._settings.onFinish) QuestJs._settings.onFinish();
  if (QuestJs._IO.transcriptFlag) msg('To see the transcript, click {cmd:SCRIPT SHOW:here}.');
};

QuestJs._IO.toggleDarkMode = function () {
  QuestJs._settings.darkModeActive = !QuestJs._settings.darkModeActive;
  if (QuestJs._settings.darkModeActive) {
    $('body').addClass('dark-body');
  } else {
    $('body').removeClass('dark-body');
  }
  if (QuestJs._settings.onDarkToggle) QuestJs._settings.onDarkToggle();
  QuestJs._IO.textColour = $('.side-panes').css('color');
  msg(QuestJs._lang.done_msg);
  return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
};

QuestJs._IO.copyTextToClipboard = function (text) {
  // from: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
  const textArea = document.createElement('textarea');
  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Styling just in case it gets displayed to make is as unobstrusive as possible
  textArea.style.width = '2em';
  textArea.style.height = '2em';
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
    metamsg(
      `Copying text command was ${successful ? 'successful' : 'unsuccessful'}`,
    );
  } catch (err) {
    metamsg('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
};

QuestJs._IO.addSlider = function (id, values, func) {
  if (!QuestJs._settings.sliders) QuestJs._settings.sliders = {};
  const name = QuestJs._tools.sentenceCase(id.replace('-', ' '));
  const max = typeof values === 'number' ? values : values.length - 1;
  QuestJs._settings.sliders[id] = { name, max, func };
  if (typeof values !== 'number') QuestJs._settings.sliders[id].values = values;
  const slider = $(`#${id}`);
  slider.append(
    `<p id="${id}-text">${name}: ${
      typeof values === 'number' ? 0 : values[0]
    }</p>`,
  );
  if (func) func(0);
  slider.append(`<div id="${id}-slider"></div>`);
  slider.css('padding-left', '10px');
  slider.css('padding-right', '10px');

  $(`#${id}-slider`).slider({ max });
  $(`#${id}-slider`).slider({
    slide(event, ui) {
      const id = event.target.id.replace('-slider', '');
      const { value } = ui;
      $(`#${id}-text`).html(
        `${QuestJs._settings.sliders[id].name}: ${
          QuestJs._settings.sliders[id].values
            ? QuestJs._settings.sliders[id].values[value]
            : value
        }`,
      );
      if (QuestJs._settings.sliders[id].func) {
        QuestJs._settings.sliders[id].func(value);
      } else {
        $(`#${id}-text`).html(
          `${QuestJs._settings.sliders[id].name}: ${
            QuestJs._settings.sliders[id].values
              ? QuestJs._settings.sliders[id].values[value]
              : value
          }`,
        );
      }
    },
  });
};

QuestJs._IO.getIcon = function (item) {
  if (QuestJs._settings.iconsFolder === false) return '';
  if (!item.icon) return '';
  if (item.icon() === '') return '';
  return `<img src="${QuestJs._settings.iconsFolder}${
    QuestJs._settings.darkModeActive ? 'l_' : 'd_'
  }${item.icon()}.png" />`;
};

QuestJs._IO.againOrOops = function (isAgain) {
  if (QuestJs._IO.savedCommands.length === 0) {
    metamsg(QuestJs._lang.again_not_available);
    return QuestJs._world.FAILED;
  }
  QuestJs._IO.savedCommands.pop(); // do not save AGAIN/OOPS
  if (isAgain) {
    QuestJs._parser.parse(
      QuestJs._IO.savedCommands[QuestJs._IO.savedCommands.length - 1],
    );
  } else {
    $('#textbox').val(
      QuestJs._IO.savedCommands[QuestJs._IO.savedCommands.length - 1],
    );
    QuestJs._IO.doNotEraseLastCommand = true;
  }
  return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
};

// Display Icons for compas
QuestJs._IO.displayIconsCompass = function (exit) {
  const datatransform = exit.rotate ? ' style="transform: rotate(40deg)"' : '';
  return `<i class="fas ${exit.symbol}"${datatransform}></i>`;
};
