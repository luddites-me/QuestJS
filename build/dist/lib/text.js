import $ from "../../web_modules/jquery.js";
import {Base} from "./base.js";
import {Known, WorldStates} from "./constants.js";
import {sentenceCase, toInt} from "./tools/tools.js";
export class Text extends Base {
  constructor(quest) {
    super(quest);
    this.text_processors = {};
    this.usedStrings = [];
    this.colours = [
      "#e6194b",
      "#3cb44b",
      "#ffe119",
      "#4363d8",
      "#f58231",
      "#911eb4",
      "#46f0f0",
      "#f032e6",
      "#bcf60c",
      "#fabebe",
      "#008080",
      "#e6beff",
      "#9a6324",
      "#fffac8",
      "#800000",
      "#aaffc3",
      "#808000",
      "#ffd8b1",
      "#000075",
      "#808080",
      "#ffffff",
      "#000000"
    ];
    this.init();
  }
  processText(str, params) {
    if (params === void 0) {
      params = {};
    }
    if (typeof str !== "string") {
      str = `${str}`;
    }
    params.tpOriginalString = str;
    if (this.usedStrings.includes(str)) {
      params.tpFirstTime = false;
    } else {
      this.usedStrings.push(str);
      params.tpFirstTime = true;
    }
    return this._processText(str, params);
  }
  _processText(str, params) {
    const s = this.findFirstToken(str);
    if (s) {
      let arr = s.split(":");
      let left = arr.shift();
      if (typeof this.text_processors[left] !== "function") {
        if (left === "player") {
          arr.unshift(this.game.player.name);
          left = "show";
        } else if (this.state.get(left)) {
          arr.unshift(left);
          left = "show";
        } else if (arr.length === 0) {
          arr = left.split(".");
          left = "show";
        } else {
          this.io.errormsg(`Attempting to use unknown text processor directive '${left}' (<i>${params.tpOriginalString}</i>)`);
          return str;
        }
      }
      str = str.replace(`{${s}}`, this.text_processors[left](arr, params));
      str = this._processText(str, params);
    }
    return str.replace(/@@@colon@@@/g, ":");
  }
  addDirective(name, fn) {
    this.text_processors[name] = fn;
  }
  findFirstToken(s) {
    const end = s.indexOf("}");
    if (end === -1) {
      return false;
    }
    const start = s.lastIndexOf("{", end);
    if (start === -1) {
      this.io.errormsg(`Failed to find starting curly brace in text processor (<i>${s}</i>)`);
      return false;
    }
    return s.substring(start + 1, end);
  }
  _charSwap(c, upper, lower) {
    if (c.match(/[A-Z]/))
      return String.fromCharCode(c.charCodeAt(0) - "A".charCodeAt(0) + upper);
    if (c.match(/[a-z]/))
      return String.fromCharCode(c.charCodeAt(0) - "a".charCodeAt(0) + lower);
    return c;
  }
  _findObject(name, params, arr) {
    if (params && params[name])
      return typeof params[name] === "string" ? this.state.get(params[name]) : params[name];
    if (name === "player")
      return this.game.player;
    if (this.state.get(name))
      return this.state.get(name);
    const ary = name.split(".");
    if (ary.length === 1)
      return void 0;
    if (ary.length > 2) {
      this.log.info(`The text process cannot handle attributes of attributes, so failed to deal with: ${name}`);
      this.log.info(ary);
      return void 0;
    }
    arr.unshift(ary[1]);
    return this.state.get(ary[0]);
  }
  findSubject(arr, params) {
    let subject;
    if (params[arr[0]]) {
      subject = params[arr[0]];
      if (typeof subject === "string")
        subject = this.state.get(subject);
      if (subject === void 0) {
        this.io.errormsg(`In text processor findSubject, could not find a subject with '${arr[0]}'. Check the console (F12) to see what params is. [${params.tpOriginalString}]`);
        this.log.info("params:");
        this.log.info(params);
        return false;
      }
    } else {
      subject = this.state.get(arr[0]);
      if (subject === void 0) {
        const s = `In text processor findSubject, could not find a key called \`${arr[0]}\` in the string \`${params.tpOriginalString}\``;
        this.log.error(s);
        this.log.error(params);
        throw new Error("Error in this.findSubject");
        return false;
      }
    }
    return subject;
  }
  handlePronouns(arr, params, pronoun) {
    const subject = this.findSubject(arr, params);
    if (!subject)
      return false;
    return arr[1] === "true" ? sentenceCase(subject.pronouns[pronoun]) : subject.pronouns[pronoun];
  }
  init() {
    this.addDirective("hour", (arr, params) => {
      const {hour} = this.utils.getDateTimeDict();
      if (hour < arr[0])
        return "";
      if (hour >= arr[1])
        return "";
      return arr[2];
    });
    this.text_processors.i = (arr, params) => `<i>${arr.join(":")}</i>`;
    this.text_processors.b = (arr, params) => `<b>${arr.join(":")}</b>`;
    this.text_processors.u = (arr, params) => `<u>${arr.join(":")}</u>`;
    this.text_processors.s = (arr, params) => `<strike>${arr.join(":")}</strike>`;
    this.text_processors.code = (arr, params) => `<code>${arr.join(":")}</code>`;
    this.text_processors.sup = (arr, params) => `<sup>${arr.join(":")}</sup>`;
    this.text_processors.sub = (arr, params) => `<sub>${arr.join(":")}</sub>`;
    this.text_processors.huge = (arr, params) => `<span style="font-size:2em">${arr.join(":")}</span>`;
    this.text_processors.big = (arr, params) => `<span style="font-size:1.5em">${arr.join(":")}</span>`;
    this.text_processors.small = (arr, params) => `<span style="font-size:0.8em">${arr.join(":")}</span>`;
    this.text_processors.tiny = (arr, params) => `<span style="font-size:0.6em">${arr.join(":")}</span>`;
    this.text_processors.smallcaps = (arr, params) => `<span style="font-variant:small-caps">${arr.join(":")}</span>`;
    this.text_processors.rainbow = (arr, params) => {
      const s = arr.pop();
      const colours = arr.length === 0 ? this.colours : arr;
      let result = "";
      for (let i = 0; i < s.length; i += 1) {
        result += `<span style="color:${this.random.fromArray(colours)}">${s.charAt(i)}</span>`;
      }
      return result;
    };
    this.text_processors.encode = (arr, params) => {
      const upper = toInt(arr.shift(), 16);
      const lower = toInt(arr.shift(), 16);
      const s = arr.shift();
      let result = "";
      for (let i = 0; i < s.length; i += 1) {
        result += this._charSwap(s.charAt(i), upper, lower);
      }
      return result;
    };
    this.text_processors.blur = (arr, params) => {
      const n = arr.shift();
      return `<span style="color:transparent;text-shadow: 0 0 ${n}px rgba(0,0,0,1);">${arr.join(":")}</span>`;
    };
    this.text_processors.font = (arr, params) => {
      const f = arr.shift();
      return `<span style="font-family:${f}">${arr.join(":")}</span>`;
    };
    this.text_processors.colour = (arr, params) => {
      const c = arr.shift();
      return `<span style="color:${c}">${arr.join(":")}</span>`;
    };
    this.text_processors.color = this.text_processors.colour;
    this.text_processors.back = (arr, params) => {
      const c = arr.shift();
      return `<span style="background-color:${c}">${arr.join(":")}</span>`;
    };
    this.text_processors.random = (arr, params) => {
      return arr[Math.floor(Math.random() * arr.length)];
    };
    this.text_processors.select = (arr, params) => {
      const o = this.state.get(arr[0]);
      if (!o)
        this.io.errormsg(`Failed to find an object called "${arr[0]}" in text processor select.`);
      const l = o[arr[1]];
      if (!l)
        this.io.errormsg(`Failed to find an attribute called "${arr[1]}" for "${arr[0]}" in text processor select.`);
      const n = o[arr[2]];
      if (!l)
        this.io.errormsg(`Failed to find an attribute called "${arr[2]}" for "${arr[0]}" in text processor select.`);
      return l[n];
    };
    this.text_processors.show = (arr, params) => {
      let name = arr.shift();
      if (params[name]) {
        if (typeof params[name] === "string")
          return params[name];
        if (typeof params[name] === "number")
          return params[name].toString();
        if (arr.length > 0)
          return params[name][arr[0]];
      }
      const obj = this._findObject(name, params, arr);
      if (!obj) {
        this.io.errormsg(`Failed to find object '${name}' in text processor 'show' (<i>${params.tpOriginalString}</i>)`);
        return false;
      }
      name = arr.shift();
      const val = obj[name];
      if (typeof val === "function") {
        return val();
      }
      return val;
    };
    this.text_processors.number = (arr, params) => {
      const name = arr.shift();
      if (name.match(/^\d+$/))
        return this.processor.toWords(toInt(name));
      if (typeof params[name] === "number")
        return this.processor.toWords(params[name]);
      const obj = this._findObject(name, params, arr);
      if (!obj) {
        this.io.errormsg(`Failed to find object '${name}' in text processor 'number' (<i>${params.tpOriginalString}</i>)`);
        return false;
      }
      if (typeof obj[arr[0]] === "number") {
        return this.processor.toWords(obj.obj[arr[0]]);
      }
      this.io.errormsg(`Failed to find a number for object '${name}' in text processor (<i>${params.tpOriginalString}</i>)`);
      return false;
    };
    this.text_processors.ordinal = (arr, params) => {
      const name = arr.shift();
      if (name.match(/^\d+$/))
        return this.processor.toOrdinal(toInt(name));
      if (typeof params[name] === "number")
        return this.processor.toOrdinal(params[name]);
      const obj = this._findObject(name, params, arr);
      if (!obj) {
        this.io.errormsg(`Failed to find object '${name}' in text processor 'number' (<i>${params.tpOriginalString}</i>)`);
        return false;
      }
      if (typeof obj[arr[0]] === "number") {
        return this.processor.toOrdinal(obj.obj[arr[0]]);
      }
      this.io.errormsg(`Failed to find a number for object '${name}' in text processor (<i>${params.tpOriginalString}</i>)`);
      return false;
    };
    this.text_processors.money = (arr, params) => {
      const name = arr.shift();
      if (name.match(/^\d+$/))
        return this.utils.displayMoney(toInt(name));
      if (typeof params[name] === "number")
        return this.utils.displayMoney(params[name]);
      const obj = this._findObject(name, params, arr);
      if (!obj) {
        this.io.errormsg(`Failed to find object '${name}' in text processor 'money' (<i>${params.tpOriginalString}</i>)`);
        return false;
      }
      if (obj.loc === this.game.player.name && obj.getSellingPrice) {
        return this.utils.displayMoney(obj.getSellingPrice(this.game.player));
      }
      if (obj.loc === this.game.player.name && obj.getBuyingPrice) {
        return this.utils.displayMoney(obj.getBuyingPrice(this.game.player));
      }
      if (obj.getPrice) {
        return this.utils.displayMoney(obj.getPrice());
      }
      if (obj.price) {
        return this.utils.displayMoney(obj.price);
      }
      if (obj.money) {
        return this.utils.displayMoney(obj.money);
      }
      this.io.errormsg(`Failed to find a price for object '${name}' in text processor (<i>${params.tpOriginalString}</i>)`);
      return false;
    };
    this.text_processors.$ = this.text_processors.money;
    this.text_processors.if = (arr, params) => {
      return this.text_processors.handleIf(arr, params, false);
    };
    this.text_processors.ifNot = (arr, params) => {
      return this.text_processors.handleIf(arr, params, true);
    };
    this.text_processors.ifHere = (arr, params) => {
      return this.text_processors.handleIfHere(arr, params, false);
    };
    this.text_processors.ifNotHere = (arr, params) => {
      return this.text_processors.handleIfHere(arr, params, true);
    };
    this.text_processors.ifLessThan = (arr, params) => {
      return this.text_processors.handleIfLessMoreThan(arr, params, false, false);
    };
    this.text_processors.ifMoreThan = (arr, params) => {
      return this.text_processors.handleIfLessMoreThan(arr, params, true, false);
    };
    this.text_processors.ifLessThanOrEqual = (arr, params) => {
      return this.text_processors.handleIfLessMoreThan(arr, params, false, true);
    };
    this.text_processors.ifMoreThanOrEqual = (arr, params) => {
      return this.text_processors.handleIfLessMoreThan(arr, params, true, true);
    };
    this.text_processors.handleIf = (arr, params, reverse) => {
      let name = arr.shift();
      let flag;
      const obj = this._findObject(name, params, arr);
      if (!obj) {
        this.io.errormsg(`Failed to find object '${name}' in text processor 'if' (<i>${params.tpOriginalString}</i>)`);
        return false;
      }
      name = arr.shift();
      if (obj[name] === void 0 || typeof obj[name] === "boolean") {
        flag = obj[name];
        if (flag === void 0)
          flag = false;
      } else {
        let value = arr.shift();
        if (typeof obj[name] === "number") {
          if (isNaN(value)) {
            this.io.errormsg(`Trying to compare a numeric attribute, '${name}' with a string.`);
            return false;
          }
          value = toInt(value);
        }
        flag = obj[name] === value;
      }
      if (reverse)
        flag = !flag;
      return flag ? arr[0] : arr[1] ? arr[1] : "";
    };
    this.text_processors.handleIfHere = (arr, params, reverse) => {
      const name = arr.shift();
      const obj = this._findObject(name, params, arr);
      if (!obj) {
        this.io.errormsg(`Failed to find object '${name}' in text processor 'ifHere' (<i>${params.tpOriginalString}</i>)`);
        return false;
      }
      let flag = obj.isAtLoc(this.game.player.loc, WorldStates.ALL);
      if (reverse)
        flag = !flag;
      return flag ? arr[0] : arr[1] ? arr[1] : "";
    };
    this.text_processors.handleIfLessMoreThan = (arr, params, moreThan, orEqual) => {
      let name = arr.shift();
      let flag;
      const obj = this._findObject(name, params, arr);
      if (!obj) {
        this.io.errormsg(`Failed to find object '${name}' in text processor 'ifLessMoreThan' (<i>${params.tpOriginalString}</i>)`);
        return false;
      }
      name = arr.shift();
      if (typeof obj[name] !== "number") {
        this.io.errormsg(`Trying to use ifLessThan with a non-numeric (or nonexistent) attribute, '${name}'.`);
        return false;
      }
      let value = arr.shift();
      if (isNaN(value)) {
        this.io.errormsg(`Trying to compare a numeric attribute, '${name}' with a string.`);
        return false;
      }
      value = toInt(value);
      flag = moreThan ? orEqual ? obj[name] >= value : obj[name] > value : orEqual ? obj[name] <= value : obj[name] < value;
      return flag ? arr[0] : arr[1] ? arr[1] : "";
    };
    this.text_processors.dateTime = (arr, params) => {
      const options = Object.assign({format: arr[0]}, params);
      if (!isNaN(arr[1]))
        options.is = toInt(arr[1]);
      if (!isNaN(arr[2]))
        options.add = toInt(arr[2]);
      return this.utils.getDateTime(options);
    };
    this.text_processors.transitDest = (arr, params) => {
      const transit = arr[0] ? this.state.get(arr[0]) : this.state.get(this.game.player.loc.name);
      if (!transit.transitDoorDir)
        return this.io.errormsg("Trying to use the 'transitDest' text process directive when the player is not in a transit location.");
      if (transit.currentButtonName) {
        const button = this.state.get(transit.currentButtonName);
        if (button.title)
          return button.title;
      }
      const destName = transit[transit.transitDoorDir].name;
      return this.processor.getName(this.state.get(destName), {capital: true});
    };
    this.text_processors.img = (arr, params) => {
      return `<img src="images/${arr[0]}" title="${arr[1]}" alt="${arr[2]}"/>`;
    };
    this.text_processors.once = (arr, params) => {
      return params.tpFirstTime ? arr.join(":") : "";
    };
    this.text_processors.notOnce = (arr, params) => {
      return params.tpFirstTime ? "" : arr.join(":");
    };
    this.text_processors.cmd = (arr, params) => {
      if (arr.length === 1) {
        return this.io.cmdlink(arr[0], arr[0]);
      }
      return this.io.cmdlink(arr[0], arr[1]);
    };
    this.text_processors.command = (arr, params) => {
      if (arr.length === 1) {
        return this.io.cmdlink(arr[0], arr[0]);
      }
      return this.io.cmdlink(arr[0], arr[1]);
    };
    this.text_processors.link = (arr, params) => {
      const s1 = arr.shift();
      const s2 = arr.join(":");
      return `<a href="${s2}" target="_blank">${s1}</a>`;
    };
    this.text_processors.popup = (arr, params) => {
      const s1 = arr.shift();
      const s2 = arr.join(":");
      const id = s1.replace(/[^a-zA-Z_]/, "") + this.random.int(0, 999999999);
      const html = `<div id="${id}" class="popup" onclick="$('#${id}').toggle();"><p>${s2}</p></div>`;
      $("#main").append(html);
      return `<span class="popup-link" onclick="$('#${id}').toggle()">${s1}</span>`;
    };
    this.text_processors.param = (arr, params) => {
      const x = params[arr[0]];
      if (x === void 0) {
        this.log.info("params:");
        this.log.info(params);
        return false;
      }
      if (arr.length === 1) {
        return x;
      }
      const att = typeof x === "string" ? this.state.get(x)[arr[1]] : x[arr[1]];
      if (typeof att !== "function")
        return att;
      const arr2 = [];
      arr.shift();
      arr.shift();
      for (const el of arr)
        arr2.push(params[el] ? params[el] : el);
      return att(...arr2);
    };
    this.text_processors.terse = (arr, params) => {
      if (this.game.verbosity === WorldStates.TERSE && this.game.room.visited === 0 || this.game.verbosity === WorldStates.VERBOSE) {
        return sentenceCase(arr.join(":"));
      }
      return "";
    };
    this.text_processors.cap = (arr, params) => {
      return sentenceCase(arr.join(":"));
    };
    this.text_processors.hereDesc = (arr, params) => {
      const room = this.state.get(this.game.player.loc.name);
      let s;
      if (typeof room.desc === "string") {
        s = room.desc;
      } else if (typeof room.desc === "function") {
        s = room.desc();
        if (s === void 0) {
          this.io.errormsg("This room description is not set up properly. It has a 'desc' function that does not return a string.");
          return "[Bad description]";
        }
      } else {
        return "This is a room in dire need of a description.";
      }
      delete params.tpFrstTime;
      return this.processText(s, params);
    };
    this.text_processors.hereName = (arr, params) => {
      const room = this.state.get(this.game.player.loc.name);
      return this.processor.getName(room, {article: Known.DEFINITE});
    };
    this.text_processors.objectsHere = (arr, params) => {
      const listOfOjects = this.utils.scope.scopeHereListed();
      return listOfOjects.length === 0 ? "" : arr.join(":");
    };
    this.text_processors.exitsHere = (arr, params) => {
      const list = this.utils.exitList();
      return list.length === 0 ? "" : arr.join(":");
    };
    this.text_processors.objects = (arr, params) => {
      const listOfOjects = this.utils.scope.scopeHereListed();
      return this.utils.formatList(listOfOjects, {
        article: Known.INDEFINITE,
        lastJoiner: this.lexicon.list_and,
        modified: true,
        nothing: this.lexicon.list_nothing,
        loc: this.game.player.loc
      });
    };
    this.text_processors.exits = (arr, params) => {
      const list = this.utils.exitList();
      return this.utils.formatList(list, {
        lastJoiner: this.lexicon.list_or,
        nothing: this.lexicon.list_nowhere
      });
    };
    this.text_processors.nm = (arr, params) => {
      const subject = this.findSubject(arr, params);
      if (!subject)
        return false;
      const opt = Object.assign({}, params);
      if (arr[1] === "the")
        opt.article = Known.DEFINITE;
      if (arr[1] === "a")
        opt.article = Known.INDEFINITE;
      if (params[`${subject.name}_count`])
        opt[`${subject.name}_count`] = params[`${subject.name}_count`];
      return arr[2] === "true" ? sentenceCase(this.processor.getName(subject, opt)) : this.processor.getName(subject, opt);
    };
    this.text_processors.nms = (arr, params) => {
      const subject = this.findSubject(arr, params);
      if (!subject)
        return false;
      const opt = Object.assign({possessive: true}, params);
      if (arr[1] === "the")
        opt.article = Known.DEFINITE;
      if (arr[1] === "a")
        opt.article = Known.INDEFINITE;
      return arr[2] === "true" ? sentenceCase(this.processor.getName(subject, opt)) : this.processor.getName(subject, opt);
    };
    this.text_processors.nv = (arr, params) => {
      const subject = this.findSubject(arr, params);
      if (!subject)
        return false;
      return this.processor.nounVerb(subject, arr[1], arr[2] === "true");
    };
    this.text_processors.pv = (arr, params) => {
      const subject = this.findSubject(arr, params);
      if (!subject)
        return false;
      return this.processor.pronounVerb(subject, arr[1], arr[2] === "true");
    };
    this.text_processors.vn = (arr, params) => {
      const subject = this.findSubject(arr, params);
      if (!subject)
        return false;
      return this.processor.verbNoun(subject, arr[1], arr[2] === "true");
    };
    this.text_processors.vp = (arr, params) => {
      const subject = this.findSubject(arr, params);
      if (!subject)
        return false;
      return this.processor.verbPronoun(subject, arr[1], arr[2] === "true");
    };
    this.text_processors.cj = (arr, params) => {
      const subject = this.findSubject(arr, params);
      if (!subject)
        return false;
      return arr[2] === "true" ? sentenceCase(this.processor.conjugate(subject, arr[1])) : this.processor.conjugate(subject, arr[1]);
    };
    this.text_processors.pa = (arr, params) => {
      return this.handlePronouns(arr, params, "poss_adj");
    };
    this.text_processors.ob = (arr, params) => {
      return this.handlePronouns(arr, params, "objective");
    };
    this.text_processors.sb = (arr, params) => {
      return this.handlePronouns(arr, params, "subjective");
    };
    this.text_processors.ps = (arr, params) => {
      return this.handlePronouns(arr, params, "possessive");
    };
    this.text_processors.rf = (arr, params) => {
      return this.handlePronouns(arr, params, "reflexive");
    };
    this.text_processors.pa2 = (arr, params) => {
      const chr1 = this.findSubject(arr, params);
      if (!chr1)
        return false;
      arr.shift();
      const chr2 = this.findSubject(arr, params);
      if (!chr2)
        return false;
      if (chr1.pronouns === chr2.pronouns) {
        const opt = {article: Known.DEFINITE, possessive: true};
        return arr[1] === "true" ? sentenceCase(this.processor.getName(chr1, opt)) : this.processor.getName(chr1, opt);
      }
      return arr[1] === "true" ? sentenceCase(chr1.pronouns.poss_adj) : chr1.pronouns.poss_adj;
    };
    this.text_processors.pa3 = (arr, params) => {
      const chr1 = this.findSubject(arr, params);
      if (!chr1)
        return false;
      arr.shift();
      const chr2 = this.findSubject(arr, params);
      if (!chr2)
        return false;
      if (chr1 !== chr2) {
        const opt = {article: Known.DEFINITE, possessive: true};
        return arr[1] === "true" ? sentenceCase(this.processor.getName(chr1, opt)) : this.processor.getName(chr1, opt);
      }
      return arr[1] === "true" ? sentenceCase(chr1.pronouns.poss_adj) : chr1.pronouns.poss_adj;
    };
  }
}
