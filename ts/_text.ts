"use strict";
//@DOC
// ## The Text Processor Function
//@UNDOC
//@DOC
// Returns a string in which all the text processor directives have been resolved, using the optionasl parameters.
// More details [here(https://github.com/ThePix/QuestJS/wiki/The-Text-Processor).
function processText(str: any, params: any) {
    if (params === undefined) {
        params = {};
    }
    if (typeof str !== "string") {
        str = "" + str;
    }
    params.tpOriginalString = str;
    if ((tp as any).usedStrings.includes(str)) {
        params.tpFirstTime = false;
    }
    else {
        (tp as any).usedStrings.push(str);
        params.tpFirstTime = true;
    }
    //console.log(params)
    //try {
    return (tp as any).processText(str, params);
    //} catch (err) {
    //  errormsg("Text processor string caused an error, returning unmodified (reported error: " + err + ")");
    //  return str;
    //}
}
// Most of the text processors are set up in text.js; these are the language specific ones.
const tp = {
    text_processors: {},
};
(tp as any).usedStrings = [];
(tp as any).colours = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];
// Use this to add you custom text processor
// Should take a string array as a parameter (the input text,
// excluding the curly braces, name and colon),
// and return a string.
(tp as any).addDirective = function (name: any, fn: any) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    tp.text_processors[name] = fn;
};
(tp as any).processText = function (str: any, params: any) {
    const s = (tp as any).findFirstToken(str);
    if (s) {
        let arr = s.split(":");
        let left = arr.shift();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (typeof tp.text_processors[left] !== "function") {
            if (left === "player") {
                arr.unshift((game as any).player.name);
                left = "show";
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            else if (w[left]) {
                arr.unshift(left);
                left = "show";
            }
            else if (arr.length === 0) {
                arr = left.split(".");
                left = "show";
            }
            else {
                errormsg("Attempting to use unknown text processor directive '" + left + "' (<i>" + params.tpOriginalString + "</i>)");
                return str;
            }
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        str = str.replace("{" + s + "}", tp.text_processors[left](arr, params));
        str = (tp as any).processText(str, params);
    }
    return str.replace(/@@@colon@@@/g, ':');
};
// Find the first token. This is the first to end, so
// we get nested.
(tp as any).findFirstToken = function (s: any) {
    const end = s.indexOf("}");
    if (end === -1) {
        return false;
    }
    const start = s.lastIndexOf("{", end);
    if (start === -1) {
        errormsg("Failed to find starting curly brace in text processor (<i>" + s + "</i>)");
        return false;
    }
    return s.substring(start + 1, end);
};
(tp.text_processors as any).i = function (arr: any, params: any) { return "<i>" + arr.join(":") + "</i>"; };
(tp.text_processors as any).b = function (arr: any, params: any) { return "<b>" + arr.join(":") + "</b>"; };
(tp.text_processors as any).u = function (arr: any, params: any) { return "<u>" + arr.join(":") + "</u>"; };
(tp.text_processors as any).s = function (arr: any, params: any) { return "<strike>" + arr.join(":") + "</strike>"; };
(tp.text_processors as any).code = function (arr: any, params: any) { return "<code>" + arr.join(":") + "</code>"; };
(tp.text_processors as any).sup = function (arr: any, params: any) { return "<sup>" + arr.join(":") + "</sup>"; };
(tp.text_processors as any).sub = function (arr: any, params: any) { return "<sub>" + arr.join(":") + "</sub>"; };
(tp.text_processors as any).huge = function (arr: any, params: any) { return '<span style="font-size:2em">' + arr.join(":") + '</span>'; };
(tp.text_processors as any).big = function (arr: any, params: any) { return '<span style="font-size:1.5em">' + arr.join(":") + '</span>'; };
(tp.text_processors as any).small = function (arr: any, params: any) { return '<span style="font-size:0.8em">' + arr.join(":") + '</span>'; };
(tp.text_processors as any).tiny = function (arr: any, params: any) { return '<span style="font-size:0.6em">' + arr.join(":") + '</span>'; };
(tp.text_processors as any).smallcaps = function (arr: any, params: any) { return '<span style="font-variant:small-caps">' + arr.join(":") + '</span>'; };
(tp.text_processors as any).rainbow = function (arr: any, params: any) {
    const s = arr.pop();
    const colours = arr.length === 0 ? (tp as any).colours : arr;
    let result = '';
    for (let i = 0; i < s.length; i++) {
        result += '<span style="color:' + (random as any).fromArray(colours) + '">' + s.charAt(i) + '</span>';
    }
    return result;
};
(tp as any)._charSwap = function (c: any, upper: any, lower: any) {
    if (c.match(/[A-Z]/))
        return String.fromCharCode(c.charCodeAt(0) - 'A'.charCodeAt(0) + upper);
    if (c.match(/[a-z]/))
        return String.fromCharCode(c.charCodeAt(0) - 'a'.charCodeAt(0) + lower);
    return c;
};
// Try 391:3AC for Greek, 402:431 for Cyrillic, 904:904 for Devanagari
(tp.text_processors as any).encode = function (arr: any, params: any) {
    const upper = parseInt(arr.shift(), 16);
    const lower = parseInt(arr.shift(), 16);
    const s = arr.shift();
    let result = '';
    for (let i = 0; i < s.length; i++) {
        result += (tp as any)._charSwap(s.charAt(i), upper, lower);
    }
    return result;
};
(tp.text_processors as any).rainbow = function (arr: any, params: any) {
    const s = arr.pop();
    const colours = arr.length === 0 ? (tp as any).colours : arr;
    let result = '';
    for (let i = 0; i < s.length; i++) {
        result += '<span style="color:' + (random as any).fromArray(colours) + '">' + s.charAt(i) + '</span>';
    }
    return result;
};
(tp.text_processors as any).blur = function (arr: any, params: any) {
    const n = arr.shift();
    return '<span style="color:transparent;text-shadow: 0 0 ' + n + 'px rgba(0,0,0,1);">' + arr.join(":") + "</span>";
};
(tp.text_processors as any).font = function (arr: any, params: any) {
    const f = arr.shift();
    return '<span style="font-family:' + f + '">' + arr.join(":") + "</span>";
};
(tp.text_processors as any).colour = function (arr: any, params: any) {
    const c = arr.shift();
    return '<span style="color:' + c + '">' + arr.join(":") + "</span>";
};
(tp.text_processors as any).color = (tp.text_processors as any).colour;
(tp.text_processors as any).back = function (arr: any, params: any) {
    const c = arr.shift();
    return '<span style="background-color:' + c + '">' + arr.join(":") + "</span>";
};
(tp.text_processors as any).random = function (arr: any, params: any) {
    return arr[Math.floor(Math.random() * arr.length)];
};
(tp.text_processors as any).select = function (arr: any, params: any) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const o = w[arr[0]];
    if (!o)
        errormsg('Failed to find an object called "' + arr[0] + '" in text processor select.');
    const l = o[arr[1]];
    if (!l)
        errormsg('Failed to find an attribute called "' + arr[1] + '" for "' + arr[0] + '" in text processor select.');
    const n = o[arr[2]];
    if (!l)
        errormsg('Failed to find an attribute called "' + arr[2] + '" for "' + arr[0] + '" in text processor select.');
    return l[n];
};
(tp as any)._findObject = function (name: any, params: any, arr: any) {
    if (params && params[name])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return typeof params[name] === 'string' ? w[params[name]] : params[name];
    if (name === "player")
        return (game as any).player;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (w[name])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return w[name];
    const ary = name.split('.');
    if (ary.length === 1)
        return undefined;
    if (ary.length > 2) {
        console.log("The text process cannot handle attributes of attributes, so failed to deal with: " + name);
        console.log(ary);
        return undefined;
    }
    arr.unshift(ary[1]);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return w[ary[0]];
};
(tp.text_processors as any).show = function (arr: any, params: any) {
    let name = arr.shift();
    if (params[name]) {
        if (typeof params[name] === 'string')
            return params[name];
        if (typeof params[name] === 'number')
            return params[name].toString();
        if (arr.length > 0)
            return params[name][arr[0]];
    }
    const obj = (tp as any)._findObject(name, params, arr);
    if (!obj) {
        errormsg("Failed to find object '" + name + "' in text processor 'show' (<i>" + params.tpOriginalString + "</i>)");
        return false;
    }
    name = arr.shift();
    const val = obj[name];
    if (typeof val === "function") {
        return val();
    }
    else {
        return val;
    }
};
(tp.text_processors as any).number = function (arr: any, params: any) {
    let name = arr.shift();
    if (name.match(/^\d+$/))
        return lang.toWords(parseInt(name));
    if (typeof params[name] === 'number')
        return lang.toWords(params[name]);
    const obj = (tp as any)._findObject(name, params, arr);
    if (!obj) {
        errormsg("Failed to find object '" + name + "' in text processor 'number' (<i>" + params.tpOriginalString + "</i>)");
        return false;
    }
    if (typeof obj[arr[0]] === 'number') {
        return lang.toWords(obj.obj[arr[0]]);
    }
    errormsg("Failed to find a number for object '" + name + "' in text processor (<i>" + params.tpOriginalString + "</i>)");
    return false;
};
(tp.text_processors as any).ordinal = function (arr: any, params: any) {
    let name = arr.shift();
    if (name.match(/^\d+$/))
        return lang.toOrdinal(parseInt(name));
    if (typeof params[name] === 'number')
        return lang.toOrdinal(params[name]);
    const obj = (tp as any)._findObject(name, params, arr);
    if (!obj) {
        errormsg("Failed to find object '" + name + "' in text processor 'number' (<i>" + params.tpOriginalString + "</i>)");
        return false;
    }
    if (typeof obj[arr[0]] === 'number') {
        return lang.toOrdinal(obj.obj[arr[0]]);
    }
    errormsg("Failed to find a number for object '" + name + "' in text processor (<i>" + params.tpOriginalString + "</i>)");
    return false;
};
(tp.text_processors as any).money = function (arr: any, params: any) {
    let name = arr.shift();
    if (name.match(/^\d+$/))
        return displayMoney(parseInt(name));
    if (typeof params[name] === 'number')
        return displayMoney(params[name]);
    const obj = (tp as any)._findObject(name, params, arr);
    if (!obj) {
        errormsg("Failed to find object '" + name + "' in text processor 'money' (<i>" + params.tpOriginalString + "</i>)");
        return false;
    }
    if (obj.loc === (game as any).player.name && obj.getSellingPrice) {
        return displayMoney(obj.getSellingPrice((game as any).player));
    }
    if (obj.loc === (game as any).player.name && obj.getBuyingPrice) {
        return displayMoney(obj.getBuyingPrice((game as any).player));
    }
    if (obj.getPrice) {
        return displayMoney(obj.getPrice());
    }
    if (obj.price) {
        return displayMoney(obj.price);
    }
    if (obj.money) {
        return displayMoney(obj.money);
    }
    errormsg("Failed to find a price for object '" + name + "' in text processor (<i>" + params.tpOriginalString + "</i>)");
    return false;
};
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
tp.text_processors['$'] = (tp.text_processors as any).money;
(tp.text_processors as any).if = function (arr: any, params: any) {
    return (this as any).handleIf(arr, params, false);
};
(tp.text_processors as any).ifNot = function (arr: any, params: any) {
    return (this as any).handleIf(arr, params, true);
};
(tp.text_processors as any).ifHere = function (arr: any, params: any) {
    return (this as any).handleIfHere(arr, params, false);
};
(tp.text_processors as any).ifNotHere = function (arr: any, params: any) {
    return (this as any).handleIfHere(arr, params, true);
};
(tp.text_processors as any).ifLessThan = function (arr: any, params: any) {
    return (this as any).handleIfLessMoreThan(arr, params, false, false);
};
(tp.text_processors as any).ifMoreThan = function (arr: any, params: any) {
    return (this as any).handleIfLessMoreThan(arr, params, true, false);
};
(tp.text_processors as any).ifLessThanOrEqual = function (arr: any, params: any) {
    return (this as any).handleIfLessMoreThan(arr, params, false, true);
};
(tp.text_processors as any).ifMoreThanOrEqual = function (arr: any, params: any) {
    return (this as any).handleIfLessMoreThan(arr, params, true, true);
};
(tp.text_processors as any).handleIf = function (arr: any, params: any, reverse: any) {
    let name = arr.shift(), flag;
    const obj = (tp as any)._findObject(name, params, arr);
    if (!obj) {
        errormsg("Failed to find object '" + name + "' in text processor 'if' (<i>" + params.tpOriginalString + "</i>)");
        return false;
    }
    name = arr.shift();
    if (obj[name] === undefined || typeof obj[name] === "boolean") {
        flag = obj[name];
        if (flag === undefined)
            flag = false;
    }
    else {
        let value = arr.shift();
        if (typeof obj[name] === "number") {
            if (isNaN(value)) {
                errormsg("Trying to compare a numeric attribute, '" + name + "' with a string.");
                return false;
            }
            value = parseInt(value);
        }
        flag = (obj[name] === value);
    }
    if (reverse)
        flag = !flag;
    return (flag ? arr[0] : (arr[1] ? arr[1] : ""));
};
(tp.text_processors as any).handleIfHere = function (arr: any, params: any, reverse: any) {
    const name = arr.shift();
    const obj = (tp as any)._findObject(name, params, arr);
    if (!obj) {
        errormsg("Failed to find object '" + name + "' in text processor 'ifHere' (<i>" + params.tpOriginalString + "</i>)");
        return false;
    }
    let flag = obj.isAtLoc((game as any).player.loc, world.ALL);
    if (reverse)
        flag = !flag;
    return (flag ? arr[0] : (arr[1] ? arr[1] : ""));
};
(tp.text_processors as any).handleIfLessMoreThan = function (arr: any, params: any, moreThan: any, orEqual: any) {
    let name = arr.shift(), flag;
    const obj = (tp as any)._findObject(name, params, arr);
    if (!obj) {
        errormsg("Failed to find object '" + name + "' in text processor 'ifLessMoreThan' (<i>" + params.tpOriginalString + "</i>)");
        return false;
    }
    name = arr.shift();
    if (typeof obj[name] !== "number") {
        errormsg("Trying to use ifLessThan with a non-numeric (or nonexistent) attribute, '" + name + "'.");
        return false;
    }
    let value = arr.shift();
    if (isNaN(value)) {
        errormsg("Trying to compare a numeric attribute, '" + name + "' with a string.");
        return false;
    }
    value = parseInt(value);
    flag = moreThan ? (orEqual ? (obj[name] >= value) : (obj[name] > value)) : (orEqual ? (obj[name] <= value) : (obj[name] < value));
    return (flag ? arr[0] : (arr[1] ? arr[1] : ""));
};
(tp.text_processors as any).dateTime = function (arr: any, params: any) {
    const options = { format: arr[0] };
    if (!isNaN(arr[1]))
        (options as any).is = parseInt(arr[1]);
    if (!isNaN(arr[2]))
        (options as any).add = parseInt(arr[2]);
    return (util as any).getDateTime(options);
};
(tp.text_processors as any).transitDest = function (arr: any, params: any) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const transit = arr[0] ? w[arr[0]] : w[(game as any).player.loc];
    if (!transit.transitDoorDir)
        return errormsg("Trying to use the 'transitDest' text process directive when the player is not in a transit location.");
    if (transit.currentButtonName) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const button = w[transit.currentButtonName];
        if (button.title)
            return button.title;
    }
    const destName = transit[transit.transitDoorDir].name;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return lang.getName(w[destName], { capital: true });
};
(tp.text_processors as any).img = function (arr: any, params: any) {
    return '<img src="images/' + arr[0] + '" title="' + arr[1] + '" alt="' + arr[2] + '"/>';
};
(tp.text_processors as any).once = function (arr: any, params: any) {
    return params.tpFirstTime ? arr.join(":") : "";
};
(tp.text_processors as any).notOnce = function (arr: any, params: any) {
    return params.tpFirstTime ? "" : arr.join(":");
};
(tp.text_processors as any).cmd = function (arr: any, params: any) {
    if (arr.length === 1) {
        return (io as any).cmdlink(arr[0], arr[0]);
    }
    else {
        return (io as any).cmdlink(arr[0], arr[1]);
    }
};
(tp.text_processors as any).command = function (arr: any, params: any) {
    if (arr.length === 1) {
        return (io as any).cmdlink(arr[0], arr[0]);
    }
    else {
        return (io as any).cmdlink(arr[0], arr[1]);
    }
};
(tp as any).addDirective("hour", function (arr: any, params: any) {
    const hour = (util as any).getDateTimeDict().hour;
    if (hour < arr[0])
        return '';
    if (hour >= arr[1])
        return '';
    return arr[2];
});
(tp.text_processors as any).link = function (arr: any, params: any) {
    let s1 = arr.shift();
    let s2 = arr.join(':');
    return '<a href=\"' + s2 + '\" target="_blank">' + s1 + '</a>';
};
(tp.text_processors as any).popup = function (arr: any, params: any) {
    let s1 = arr.shift();
    let s2 = arr.join(':');
    let id = s1.replace(/[^a-zA-Z_]/, '') + (random as any).int(0, 999999999);
    const html = '<div id=\"' + id + '\" class=\"popup\" onclick=\"$(\'#' + id + '\').toggle();"><p>' + s2 + '</p></div>';
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#main').append(html);
    return '<span class=\"popup-link\" onclick=\"$(\'#' + id + '\').toggle()">' + s1 + '</span>';
};
(tp.text_processors as any).param = function (arr: any, params: any) {
    const x = params[arr[0]];
    if (x === undefined) {
        //errormsg("In text processor param, could not find a value with the key '" + arr[0] + "'. Check the console (F12) to see what params is. [" + params.tpOriginalString + "]");
        console.log("params:");
        console.log(params);
        return false;
    }
    else if (arr.length === 1) {
        return x;
    }
    else {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const att = (typeof x === "string" ? w[x][arr[1]] : x[arr[1]]);
        if (typeof att !== "function")
            return att;
        const arr2 = [];
        arr.shift();
        arr.shift();
        for (let el of arr)
            arr2.push(params[el] ? params[el] : el);
        return att(...arr2);
    }
};
(tp.text_processors as any).terse = function (arr: any, params: any) {
    if (((game as any).verbosity === world.TERSE && (game as any).room.visited === 0) || (game as any).verbosity === world.VERBOSE) {
        return sentenceCase(arr.join(":"));
    }
    else {
        return '';
    }
};
(tp.text_processors as any).cap = function (arr: any, params: any) {
    return sentenceCase(arr.join(":"));
};
// Need to do some hackery here...
// It is assumed this is only used in the room template, and therefore should be safe
// The issue is that the text for every room is {hereDesc}, so the "once" directive
// would only work the first time. In the econd room, {hereDesc} has already been done, so once fails.
// The hack then is to pre-process the rom text in here
(tp.text_processors as any).hereDesc = function (arr: any, params: any) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const room = w[(game as any).player.loc];
    let s;
    if (typeof room.desc === 'string') {
        s = room.desc;
    }
    else if (typeof room.desc === 'function') {
        s = room.desc();
        if (s === undefined) {
            errormsg("This room description is not set up properly. It has a 'desc' function that does not return a string.");
            return "[Bad description]";
        }
    }
    else {
        return "This is a room in dire need of a description.";
    }
    delete params.tpFrstTime;
    return processText(s, params);
};
(tp.text_processors as any).hereName = function (arr: any, params: any) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const room = w[(game as any).player.loc];
    return lang.getName(room, { article: DEFINITE });
};
(tp.text_processors as any).objectsHere = function (arr: any, params: any) {
    const listOfOjects = scopeHereListed();
    return listOfOjects.length === 0 ? "" : arr.join(":");
};
(tp.text_processors as any).exitsHere = function (arr: any, params: any) {
    const list = (util as any).exitList();
    return list.length === 0 ? "" : arr.join(":");
};
(tp.text_processors as any).objects = function (arr: any, params: any) {
    const listOfOjects = scopeHereListed();
    return formatList(listOfOjects, { article: INDEFINITE, lastJoiner: lang.list_and, modified: true, nothing: lang.list_nothing, loc: (game as any).player.loc });
};
(tp.text_processors as any).exits = function (arr: any, params: any) {
    const list = (util as any).exitList();
    return formatList(list, { lastJoiner: lang.list_or, nothing: lang.list_nowhere });
};
// Then {nv:char:try} to get
(tp as any).findSubject = function (arr: any, params: any) {
    let subject;
    if (params[arr[0]]) {
        subject = params[arr[0]];
        if (typeof subject === "string")
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            subject = w[subject];
        if (subject === undefined) {
            errormsg("In text processor findSubject, could not find a subject with '" + arr[0] + "'. Check the console (F12) to see what params is. [" + params.tpOriginalString + "]");
            console.log("params:");
            console.log(params);
            (console as any).fdjkh.fkgh.fdkyh = 3;
            return false;
        }
    }
    else {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        subject = w[arr[0]];
        if (subject === undefined) {
            const s = "In text processor findSubject, could not find a key called `" + arr[0] + "` in the string `" + params.tpOriginalString + "`";
            console.error(s);
            console.error(params);
            throw new Error("Error in tp.findSubject");
            return false;
        }
    }
    return subject;
};
(tp.text_processors as any).nm = function (arr: any, params: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    const opt = {};
    if (arr[1] === 'the')
        (opt as any).article = DEFINITE;
    if (arr[1] === 'a')
        (opt as any).article = INDEFINITE;
    if (params[subject.name + '_count'])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        opt[subject.name + '_count'] = params[subject.name + '_count'];
    return arr[2] === 'true' ? sentenceCase(lang.getName(subject, opt)) : lang.getName(subject, opt);
};
(tp.text_processors as any).nms = function (arr: any, params: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    const opt = { possessive: true };
    if (arr[1] === 'the')
        (opt as any).article = DEFINITE;
    if (arr[1] === 'a')
        (opt as any).article = INDEFINITE;
    return arr[2] === 'true' ? sentenceCase(lang.getName(subject, opt)) : lang.getName(subject, opt);
};
// {name:subject:verb:capitalise}
(tp.text_processors as any).nv = function (arr: any, params: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    return lang.nounVerb(subject, arr[1], arr[2] === 'true');
};
(tp.text_processors as any).pv = function (arr: any, params: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    return lang.pronounVerb(subject, arr[1], arr[2] === 'true');
};
(tp.text_processors as any).vn = function (arr: any, params: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    return lang.verbNoun(subject, arr[1], arr[2] === 'true');
};
(tp.text_processors as any).vp = function (arr: any, params: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    return lang.verbPronoun(subject, arr[1], arr[2] === 'true');
};
(tp.text_processors as any).cj = function (arr: any, params: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    return arr[2] === 'true' ? sentenceCase(lang.conjugate(subject, arr[1])) : lang.conjugate(subject, arr[1]);
};
// {name:subject:capitalise}
(tp as any).handlePronouns = function (arr: any, params: any, pronoun: any) {
    const subject = (tp as any).findSubject(arr, params);
    if (!subject)
        return false;
    return arr[1] === 'true' ? sentenceCase(subject.pronouns[pronoun]) : subject.pronouns[pronoun];
};
(tp.text_processors as any).pa = function (arr: any, params: any) {
    return (tp as any).handlePronouns(arr, params, "poss_adj");
};
(tp.text_processors as any).ob = function (arr: any, params: any) {
    return (tp as any).handlePronouns(arr, params, "objective");
};
(tp.text_processors as any).sb = function (arr: any, params: any) {
    return (tp as any).handlePronouns(arr, params, "subjective");
};
(tp.text_processors as any).ps = function (arr: any, params: any) {
    return (tp as any).handlePronouns(arr, params, "possessive");
};
(tp.text_processors as any).rf = function (arr: any, params: any) {
    return (tp as any).handlePronouns(arr, params, "reflexive");
};
// {pa2:chr1:chr2}
(tp.text_processors as any).pa2 = function (arr: any, params: any) {
    const chr1 = (tp as any).findSubject(arr, params);
    if (!chr1)
        return false;
    arr.shift();
    const chr2 = (tp as any).findSubject(arr, params);
    if (!chr2)
        return false;
    if (chr1.pronouns === chr2.pronouns) {
        const opt = { article: DEFINITE, possessive: true };
        return arr[1] === 'true' ? sentenceCase(lang.getName(chr1, opt)) : lang.getName(chr1, opt);
    }
    return arr[1] === 'true' ? sentenceCase(chr1.pronouns.poss_adj) : chr1.pronouns.poss_adj;
};
// {pa3:chr1:chr2}
(tp.text_processors as any).pa3 = function (arr: any, params: any) {
    const chr1 = (tp as any).findSubject(arr, params);
    if (!chr1)
        return false;
    arr.shift();
    const chr2 = (tp as any).findSubject(arr, params);
    if (!chr2)
        return false;
    if (chr1 !== chr2) {
        const opt = { article: DEFINITE, possessive: true };
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'subject'.
        return arr[1] === 'true' ? sentenceCase(lang.getName(subject, opt)) : lang.getName(subject, opt);
    }
    return arr[1] === 'true' ? sentenceCase(chr1.pronouns.poss_adj) : chr1.pronouns.poss_adj;
};
