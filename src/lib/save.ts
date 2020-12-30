// Should all be language neutral
import { Quest } from "../Quest";
import { Exit } from "../node/exit";
import { Base } from "./base";

/*
The game state is saved as a name-value pair.
The value is the game state, with each segment separated by an exclamation mark. The first four segments are the header, the rest are the body. The header consists of the title, version, comment and timestamp. Each segment of the body is an object in the game.
An object is saved as its name followed by an equals sign followed by either "Object" or by "Clone:" and the name of the clone's prototype, followed by an equals sign, and then the data. Each datam is separated by a semi-colon. Each datum consists of the name, the type and the value, separated by colons.
If a datum is an object, and has a name attribute, the name is saved as type qobject.
If the datam is an array and the first element is a string, it is assumed that all the elements are strings, and it is saved as an QuestJs._array. Other arrays are not saved.
If the datam is a number, a string or true it is saved as such.
Any other objects or values will not be saved.
*/

export class SaveLoad extends Base {

  replacements:{unescaped: string, escaped: string}[];
  saveType: string;

  constructor(quest: Quest) {
    super(quest);

    this.replacements = [
      { unescaped: ':', escaped: 'cln' },
      { unescaped: ';', escaped: 'scln' },
      { unescaped: '!', escaped: 'exm' },
      { unescaped: '=', escaped: 'eqs' },
      { unescaped: '~', escaped: 'tld' },
    ]
  }

  saveGame(filename: string, comment = '-') {
    if (filename === undefined) {
      this.io.errormsg(this.lexicon.sl_no_filename);
      return false;
    }
    const s = this.saveTheWorld(comment);
    // this.log.info(s)
    localStorage.setItem(`${this.settings.title}: ${filename}`, s);
    this.io.metamsg('Saved');
    if (this.settings.afterSave) this.settings.afterSave(filename);
    return true;
  }

  saveTheWorld(comment) {
    return (
      this.getSaveHeader(comment) + this.getSaveBody()
    );
  }

  getHeader(s) {
    const arr = s.split('!');
    return {
      title: this.decodeString(arr[0]),
      version: this.decodeString(arr[1]),
      comment: this.decodeString(arr[2]),
      timestamp: arr[3],
    };
  }

  getSaveHeader(comment) {
    const currentdate = new Date();
    let s = `${this.encodeString(this.settings.title)}!`;
    s += `${this.encodeString(this.settings.version)}!`;
    s += `${comment ? this.encodeString(comment) : '-'}!`;
    s += `${currentdate.toLocaleString()}!`;
    return s;
  }

  getSaveBody() {
    const l = [];
    this.state.forEach((key, val) => {
      l.push(`${key}=${val.getSaveString()}`);
    });
    return l.join('!');
  }

  // LOAD

  loadGame(filename) {
    const s = localStorage.getItem(`${this.settings.title}: ${filename}`);
    if (s != null) {
      this.loadTheWorld(s, 4);
      this.io.metamsg('Loaded');
      if (this.settings.afterLoad) this.settings.afterLoad(filename);
    } else {
      this.io.metamsg('Load failed: File not found');
    }
  }

  loadTheWorld(s, removeHeader = -1) {
    const arr = s.split('!');
    if (removeHeader > 0) {
      arr.splice(0, removeHeader);
    }

    // Eliminate all clones
    // Reset followers
    this.state.forEach((key, val) => {
      if (val.followers) val.followers = [];
      if (val.clonePrototype) delete val[key];
    });

    for (const el of arr) {
      this.setLoadString(el);
    }
    this.game.update();
    this.io.endTurnUI(true);
  }

  setLoadString(s) {
    const parts = s.split('=');
    if (parts.length !== 3) {
      this.io.errormsg(`Bad format in saved data (${s})`);
      return;
    }
    const name = parts[0];
    const saveType = parts[1];
    const arr = parts[2].split(';');

    if (saveType.startsWith('Clone')) {
      const clonePrototype = saveType.split(':')[1];
      if (!this.state.get(clonePrototype)) {
        this.io.errormsg(`Cannot find prototype '${clonePrototype}'`);
        return;
      }
      const obj = this.state.cloneObject(this.state.get(clonePrototype));
      this.setFromArray(obj, arr);
      this.state.set(obj.name, obj);
      obj.templatePostLoad();
      return;
    }

    if (saveType === 'Object') {
      if (!this.state.get(name)) {
        this.io.errormsg(`Cannot find object '${name}'`);
        return;
      }
      const obj = this.state.get(name);
      this.setFromArray(obj, arr);
      obj.templatePostLoad();
      return;
    }

    /*
    if (saveLoad["load" + hash.saveType]) {
      saveLoad["load" + hash.saveType](name, hash);
      return;
    } */

    this.io.errormsg(
      `Unknown save type for object '${name}' (${this.saveType})`,
    );
  }

