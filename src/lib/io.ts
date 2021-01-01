import $ from 'jquery';
import { WorldStates, Known } from './constants';
import { sentenceCase, toInt } from './tools/tools';
import { Quest } from '../Quest';
import { Base } from './base';
import { ExitList } from '../lang/lexicon';
import { MessageOptions } from './IOptions';
import { FnPrmAny } from '../@types/fn';

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
export class IO extends Base {

  // Each line that is output is given an id, n plus an id number.
  nextid = 0;

  // The output system is quite complicated...
  // https://github.com/ThePix/QuestJS/wiki/The-Output-Queue
  outputQueue: MessageOptions[] = [];
  outputSuspended = false;

  // A list of names for items currently world. in the inventory panes
  currentItemList = [];
  modulesToUpdate = [];
  modulesToInit = [];
  spoken = false;
  // TRANSCRIPT SUPPORT
  transcript = false;
  transcriptFlag = false;
  transcriptText = [];

  allowedHtmlAttrs = [
    'width',
    'height',
    'onclick',
    'src',
    'autoplay',
  ];

  mainGutter = 20;
  panesWidth = 160;
  resizePanesListener = window.matchMedia(
    `(max-width: ${this.settings.panesCollapseAt}px)`,
  );
  resizeMapImageListener = window.matchMedia(
    `(max-width: ${this.settings.mapAndImageCollapseAt}px)`,
  );

  // 0: not disabled at all
  // 1: disable until output is done
  // 2: awaiting special input, eg from menu, including text
  // 3: awaiting special input, eg from menu, excluding text
  disableLevel = 0;

  synth = window.speechSynthesis;
  voice = null;
  voice2 = null;
  dialogShowing = false;

  menuStartId: number;
  menuFn: FnPrmAny;
  menuOptions: MessageOptions[] | string[];

  textColour: string;

  savedCommands = ['help'];
  savedCommandsPos = 0;

  finished = false;

  doNotEraseLastCommand = true;
  map: any;
  imagePane: any;

  constructor(quest: Quest) {
    super(quest);
    this.resizePanesListener.addListener(this.calcMargins); // Attach listener function on state changes
    this.resizeMapImageListener.addListener(this.calcMargins); // Attach listener function on state changes
    this.init();
  }

  private _msg(s: string, params: any, options: MessageOptions) {
    if (options.tag === undefined)
      options.tag = 'p';
    if (options.cssClass === undefined)
      options.cssClass = 'default-' + options.tag.toLowerCase();
    const processed = params ? this.text.processText(s, params).trim() : s.trim();
    if (processed === "" && !options.printBlank) {
      return;
    }
    // if (test.testing) {
    //     test.testOutput.push(processed);
    //     return;
    const lines = processed.split('|');
    lines.forEach(line => {
      // can add effects
      const data = options;
      data.text = line;
      if (!data.action)
        data.action = 'output';
      this.addToOutputQueue(data);
    });
  }

  addToOutputQueue(data: MessageOptions) {
    data.id = this.nextid;
    this.outputQueue.push(data);
    this.nextid += 1;
    this.outputFromQueue();
  };

