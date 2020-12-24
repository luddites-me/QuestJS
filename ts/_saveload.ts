"use strict";
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
    saveGame: function (filename: any, comment: any) {
        if (filename === undefined) {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sl_no_filename'.
            errormsg(sl_no_filename);
            return false;
        }
        if (comment === undefined) {
            comment = "-";
        }
        const s = saveLoad.saveTheWorld(comment);
        //console.log(s)
        localStorage.setItem(settings.title + ": " + filename, s);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg("Saved");
        if ((settings as any).afterSave)
            (settings as any).afterSave(filename);
        return true;
    },
    saveTheWorld: function (comment: any) {
        return saveLoad.getSaveHeader(comment) + saveLoad.getSaveBody();
    },
    getHeader: function (s: any) {
        const arr = s.split("!");
        return { title: saveLoad.decodeString(arr[0]), version: saveLoad.decodeString(arr[1]), comment: saveLoad.decodeString(arr[2]), timestamp: arr[3] };
    },
    getSaveHeader: function (comment: any) {
        const currentdate = new Date();
        let s = saveLoad.encodeString(settings.title) + "!";
        s += saveLoad.encodeString(settings.version) + "!";
        s += (comment ? saveLoad.encodeString(comment) : "-") + "!";
        s += currentdate.toLocaleString() + "!";
        return s;
    },
    getSaveBody: function () {
        const l = [];
        for (let key in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            l.push(key + "=" + w[key].getSaveString());
        }
        return l.join("!");
    },
    // LOAD
    loadGame: function (filename: any) {
        const s = localStorage.getItem(settings.title + ": " + filename);
        if (s != null) {
            saveLoad.loadTheWorld(s, 4);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg("Loaded");
            if ((settings as any).afterLoad)
                (settings as any).afterLoad(filename);
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg("Load failed: File not found");
        }
    },
    loadTheWorld: function (s: any, removeHeader: any) {
        const arr = s.split("!");
        if (removeHeader !== undefined) {
            arr.splice(0, removeHeader);
        }
        // Eliminate all clones
        // Reset followers
        for (let key in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[key].followers)
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                w[key].followers = [];
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[key].clonePrototype)
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                delete w[key];
        }
        for (let el of arr) {
            this.setLoadString(el);
        }
        (game as any).update();
        endTurnUI(true);
    },
    setLoadString: function (s: any) {
        const parts = s.split("=");
        if (parts.length !== 3) {
            errormsg("Bad format in saved data (" + s + ")");
            return;
        }
        const name = parts[0];
        const saveType = parts[1];
        const arr = parts[2].split(";");
        if (saveType.startsWith("Clone")) {
            const clonePrototype = saveType.split(":")[1];
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (!w[clonePrototype]) {
                errormsg("Cannot find prototype '" + clonePrototype + "'");
                return;
            }
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            const obj = cloneObject(w[clonePrototype]);
            this.setFromArray(obj, arr);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            w[(obj as any).name] = obj;
            (obj as any).templatePostLoad();
            return;
        }
        if (saveType === "Object") {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (!w[name]) {
                errormsg("Cannot find object '" + name + "'");
                return;
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const obj = w[name];
            this.setFromArray(obj, arr);
            obj.templatePostLoad();
            return;
        }
        /*
        if (saveLoad["load" + hash.saveType]) {
          saveLoad["load" + hash.saveType](name, hash);
          return;
        }*/
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'hash'.
        errormsg("Unknown save type for object '" + name + "' (" + hash.saveType + ")");
    },
    // UTILs  
    decode: function (hash: any, str: any) {
        const parts = str.split(":");
        const key = parts[0];
        const attType = parts[1];
        const s = parts[2];
        if (attType === "boolean") {
            hash[key] = (s === "true");
            return;
        }
        if (attType === "number") {
            hash[key] = parseFloat(s);
            return;
        }
        if (attType === "string") {
            hash[key] = saveLoad.decodeString(s);
            return;
        }
        if (attType === "array") {
            hash[key] = saveLoad.decodeArray(s);
            return;
        }
        if (attType === "numberarray") {
            hash[key] = saveLoad.decodeNumberArray(s);
            return;
        }
        if (attType === "exit") {
            //console.log(key)
            //console.log(hash[key])
            //console.log(hash)
            hash[key].locked = (parts[3] === "l");
            hash[key].hidden = (parts[4] === "h");
            return;
        }
        if (attType === "qobject") {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            hash[key] = w[s];
            return;
        } // this will cause an issue if it points to a clone that has not been done yet !!!
    },
    encode: function (key: any, value: any) {
        if (!value)
            return '';
        let attType = typeof value;
        if (Array.isArray(value)) {
            if (typeof value[0] == 'string')
                return key + ":array:" + saveLoad.encodeArray(value) + ";";
            if (typeof value[0] == 'number')
                return key + ":numberarray:" + saveLoad.encodeNumberArray(value) + ";";
            return '';
        }
        if (value instanceof Exit) {
            if ((value as any).name)
                return key + ":exit:" + (value as any).name + ":" + ((value as any).locked ? 'l' : 'u') + ":" + ((value as any).hidden ? 'h' : 'v') + ";";
            return '';
        }
        if (attType === "object") {
            if (value.name)
                return key + ":qobject:" + value.name + ";";
            return '';
        }
        if (attType === "string")
            return key + ":string:" + saveLoad.encodeString(value) + ";";
        return key + ":" + attType + ":" + value + ";";
    },
    replacements: [
        { unescaped: ':', escaped: 'cln' },
        { unescaped: ';', escaped: 'scln' },
        { unescaped: '!', escaped: 'exm' },
        { unescaped: '=', escaped: 'eqs' },
        { unescaped: '~', escaped: 'tld' },
    ],
    encodeString: function (s: any) {
        for (let d of saveLoad.replacements) {
            s = s.replace(new RegExp(d.unescaped, "g"), "@@@" + d.escaped + "@@@");
        }
        return s;
        //return '"' + s + '"';
    },
    decodeString: function (s: any) {
        if (typeof s !== 'string') {
            console.log("Expecting a string there, but found this instead (did you add an object to a list rather than its name?):");
            console.log(s);
        }
        for (let d of saveLoad.replacements) {
            s = s.replace(new RegExp("@@@" + d.escaped + "@@@", "g"), d.unescaped);
        }
        return s;
    },
    encodeArray: function (ary: any) {
        return ary.map((el: any) => saveLoad.encodeString(el)).join('~');
    },
    decodeArray: function (s: any) {
        return s.split('~').map((el: any) => saveLoad.decodeString(el));
    },
    encodeNumberArray: function (ary: any) {
        return ary.map((el: any) => el.toString()).join('~');
    },
    decodeNumberArray: function (s: any) {
        return s.split('~').map((el: any) => parseFloat(el));
    },
    decodeExit: function (s: any) {
        return s.split('~').map((el: any) => saveLoad.decodeString(el));
    },
    lsTest: function () {
        const test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        }
        catch (e) {
            return false;
        }
    },
    // Other functions
    deleteGame: function (filename: any) {
        localStorage.removeItem(settings.title + ": " + filename);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg("Deleted");
    },
    dirGame: function () {
        let s = "<table class=\"meta\">" + lang.sl_dir_headings;
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $.each(localStorage, function (key: any, value: any) {
            //debugmsg("key=" + key);
            const regex = new RegExp("^" + settings.title + ": ");
            const name = key.replace(regex, "");
            if (regex.test(key)) {
                const dic = saveLoad.getHeader(value);
                s += "<tr><td>" + name + "</td>";
                s += "<td>" + dic.version + "</td>";
                s += "<td>" + dic.timestamp + "</td>";
                s += "<td>" + dic.comment + "</td></tr>";
            }
        });
        s += "</table>";
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg(s);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg(lang.sl_dir_msg);
    },
    setFromArray: function (obj: any, arr: any) {
        for (let el of arr) {
            saveLoad.decode(obj, el);
        }
    },
};
