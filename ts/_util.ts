"use strict";
// ============  Utilities  =================================
// Should all be language neutral
const INDEFINITE = 1;
const DEFINITE = 2;
const INFINITY = 9999;
const NULL_FUNC = function () { };
const test = {};
(test as any).testing = false;
//@DOC
// ## General Utility Functions
//@UNDOC

//@DOC
// Runs the given string as though the player typed it, including recording it in the output
function runCmd(cmd: any) {
    (io as any).msgInputText(cmd);
    (parser as any).parse(cmd);
}
//@DOC
// This is an attempt to mimic the firsttime functionality of Quest 5. Unfortunately, JavaScript does not
// lend itself well to that!
// If this is the first time the give `id` has been encountered, the `first` function will be run.
// Otherwise the `other` function will be run, if given.
//
//     firstime(342, function() {
//       msg("This was the first time.")
//     }, function() {
//       msg("This was NOT the first time.")
//     }, function() {
//
function firsttime(id: any, first: any, other: any) {
    if (firsttimeTracker.includes(id)) {
        if (other)
            other();
    }
    else {
        firsttimeTracker.push(id);
        first();
    }
}
const firsttimeTracker: any = [];
//@DOC
// If the given attribute is a string it is printed, if it is a
// function it is called. Otherwise an error is generated.
// It isMultiple is true, the object name is prefixed.
// TODO: test array with function
function printOrRun(char: any, item: any, attname: any, options: any) {
    if (options === undefined)
        options = {};
    if (typeof item[attname] === "string") {
        // The attribute is a string
        let s = prefix(item, options.multi) + item[attname];
        if (item[attname + 'Addendum'])
            s += item[attname + 'Addendum'](char);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(s, { char: char, item: item });
        return true;
    }
    else if (typeof item[attname] === "function") {
        // The attribute is a function
        const res = item[attname](options.multi, char, options);
        return res;
    }
    else {
        const s = "Unsupported type for printOrRun (" + attname + " is a " + (typeof item[attname]) + ").";
        errormsg(s + " F12 for more.");
        throw new Error(s);
    }
}
function printOrRun2(char: any, item: any, attname: any, options: any) {
    if (options === undefined)
        options = {};
    let flag, i;
    if (Array.isArray(item[attname])) {
        // the attribute is an array
        //debugmsg(0, "Array: " + attname);
        flag = true;
        for (i = 0; i < item[attname].length; i++) {
            flag = printOrRun(char, item, item[attname][i], options) && flag;
        }
        return flag;
    }
    if (Array.isArray(attname)) {
        // The value is an array
        flag = true;
        for (i = 0; i < attname.length; i++) {
            flag = printOrRun(char, item, attname[i], options) && flag;
        }
        return flag;
    }
    else if (!item[attname]) {
        // This is not an attribute
        if (typeof attname === "function") {
            return attname(item, options.multi, char, options);
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(attname, { char: char, item: item });
            return true;
        }
    }
    else if (typeof item[attname] === "string") {
        // The attribute is a string
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(item, options.multi) + item[attname], { char: char, item: item });
        return true;
    }
    else if (typeof item[attname] === "function") {
        // The attribute is a function
        const res = item[attname](options.multi, char, options);
        return res;
    }
    else {
        errormsg("Unsupported type for printOrRun");
        return false;
    }
}
// ============  Random Utilities  =======================================
//@DOC
// ## Random Functions
//@UNDOC
const random = {
    buffer: [],
};
//@DOC
// Returns a random number from 0 to n1, or n1 to n2, inclusive.
(random as any).int = function (n1: any, n2: any) {
    if (this.buffer.length > 0)
        return this.buffer.shift();
    if (n2 === undefined) {
        n2 = n1;
        n1 = 0;
    }
    return Math.floor(Math.random() * (n2 - n1 + 1)) + n1;
};
//@DOC
// Returns true 'percentile' times out of 100, false otherwise.
(random as any).chance = function (percentile: any) {
    return (random as any).int(99) < percentile;
};
//@DOC
// Returns a random element from the array, or null if it is empty
// If the second parameter is true, then the selected value is also deleted from the array,
// preventing it from being selected a second time.
// If sent a string instead of an array, the string will be broken into an array on |.
(random as any).fromArray = function (arr: any, deleteEntry: any) {
    if (typeof arr === 'string')
        arr.split('|');
    if (arr.length === 0)
        return null;
    const index = (random as any).int(arr.length - 1);
    const res = arr[index];
    if (deleteEntry)
        arr.splice(index, 1);
    return res;
};
//@DOC
// Returns the given array, in random order using the Fisher-Yates algorithm
(random as any).shuffle = function (arr: any) {
    if (typeof arr === "number")
        // @ts-expect-error ts-migrate(2569) FIXME: Type 'IterableIterator<number>' is not an array ty... Remove this comment to see the full error message
        arr = [...Array(arr).keys()];
    const res = [];
    while (arr.length > 0) {
        res.push((random as any).fromArray(arr, true));
    }
    return res;
};
//@DOC
// Returns a random number based on the standard RPG dice notation.
// For example 2d6+3 means roll two six sided dice and add three.
// Returns he number if sent a number.
// It can cope with complex strings such as 2d8-3d6
// You can also specify unusual dice, i.e., not a sequence from one to n, by separating each value with a colon,
// so d1:5:6 rolls a three sided die, with 1, 5 and 6 on the sides.
// It will cope with any number of parts, so -19+2d1:5:6-d4 will be fine.
(random as any).dice = function (s: any) {
    if (typeof s === 'number')
        return s;
    s = s.replace(/ /g, '').replace(/\-/g, '+-');
    let total = 0;
    for (let dice of s.split("+")) {
        if (dice === '')
            continue;
        let negative = 1;
        if (/^\-/.test(dice)) {
            dice = dice.substring(1);
            negative = -1;
        }
        if (/^\d+$/.test(dice)) {
            total += parseInt(dice);
        }
        else {
            if (/^d/.test(dice)) {
                dice = "1" + dice;
            }
            const parts = dice.split("d");
            if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^[0-9\:]+$/.test(parts[1])) {
                const number = parseInt(parts[0]);
                for (let i = 0; i < number; i++) {
                    if (/^\d+$/.test(parts[1])) {
                        total += negative * (random as any).int(1, parseInt(parts[1]));
                    }
                    else {
                        total += negative * parseInt((random as any).fromArray(parts[1].split(':')));
                    }
                }
            }
            else {
                console.log("Can't parse dice type (but will attempt to use what I can): " + dice);
                errormsg("Can't parse dice type (but will attempt to use what I can): " + dice);
            }
        }
    }
    return total;
};
//@DOC
// Loads up a buffer with the given number or array of numbers.
// The random.int function will grab the first number from the buffer and return that instead of a random
// number, if there is anything in the buffer. Note that the other random functions all use random.int,
// so you can use random.prime to force any of them to return a certain value. Note that there is no
// checking, so random.int(4) could return 7 or even "seven". It is up to you to ensure the numbers you
// prime the buffer with make sense.
// This is most useful when testing, as you know in advance what the random number will be.
(random as any).prime = function (ary: any) {
    if (typeof ary === 'number')
        ary = [ary];
    for (let el of ary)
        this.buffer.push(el);
};
// ============  String Utilities  =======================================
//@DOC
// ## String Functions
//@UNDOC
//@DOC
// Returns the string with the first letter capitalised
function sentenceCase(str: any) {
    return str.replace(/[a-z]/i, (letter: any) => letter.toUpperCase()).trim();
}
//@DOC
// Returns a string with the given number of hard spaces. Browsers collapse multiple white spaces to just show
// one, so you need to use hard spaces (NBSPs) if you want several together.
function spaces(n: any) {
    return "&nbsp;".repeat(n);
}
//@DOC
// If isMultiple is true, returns the item name, otherwise nothing. This is useful in commands that handle
// multiple objects, as you can have this at the start of the response string. For example, if the player does GET BALL,
// the response might be "Done". If she does GET ALL, then the response for the ball needs to be "Ball: Done".
// In the command, you can have `msg(prefix(item, isMultiple) + "Done"), and it is sorted.
function prefix(item: any, isMultiple: any) {
    if (!isMultiple) {
        return "";
    }
    return sentenceCase(item.alias) + ": ";
}
//@DOC
// Creates a string from an array. If the array element is a string, that is used, if it is an item, `lang.getName` is used (and passed the `options`). Items are sorted alphabetically, based on the "name" attribute.
//
// Options:
//
// * article:    DEFINITE (for "the") or INDEFINITE (for "a"), defaults to none (see `lang.getName`)
// * sep:        separator (defaults to comma)
// * lastJoiner: separator for last two items (just separator if not provided); you should not include any spaces
// * modified:   item aliases modified (see `lang.getName`) (defaults to false)
// * nothing:    return this if the list is empty (defaults to empty string)
// * count:      if this is a number, the name will be prefixed by that (instead of the article)
// * doNotSort   if true the list is not sorted
// * separateEnsembles:  if true, ensembles are listed as the separate items
//
// For example:
//
// ```
// formatList(listOfOjects, {article:INDEFINITE, lastJoiner:"and"})
// -> "a hat, Mary and some boots"
//
// formatList(list, {lastJoiner:"or", nothing:"nowhere");
// -> north, east or up
// ```
//
function formatList(itemArray: any, options: any) {
    if (options === undefined) {
        options = {};
    }
    if (itemArray.length === 0) {
        return options.nothing ? options.nothing : "";
    }
    if (!options.sep)
        options.sep = ",";
    if (!options.separateEnsembles) {
        const toRemove = [];
        const toAdd: any = [];
        for (let item of itemArray) {
            if (item.ensembleMaster && item.ensembleMaster.isAllTogether()) {
                toRemove.push(item);
                if (!toAdd.includes(item.ensembleMaster))
                    toAdd.push(item.ensembleMaster);
            }
        }
        itemArray = (array as any).subtract(itemArray, toRemove);
        itemArray = itemArray.concat(toAdd);
    }
    // sort the list alphabetically on name
    if (!options.doNotSort) {
        itemArray.sort(function (a: any, b: any) {
            if (a.name)
                a = a.name;
            if (b.name)
                b = b.name;
            return a.localeCompare(b);
        });
    }
    const l = itemArray.map((el: any) => {
        //if (el === undefined) return "[undefined]";
        return typeof el === "string" ? el : lang.getName(el, options);
    });
    let s = "";
    if ((settings as any).oxfordComma && l.length === 2 && options.lastJoiner)
        return l[0] + ' ' + options.lastJoiner + ' ' + l[1];
    do {
        s += l.shift();
        if (l.length === 1 && options.lastJoiner) {
            if ((settings as any).oxfordComma)
                s += options.sep;
            s += ' ' + options.lastJoiner + ' ';
        }
        else if (l.length > 0)
            s += options.sep + ' ';
    } while (l.length > 0);
    return s;
}
//@DOC
// Lists the properties of the given object; useful for debugging only.
// To inspect an object use JSON.stringify(obj)
function listProperties(obj: any) {
    return Object.keys(obj).join(", ");
}
const arabic = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const roman = "M;CM;D;CD;C;XC;L;XL;X;IX;V;IV;I".split(";");
//@DOC
// Returns the given number as a string in Roman numerals.
function toRoman(number: any) {
    if (typeof number !== "number") {
        errormsg("toRoman can only handle numbers");
        return number;
    }
    let result = "";
    //var a, r;
    for (let i = 0; i < 13; i++) {
        while (number >= arabic[i]) {
            result = result + roman[i];
            number = number - arabic[i];
        }
    }
    return result;
}
//@DOC
// Returns the given number as a string formatted as money. The formatting is defined by settings.moneyFormat.
function displayMoney(n: any) {
    if (typeof settings.moneyFormat === "undefined") {
        errormsg("No format for money set (set settings.moneyFormat in settings.js).");
        return "" + n;
    }
    const ary = settings.moneyFormat.split("!");
    if (ary.length === 2) {
        return settings.moneyFormat.replace("!", "" + n);
    }
    else if (ary.length === 3) {
        const negative = (n < 0);
        n = Math.abs(n);
        let options = ary[1];
        const showsign = options.startsWith("+");
        if (showsign) {
            options = options.substring(1);
        }
        let number = displayNumber(n, options);
        if (negative) {
            number = "-" + number;
        }
        else if (n !== 0 && showsign) {
            number = "+" + number;
        }
        return (ary[0] + number + ary[2]);
    }
    else if (ary.length === 4) {
        const options = n < 0 ? ary[2] : ary[1];
        return ary[0] + displayNumber(n, options) + ary[3];
    }
    else {
        errormsg("settings.moneyFormat in settings.js expected to have either 1, 2 or 3 exclamation marks.");
        return "" + n;
    }
}
//@DOC
// Returns the given number as a string formatted as per the control string.
// The control string is made up of five parts.
// The first is a sequence of characters that are not digits that will be added to the start of the string, and is optional.
// The second is a sequence of digits and it the number of characters left of the decimal point; this is padded with zeros to make it longer.
// The third is a single non-digit character; the decimal marker.
// The fourth is a sequence of digits and it the number of characters right of the decimal point; this is padded with zeros to make it longer.
// The fifth is a sequence of characters that are not digits that will be added to the end of the string, and is optional.
function displayNumber(n: any, control: any) {
    n = Math.abs(n); // must be positive
    const regex = /^(\D*)(\d+)(\D)(\d*)(\D*)$/;
    if (!regex.test(control)) {
        errormsg("Unexpected format in displayNumber (" + control + "). Should be a number, followed by a single character separator, followed by a number.");
        return "" + n;
    }
    const options = regex.exec(control);
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    const places = parseInt(options[4]); // eg 2
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    let padding = parseInt(options[2]); // eg 3
    if (places > 0) {
        // We want a decimal point, so the padding, the total length, needs that plus the places
        padding = padding + 1 + places; // eg 6
    }
    const factor = Math.pow(10, places); // eg 100
    const base = (n / factor).toFixed(places); // eg "12.34"
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    const decimal = base.replace(".", options[3]); // eg "12,34"
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    return (options[1] + decimal.padStart(padding, "0") + options[5]); // eg "(012,34)"
}
//@DOC
// Converts the string to the standard direction name, so "down", "dn" and "d" will all return "down".
// Uses the EXITS array, so language neutral.
function getDir(s: any) {
    for (let exit of lang.exit_list) {
        if (exit.type === 'nocmd')
            continue;
        if (exit.name === s)
            return exit.name;
        if (exit.abbrev.toLowerCase() === s)
            return exit.name;
        if (new RegExp("^(" + exit.alt + ")$").test(s))
            return exit.name;
    }
    return false;
}
// ============  Array Utilities  =======================================
//@DOC
// ## Array (List) Functions
//@UNDOC
const array = {};
//@DOC
// Returns a new array, derived by subtracting each element in b from the array a.
// If b is not an array, then b itself will be removed.
// Unit tested.
(array as any).subtract = function (a: any, b: any) {
    if (!Array.isArray(b))
        b = [b];
    const res = [];
    for (let i = 0; i < a.length; i++) {
        if (!b.includes(a[i]))
            res.push(a[i]);
    }
    return res;
};
//@DOC
// Returns true if the arrays a and b are equal. They are equal if both are arrays, they have the same length,
// and each element in order is the same.
// Assumes a is an array, but not b.
// Unit tested
(array as any).compare = function (a: any, b: any) {
    if (!Array.isArray(b))
        return false;
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (b[i] !== a[i])
            return false;
    }
    return true;
};
//@DOC
// Returns true if each element in a matches the elements in b, but not necessarily in the same order
// (assumes each element is unique; repeated elements may give spurious results).
// Assumes a is an array, but not b.
// Unit tested
(array as any).compareUnordered = function (a: any, b: any) {
    if (!Array.isArray(b))
        return false;
    if (a.length !== b.length)
        return false;
    for (let el of a) {
        if (!b.includes(el))
            return false;
    }
    return true;
};
//@DOC
// Removes the element el from the array, ary.
// Unlike array.subtract, no new array is created; the original aray is modified, and nothing is returned.
(array as any).remove = function (ary: any, el: any) {
    let index = ary.indexOf(el);
    if (index !== -1) {
        ary.splice(index, 1);
    }
};
//@DOC
// Returns a new array based on ary, but including only those objects for which the attribute attName is equal to value.
// To filter for objects that do not have the attribute you can filter for the value undefined.
(array as any).filterByAttribute = function (ary: any, attName: any, value: any) {
    return ary.filter((el: any) => el[attName] === value);
};
//@DOC
// Returns the next element after el from the array, ary.
// If el is present more than once, it goes with the first.
// If el is the last element, and circular is true it return the fist element and false otherwise.
(array as any).next = function (ary: any, el: any, circular: any) {
    let index = ary.indexOf(el) + 1;
    if (index === 0)
        return false;
    if (index === ary.length)
        return circular ? ary[0] : false;
    return ary[index];
};
//@DOC
// Returns the next element after el from the array, ary, for which the attribute, att, is true.
// If el is present more than once, it goes with the first.
// If el is the last element, and circular is true it return the fist element and false otherwise.
(array as any).nextFlagged = function (ary: any, el: any, att: any, circular: any) {
    let o = el;
    let count = ary.length;
    while (o && !o[att] && count > 0) {
        o = (array as any).next(ary, o, circular);
        count = count - 1;
    }
    if (!o || !o[att])
        return false;
    return (o);
};
//@DOC
// Returns a copy of the given array. Members of the array are not cloned.
(array as any).clone = function (ary: any, options: any) {
    if (!options)
        options = {};
    // @ts-expect-error ts-migrate(2569) FIXME: Type 'Set<unknown>' is not an array type or a stri... Remove this comment to see the full error message
    let newary = options.compress ? [...new Set(ary)] : [...ary];
    if (options.value)
        newary = newary.map(el => el[options.value]);
    if (options.function)
        newary = newary.map(el => el[options.function]());
    if (options.attribute)
        newary = newary.map(el => typeof el[options.attribute] === 'function' ? el[options.attribute]() : el[options.attribute]);
    return options.reverse ? newary.reverse() : newary;
};
// ============  Scope Utilities  =======================================
//@DOC
// ## Scope Functions
//@UNDOC
//@DOC
// Returns an array of objects the player can currently reach and see.
function scopeReachable() {
    const list = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (w[key].scopeStatus === world.REACHABLE && world.ifNotDark(w[key])) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            list.push(w[key]);
        }
    }
    return list;
}
//@DOC
// Returns an array of objects held by the given character.
function scopeHeldBy(chr: any, situation = world.PARSER) {
    return chr.getContents(situation);
}
//@DOC
// Returns an array of objects at the player's location that can be seen.
function scopeHereListed() {
    const list = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const o = w[key];
        if (!o.player && o.isAtLoc((game as any).player.loc, world.LOOK) && world.ifNotDark(o)) {
            list.push(o);
        }
    }
    return list;
}
//@DOC
// Returns an array of NPCs at the player's location (excludes those flagged as scenery).
function scopeNpcHere(ignoreDark: any) {
    const list = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const o = w[key];
        if (o.isAtLoc((game as any).player.loc, world.LOOK) && o.npc && (world.ifNotDark(o) || ignoreDark)) {
            list.push(o);
        }
    }
    return list;
}
//@DOC
// Returns an array of NPCs at the player's location (includes those flagged as scenery).
function scopeAllNpcHere(ignoreDark: any) {
    const list = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const o = w[key];
        if (o.isAtLoc((game as any).player.loc, world.PARSER) && o.npc && (world.ifNotDark(o) || ignoreDark)) {
            list.push(o);
        }
    }
    return list;
}
//@DOC
// Returns an array of objects for which the given function returns true.
function scopeBy(func: any) {
    const list = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (func(w[key])) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            list.push(w[key]);
        }
    }
    return list;
}
const util = {};
(util as any).getContents = function (situation: any) {
    const list = [];
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (w[key].isAtLoc((this as any).name, situation)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            list.push(w[key]);
        }
    }
    return list;
};
// Is this container already inside the given object, and hence
// putting the object in the container will destroy the universe
(util as any).testForRecursion = function (char: any, item: any) {
    let contName = (this as any).name;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    while (w[contName]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (w[contName].loc === item.name)
            return falsemsg(lang.container_recursion, { char: char, container: this, item: item });
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        contName = w[contName].loc;
    }
    return true;
};
(util as any).nameModifierFunctionForContainer = function (o: any, list: any) {
    //console.log("here")
    const contents = o.getContents(world.LOOK);
    //console.log(contents)
    if (contents.length > 0 && (!o.closed || o.transparent)) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        list.push(lang.contentsForData[o.contentsType].prefix + o.listContents(world.LOOK) + lang.contentsForData[o.contentsType].suffix);
    }
    //console.log(list)
};
(util as any).changeListeners = [];
// This is used in world.endTurn, before turn events are run, and after too (just once if no turn events). Also after timer events if one fired
(util as any).handleChangeListeners = function () {
    for (let el of (util as any).changeListeners) {
        if (el.test(el.object, el.attName, el.oldValue))
            el.func(el.object);
    }
};
(util as any).defaultChangeListenerTest = function (object: any, attName: any, oldValue: any) {
    return object[attName] != oldValue;
};
(util as any).addChangeListener = function (object: any, attName: any, func: any, test = (util as any).defaultChangeListenerTest) {
    if (world.isCreated && !settings.saveDisabled) {
        errormsg("Attempting to use addChangeListener after set up.");
        return;
    }
    (util as any).changeListeners.push({ object: object, attName: attName, func: func, test: test, oldValue: object[attName] });
};
// ============  Response Utilities  =======================================
//@DOC
// ## The Respond Function
//@UNDOC
//@DOC
// Searchs the given list for a suitable response, according to the given params, and runs that response.
// This is a big topic, see [here](https://github.com/ThePix/QuestJS/wiki/The-respond-function) for more.
function respond(params: any, list: any, func: any) {
    //console.log(params)
    //if (!params.action) throw "No action in params"
    //if (!params.actor) throw "No action in params"
    //if (!params.target) throw "No action in params"
    const response = (util as any).findResponse(params, list);
    if (!response) {
        if (func)
            func(params);
        errormsg("Failed to find a response");
        console.log(params);
        console.log(list);
        return false;
    }
    //console.log(response)
    if (response.script)
        response.script(params);
    if (response.msg) {
        if (params.actor) {
            params.actor.msg(response.msg, params);
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(response.msg, params);
        }
    }
    if (!response.script && !response.msg && !response.failed) {
        errormsg("No script or msg for response");
        console.log(response);
    }
    if (func)
        func(params, response);
    return !response.failed;
}
function getResponseList(params: any, list: any, result: any) {
    if (!result)
        result = [];
    for (let item of list) {
        if (item.name) {
            params.text = item.name.toLowerCase();
            //console.log("check item: " + item.name)
            if (item.test) {
                if (!result.includes(item) && item.test(params))
                    result.push(item);
            }
            else {
                if (!result.includes(item))
                    result.push(item);
            }
            //console.log("item is good: " + item.name)
        }
        if (item.responses)
            result = getResponseList(params, item.responses, result);
        //console.log("done")
    }
    return result;
}
(util as any).findResponse = function (params: any, list: any) {
    for (let item of list) {
        if (item.test && !item.test(params))
            continue;
        if (item.responses)
            return (util as any).findResponse(params, item.responses);
        return item;
    }
    return false;
};
(util as any).addResponse = function (route: any, data: any, list: any) {
    (util as any).addResponseToList(route, data, list);
};
(util as any).addResponseToList = function (route: any, data: any, list: any) {
    const sublist = (util as any).getResponseSubList(route, list);
    sublist.unshift(data);
};
(util as any).getResponseSubList = function (route: any, list: any) {
    const s = route.shift();
    if (s) {
        const sublist = list.find((el: any) => el.name === s);
        if (!sublist)
            throw "Failed to add sub-list with " + s;
        return (util as any).getResponseSubList(route, sublist.responses);
    }
    else {
        return list;
    }
};
(util as any).verifyResponses = function (list: any, level: any) {
    //  console.log(list)
    if (level === undefined)
        level = 1;
    if (list[list.length - 1].test) {
        console.log("WARNING: Last entry at depth " + level + " has a test condition:");
        console.log(list);
    }
    for (let item of list) {
        if (item.responses) {
            //console.log(item.name)
            if (item.responses.length === 0) {
                console.log("Zero responses at depth " + level + " for: " + item.name);
            }
            else {
                (util as any).verifyResponses(item.responses, level + 1);
            }
        }
    }
};
(util as any).listContents = function (situation: any, modified = true) {
    return formatList((this as any).getContents(situation), { article: INDEFINITE, lastJoiner: lang.list_and, modified: modified, nothing: lang.list_nothing, loc: (this as any).name });
};
(util as any).niceDirection = function (dir: any) {
    const dirObj = lang.exit_list.find(function (el) { return el.name === dir; });
    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
    return dirObj.niceDir ? dirObj.niceDir : dirObj.name;
};
(util as any).reverseDirection = function (dir: any) {
    const dirObj = lang.exit_list.find(function (el) { return el.name === dir; });
    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
    return dirObj.opp;
};
(util as any).reverseDirectionObj = function (dir: any) {
    return lang.exit_list.find(function (el) { return el.name === (util as any).reverseDirection(dir); });
};
(util as any).exitList = function (char = (game as any).player) {
    const list = [];
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const room = w[char.loc];
    for (let exit of lang.exit_list) {
        if (room.hasExit(exit.name)) {
            list.push(exit.name);
        }
    }
    return list;
};
//@DOC
// Returns the number of the internal the given number falls in
// For example, if intervals
// Unit tested.
(util as any).getByInterval = function (intervals: any, n: any) {
    let count = 0;
    while (count < intervals.length) {
        if (n < intervals[count])
            return count;
        n -= intervals[count];
        count++;
    }
    return false;
};
//@DOC
// Returns a string formatted in CSS from the given dictionary.
// If includeCurlyBraces is true, you get curly braces too.
(util as any).dictionaryToCss = function (d: any, includeCurlyBraces: any) {
    const ary = [];
    for (let key in d)
        ary.push(key + ':' + d[key]);
    return includeCurlyBraces ? '{' + ary.join(';') + '}' : ary.join(';');
};
(util as any).getNameModifiers = function (item: any, options: any) {
    if (!options.modified)
        return '';
    const list: any = [];
    for (let f of item.nameModifierFunctions)
        f(item, list);
    if (item.nameModifierFunction)
        item.nameModifierFunction(list);
    if (list.length === 0)
        return '';
    if (options.noBrackets)
        return ' ' + list.join('; ');
    return ' (' + list.join('; ') + ')';
};
//@DOC
// Returns the game time as a string. The game time is game.elapsedTime seconds after game.startTime.
(util as any).getDateTime = function (options: any) {
    if (!(settings.dateTime as any).formats) {
        const time = new Date((game as any).elapsedTime * 1000 + (game as any).startTime.getTime());
        return time.toLocaleString(settings.dateTime.locale, settings.dateTime);
    }
    return (util as any).getCustomDateTime(options);
};
(util as any).getDateTimeDict = function (options: any) {
    if (!options)
        options = {};
    return (settings.dateTime as any).formats ? (util as any).getCustomDateTimeDict(options) : (util as any).getStdDateTimeDict(options);
};
(util as any).getStdDateTimeDict = function (options: any) {
    const dict = {};
    let timeInSeconds = (game as any).elapsedTime;
    if (options.add)
        timeInSeconds += options.add;
    const time = new Date(timeInSeconds * 1000 + (game as any).startTime.getTime());
    (dict as any).second = time.getSeconds();
    (dict as any).minute = time.getMinutes();
    (dict as any).hour = time.getHours();
    (dict as any).date = time.getDate();
    (dict as any).weekday = time.toLocaleString('default', { weekday: 'long' });
    (dict as any).month = time.toLocaleString('default', { month: 'long' });
    (dict as any).year = time.getFullYear();
    return dict;
};
(util as any).getCustomDateTimeDict = function (options: any) {
    const dict = {};
    let time = (settings.dateTime as any).startTime + (game as any).elapsedTime;
    if (options.is)
        time = (settings.dateTime as any).startTime + options.is;
    if (options.add)
        time += options.add;
    for (let el of (settings.dateTime as any).data) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        dict[el.name] = time % el.number;
        time = Math.floor(time / el.number);
    }
    return dict;
};
(util as any).getCustomDateTime = function (options: any) {
    if (!options)
        options = {};
    const dict = (util as any).getCustomDateTimeDict(options);
    let s = options.format ? (settings.dateTime as any).formats[options.format] : (settings.dateTime as any).formats.def;
    for (let key in (settings.dateTime as any).functions) {
        s = s.replace('%' + key + '%', (settings.dateTime as any).functions[key](dict));
    }
    return s;
};
(util as any).seconds = function (seconds: any, minutes = 0, hours = 0, days = 0) {
    if ((settings.dateTime as any).convertSeconds)
        return (settings.dateTime as any).convertSeconds(seconds, minutes, hours, days);
    return ((((days * 24) + hours) * 60) + minutes) * 60 + seconds;
};
(util as any).elapsed = function (seconds: any, minutes = 0, hours = 0, days = 0) {
    return (util as any).seconds(seconds, minutes, hours, days) >= (game as any).elapsedTime;
};
(util as any).isAfter = function (timeString: any) {
    if (typeof timeString === 'number')
        return (game as any).elapsedTime > timeString;
    if (timeString.match(/^\d\d\d\d$/)) {
        // This is a 24h clock time, so a daily
        const dict = (util as any).getDateTimeDict();
        const hour = parseInt(timeString.substring(0, 2));
        const minute = parseInt(timeString.substring(2, 4));
        if (hour < dict.hour)
            return true;
        if (hour > dict.hour)
            return false;
        return (minute < dict.minute);
    }
    const nowTime = new Date((game as any).elapsedTime * 1000 + (game as any).startTime.getTime());
    const targetTime = Date.parse(timeString);
    if (targetTime)
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'Date' and... Remove this comment to see the full error message
        return nowTime > targetTime;
    return errormsg("Failed to parse date-time string: " + timeString);
};
(util as any).changePOV = function (char: any, pronouns: any) {
    if (typeof char === 'string') {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[char])
            return errormsg("Failed to change POV, no object called '" + char + "'");
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        char = w[char];
    }
    else if (!char)
        errormsg("Failed to change POV, char not defined.");
    if ((game as any).player) {
        (game as any).player.player = false;
        (game as any).player.pronouns = (game as any).player.npcPronouns;
        (game as any).player.regex = new RegExp('^(' + (char.npcAlias ? char.npcAlias : char.alias) + ')$');
    }
    char.player = true;
    char.npcPronouns = char.pronouns;
    char.pronouns = pronouns ? pronouns : lang.pronouns.secondperson;
    char.regex = new RegExp('^(me|myself|player|' + (char.npcAlias ? char.npcAlias : char.alias) + ')$');
    (game as any).player = char;
    (game as any).update();
    if ((w as any).background)
        world.setBackground();
};
(util as any).defaultExitUse = function (char: any, dir: any, exit: any) {
    if (!exit)
        exit = this;
    if (char.testMobility && !char.testMobility()) {
        return false;
    }
    if (exit.isLocked()) {
        if (exit.lockedmsg) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(exit.lockedmsg);
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(lang.locked_exit(char, exit));
        }
        return false;
    }
    if (exit.isUnlocked && !exit.isUnlocked(char, dir))
        return false;
    for (let el of char.onGoCheckList) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[el].onGoCheck(char, exit.name, dir))
            return false;
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    msg(lang.stop_posture(char));
    if (exit.msg) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        printOrRun(char, exit, "msg");
    }
    else {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.go_successful, { char: char, dir: dir });
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
    world.setRoom(char, exit.name, false);
    return true;
};
// Helper function for exits.
// You must set "door" and can optionally set "doorName" in the exit attributes
(util as any).useWithDoor = function (char: any, dir: any) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const obj = w[(this as any).door];
    if (obj === undefined) {
        errormsg("Not found an object called '" + (this as any).door + "'. Any exit that uses the 'util.useWithDoor' function must also set a 'door' attribute.");
    }
    const tpParams = { char: char, doorName: (this as any).doorName ? (this as any).doorName : "door" };
    if (!obj.closed) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        world.setRoom(char, (this as any).name, dir);
        return true;
    }
    if (!obj.locked) {
        obj.closed = false;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.open_and_enter, tpParams);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        world.setRoom(char, (this as any).name, false);
        return true;
    }
    if (obj.testKeys(char)) {
        obj.closed = false;
        obj.locked = false;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.unlock_and_enter, tpParams);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        world.setRoom(char, (this as any).name, false);
        return true;
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    msg(lang.try_but_locked, tpParams);
    return false;
};
// Helper function for exits.
// You can optionally set "msg" in the exit attributes
(util as any).cannotUse = function (char: any, dir: any) {
    const tpParams = { char: char };
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    msg((this as any).msg ? (this as any).msg : lang.try_but_locked, tpParams);
    return false;
};