  //@DOC
  // Output a standard message, as an HTML paragraph element (P).
  // The string will first be passed through the text processor.
  // Additional data can be put in the optional params dictionary.
  // You can specify a CSS class to use.
  // During unit testing, messages will be saved and tested
  msg(s: string, params: any = {}, cssClass?: string): void {
    //if (!params) params = {}
    const lines = s.split('|');
    lines.forEach(l => {
      const tag = (/^#/.test(l) ? 'h4' : 'p');
      const line = l.replace(/^#/, '');
      this._msg(line, params || {}, { cssClass, tag });
    });
  };


  // @DOC
  // Adds the given string to the print queue.
  // This allows you to add any HTML you want to the output queue.
  rawPrint(s) {
    this._msg(s, {}, {});
  }

  // @DOC
  // As `msg`, but the string is presented as an HTML heading (H1 to H6).
  // The level of the heading is determined by `level`, with 1 being the top, and 6 the bottom.
  // Headings are ignored during unit testing.
  msgBlankLine() {
    this._msg('', false, { tag: 'p', printBlank: true });
  }

  // @DOC
  // As `msg`, but handles an array of strings. Each string is put in its own HTML paragraph,
  // and the set is put in an HTML division (DIV). The cssClass is applied to the division.
  msgDiv(arr: string[], params, cssClass) {
    let s = '';
    arr.forEach(item => s += `  <p>${item}</p>\n`);
    this._msg(s, params || {}, { cssClass, tag: 'div' });
  }

  // @DOC
  // As `msg`, but handles an array of strings in a list. Each string is put in its own HTML list item (LI),
  // and the set is put in an HTML order list (OL) or unordered list (UL), depending on the value of `ordered`.
  msgList(arr: string[], ordered, params, cssClass) {
    let s = '';
    arr.forEach(item => s += `  <li>${item}</li>\n`);
    this._msg(s, params || {}, { cssClass, tag: ordered ? 'ol' : 'ul' });
  }

  // @DOC
  // As `msg`, but handles an array of arrays of strings in a list. This is laid out in an HTML table.
  // If `headings` is present, this array of strings is used as the column headings.
  msgTable(arr: string[][], headings: string[], params: any = {}, cssClass: string = '') {
    let s = '';
    if (headings) {
      s += '  <tr>\n';
      headings.forEach(item => s += `    <th>${item}</th>\n`)
      s += '  </tr>\n';
    }
    arr.forEach(row => {
      s += '  <tr>\n';
      row.forEach(item => s += `    <td>${item}</td>\n`);
      s += '  </tr>\n';
    });
    this._msg(s, params, { cssClass, tag: 'table' });
  }

  getH(level: 1 | 2 | 3 | 4 | 5 | 6): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
    switch(level) {
      case 1:
        return 'h1';
      case 2:
        return 'h2';
      case 3:
        return 'h3';
      case 4:
        return 'h4';
      case 5:
        return 'h5';
      case 6:
        return 'h6';
    }
  }

  // @DOC
  // As `msg`, but the string is presented as an HTML heading (H1 to H6).
  // The level of the heading is determined by `level`, with 1 being the top, and 6 the bottom.
  // Headings are ignored during unit testing.
  msgHeading(s, level: 1 | 2 | 3 | 4 | 5 | 6, params = {}) {
    this._msg(s, params, { tag: this.getH(level) });
  }

  // @DOC
  // Output a picture, as an HTML image element (IMG).
  // If width and height are omitted, the size of the image is used.
  // If height is omitted, the height will be proportional to the given width.
  // The file name should include the path. For a local image, that would probably be the images folder,
  // but it could be the web address of an image hosted elsewhere.
  picture(filename: string, width: string, height: string) {
    const src = filename.includes('/')
      ? filename
      : this.settings.imagesFolder + filename;
    this._msg(
      '',
      {},
      { action: 'output', width, height, tag: 'img', src, printBlank: true },
    );
  }

  image(filename: string, width: string, height: string) {
    const src = filename.includes('/')
      ? filename
      : this.settings.imagesFolder + filename;
    this._msg(
      '',
      {},
      {
        action: 'output',
        width,
        height,
        tag: 'img',
        src,
        cssClass: 'centred',
        printBlank: true,
        destination: 'quest-image',
      },
    );
  }

  // @DOC
  // Plays a sound. The filename must include the extension, and the file should be in the folder specified by audioFolder (defaults to the game folder).
  sound(filename: string) {
    // this.log.info(this.settings.ssFolder)
    this._msg(
      'Your browser does not support the <code>audio</code> element.',
      {},
      { action: 'sound', name: filename },
    );
  }

  ambient(filename: string = 'n/a', volume: number = 0) {
    this._msg(
      'Your browser does not support the <code>audio</code> element.',
      {},
      { action: 'ambient', name: filename, volume },
    );
  }

  // @DOC
  // Plays a video. The filename must include the extension, and the file should be in the folder specified by audioFolder (defaults to the game folder).
  // There are some issues about codecs and formats; use at your discretion.
  video(filename: string) {
    // this.log.info(this.settings.ssFolder)
    this._msg(
      'Your browser does not support the <code>video</code> element.',
      {},
      {
        action: 'output',
        autoplay: true,
        tag: 'video',
        src: `${this.settings.videosFolder}/${filename}`,
      },
    );
  }

  // @DOC
  // Draw an image in the main window, embedded in the text.
  // This uses SVG, which is a standard web drawing system.
  // The first and second parameters are the width and height of the image.
  // The third parameter is an array of strings, each element being an SVG primitive.
  // The image will be added to the output queue in the same way text is.
  draw(width: string, height: string, data: string[], options: MessageOptions = {}) {
    let s = `<svg width="${width}" height="${height}" viewBox="`;
    s += options.x ? `${options.x} ${options.y}` : '0 0';
    s += ` ${width} ${height}" `;
    if (options.background) s += `style="background:${options.background}" `;
    s += 'xmlns="http://www.w3.org/2000/svg">';
    s += `${data.join('')}</svg>`;
    if (this.settings.reportAllSvg)
      this.log.info(s.replace(/></g, '>\n<'));
    if (options.destination) {
      $(`#${options.destination}`).html(s);
    } else {
      this.rawPrint(s);
    }
  }

  // @DOC
  // Just the same as msg, but adds the "failed" CSS class. This allows failed command responses to be differentiated.
  // Returns the value FAILED, allowing commands to give a message and give up
  //     if (notAllowed) return failedmsg("That is not allowed.")
  failedmsg(s: string, params: any = {}) {
    this._msg(s, params, { cssClass: 'failed', tag: 'p' });
    return WorldStates.FAILED;
  }

  // @DOC
  // Just the same as msg, but adds the "failed" CSS class. This allows failed command responses to be differentiated.
  // Returns the value false, allowing commands to give a message and give up
  //     if (notAllowed) return falsemsg("That is not allowed.")
  falsemsg(s: string, params: any = {}) {
    this._msg(s, params, { cssClass: 'failed', tag: 'p' });
    return false;
  }

  // @DOC
  // Output a meta-message - a message to inform the player about something outside the game world,
  // such as hints and help messages.
  // The string will first be passed through the text processor.
  // Additional data can be put in the optional params dictionary.
  // During unit testing, messages will be saved and tested
  metamsg(s: string, params: any = {}) {
    this._msg(s, params, { cssClass: 'meta', tag: 'p' });
  }

  // @DOC
  // Output a message from the parser indicating the input text could not be parsed.
  // During unit testing, messages will be saved and tested.
  // Does not use the text processor.
  parsermsg(s: string) {
    this._msg(s, false, { cssClass: 'parser', tag: 'p' });
    return false;
  }

  // @DOC
  // Output an error message.
  // Use for when something has gone wrong, but not when the player types something odd -
  // if you see this during play, there is a bug in your game (or my code!), it is not the player
  // to blame.
  //
  // This bypasses the normal output system. It will not wait for other text to be output (for example
  // after wait). During unit testing, error messages will be output to screen as they occur.
  // It does not use the text processor.
  errormsg(s: string) {
    if (this.world.isCreated) {
      this.print({
        tag: "p",
        cssClass: 'error',
        text: this.lexicon.error,
      });
    }
    this.log.error(`ERROR: ${s}`);
    this.log.info(
      'Look through the trace below to find the offending code. The first entry in the list will be "errormsg", which is me, the next will the code that detected the error and called the "errormsg" message. You may need to look further down to find the root cause. If you get to the "jquery" lines you have gone too far.',
    );
    this.log.trace();
    return false;
  }

  // @DOC
  // Output a debug message.
  // Debug messages are ignored if DEBUG is false.
  // You should also consider using `this.log.info` when debugging; it gives a message in the console,
  // and outputs objects and array far better.
  //
  // This bypasses the normal output system. It will not wait for other text to be output (for example
  // after wait). During unit testing, error messages will be output to screen as they occur.
  // It does not use the text processor.
  debugmsg(s: string) {
    if (
      this.settings.playMode === 'dev' ||
      this.settings.playMode === 'meta'
    ) {
      this.print({ tag: 'p', cssClass: 'debug', text: s });
    }
  }

  // @DOC
  // Clears the screen.
  clearScreen() {
    // this.outputQueue.push({action:'clear'})
    this.addToOutputQueue({ action: 'clear' });
  }

  // @DOC
  // Stops outputting whilst waiting for the player to click.
  wait(delay: number, text: string) {
    if (this.settings.testing) return;
    if (delay === undefined) {
      this.addToOutputQueue({
        action: "wait",
        text,
        cssClass: 'continue',
      });
    } else {
      this.addToOutputQueue({
        action: 'delay',
        delay,
        text,
        cssClass: 'continue',
      });
    }
  }

  askQuestion(title: string, fn: FnPrmAny) {
    this.msg(title);
    this.parser.overrideWith(fn);
  }

  // @DOC
  // Use like this:
  //      showMenu('What is your favourite color?', ['Blue', 'Red', 'Yellow', 'Pink'], function(result) {
  //        msg("You picked " + result + ".");
  //      });
  showMenu(title: string, options, fn) {
    const opts = { article: Known.DEFINITE, capital: true };
    this.input(title, options, false, fn, (options) => {
      for (let i = 0; i < options.length; i += 1) {
        let s = `<a class="menu-option" onclick="this.menuResponse(${i})">`;
        s +=
          typeof options[i] === 'string'
            ? options[i]
            : this.processor.getName(options[i], opts);
        s += '</a>';
        this.msg(s);
      }
    });
  }

  showMenuWithNumbers(title: string, options, fn) {
    const opts = { article: Known.DEFINITE, capital: true };
    this.parser.overrideWith(this.menuResponse);
    this.input(title, options, true, fn, (options) => {
      for (let i = 0; i < options.length; i += 1) {
        let s = `${i + 1
          }. <a class="menu-option" onclick="this.menuResponse(${i})">`;
        s +=
          typeof options[i] === 'string'
            ? options[i]
            : this.processor.getName(options[i], opts);
        s += '</a>';
        this.msg(s);
      }
    });
  }

  showDropDown(title: string, options, fn) {
    const opts = { article: Known.DEFINITE, capital: true };
    this.input(title, options, false, fn, (options) => {
      let s =
        '<select id="menu-select" class="custom-select" style="width:400px;" ';
      s +=
        "onchange=\"this.menuResponse($('#menu-select').find(':selected').val())\">";
      s += '<option value="-1"> -= 1 Select one  -= 1</option>';
      for (let i = 0; i < options.length; i += 1) {
        s += `<option value="${i}">`;
        s +=
          typeof options[i] === 'string'
            ? options[i]
            : this.processor.getName(options[i], opts);
        s += '</option>';
      }
      this.msg(`${s}</select>`);
      // $('#menu-select').selectmenu();
      $('#menu-select').focus();
    });
  }

  showYesNoMenu(title: string, fn) {
    this.showMenu(title, this.lexicon.yesNo, fn);
  }

  showYesNoMenuWithNumbers(title: string, fn) {
    this.showMenuWithNumbers(title, this.lexicon.yesNo, fn);
  }

  showYesNoDropDown(title: string, fn) {
    this.showDropDown(title, this.lexicon.yesNo, fn);
  }

  // This should be called after each turn to ensure we are at the end of the page and the text box has the focus
  endTurnUI(update) {
    if (this.settings.panes !== 'none' && update) {
      // set the this.lexicon.exit_list
      this.lexicon.exit_list.forEach(exit => {
        if (
          this.game.room.hasExit(exit.name, { excludeScenery: true }) ||
          exit.type === 'nocmd'
        ) {
          $(`#exit-${exit.name}`).show();
        } else {
          $(`#exit-${exit.name}`).hide();
        }
      });
      this.updateStatus();
      if (this.settings.updateCustomUI) this.settings.updateCustomUI();
    }
    this.modulesToUpdate.forEach(m => m.update(update));
    this.updateUIItems();

    // scroll to end
    setTimeout(this.scrollToEnd, 1);
    // give focus to command bar
    if (this.settings.textInput) {
      $('#textbox').focus();
    }
  }

  createPaneBox(position, title, content) {
    $(`div.pane-div:nth-child(${position})`).before(
      `<div class="pane-div"><h4 class="side-pane-heading">${title}</h4><div class="">${content}</div></div>`,
    );
  }

  // Create Toolbar
  createToolbar() {
    let html = '';
    html += '<div class="toolbar button" id="toolbar">';
    html += '<div class="status">';
    if (this.settings.toolbar.content)
      html += ` <div>${this.settings.toolbar.content()}</div>`;
    html += '</div>';

    html += '<div class="room">';
    if (this.settings.toolbar.roomdisplay) {
      html += ` <div>${sentenceCase(
        this.processor.getName(this.state.get(this.game.player.loc.name), {
          article: Known.DEFINITE,
        }),
      )}</div>`;
    }
    html += '</div>';

    html += '<div class="links">';
    for (const link of this.settings.toolbar.buttons) {
      const js = link.cmd ? `this.runCmd('${link.cmd}')` : link.onclick;
      html += ` <a class="link" onclick="${js}"><i class="fas ${link.icon}" title="${link.title}"></i></a>`;
    }
    html += '</div>';
    html += '</div>';

    $('#output').before(html);
  }

  scriptStart() {
    this.transcript = true;
    this.transcriptFlag = true;
    this.metamsg('Transcript is now on.');
  }

  scriptEnd() {
    this.metamsg('Transcript is now off.');
    this.transcript = false;
  }

  scriptShow(opts = '') {
    if (opts === 'w') {
      const lines = [];
      for (const el of this.transcriptText) {
        if (el.cssClass === 'input' && !el.text.match(/^(tran)?script/)) {
          lines.push(`    "${el.text}",`);
        }
        if (el.cssClass === 'menu') {
          const previous = lines.pop();
          if (typeof previous === 'string') {
            const d = {
              cmd: /^ +\"(.+)\"/.exec(previous)[1],
              menu: [toInt(el.n, 10)],
            };
            lines.push(d);
          } else {
            previous.menu.push(toInt(el.n));
            lines.push(previous);
          }
        }
      }
      this.log.info(lines);
      const wt = lines
        .map((el) =>
          typeof el === 'string' ? el : `    ${JSON.stringify(el)},`,
        )
        .join('\n');
      this.copyTextToClipboard(`  recorded:[\n${wt}\n  ],\n`);
    } else {
      let html = '';
      html +=
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Quest 6 Transcript for ';
      html += this.settings.title;
      html += '</title></head><body><h2>Quest 6 Transcript for "';
      html += `${this.settings.title}" (version ${this.settings.version}`;
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
  }

  scriptClear() {
    this.transcriptText = [];
    this.metamsg('Transcript cleared.');
  }

  scriptAppend(data) {
    this.transcriptText.push(data);
  }

  input(
    title,
    options,
    allowText,
    reactFunction,
    displayFunction,
  ) {
    this.menuStartId = this.nextid;
    this.menuFn = reactFunction;
    this.menuOptions = options;

    if (this.settings.testing) {
      if (this.test.menuResponseNumber === undefined) {
        this.debugmsg(
          `Error when testing menu (possibly due to disambiguation?), this.test.menuResponseNumber = ${this.test.menuResponseNumber}`,
        );
      } else {
        this.menuResponse(this.test.menuResponseNumber);
        delete this.test.menuResponseNumber;
      }
      return;
    }

    if (this.settings.walkthroughMenuResponses.length > 0) {
      const response = this.settings.walkthroughMenuResponses.shift();
      this.log.info(`Using response: ${response}`);
      this.log.info(
        `this.settings.walkthroughMenuResponses.length: ${this.settings.walkthroughMenuResponses.length}`,
      );
      this.menuResponse(response);
      return;
    }

    this.disable(allowText ? 2 : 3);
    this.msg(title, {}, 'menu-title');
    displayFunction(options);
  };

  // Stops the current pause immediately (no effect if not paused)
  unpause() {
    $('.continue').remove();
    this.outputSuspended = false;
    this.outputFromQueue();
    if (this.settings.textInput) $('#textbox').focus();
  }

  forceOutputFromQueue() {
    this.outputSuspended = false;
    this.outputFromQueue();
  }

  outputFromQueue() {
    if (this.outputSuspended) return;
    if (this.outputQueue.length === 0) {
      this.enable();
      return;
    }

    // if (this.settings.textInput) $('#input').show()
    const data = this.outputQueue.shift();
    if (data.action === 'wait') {
      this.disable();
      this.outputSuspended = true;
      // if (this.settings.textInput) $('#input').hide()
      data.tag = 'p';
      data.onclick = this.unpause;
      if (!data.text) data.text = this.lexicon.click_to_continue;
      this.print(data);
    }
    if (data.action === 'delay') {
      this.disable();
      this.outputSuspended = true;
      if (data.text) {
        data.tag = 'p';
        this.print(data);
      }
      setTimeout(this.unpause, data.delay * 1000);
    }
    if (data.action === 'output') {
      const html = this.print(data);
      if (this.spoken) this.speak(html);
      if (this.transcript) this.scriptAppend(data);
      this.outputFromQueue();
    }
    if (data.action === 'effect') {
      this.disable();
      // need a way to handle spoken and transcript here
      data.effect(data);
    }
    if (data.action === 'clear') {
      $('#output').empty();
      this.outputFromQueue();
    }
    if (data.action === 'sound') {
      this.log.info(`PLAY SOUND ${data.name}`);
      if (!this.settings.silent) {
        const el = document.getElementById(data.name) as HTMLAudioElement;
        el.currentTime = 0;
        el.play();
      }
    }
    if (data.action === 'ambient') {
      this.log.info(`PLAY AMBIENT ${data.name}`);
      const els: HTMLAudioElement[] = Array.prototype.slice.call(document.getElementsByTagName('audio'));
      els.forEach(el => el.pause());
      if (!this.settings.silent && data.name) {
        const el = document.getElementById(data.name) as HTMLAudioElement;
        el.currentTime = 0;
        el.loop = true;
        el.play();
        if (data.volume) el.volume = data.volume / 10;
      }
    }

    window.scrollTo(0, document.getElementById('main').scrollHeight);
  }

  print(data) {
    let html;
    if (typeof data === 'string') {
      html = data;
    }
    if (data.html) {
      html = data.html;
    } else {
      html = `<${data.tag} id="n${data.id}"`;
      if (data.cssClass) html += ` class="${data.cssClass}"`;
      for (const s of this.allowedHtmlAttrs)
        if (data[s]) html += ` ${s}="${data[s]}"`;
      html += `>${data.text}</${data.tag}>`;
    }
    if (data.destination) {
      $(`#${data.destination}`).html(html);
    } else {
      $('#output').append(html);
    }
    return html;
  }

  typewriterEffect(data) {
    if (!data.position) {
      $('#output').append(
        `<${data.tag} id="n${data.id}" class="typewriter"></${data.tag}>`,
      );
      data.position = 0;
      data.text = this.text.processText(data.text, data.params);
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
      this.outputQueue.unshift(data);
      this.outputSuspended = true;
    }
    setTimeout(
      this.forceOutputFromQueue,
      this.settings.textEffectDelay,
    );
  }

  unscrambleEffect(data) {
    // Set up the system
    if (!data.count) {
      $('#output').append(
        `<${data.tag} id="n${data.id}" class="typewriter"></${data.tag}>`,
      );
      data.count = 0;
      data.text = this.text.processText(data.text, data.params);
      if (!data.pick) data.pick = this.unscamblePick;
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
      let pos = this.random.int(0, data.count - 1);
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
    $(`#n${data.id}`).html(this.unscambleScramble(data));
    if (data.count > 0) {
      this.outputQueue.unshift(data);
      this.outputSuspended = true;
    }
    setTimeout(
      this.forceOutputFromQueue,
      this.settings.textEffectDelay,
    );
  }

  unscamblePick() {
    const c = String.fromCharCode(this.random.int(33, 125));
    return c === '<' ? '~' : c;
  }

  unscambleScramble(data) {
    let s = '';
    for (let i = 0; i < data.text.length; i += 1) {
      s += data.mask.charAt(i) === ' ' ? data.text.charAt(i) : data.pick(i);
    }
    return s;
  }

  cmdlink(command, str) {
    return `<a class="cmd-link" onclick="this.parser.parse('${command}')">${str}</a>`;
  }

  scrollToEnd() {
    window.scrollTo(0, document.getElementById('main').scrollHeight);
  }

  setTitleAndInit(s) {
    document.title = s;
    for (const o of this.modulesToInit) {
      o.init();
    }
    this.calcMargins();
  }

  calcMargins() {
    // How much space do we need for images and map?
    let mapImageWidth = '0';
    if (typeof this.map !== 'undefined') {
      if (!this.settings.hideMap) mapImageWidth = this.settings.mapStyle.width;
    }
    if (typeof this.imagePane !== 'undefined') {
      if (
        !this.settings.hideImagePane &&
        this.settings.imageWidth > mapImageWidth
      )
        mapImageWidth = this.settings.imageWidth;
    }

    $('#main').css('margin-left', '40px');
    $('#main').css('margin-right', '40px');

    // Do we show the side panes?
    if (this.settings.panes !== 'none') {
      const margin =
        this.settings.panes === 'left' ? 'margin-left' : 'margin-right';
      if (this.resizePanesListener.matches) {
        // If media query matches
        // hide sidepane
        $('#main').css(margin, `${this.mainGutter}px`);
        $('#panes').css('display', 'none');
      } else {
        // show sidepane
        $('#main').css(
          margin,
          `${this.panesWidth + this.mainGutter}px`,
        );
        $('#panes').css('display', 'block');
      }
    }

    let margin =
      this.settings.panes === 'right' ? 'margin-left' : 'margin-right';
    if (this.settings.mapImageSide)
      margin =
        this.settings.mapImageSide === 'left'
          ? 'margin-left'
          : 'margin-right';
    if (this.resizeMapImageListener.matches) {
      // If media query matches
      // hide image
      $('#main').css(margin, `${this.mainGutter}px`);
      $('#quest-image').css('display', 'none');
      $('#quest-map').css('display', 'none');
    } else {
      // show image
      $('#main').css(margin, `${mapImageWidth + this.mainGutter}px`);
      $('#quest-image').css('display', 'block');
      $('#quest-map').css('display', 'block');
    }
  };

  disable(level = 1) {
    if (level <= this.disableLevel) return;
    this.disableLevel = level;
    if (level !== 2) $('#input').hide();
    $('.compass-button .dark-body').css('color', '#808080');
    $('.item').css('color', '#808080');
    $('.item-action').css('color', '#808080');
  };

  enablethis(level) {
    // this.log.info('enable ' + level + ' (' + this.disableLevel + ')')
    if (!level) level = 1;
    if (!this.disableLevel || level < this.disableLevel) return;
    this.disableLevel = 0;
    $('#input').show();
    $('.compass-button').css('color', this.textColour);
    $('.item').css('color', this.textColour);
    $('.item-action').css('color', this.textColour);
  };

  updateUIItems() {
    if (this.settings.panes === 'none' || !this.settings.inventoryPane) {
      return;
    }

    for (const inv of this.settings.inventoryPane) {
      $(`#${inv.alt}`).empty();
    }

    this.currentItemList = [];
    this.state.forEach((key, item) => {
      this.settings.inventoryPane.forEach(inv => {
        const loc = inv.getLoc();
        if (inv.test(item) && !item.inventorySkip) {
          this.appendItem(item, inv.alt, loc);
        }
      });
    });
    this.clickItem('');
  };

  updateStatus() {
    if (this.settings.statusPane) {
      $('#status-pane').empty();
      this.settings.forEach('status', (key, st) => {
        if (typeof st === 'string') {
          if (this.game.player[st] !== undefined) {
            let s = `<tr><td width="${this.settings.statusWidthLeft
              }">${sentenceCase(st)}</td>`;
            s += `<td width="${this.settings.statusWidthRight}">${this.game.player[st]}</td></tr>`;
            $('#status-pane').append(s);
          }
        } else if (typeof st === 'function') {
          $('#status-pane').append(`<tr>${st()}</tr>`);
        }
      });
    }

    if (this.settings.toolbar) {
      $('#toolbar').remove();
      this.createToolbar();
    }
  };

  menuResponse(n: string | number) {
    if (typeof n === 'string' && n.match(/^\d+$/)) n = toInt(n) - 1;
    if (typeof n === 'string') {
      const s = n;
      n = this.menuOptions.findIndex((el) => {
        this.log.info(el);
        if (typeof el === 'string') return el.includes(s);
        return el.name.includes(s);
      });
    }
    this.enable(5);
    // this.parser.overrideWith();
    $('#input').css('world.', 'block');
    for (let i = this.menuStartId; i < this.nextid; i += 1)
      $(`#n${i}`).remove();
    if (n === undefined) {
      this.menuFn();
    } else if (n !== -1) {
      if (this.transcript) {
        const a = this.menuOptions[n] as any;
        this.scriptAppend({
          cssClass: 'menu',
          text: a.alias ? a.alias : a,
          n,
        });
      }
      this.menuFn(this.menuOptions[n]);
    }
    this.endTurnUI(true);
    if (this.settings.textInput) $('#textbox').focus();
  };

  clickExit(dir) {
    if (this.disableLevel) return;

    this.msgInputText(dir);
    let cmd = this.getCommand(`Go${sentenceCase(dir)}`);
    if (!cmd) cmd = this.getCommand(sentenceCase(dir));
    if (!cmd)
      cmd = this.getCommand(`Meta${sentenceCase(dir)}`);
    this.parser.quickCmd(cmd);
  };

  clickItem(itemName) {
    if (this.disableLevel) return;

    for (const item of this.currentItemList) {
      if (item === itemName) {
        $(`.${item}-actions`).toggle();
      } else {
        $(`.${item}-actions`).hide();
      }
    }
  };

  clickItemAction(itemName, action) {
    if (this.disableLevel) return;
    const item = this.state.get(itemName);
    const cmd = action.includes('%')
      ? action.replace('%', item.alias)
      : `${action} ${item.alias}`;
    this.msgInputText(cmd);
    this.parser.parse(cmd);
  };

  // Add the item to the DIV named htmlDiv
  // The item will be given verbs from its attName attribute
  appendItem(item, htmlDiv, loc, isSubItem = false) {
    $(`#${htmlDiv}`).append(
      `<div id="${item.name}-item"><p class="item${isSubItem ? ' sub-item' : ''
      }" onclick="this.clickItem('${item.name}')">${this.getIcon(
        item,
      )}${item.getListAlias(loc)}</p></div>`,
    );
    this.currentItemList.push(item.name);
    const verbList = item.getVerbs(loc);
    if (verbList === undefined) {
      this.errormsg(`No verbs for ${item.name}`);
      this.log.info(item);
    }
    for (let verb of verbList) {
      if (typeof verb === 'string') verb = { name: verb, action: verb };
      let s = `<div class="${item.name}-actions item-action" onclick="this.clickItemAction('${item.name}', '${verb.action}')">`;
      s += verb.name;
      s += '</div>';
      $(`#${htmlDiv}`).append(s);
    }
    if (item.container && !item.closed) {
      if (typeof item.getContents !== 'function') {
        this.log.info(
          'item flagged as container but no getContents function:'
        );
        this.log.info(item);
      }
      const l = item.getContents(WorldStates.SIDE_PANE);
      for (const el of l) {
        this.appendItem(el, htmlDiv, item.name, true);
      }
    }
  };

  // Creates the panes on the left or right
  // Should only be called once, when the page is first built
  createPanes() {
    if (!['right', 'left', 'none'].includes(this.settings.panes)) {
      this.log.error(
        `ERROR: Your this.settings.panes value is "${this.settings.panes}". It must be one of "right", "left" or "none" (all lower-case). It is probably set in the file setiings.js.`,
      );
      return;
    }

    $('#input').html(
      `<span id="cursor">${this.settings.cursor}</span><input type="text" name="textbox" id="textbox"  autofocus/>`,
    );

    if (this.settings.panes === 'none') {
      return;
    }

    const panes = $('#panes');
    panes.addClass(`side-panes side-panes${this.settings.panes} panes-narrow`);

    if (this.settings.compassPane) {
      panes.append('<div class="pane-div">');
      panes.append('<table id="compass-table">');
      for (let i = 0; i < 3; i += 1) {
        panes.append('<tr>');
        this.writeExit(panes, 0 + 5 * i);
        this.writeExit(panes, 1 + 5 * i);
        this.writeExit(panes, 2 + 5 * i);
        panes.append('<td></td>');
        this.writeExit(panes, 3 + 5 * i);
        this.writeExit(panes, 4 + 5 * i);
        panes.append('</tr>');
      }
      panes.append('</table>');
      panes.append('</div>');
    }

    if (this.settings.statusPane) {
      panes.append('<div class="pane-div">');
      panes.append(
        `<h4 class="side-pane-heading">${this.settings.statusPane}</h4>`,
      );
      panes.append('<table id="status-pane">');
      panes.append('</table>');
      panes.append('</div>');
    }

    if (this.settings.inventoryPane) {
      for (const inv of this.settings.inventoryPane) {
        panes.append('<div class="pane-div">');
        panes.append(`<h4 class="side-pane-heading">${inv.name}</h4>`);
        panes.append(`<div id="${inv.alt}">`);
        panes.append('</div>');
        panes.append('</div>');
      }
    }

    panes.append('<div class="pane-div-finished">');
    panes.append(this.lexicon.game_over_html);
    panes.append('</div>');
    panes.append('</div>');

    if (this.settings.customUI) this.settings.customUI();
  };

  writeExit(panes, n) {
    panes.append(
      `<td class="compass-button" title="${this.lexicon.exit_list[n].name}">`,
    );
    panes.append(
      `<span class="compass-button" id="exit-${this.lexicon.exit_list[n].name}`,
    );
    panes.append(
      `" onclick="this.clickExit('${this.lexicon.exit_list[n].name}')">`,
    );
    panes.append(
      this.settings.symbolsForCompass
        ? this.displayIconsCompass(this.lexicon.exit_list[n])
        : this.lexicon.exit_list[n].abbrev,
    );
    panes.append('</span></td>');
  }

  // Gets the command with the given name
  getCommand(name) {
    return this.commandFactory.findCmd(name);
  };

  msgInputText(s) {
    if (!this.settings.cmdEcho || s === '') return;
    $('#output').append(
      `<p id="n${this.nextid}" class="input-text">&gt; ${s}</p>`,
    );
    this.nextid += 1;
    if (this.spoken) this.speak(s, true);
    if (this.transcript)
      this.scriptAppend({ cssClass: 'input', text: s });
  };

  speak(str, altVoice = false) {
    if (!this.voice) {
      this.voice = this.synth
        .getVoices()
        .find((el) => /UK/.test(el.name) && /Female/.test(el.name));
      if (!this.voice)
        this.voice = this.synth.getVoices()[0];
    }
    if (!this.voice2) {
      this.voice2 = this.synth
        .getVoices()
        .find((el) => /UK/.test(el.name) && /Male/.test(el.name));
      if (!this.voice2)
        this.voice2 = this.synth.getVoices()[0];
    }

    const utterThis = new SpeechSynthesisUtterance(str);
    utterThis.onend = function (event) {
      // this.log.info('SpeechSynthesisUtterance.onend');
    };
    utterThis.onerror = function (event) {
      // this.log.error('SpeechSynthesisUtterance.onerror: ' + event.name);
    };
    utterThis.voice = altVoice ? this.voice2 : this.voice;
    // I think these can vary from 0 to 2
    utterThis.pitch = 1;
    utterThis.rate = 1;
    this.synth.speak(utterThis);
  };
  // @DOC
  // Appends an HTML DIV, with the given title and content,
  // and shows it as a dialog. Used by the transcript
  // (and really only useful for displaying data).
  showHtml(title, html) {
    if (this.dialogShowing) return false;
    $('body').append(`<div id="showHtml" title="${title}">${html}</div>`);
    this.dialogShowing = true;
    $('#showHtml').dialog({
      width: 860,
      close() {
        $('#showHtml').remove();
        this.dialogShowing = false;
      },
    });
    return true;
  };

  enable(level = 1) {
    // this.log.info('enable ' + level + ' (' + this.disableLevel + ')')
    if (!this.disableLevel || level < this.disableLevel) return;
    this.disableLevel = 0;
    $('#input').show();
    $('.compass-button').css('color', this.textColour);
    $('.item').css('color', this.textColour);
    $('.item-action').css('color', this.textColour);
  };

  finish() {
    this.finished = true;
    this.settings.textInput = false;
    $('#input').hide();
    $('.pane-div').hide();
    $('.pane-div-finished').show();
    if (this.settings.onFinish) this.settings.onFinish();
    if (this.transcriptFlag)
      this.msg('To see the transcript, click {cmd:SCRIPT SHOW:here}.');
  };

  toggleDarkMode() {
    this.settings.darkModeActive = !this.settings.darkModeActive;
    if (this.settings.darkModeActive) {
      $('body').addClass('dark-body');
    } else {
      $('body').removeClass('dark-body');
    }
    if (this.settings.onDarkToggle) this.settings.onDarkToggle();
    this.textColour = $('.side-panes').css('color');
    this.msg(this.lexicon.done_msg);
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  };

  copyTextToClipboard(text) {
    // from: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    const textArea = document.createElement('textarea');
    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';

    // Styling just in case it gets displayed to make is as unobstrusive as possible
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
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
      this.metamsg(
        `Copying text command was ${successful ? 'successful' : 'unsuccessful'}`,
      );
    } catch (err) {
      this.metamsg('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
  };

  addSlider(id, values, func) {
    if (!this.settings.sliders) this.settings.sliders = {};
    const name = sentenceCase(id.replace('-', ' '));
    const max = typeof values === 'number' ? values : values.length - 1;
    this.settings.sliders[id] = { name, max, func, values };
    if (typeof values !== 'number') this.settings.sliders[id].values = values;
    const slider = $(`#${id}`);
    slider.append(
      `<p id="${id}-text">${name}: ${typeof values === 'number' ? 0 : values[0]
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
          `${this.settings.sliders[id].name}: ${this.settings.sliders[id].values
            ? this.settings.sliders[id].values[value]
            : value
          }`,
        );
        if (this.settings.sliders[id].func) {
          this.settings.sliders[id].func(value);
        } else {
          $(`#${id}-text`).html(
            `${this.settings.sliders[id].name}: ${this.settings.sliders[id].values
              ? this.settings.sliders[id].values[value]
              : value
            }`,
          );
        }
      },
    });
  };

