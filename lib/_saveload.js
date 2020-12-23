

// Should all be language neutral


/*

The game state is saved as a name-value pair.

The value is the game state, with each segment separated by an exclamation mark. The first four segments are the header, the rest are the body. The header consists of the title, version, comment and timestamp. Each segment of the body is an object in the game.

An object is saved as its name followed by an equals sign followed by either "Object" or by "Clone:" and the name of the clone's prototype, followed by an equals sign, and then the data. Each datam is separated by a semi-colon. Each datum consists of the name, the type and the value, separated by colons.

If a datum is an object, and has a name attribute, the name is saved as type qobject.

If the datam is an array and the first element is a string, it is assumed that all the elements are strings, and it is saved as an array. Other arrays are not saved.

If the datam is a number, a string or true it is saved as such.

Any other objects or values will not be saved.


*/


const saveLoad = {

  saveGame:function(filename, comment) {
    if (filename === undefined) {
      QuestJs._io.errormsg(sl_no_filename);
      return false;
    }
    if (comment === undefined) { comment = "-"; }
    const s = QuestJs._saveLoad.saveTheWorld(comment);
    //console.log(s)
    localStorage.setItem(QuestJs._settings.title + ": " + filename, s);
    QuestJs._io.metamsg("Saved");
    if (QuestJs._settings.afterSave) QuestJs._settings.afterSave(filename)
    return true;
  },

  saveTheWorld:function(comment) {
    return QuestJs._saveLoad.getSaveHeader(comment) + QuestJs._saveLoad.getSaveBody();
  },

  getHeader:function(s) {
    const arr = s.split("!");
    return { title:QuestJs._saveLoad.decodeString(arr[0]), version:QuestJs._saveLoad.decodeString(arr[1]), comment:QuestJs._saveLoad.decodeString(arr[2]), timestamp:arr[3] };
  },

  getSaveHeader:function(comment) {
    const currentdate = new Date();
    let s = QuestJs._saveLoad.encodeString(QuestJs._settings.title) + "!";
    s += QuestJs._saveLoad.encodeString(QuestJs._settings.version) + "!";
    s += (comment ? QuestJs._saveLoad.encodeString(comment) : "-") + "!";
    s += currentdate.toLocaleString() + "!";
    return s;
  },

  getSaveBody:function() {
    const l = [];
    for (let key in w) {
      l.push(key + "=" + w[key].getSaveString());
    }
    return l.join("!");
  },
  

  
  
  
  // LOAD
  
  loadGame:function(filename) {
    const s = localStorage.getItem(QuestJs._settings.title + ": " + filename);
    if (s != null) {
      QuestJs._saveLoad.loadTheWorld(s, 4);
      QuestJs._io.metamsg("Loaded");
      if (QuestJs._settings.afterLoad) QuestJs._settings.afterLoad(filename)
    }
    else {
      QuestJs._io.metamsg("Load failed: File not found");
    }
  },



  loadTheWorld:function(s, removeHeader) {
    const arr = s.split("!");
    if (removeHeader !== undefined) {
      arr.splice(0, removeHeader);
    }
    
    // Eliminate all clones
    // Reset followers
    for (let key in w) {
      if (w[key].followers) w[key].followers = [];
      if (w[key].clonePrototype) delete w[key];
    }
    
    for (let el of arr) {
      this.setLoadString(el);
    }
    game.update();
    QuestJs._io.endTurnUI(true);
  },



  setLoadString:function(s) {
    const parts = s.split("=");
    if (parts.length !== 3) {
      QuestJs._io.errormsg("Bad format in saved data (" + s + ")");
      return;
    }
    const name = parts[0];
    const saveType = parts[1]
    const arr = parts[2].split(";");
    
    if (saveType.startsWith("Clone")) {
      const clonePrototype = saveType.split(":")[1];
      if (!w[clonePrototype]) {
        QuestJs._io.errormsg("Cannot find prototype '" + clonePrototype + "'");
        return;
      }
      const obj = cloneObject(w[clonePrototype]);
      this.setFromArray(obj, arr);
      w[obj.name] = obj;
      obj.templatePostLoad();
      return
    }
    
    if (saveType === "Object") {
      if (!w[name]) {
        QuestJs._io.errormsg("Cannot find object '" + name + "'");
        return;
      }
      const obj = w[name];
      this.setFromArray(obj, arr);
      obj.templatePostLoad();
      return
    }
    
    /*
    if (saveLoad["load" + hash.saveType]) {
      saveLoad["load" + hash.saveType](name, hash);
      return;
    }*/
    
    QuestJs._io.errormsg("Unknown save type for object '" + name + "' (" + hash.saveType + ")");
  },
  
  

  
  
  // UTILs  
  
  decode:function(hash, str) {
    const parts = str.split(":");
    const key = parts[0]
    const attType = parts[1]
    const s = parts[2]
    
    
    if (attType === "boolean") {
      hash[key] = (s === "true");
      return;
    }
    
    if (attType === "number") {
      hash[key] = parseFloat(s);
      return;
    }
    
    if (attType === "string") {
      hash[key] = QuestJs._saveLoad.decodeString(s);
      return;
    }
    
    if (attType === "array") {
      hash[key] = QuestJs._saveLoad.decodeArray(s);
      return;
    }
    
    if (attType === "numberarray") {
      hash[key] = QuestJs._saveLoad.decodeNumberArray(s);
      return;
    }
    
    if (attType === "exit") {
      //console.log(key)
      //console.log(hash[key])
      //console.log(hash)
      hash[key].locked = (parts[3] === "l")
      hash[key].hidden = (parts[4] === "h")
      return;
    }
    
    if (attType === "qobject") {
      hash[key] = w[s];
      return;
    } // this will cause an issue if it points to a clone that has not been done yet !!!
  },
  
  encode:function(key, value) {
    if (!value) return ''
    let attType = typeof value;
    if (Array.isArray(value)) {
      if (typeof value[0] == 'string') return key + ":array:" + QuestJs._saveLoad.encodeArray(value) + ";";
      if (typeof value[0] == 'number') return key + ":numberarray:" + QuestJs._saveLoad.encodeNumberArray(value) + ";";
      return '';
    }
    if (value instanceof Exit) {
      if (value.name) return key + ":exit:" + value.name + ":" + (value.locked ? 'l' : 'u') + ":" + (value.hidden ? 'h' : 'v') + ";";
      return '';
    }
    if (attType === "object") {
      if (value.name) return key + ":qobject:" + value.name + ";";
      return '';
    }
    if (attType === "string") return key + ":string:" + QuestJs._saveLoad.encodeString(value) + ";";
    return key + ":" + attType + ":" + value + ";";
  },


  replacements:[
    { unescaped:':', escaped:'cln'},
    { unescaped:';', escaped:'scln'},
    { unescaped:'!', escaped:'exm'},
    { unescaped:'=', escaped:'eqs'},
    { unescaped:'~', escaped:'tld'},
  ],


  encodeString:function(s) {
    for (let d of QuestJs._saveLoad.replacements) {
      s = s.replace(new RegExp(d.unescaped, "g"), "@@@" + d.escaped + "@@@");
    }
    return s;
    //return '"' + s + '"';
  },

  decodeString:function(s) {
    if (typeof s !== 'string') {
      console.log("Expecting a string there, but found this instead (did you add an object to a list rather than its name?):")
      console.log(s)
    }
    for (let d of QuestJs._saveLoad.replacements) {
      s = s.replace(new RegExp("@@@" + d.escaped + "@@@", "g"), d.unescaped);
    }
    return s;
  },

  encodeArray:function(ary) {
    return ary.map(el => QuestJs._saveLoad.encodeString(el)).join('~');
  },

  decodeArray:function(s) {
    return s.split('~').map(el => QuestJs._saveLoad.decodeString(el));
  },

  encodeNumberArray:function(ary) {
    return ary.map(el => el.toString()).join('~');
  },

  decodeNumberArray:function(s) {
    return s.split('~').map(el => parseFloat(el));
  },

  decodeExit:function(s) {
    return s.split('~').map(el => QuestJs._saveLoad.decodeString(el));
  },

  
  lsTest:function() {
    const test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
  },

  
  
  
  // Other functions
  
  deleteGame:function(filename) {
    localStorage.removeItem(QuestJs._settings.title + ": " + filename);
    QuestJs._io.metamsg("Deleted");
  },

  dirGame:function() {
    let s = "<table class=\"meta\">" + QuestJs._lang.sl_dir_headings;
    $.each(localStorage, function(key, value){
      //QuestJs._io.debugmsg("key=" + key);
      const regex = new RegExp("^" + QuestJs._settings.title + ": ");
      const name = key.replace(regex, "");
      if (regex.test(key)) {
        const dic = QuestJs._saveLoad.getHeader(value);
        s += "<tr><td>" + name + "</td>";
        s += "<td>" + dic.version + "</td>";
        s += "<td>" + dic.timestamp + "</td>";
        s += "<td>" + dic.comment + "</td></tr>";
      }
    });  
    s += "</table>";
    QuestJs._io.metamsg(s);
    QuestJs._io.metamsg(QuestJs._lang.sl_dir_msg);
  },
  
  setFromArray:function(obj, arr) {
    for (let el of arr) {
      QuestJs._saveLoad.decode(obj, el);
    }
  },

  

};

QuestJs._saveLoad = saveLoad;