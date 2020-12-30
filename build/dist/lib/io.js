import $ from "../../web_modules/jquery.js";
import {WorldStates, Known} from "./constants.js";
import {sentenceCase, toInt} from "./tools/tools.js";
import {Base} from "./base.js";
export class IO extends Base {
  constructor(quest) {
    super(quest);
    this.nextid = 0;
    this.outputSuspended = false;
    this.currentItemList = [];
    this.modulesToUpdate = [];
    this.modulesToInit = [];
    this.spoken = false;
    this.transcript = false;
    this.transcriptFlag = false;
    this.transcriptText = [];
    this.allowedHtmlAttrs = [
      "width",
      "height",
      "onclick",
      "src",
      "autoplay"
    ];
    this.mainGutter = 20;
    this.panesWidth = 160;
    this.resizePanesListener = window.matchMedia(`(max-width: ${this.settings.panesCollapseAt}px)`);
    this.resizeMapImageListener = window.matchMedia(`(max-width: ${this.settings.mapAndImageCollapseAt}px)`);
    this.disableLevel = 0;
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.voice2 = null;
    this.dialogShowing = false;
    this.savedCommands = ["help"];
    this.savedCommandsPos = 0;
    this.finished = false;
    this.doNotEraseLastCommand = true;
    this.resizePanesListener.addListener(this.calcMargins);
    this.resizeMapImageListener.addListener(this.calcMargins);
    this.init();
  }
  _msg(s, params, options) {
    if (options.tag === void 0)
      options.tag = "p";
    if (options.cssClass === void 0)
      options.cssClass = "default-" + options.tag.toLowerCase();
    const processed = params ? this.text.processText(s, params).trim() : s.trim();
    if (processed === "" && !options.printBlank) {
      return;
    }
    const lines = processed.split("|");
    lines.forEach((line) => {
      const data = options;
      data.text = line;
      if (!data.action)
        data.action = "output";
      this.addToOutputQueue(data);
    });
  }
  addToOutputQueue(data) {
    data.id = this.nextid;
    this.outputQueue.push(data);
    this.nextid += 1;
    this.outputFromQueue();
  }
  msg(s, params = {}, cssClass) {
    const lines = s.split("|");
    lines.forEach((l) => {
      const tag = /^#/.test(l) ? "h4" : "p";
      const line = l.replace(/^#/, "");
      this._msg(line, params || {}, {cssClass, tag});
    });
  }
  rawPrint(s) {
    this._msg(s, {}, {});
  }
  msgBlankLine() {
    this._msg("", false, {tag: "p", printBlank: true});
  }
  msgDiv(arr, params, cssClass) {
    let s = "";
    arr.forEach((item) => s += `  <p>${item}</p>
`);
    this._msg(s, params || {}, {cssClass, tag: "div"});
  }
  msgList(arr, ordered, params, cssClass) {
    let s = "";
    arr.forEach((item) => s += `  <li>${item}</li>
`);
    this._msg(s, params || {}, {cssClass, tag: ordered ? "ol" : "ul"});
  }
  msgTable(arr, headings, params = {}, cssClass = "") {
    let s = "";
    if (headings) {
      s += "  <tr>\n";
      headings.forEach((item) => s += `    <th>${item}</th>
`);
      s += "  </tr>\n";
    }
    arr.forEach((row) => {
      s += "  <tr>\n";
      row.forEach((item) => s += `    <td>${item}</td>
`);
      s += "  </tr>\n";
    });
    this._msg(s, params, {cssClass, tag: "table"});
  }
  getH(level) {
    switch (level) {
      case 1:
        return "h1";
      case 2:
        return "h2";
      case 3:
        return "h3";
      case 4:
        return "h4";
      case 5:
        return "h5";
      case 6:
        return "h6";
    }
  }
  msgHeading(s, level, params = {}) {
    this._msg(s, params, {tag: this.getH(level)});
  }
  picture(filename, width, height) {
    const src = filename.includes("/") ? filename : this.settings.imagesFolder + filename;
    this._msg("", {}, {action: "output", width, height, tag: "img", src, printBlank: true});
  }
  image(filename, width, height) {
    const src = filename.includes("/") ? filename : this.settings.imagesFolder + filename;
    this._msg("", {}, {
      action: "output",
      width,
      height,
      tag: "img",
      src,
      cssClass: "centred",
      printBlank: true,
      destination: "quest-image"
    });
  }
  sound(filename) {
    this._msg("Your browser does not support the <code>audio</code> element.", {}, {action: "sound", name: filename});
  }
  ambient(filename = "n/a", volume = 0) {
    this._msg("Your browser does not support the <code>audio</code> element.", {}, {action: "ambient", name: filename, volume});
  }
  video(filename) {
    this._msg("Your browser does not support the <code>video</code> element.", {}, {
      action: "output",
      autoplay: true,
      tag: "video",
      src: `${this.settings.videosFolder}/${filename}`
    });
  }
  draw(width, height, data, options = {}) {
    let s = `<svg width="${width}" height="${height}" viewBox="`;
    s += options.x ? `${options.x} ${options.y}` : "0 0";
    s += ` ${width} ${height}" `;
    if (options.background)
      s += `style="background:${options.background}" `;
    s += 'xmlns="http://www.w3.org/2000/svg">';
    s += `${data.join("")}</svg>`;
    if (this.settings.reportAllSvg)
      this.log.info(s.replace(/></g, ">\n<"));
    if (options.destination) {
      $(`#${options.destination}`).html(s);
    } else {
      this.rawPrint(s);
    }
  }
  failedmsg(s, params = {}) {
    this._msg(s, params, {cssClass: "failed", tag: "p"});
    return WorldStates.FAILED;
  }
  falsemsg(s, params = {}) {
    this._msg(s, params, {cssClass: "failed", tag: "p"});
    return false;
  }
  metamsg(s, params = {}) {
    this._msg(s, params, {cssClass: "meta", tag: "p"});
  }
  parsermsg(s) {
    this._msg(s, false, {cssClass: "parser", tag: "p"});
    return false;
  }
  errormsg(s) {
    if (this.world.isCreated) {
      this.print({
        tag: "p",
        cssClass: "error",
        text: this.lexicon.error
      });
    }
    this.log.error(`ERROR: ${s}`);
    this.log.info('Look through the trace below to find the offending code. The first entry in the list will be "errormsg", which is me, the next will the code that detected the error and called the "errormsg" message. You may need to look further down to find the root cause. If you get to the "jquery" lines you have gone too far.');
    this.log.trace();
    return false;
  }
  debugmsg(s) {
    if (this.settings.playMode === "dev" || this.settings.playMode === "meta") {
      this.print({tag: "p", cssClass: "debug", text: s});
    }
  }
  clearScreen() {
    this.addToOutputQueue({action: "clear"});
  }
  wait(delay, text) {
    if (this.settings.testing)
      return;
    if (delay === void 0) {
      this.addToOutputQueue({
        action: "wait",
        text,
        cssClass: "continue"
      });
    } else {
      this.addToOutputQueue({
        action: "delay",
        delay,
        text,
        cssClass: "continue"
      });
    }
  }
  askQuestion(title, fn2) {
    this.msg(title);
    this.parser.overrideWith(fn2);
  }
  showMenu(title, options, fn2) {
    const opts = {article: Known.DEFINITE, capital: true};
    this.input(title, options, false, fn2, (options2) => {
      for (let i = 0; i < options2.length; i += 1) {
        let s = `<a class="menu-option" onclick="this.menuResponse(${i})">`;
        s += typeof options2[i] === "string" ? options2[i] : this.processor.getName(options2[i], opts);
        s += "</a>";
        this.msg(s);
      }
    });
  }
  showMenuWithNumbers(title, options, fn2) {
    const opts = {article: Known.DEFINITE, capital: true};
    this.parser.overrideWith(this.menuResponse);
    this.input(title, options, true, fn2, (options2) => {
      for (let i = 0; i < options2.length; i += 1) {
        let s = `${i + 1}. <a class="menu-option" onclick="this.menuResponse(${i})">`;
        s += typeof options2[i] === "string" ? options2[i] : this.processor.getName(options2[i], opts);
        s += "</a>";
        this.msg(s);
      }
    });
  }
  showDropDown(title, options, fn2) {
    const opts = {article: Known.DEFINITE, capital: true};
    this.input(title, options, false, fn2, (options2) => {
      let s = '<select id="menu-select" class="custom-select" style="width:400px;" ';
      s += `onchange="this.menuResponse($('#menu-select').find(':selected').val())">`;
      s += '<option value="-1"> -= 1 Select one  -= 1</option>';
      for (let i = 0; i < options2.length; i += 1) {
        s += `<option value="${i}">`;
        s += typeof options2[i] === "string" ? options2[i] : this.processor.getName(options2[i], opts);
        s += "</option>";
      }
      this.msg(`${s}</select>`);
      $("#menu-select").focus();
    });
  }
  showYesNoMenu(title, fn2) {
    this.showMenu(title, this.lexicon.yesNo, fn2);
  }
  showYesNoMenuWithNumbers(title, fn2) {
    this.showMenuWithNumbers(title, this.lexicon.yesNo, fn2);
  }
  showYesNoDropDown(title, fn2) {
    this.showDropDown(title, this.lexicon.yesNo, fn2);
  }
  endTurnUI(update) {
    if (this.settings.panes !== "none" && update) {
      this.lexicon.exit_list.forEach((exit) => {
        if (this.game.room.hasExit(exit.name, {excludeScenery: true}) || exit.type === "nocmd") {
          $(`#exit-${exit.name}`).show();
        } else {
          $(`#exit-${exit.name}`).hide();
        }
      });
      this.updateStatus();
      if (this.settings.updateCustomUI)
        this.settings.updateCustomUI();
    }
    this.modulesToUpdate.forEach((m) => m.update(update));
    this.updateUIItems();
    setTimeout(this.scrollToEnd, 1);
    if (this.settings.textInput) {
      $("#textbox").focus();
    }
  }
  createPaneBox(position, title, content) {
    $(`div.pane-div:nth-child(${position})`).before(`<div class="pane-div"><h4 class="side-pane-heading">${title}</h4><div class="">${content}</div></div>`);
  }
  createToolbar() {
    let html = "";
    html += '<div class="toolbar button" id="toolbar">';
    html += '<div class="status">';
    if (this.settings.toolbar.content)
      html += ` <div>${this.settings.toolbar.content()}</div>`;
    html += "</div>";
    html += '<div class="room">';
    if (this.settings.toolbar.roomdisplay) {
      html += ` <div>${sentenceCase(this.processor.getName(this.state.get(this.game.player.loc.name), {
        article: Known.DEFINITE
      }))}</div>`;
    }
    html += "</div>";
    html += '<div class="links">';
    for (const link of this.settings.toolbar.buttons) {
      const js = link.cmd ? `QuestJs._tools.runCmd('${link.cmd}')` : link.onclick;
      html += ` <a class="link" onclick="${js}"><i class="fas ${link.icon}" title="${link.title}"></i></a>`;
    }
    html += "</div>";
    html += "</div>";
    $("#output").before(html);
  }
  scriptStart() {
    this.transcript = true;
    this.transcriptFlag = true;
    this.metamsg("Transcript is now on.");
  }
  scriptEnd() {
    this.metamsg("Transcript is now off.");
    this.transcript = false;
  }
  scriptShow(opts = "") {
    if (opts === "w") {
      const lines = [];
      for (const el of this.transcriptText) {
        if (el.cssClass === "input" && !el.text.match(/^(tran)?script/)) {
          lines.push(`    "${el.text}",`);
        }
        if (el.cssClass === "menu") {
          const previous = lines.pop();
          if (typeof previous === "string") {
            const d = {
              cmd: /^ +\"(.+)\"/.exec(previous)[1],
              menu: [toInt(el.n, 10)]
            };
            lines.push(d);
          } else {
            previous.menu.push(toInt(el.n));
            lines.push(previous);
          }
        }
      }
      this.log.info(lines);
      const wt = lines.map((el) => typeof el === "string" ? el : `    ${JSON.stringify(el)},`).join("\n");
      this.copyTextToClipboard(`  recorded:[
${wt}
  ],
`);
    } else {
      let html = "";
      html += '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Quest 6 Transcript for ';
      html += this.settings.title;
      html += '</title></head><body><h2>Quest 6 Transcript for "';
      html += `${this.settings.title}" (version ${this.settings.version}`;
      html += ")</h2>";
      for (const el of this.transcriptText) {
        switch (el.cssClass) {
          case "default-p":
            html += `<p>${el.text}</p>`;
            break;
          case "meta":
            if (!opts.includes("m")) {
              html += `<p style="color:blue">${el.text}</p>`;
            }
            break;
          case "error":
            if (!opts.includes("e")) {
              html += `<p style="color:red">${el.text}</p>`;
            }
            break;
          case "debug":
            if (!opts.includes("d")) {
              html += `<p style="color:grey">${el.text}</p>`;
            }
            break;
          case "parser":
            if (!opts.includes("p")) {
              html += `<p style="color:magenta">${el.text}</p>`;
            }
            break;
          case "input":
            if (!opts.includes("i")) {
              html += `<p style="color:cyan">${el.text}</p>`;
            }
            break;
          case "menu":
            if (!opts.includes("o")) {
              html += `<p style="color:green">Menu option ${el.n}: ${el.text}</p>`;
            }
            break;
          case "html":
            html += el.text;
            break;
          default:
            html += `<${el.tag}>${el.text}</${el.tag}>`;
        }
      }
      html += "</body></html>";
      const tab = window.open("about:blank", "_blank");
      tab.document.write(html);
      tab.document.close();
    }
  }
  scriptClear() {
    this.transcriptText = [];
    this.metamsg("Transcript cleared.");
  }
  scriptAppend(data) {
    this.transcriptText.push(data);
  }
  input(title, options, allowText, reactFunction, displayFunction) {
    this.menuStartId = this.nextid;
    this.menuFn = reactFunction;
    this.menuOptions = options;
    if (this.settings.testing) {
      if (this.test.menuResponseNumber === void 0) {
        this.debugmsg(`Error when testing menu (possibly due to disambiguation?), this.test.menuResponseNumber = ${this.test.menuResponseNumber}`);
      } else {
        this.menuResponse(this.test.menuResponseNumber);
        delete this.test.menuResponseNumber;
      }
      return;
    }
    if (this.settings.walkthroughMenuResponses.length > 0) {
      const response = this.settings.walkthroughMenuResponses.shift();
      this.log.info(`Using response: ${response}`);
      this.log.info(`this.settings.walkthroughMenuResponses.length: ${this.settings.walkthroughMenuResponses.length}`);
      this.menuResponse(response);
      return;
    }
    this.disable(allowText ? 2 : 3);
    this.msg(title, {}, "menu-title");
    displayFunction(options);
  }
  unpause() {
    $(".continue").remove();
    this.outputSuspended = false;
    this.outputFromQueue();
    if (this.settings.textInput)
      $("#textbox").focus();
  }
  forceOutputFromQueue() {
    this.outputSuspended = false;
    this.outputFromQueue();
  }
  outputFromQueue() {
    if (this.outputSuspended)
      return;
    if (this.outputQueue.length === 0) {
      this.enable();
      return;
    }
    const data = this.outputQueue.shift();
    if (data.action === "wait") {
      this.disable();
      this.outputSuspended = true;
      data.tag = "p";
      data.onclick = this.unpause;
      if (!data.text)
        data.text = this.lexicon.click_to_continue;
      this.print(data);
    }
    if (data.action === "delay") {
      this.disable();
      this.outputSuspended = true;
      if (data.text) {
        data.tag = "p";
        this.print(data);
      }
      setTimeout(this.unpause, data.delay * 1e3);
    }
    if (data.action === "output") {
      const html = this.print(data);
      if (this.spoken)
        this.speak(html);
      if (this.transcript)
        this.scriptAppend(data);
      this.outputFromQueue();
    }
    if (data.action === "effect") {
      this.disable();
      data.effect(data);
    }
    if (data.action === "clear") {
      $("#output").empty();
      this.outputFromQueue();
    }
    if (data.action === "sound") {
      this.log.info(`PLAY SOUND ${data.name}`);
      if (!this.settings.silent) {
        const el = document.getElementById(data.name);
        el.currentTime = 0;
        el.play();
      }
    }
    if (data.action === "ambient") {
      this.log.info(`PLAY AMBIENT ${data.name}`);
      const els = Array.prototype.slice.call(document.getElementsByTagName("audio"));
      els.forEach((el) => el.pause());
      if (!this.settings.silent && data.name) {
        const el = document.getElementById(data.name);
        el.currentTime = 0;
        el.loop = true;
        el.play();
        if (data.volume)
          el.volume = data.volume / 10;
      }
    }
    window.scrollTo(0, document.getElementById("main").scrollHeight);
  }
  print(data) {
    let html;
    if (typeof data === "string") {
      html = data;
    }
    if (data.html) {
      html = data.html;
    } else {
      html = `<${data.tag} id="n${data.id}"`;
      if (data.cssClass)
        html += ` class="${data.cssClass}"`;
      for (const s of this.allowedHtmlAttrs)
        if (data[s])
          html += ` ${s}="${data[s]}"`;
      html += `>${data.text}</${data.tag}>`;
    }
    if (data.destination) {
      $(`#${data.destination}`).html(html);
    } else {
      $("#output").append(html);
    }
    return html;
  }
  typewriterEffect(data) {
    if (!data.position) {
      $("#output").append(`<${data.tag} id="n${data.id}" class="typewriter"></${data.tag}>`);
      data.position = 0;
      data.text = this.text.processText(data.text, data.params);
    }
    const el = $(`#n${data.id}`);
    el.html(`${data.text.slice(0, data.position)}<span class="typewriter-active">${data.text.slice(data.position, data.position + 1)}</span>`);
    data.position += 1;
    if (data.position <= data.text.length) {
      this.outputQueue.unshift(data);
      this.outputSuspended = true;
    }
    setTimeout(this.forceOutputFromQueue, this.settings.textEffectDelay);
  }
  unscrambleEffect(data) {
    if (!data.count) {
      $("#output").append(`<${data.tag} id="n${data.id}" class="typewriter"></${data.tag}>`);
      data.count = 0;
      data.text = this.text.processText(data.text, data.params);
      if (!data.pick)
        data.pick = this.unscamblePick;
      data.mask = "";
      data.scrambled = "";
      for (let i = 0; i < data.text.length; i += 1) {
        if (data.text.charAt(i) === " " && !data.incSpaces) {
          data.scrambled += " ";
          data.mask += " ";
        } else {
          data.scrambled += data.pick(i);
          data.mask += "x";
          data.count += 1;
        }
      }
    }
    if (data.randomPlacing) {
      let pos = this.random.int(0, data.count - 1);
      let newMask = "";
      for (let i = 0; i < data.mask.length; i += 1) {
        if (data.mask.charAt(i) === " ") {
          newMask += " ";
        } else if (pos === 0) {
          newMask += " ";
          pos -= 1;
        } else {
          newMask += "x";
          pos -= 1;
        }
      }
      data.mask = newMask;
    } else {
      data.mask = data.mask.replace("x", " ");
    }
    data.count -= 1;
    $(`#n${data.id}`).html(this.unscambleScramble(data));
    if (data.count > 0) {
      this.outputQueue.unshift(data);
      this.outputSuspended = true;
    }
    setTimeout(this.forceOutputFromQueue, this.settings.textEffectDelay);
  }
  unscamblePick() {
    const c = String.fromCharCode(this.random.int(33, 125));
    return c === "<" ? "~" : c;
  }
  unscambleScramble(data) {
    let s = "";
    for (let i = 0; i < data.text.length; i += 1) {
      s += data.mask.charAt(i) === " " ? data.text.charAt(i) : data.pick(i);
    }
    return s;
  }
  cmdlink(command, str) {
    return `<a class="cmd-link" onclick="this.parser.parse('${command}')">${str}</a>`;
  }
  scrollToEnd() {
    window.scrollTo(0, document.getElementById("main").scrollHeight);
  }
  setTitleAndInit(s) {
    document.title = s;
    for (const o of this.modulesToInit) {
      o.init();
    }
    this.calcMargins();
  }
  calcMargins() {
    let mapImageWidth = "0";
    if (typeof this.map !== "undefined") {
      if (!this.settings.hideMap)
        mapImageWidth = this.settings.mapStyle.width;
    }
    if (typeof this.imagePane !== "undefined") {
      if (!this.settings.hideImagePane && this.settings.imageWidth > mapImageWidth)
        mapImageWidth = this.settings.imageWidth;
    }
    $("#main").css("margin-left", "40px");
    $("#main").css("margin-right", "40px");
    if (this.settings.panes !== "none") {
      const margin2 = this.settings.panes === "left" ? "margin-left" : "margin-right";
      if (this.resizePanesListener.matches) {
        $("#main").css(margin2, `${this.mainGutter}px`);
        $("#panes").css("display", "none");
      } else {
        $("#main").css(margin2, `${this.panesWidth + this.mainGutter}px`);
        $("#panes").css("display", "block");
      }
    }
    let margin = this.settings.panes === "right" ? "margin-left" : "margin-right";
    if (this.settings.mapImageSide)
      margin = this.settings.mapImageSide === "left" ? "margin-left" : "margin-right";
    if (this.resizeMapImageListener.matches) {
      $("#main").css(margin, `${this.mainGutter}px`);
      $("#quest-image").css("display", "none");
      $("#quest-map").css("display", "none");
    } else {
      $("#main").css(margin, `${mapImageWidth + this.mainGutter}px`);
      $("#quest-image").css("display", "block");
      $("#quest-map").css("display", "block");
    }
  }
  disable(level = 1) {
    if (level <= this.disableLevel)
      return;
    this.disableLevel = level;
    if (level !== 2)
      $("#input").hide();
    $(".compass-button .dark-body").css("color", "#808080");
    $(".item").css("color", "#808080");
    $(".item-action").css("color", "#808080");
  }
  enablethis(level) {
    if (!level)
      level = 1;
    if (!this.disableLevel || level < this.disableLevel)
      return;
    this.disableLevel = 0;
    $("#input").show();
    $(".compass-button").css("color", this.textColour);
    $(".item").css("color", this.textColour);
    $(".item-action").css("color", this.textColour);
  }
  updateUIItems() {
    if (this.settings.panes === "none" || !this.settings.inventoryPane) {
      return;
    }
    for (const inv of this.settings.inventoryPane) {
      $(`#${inv.alt}`).empty();
    }
    this.currentItemList = [];
    this.state.forEach((key, item) => {
      this.settings.inventoryPane.forEach((inv) => {
        const loc = inv.getLoc();
        if (inv.test(item) && !item.inventorySkip) {
          this.appendItem(item, inv.alt, loc);
        }
      });
    });
    this.clickItem("");
  }
  updateStatus() {
    if (this.settings.statusPane) {
      $("#status-pane").empty();
      this.settings.status.forEach((st) => {
        if (typeof st === "string") {
          if (this.game.player[st] !== void 0) {
            let s = `<tr><td width="${this.settings.statusWidthLeft}">${sentenceCase(st)}</td>`;
            s += `<td width="${this.settings.statusWidthRight}">${this.game.player[st]}</td></tr>`;
            $("#status-pane").append(s);
          }
        } else if (typeof st === "function") {
          $("#status-pane").append(`<tr>${st()}</tr>`);
        }
      });
    }
    if (this.settings.toolbar) {
      $("#toolbar").remove();
      this.createToolbar();
    }
  }
  menuResponse(n) {
    if (typeof n === "string" && n.match(/^\d+$/))
      n = toInt(n) - 1;
    if (typeof n === "string") {
      const s = n;
      n = this.menuOptions.findIndex((el) => {
        this.log.info(el);
        if (typeof el === "string")
          return el.includes(s);
        return el.name.includes(s);
      });
    }
    this.enable(5);
    $("#input").css("world.", "block");
    for (let i = this.menuStartId; i < this.nextid; i += 1)
      $(`#n${i}`).remove();
    if (n === void 0) {
      this.menuFn();
    } else if (n !== -1) {
      if (this.transcript) {
        const a = this.menuOptions[n];
        this.scriptAppend({
          cssClass: "menu",
          text: a.alias ? a.alias : a,
          n
        });
      }
      this.menuFn(this.menuOptions[n]);
    }
    this.endTurnUI(true);
    if (this.settings.textInput)
      $("#textbox").focus();
  }
  clickExit(dir) {
    if (this.disableLevel)
      return;
    this.msgInputText(dir);
    let cmd = this.getCommand(`Go${sentenceCase(dir)}`);
    if (!cmd)
      cmd = this.getCommand(sentenceCase(dir));
    if (!cmd)
      cmd = this.getCommand(`Meta${sentenceCase(dir)}`);
    this.parser.quickCmd(cmd);
  }
  clickItem(itemName) {
    if (this.disableLevel)
      return;
    for (const item of this.currentItemList) {
      if (item === itemName) {
        $(`.${item}-actions`).toggle();
      } else {
        $(`.${item}-actions`).hide();
      }
    }
  }
  clickItemAction(itemName, action) {
    if (this.disableLevel)
      return;
    const item = this.state.get(itemName);
    const cmd = action.includes("%") ? action.replace("%", item.alias) : `${action} ${item.alias}`;
    this.msgInputText(cmd);
    this.parser.parse(cmd);
  }
  appendItem(item, htmlDiv, loc, isSubItem = false) {
    $(`#${htmlDiv}`).append(`<div id="${item.name}-item"><p class="item${isSubItem ? " sub-item" : ""}" onclick="this.clickItem('${item.name}')">${this.getIcon(item)}${item.getListAlias(loc)}</p></div>`);
    this.currentItemList.push(item.name);
    const verbList = item.getVerbs(loc);
    if (verbList === void 0) {
      this.errormsg(`No verbs for ${item.name}`);
      this.log.info(item);
    }
    for (let verb of verbList) {
      if (typeof verb === "string")
        verb = {name: verb, action: verb};
      let s = `<div class="${item.name}-actions item-action" onclick="this.clickItemAction('${item.name}', '${verb.action}')">`;
      s += verb.name;
      s += "</div>";
      $(`#${htmlDiv}`).append(s);
    }
    if (item.container && !item.closed) {
      if (typeof item.getContents !== "function") {
        this.log.info("item flagged as container but no getContents function:");
        this.log.info(item);
      }
      const l = item.getContents(WorldStates.SIDE_PANE);
      for (const el of l) {
        this.appendItem(el, htmlDiv, item.name, true);
      }
    }
  }
  createPanes() {
    if (!["right", "left", "none"].includes(this.settings.panes)) {
      this.log.error(`ERROR: Your this.settings.panes value is "${this.settings.panes}". It must be one of "right", "left" or "none" (all lower-case). It is probably set in the file setiings.js.`);
      return;
    }
    $("#input").html(`<span id="cursor">${this.settings.cursor}</span><input type="text" name="textbox" id="textbox"  autofocus/>`);
    if (this.settings.panes === "none") {
      return;
    }
    document.writeln(`<div id="panes" class="side-panes side-panes${this.settings.panes} panes-narrow">`);
    if (this.settings.compassPane) {
      document.writeln('<div class="pane-div">');
      document.writeln('<table id="compass-table">');
      for (let i = 0; i < 3; i += 1) {
        document.writeln("<tr>");
        this.writeExit(0 + 5 * i);
        this.writeExit(1 + 5 * i);
        this.writeExit(2 + 5 * i);
        document.writeln("<td></td>");
        this.writeExit(3 + 5 * i);
        this.writeExit(4 + 5 * i);
        document.writeln("</tr>");
      }
      document.writeln("</table>");
      document.writeln("</div>");
    }
    if (this.settings.statusPane) {
      document.writeln('<div class="pane-div">');
      document.writeln(`<h4 class="side-pane-heading">${this.settings.statusPane}</h4>`);
      document.writeln('<table id="status-pane">');
      document.writeln("</table>");
      document.writeln("</div>");
    }
    if (this.settings.inventoryPane) {
      for (const inv of this.settings.inventoryPane) {
        document.writeln('<div class="pane-div">');
        document.writeln(`<h4 class="side-pane-heading">${inv.name}</h4>`);
        document.writeln(`<div id="${inv.alt}">`);
        document.writeln("</div>");
        document.writeln("</div>");
      }
    }
    document.writeln('<div class="pane-div-finished">');
    document.writeln(this.lexicon.game_over_html);
    document.writeln("</div>");
    document.writeln("</div>");
    if (this.settings.customUI)
      this.settings.customUI();
  }
  writeExit(n) {
    document.write(`<td class="compass-button" title="${this.lexicon.exit_list[n].name}">`);
    document.write(`<span class="compass-button" id="exit-${this.lexicon.exit_list[n].name}`);
    document.write(`" onclick="this.clickExit('${this.lexicon.exit_list[n].name}')">`);
    document.write(this.settings.symbolsForCompass ? this.displayIconsCompass(this.lexicon.exit_list[n]) : this.lexicon.exit_list[n].abbrev);
    document.write("</span></td>");
  }
  getCommand(name) {
    return this.commandFactory.findCmd(name);
  }
  msgInputText(s) {
    if (!this.settings.cmdEcho || s === "")
      return;
    $("#output").append(`<p id="n${this.nextid}" class="input-text">&gt; ${s}</p>`);
    this.nextid += 1;
    if (this.spoken)
      this.speak(s, true);
    if (this.transcript)
      this.scriptAppend({cssClass: "input", text: s});
  }
  speak(str, altVoice = false) {
    if (!this.voice) {
      this.voice = this.synth.getVoices().find((el) => /UK/.test(el.name) && /Female/.test(el.name));
      if (!this.voice)
        this.voice = this.synth.getVoices()[0];
    }
    if (!this.voice2) {
      this.voice2 = this.synth.getVoices().find((el) => /UK/.test(el.name) && /Male/.test(el.name));
      if (!this.voice2)
        this.voice2 = this.synth.getVoices()[0];
    }
    const utterThis = new SpeechSynthesisUtterance(str);
    utterThis.onend = function(event) {
    };
    utterThis.onerror = function(event) {
    };
    utterThis.voice = altVoice ? this.voice2 : this.voice;
    utterThis.pitch = 1;
    utterThis.rate = 1;
    this.synth.speak(utterThis);
  }
  showHtml(title, html) {
    if (this.dialogShowing)
      return false;
    $("body").append(`<div id="showHtml" title="${title}">${html}</div>`);
    this.dialogShowing = true;
    $("#showHtml").dialog({
      width: 860,
      close() {
        $("#showHtml").remove();
        this.dialogShowing = false;
      }
    });
    return true;
  }
  enable(level = 1) {
    if (!this.disableLevel || level < this.disableLevel)
      return;
    this.disableLevel = 0;
    $("#input").show();
    $(".compass-button").css("color", this.textColour);
    $(".item").css("color", this.textColour);
    $(".item-action").css("color", this.textColour);
  }
  finish() {
    this.finished = true;
    this.settings.textInput = false;
    $("#input").hide();
    $(".pane-div").hide();
    $(".pane-div-finished").show();
    if (this.settings.onFinish)
      this.settings.onFinish();
    if (this.transcriptFlag)
      this.msg("To see the transcript, click {cmd:SCRIPT SHOW:here}.");
  }
  toggleDarkMode() {
    this.settings.darkModeActive = !this.settings.darkModeActive;
    if (this.settings.darkModeActive) {
      $("body").addClass("dark-body");
    } else {
      $("body").removeClass("dark-body");
    }
    if (this.settings.onDarkToggle)
      this.settings.onDarkToggle();
    this.textColour = $(".side-panes").css("color");
    this.msg(this.lexicon.done_msg);
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }
  copyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      this.metamsg(`Copying text command was ${successful ? "successful" : "unsuccessful"}`);
    } catch (err) {
      this.metamsg("Oops, unable to copy");
    }
    document.body.removeChild(textArea);
  }
  addSlider(id, values, func) {
    if (!this.settings.sliders)
      this.settings.sliders = {};
    const name = sentenceCase(id.replace("-", " "));
    const max = typeof values === "number" ? values : values.length - 1;
    this.settings.sliders[id] = {name, max, func, values};
    if (typeof values !== "number")
      this.settings.sliders[id].values = values;
    const slider = $(`#${id}`);
    slider.append(`<p id="${id}-text">${name}: ${typeof values === "number" ? 0 : values[0]}</p>`);
    if (func)
      func(0);
    slider.append(`<div id="${id}-slider"></div>`);
    slider.css("padding-left", "10px");
    slider.css("padding-right", "10px");
    $(`#${id}-slider`).slider({max});
    $(`#${id}-slider`).slider({
      slide(event, ui) {
        const id2 = event.target.id.replace("-slider", "");
        const {value} = ui;
        $(`#${id2}-text`).html(`${this.settings.sliders[id2].name}: ${this.settings.sliders[id2].values ? this.settings.sliders[id2].values[value] : value}`);
        if (this.settings.sliders[id2].func) {
          this.settings.sliders[id2].func(value);
        } else {
          $(`#${id2}-text`).html(`${this.settings.sliders[id2].name}: ${this.settings.sliders[id2].values ? this.settings.sliders[id2].values[value] : value}`);
        }
      }
    });
  }
  getIcon(item) {
    if (!this.settings.iconsFolder)
      return "";
    if (!item.icon)
      return "";
    if (item.icon() === "")
      return "";
    return `<img src="${this.settings.iconsFolder}${this.settings.darkModeActive ? "l_" : "d_"}${item.icon()}.png" />`;
  }
  againOrOops(isAgain) {
    if (this.savedCommands.length === 0) {
      this.metamsg(this.lexicon.again_not_available);
      return WorldStates.FAILED;
    }
    this.savedCommands.pop();
    if (isAgain) {
      this.parser.parse(this.savedCommands[this.savedCommands.length - 1]);
    } else {
      $("#textbox").val(this.savedCommands[this.savedCommands.length - 1]);
      this.doNotEraseLastCommand = true;
    }
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }
  displayIconsCompass(exit) {
    const datatransform = exit.rotate ? ' style="transform: rotate(40deg)"' : "";
    return `<i class="fas ${exit.symbol}"${datatransform}></i>`;
  }
  init() {
    $(document).ready(() => {
      this.createPanes();
      $("#textbox").keydown((event) => {
        const keycode = event.keyCode ? event.keyCode : event.which;
        for (const exit of this.lexicon.exit_list) {
          if (exit.key && exit.key === keycode) {
            this.msgInputText(exit.name);
            this.parser.parse(exit.name);
            $("#textbox").val("");
            event.stopPropagation();
            event.preventDefault();
            return false;
          }
        }
        if (keycode === 13) {
          if (event.ctrlKey && (this.settings.playMode === "dev" || this.settings.playMode === "beta")) {
            this.parser.parse("script show");
          } else {
            const s = $("#textbox").val();
            this.msgInputText(s);
            if (s) {
              if (this.savedCommands[this.savedCommands.length - 1] !== s) {
                this.savedCommands.push(s);
              }
              this.savedCommandsPos = this.savedCommands.length;
              this.parser.parse(s);
              if (this.doNotEraseLastCommand) {
                this.doNotEraseLastCommand = false;
              } else {
                $("#textbox").val("");
              }
            }
          }
        }
        if (keycode === 38) {
          this.savedCommandsPos -= 1;
          if (this.savedCommandsPos < 0) {
            this.savedCommandsPos = 0;
          }
          $("#textbox").val(this.savedCommands[this.savedCommandsPos]);
          const el = $("#textbox")[0];
          if (el.setSelectionRange) {
            setTimeout(() => {
              el.setSelectionRange(9999, 9999);
            }, 0);
          } else if (typeof el.selectionStart === "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
          } else if (typeof el.createTextRange !== "undefined") {
            el.focus();
            const range = el.createTextRange();
            range.collapse(false);
            range.select();
          }
        }
        if (keycode === 40) {
          this.savedCommandsPos += 1;
          if (this.savedCommandsPos >= this.savedCommands.length) {
            this.savedCommandsPos = this.savedCommands.length - 1;
          }
          $("#textbox").val(this.savedCommands[this.savedCommandsPos]);
        }
        if (keycode === 27) {
          $("#textbox").val("");
        }
        if (keycode === 96 && (this.settings.playMode === "dev" || this.settings.playMode === "beta")) {
          if (event.ctrlKey && event.altKey) {
            this.parser.parse("wt b");
          } else if (event.altKey) {
            this.parser.parse("wt a");
          } else if (event.ctrlKey) {
            this.parser.parse("wt c");
          } else {
            this.parser.parse("test");
          }
          setTimeout(() => {
            $("#textbox").val("");
          }, 1);
        }
        if (keycode === 90 && event.ctrlKey) {
          this.parser.parse("undo");
        }
      });
      this.textColour = $(".side-panes").css("color");
      if (this.settings.soundsFiles) {
        const main = $("#main");
        for (const el of this.settings.soundsFiles) {
          main.append(`<audio id="${el}" src="${this.settings.soundsFolder}${el}${this.settings.soundsFileExt}"/>`);
        }
      }
      this.game.initialise();
      this.endTurnUI(true);
      this.game.begin();
    });
  }
}