  getIcon(item) {
    if (!this.settings.iconsFolder) return '';
    if (!item.icon) return '';
    if (item.icon() === '') return '';
    return `<img src="${this.settings.iconsFolder}${this.settings.darkModeActive ? 'l_' : 'd_'
      }${item.icon()}.png" />`;
  };

  againOrOops(isAgain) {
    if (this.savedCommands.length === 0) {
      this.metamsg(this.lexicon.again_not_available);
      return WorldStates.FAILED;
    }
    this.savedCommands.pop(); // do not save AGAIN/OOPS
    if (isAgain) {
      this.parser.parse(
        this.savedCommands[this.savedCommands.length - 1],
      );
    } else {
      $('#textbox').val(
        this.savedCommands[this.savedCommands.length - 1],
      );
      this.doNotEraseLastCommand = true;
    }
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  };

  // Display Icons for compas
  displayIconsCompass(exit: ExitList) {
    const datatransform = exit.rotate ? ' style="transform: rotate(40deg)"' : '';
    return `<i class="fas ${exit.symbol}"${datatransform}></i>`;
  }

  init() {
    $(document).ready(() => {

      this.createPanes();

      $('#textbox').keydown((event) => {
        const keycode = event.keyCode ? event.keyCode : event.which;
        for (const exit of this.lexicon.exit_list) {
          if (exit.key && exit.key === keycode) {
            this.msgInputText(exit.name);
            this.parser.parse(exit.name);
            $('#textbox').val('');
            event.stopPropagation();
            event.preventDefault();
            return false;
          }
        }
        if (keycode === 13) {
          // enter
          if (
            event.ctrlKey &&
            (this.settings.playMode === 'dev' ||
              this.settings.playMode === 'beta')
          ) {
            this.parser.parse('script show');
          } else {
            const s = $('#textbox').val();
            this.msgInputText(s);
            if (s) {
              if (
                this.savedCommands[this.savedCommands.length - 1] !==
                s
              ) {
                this.savedCommands.push(s);
              }
              this.savedCommandsPos = this.savedCommands.length;
              this.parser.parse(s);
              if (this.doNotEraseLastCommand) {
                this.doNotEraseLastCommand = false;
              } else {
                $('#textbox').val('');
              }
            }
          }
        }
        if (keycode === 38) {
          // up arrow
          this.savedCommandsPos -= 1;
          if (this.savedCommandsPos < 0) {
            this.savedCommandsPos = 0;
          }
          $('#textbox').val(
            this.savedCommands[this.savedCommandsPos],
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
          this.savedCommandsPos += 1;
          if (this.savedCommandsPos >= this.savedCommands.length) {
            this.savedCommandsPos = this.savedCommands.length - 1;
          }
          $('#textbox').val(
            this.savedCommands[this.savedCommandsPos],
          );
        }
        if (keycode === 27) {
          // ESC
          $('#textbox').val('');
        }
        if (
          keycode === 96 &&
          (this.settings.playMode === 'dev' ||
            this.settings.playMode === 'beta')
        ) {
          if (event.ctrlKey && event.altKey) {
            this.parser.parse('wt b');
          } else if (event.altKey) {
            this.parser.parse('wt a');
          } else if (event.ctrlKey) {
            this.parser.parse('wt c');
          } else {
            this.parser.parse('test');
          }
          setTimeout(() => {
            $('#textbox').val('');
          }, 1);
        }
        if (keycode === 90 && event.ctrlKey) {
          this.parser.parse('undo');
        }
      });
      this.textColour = $('.side-panes').css('color');
      if (this.settings.soundsFiles) {
        const main = $('#main');
        for (const el of this.settings.soundsFiles) {
          main.append(
            `<audio id="${el}" src="${this.settings.soundsFolder}${el}${this.settings.soundsFileExt}"/>`,
          );
        }
      }
      this.game.init();
      this.endTurnUI(true);
      this.game.begin();
    });
  }
}