  // UTILs

  decode(hash, str) {
    const parts = str.split(':');
    const key = parts[0];
    const attType = parts[1];
    const s = parts[2];

    if (attType === 'boolean') {
      hash[key] = s === 'true';
      return;
    }

    if (attType === 'number') {
      hash[key] = parseFloat(s);
      return;
    }

    if (attType === 'string') {
      hash[key] = this.decodeString(s);
      return;
    }

    if (attType === 'array') {
      hash[key] = this.decodeArray(s);
      return;
    }

    if (attType === 'numberarray') {
      hash[key] = this.decodeNumberArray(s);
      return;
    }

    if (attType === 'exit') {
      // this.log.info(key)
      // this.log.info(hash[key])
      // this.log.info(hash)
      hash[key].locked = parts[3] === 'l';
      hash[key].hidden = parts[4] === 'h';
      return;
    }

    if (attType === 'qobject') {
      hash[key] = this.state.get(s);
    } // this will cause an issue if it points to a clone that has not been done yet !!!
  }

  encode(key, value) {
    if (!value) return '';
    const attType = typeof value;
    if (Array.isArray(value)) {
      if (typeof value[0] === 'string')
        return `${key}:array:${this.encodeArray(value)};`;
      if (typeof value[0] === 'number')
        return `${key}:numberarray:${this.encodeNumberArray(
          value,
        )};`;
      return '';
    }
    if (value instanceof Exit) {
      if (value.name)
        return `${key}:exit:${value.name}:${value.locked ? 'l' : 'u'}:${
          value.hidden ? 'h' : 'v'
        };`;
      return '';
    }
    if (attType === 'object') {
      if (value.name) return `${key}:qobject:${value.name};`;
      return '';
    }
    if (attType === 'string')
      return `${key}:string:${this.encodeString(value)};`;
    return `${key}:${attType}:${value};`;
  }

  encodeString(s) {
    for (const d of this.replacements) {
      s = s.replace(new RegExp(d.unescaped, 'g'), `@@@${d.escaped}@@@`);
    }
    return s;
    // return '"' + s + '"';
  }

  decodeString(s) {
    if (typeof s !== 'string') {
      this.log.info(
        'Expecting a string there, but found this instead (did you add an object to a list rather than its name?):'
      );
      this.log.info(s);
    }
    for (const d of this.replacements) {
      s = s.replace(new RegExp(`@@@${d.escaped}@@@`, 'g'), d.unescaped);
    }
    return s;
  }

  encodeArray(ary) {
    return ary.map((el) => this.encodeString(el)).join('~');
  }

  decodeArray(s) {
    return s.split('~').map((el) => this.decodeString(el));
  }

  encodeNumberArray(ary) {
    return ary.map((el) => el.toString()).join('~');
  }

  decodeNumberArray(s) {
    return s.split('~').map((el) => parseFloat(el));
  }

  decodeExit(s) {
    return s.split('~').map((el) => this.decodeString(el));
  }

  lsTest() {
    const test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Other functions

  deleteGame(filename) {
    localStorage.removeItem(`${this.settings.title}: ${filename}`);
    this.io.metamsg('Deleted');
  }

  dirGame() {
    let s = `<table class="meta">${this.lexicon.sl_dir_headings}`;
    Object.keys(localStorage).forEach(key => {
      const value = localStorage[key];
      // this.io.debugmsg("key=" + key);
      const regex = new RegExp(`^${this.settings.title}: `);
      const name = key.replace(regex, '');
      if (regex.test(key)) {
        const dic = this.getHeader(value);
        s += `<tr><td>${name}</td>`;
        s += `<td>${dic.version}</td>`;
        s += `<td>${dic.timestamp}</td>`;
        s += `<td>${dic.comment}</td></tr>`;
      }
    });
    s += '</table>';
    this.io.metamsg(s);
    this.io.metamsg(this.lexicon.sl_dir_msg);
  }

  setFromArray(obj, arr) {
    for (const el of arr) {
      this.decode(obj, el);
    }
  }
};
