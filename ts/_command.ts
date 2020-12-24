"use strict";
// Should all be language neutral (except the inspect function, which is just for debugging)
function Cmd(name: any, hash: any) {
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.name = name;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.objects = [];
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.rules = [];
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.default = function (item: any, isMultiple: any, char: any) {
        if (typeof this.defmsg === "string") {
            failedmsg(prefix(item, isMultiple) + this.defmsg, { char: char, item: item });
        }
        else if (typeof this.defmsg === "function") {
            failedmsg(prefix(item, isMultiple) + this.defmsg(char, item), { char: char, item: item });
        }
        else {
            errormsg("No default set for command '" + this.name + "'.");
        }
        return false;
    };
    // This is the default script for commands
    // Assumes a verb and an object; the verb may or may not be the first object
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.script = function (objects: any, matches: any) {
        let success = false;
        let suppressEndturn = false;
        let verb;
        if (objects.length > 1)
            verb = objects.shift();
        const multi = objects[0] && (objects[0].length > 1 || (parser as any).currentCommand.all);
        if (objects[0].length === 0) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            metamsg(lang.nothing_msg);
            return world.FAILED;
        }
        for (let i = 0; i < objects[0].length; i++) {
            if (!objects[0][i][this.attName]) {
                this.default(objects[0][i], multi, (game as any).player);
            }
            else {
                let result = this.processCommand((game as any).player, objects[0][i], multi, matches[0][i], verb);
                if (result === world.SUCCESS_NO_TURNSCRIPTS) {
                    suppressEndturn = true;
                    result = true;
                }
                success = result || success;
            }
        }
        if (success) {
            return (this.noTurnscripts || suppressEndturn ? world.SUCCESS_NO_TURNSCRIPTS : world.SUCCESS);
        }
        else {
            return world.FAILED;
        }
    };
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.processCommand = function (char: any, item: any, multi: any, match: any, verb: any) {
        for (let rule of this.rules) {
            if (typeof rule !== "function") {
                errormsg("Failed to process command '" + this.name + "' as one of its rules is not a function (F12 for more).");
                console.log("Failed to process command '" + this.name + "' as one of its rules is not a function:");
                console.log(this);
                console.log(rule);
            }
            if (!rule(this, char, item, multi)) {
                return false;
            }
        }
        let result = printOrRun(char, item, this.attName, { multi: multi, match: match, verb: verb });
        if (typeof result !== "boolean" && result !== world.SUCCESS_NO_TURNSCRIPTS) {
            // Assume the author wants to return true from the verb
            result = true;
        }
        return result;
    };
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.noobjecterror = function (s: any) {
        return lang.object_unknown_msg(s);
    };
    for (let key in hash) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this[key] = hash[key];
    }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.attName = this.attName ? this.attName : this.name.toLowerCase();
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    for (let key in this.objects) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (!this.objects[key].attName) {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.objects[key].attName = this.attName;
        }
    }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    if (!this.regex && !this.regexes) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.regexes = Array.isArray(lang.regex[this.name]) ? lang.regex[this.name] : [lang.regex[this.name]];
    }
}
// Use only for NPC commands that you are not giving your
// own custom script attribute. Commands must be an order to a single
// NPC in the form verb-object.
function NpcCmd(name: any, hash: any) {
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    Cmd.call(this, name, hash);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    if (!this.cmdCategory)
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.cmdCategory = name;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.script = function (objects: any) {
        const npc = objects[0][0];
        if (!npc.npc) {
            failedmsg(lang.not_npc, { char: (game as any).player, item: npc });
            return world.FAILED;
        }
        let success = false, handled;
        if (objects.length !== 2) {
            errormsg("The command " + name + " is trying to use a facility for NPCs to do it, but there is no object list; this facility is only for commands in the form verb-object.");
            return world.FAILED;
        }
        const multi = (objects[1].length > 1 || (parser as any).currentCommand.all);
        for (let obj of objects[1]) {
            if (npc["getAgreement" + this.cmdCategory] && !npc["getAgreement" + this.cmdCategory](obj, this.name)) {
                // The getAgreement should give the response
                continue;
            }
            if (!npc["getAgreement" + this.cmdCategory] && npc.getAgreement && !npc.getAgreement(this.cmdCategory, obj)) {
                continue;
            }
            if (!obj[this.attName]) {
                this.default(obj, multi, npc);
            }
            else {
                let result = this.processCommand(npc, obj, multi);
                if (result === world.SUCCESS_NO_TURNSCRIPTS) {
                    result = true;
                }
                success = result || success;
            }
        }
        if (success) {
            npc.pause();
            return (this.noTurnscripts ? world.SUCCESS_NO_TURNSCRIPTS : world.SUCCESS);
        }
        else {
            return world.FAILED;
        }
    };
}
function ExitCmd(name: any, dir: any, hash: any) {
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    Cmd.call(this, name, hash);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.exitCmd = true;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.dir = dir;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.objects = [{ ignore: true }, { ignore: true },],
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.script = function (objects: any) {
            if (!(game as any).room.hasExit(this.dir)) {
                failedmsg(lang.not_that_way, { char: (game as any).player, dir: this.dir });
                return world.FAILED;
            }
            else {
                const ex = (game as any).room[this.dir];
                if (typeof ex === "object") {
                    if (!(game as any).player.canMove(ex, this.dir)) {
                        return world.FAILED;
                    }
                    if (typeof ex.use !== 'function') {
                        errormsg("Exit's 'use' attribute is not a function (or does not exist). Press F12 for more.");
                        console.log("Bad exit:");
                        console.log(ex);
                        return world.FAILED;
                    }
                    const flag = ex.use((game as any).player, this.dir);
                    if (typeof flag !== "boolean") {
                        errormsg("Exit failed to return a Boolean value, indicating success of failure; assuming success");
                        return world.SUCCESS;
                    }
                    if (flag && ex.extraTime)
                        (game as any).elapsedTime += ex.extraTime;
                    return flag ? world.SUCCESS : world.FAILED;
                }
                else {
                    errormsg("Unsupported type for direction");
                    return world.FAILED;
                }
            }
        };
}
function NpcExitCmd(name: any, dir: any, hash: any) {
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    Cmd.call(this, name, hash);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.exitCmd = true;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.dir = dir;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.objects = [{ scope: (parser as any).isHere, attName: "npc" }, { ignore: true }, { ignore: true },],
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.script = function (objects: any) {
            const npc = objects[0][0];
            if (!(game as any).room.hasExit(this.dir)) {
                failedmsg(lang.not_that_way, { char: npc, dir: this.dir });
                return world.FAILED;
            }
            if (!npc.canMove((game as any).room[this.dir], this.dir)) {
                return world.FAILED;
            }
            if (npc.getAgreementGo && !npc.getAgreementGo(dir)) {
                return world.FAILED;
            }
            if (!npc.getAgreementGo && npc.getAgreement && !npc.getAgreement("Go", dir)) {
                return world.FAILED;
            }
            else {
                const ex = (game as any).room[this.dir];
                if (typeof ex === "object") {
                    const flag = ex.use(npc, this.dir);
                    if (flag)
                        npc.pause();
                    return flag ? world.SUCCESS : world.FAILED;
                }
                else {
                    errormsg("Unsupported type for direction");
                    return world.FAILED;
                }
            }
        };
}
// Should be called during the initialisation process
function initCommands() {
    const newCmds = [];
    for (let el of commands) {
        if (el.regex) {
            el.regexes = [el.regex];
        }
        if (el.npcCmd) {
            if (!Array.isArray(el.regexes))
                console.log(el);
            //console.log("creating NPC command for " + el.name)
            const regexAsStr = el.regexes[0].source.substr(1); // lose the ^ at the start, as we will prepend to it
            const objects = el.objects.slice();
            objects.unshift({ scope: (parser as any).isHere, attName: "npc" });
            const data = {
                objects: objects,
                attName: el.attName,
                default: el.default,
                defmsg: el.defmsg,
                rules: el.rules,
                score: el.score,
                cmdCategory: el.cmdCategory ? el.cmdCategory : el.name,
                forNpc: true,
            };
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            const cmd = new NpcCmd("Npc" + el.name, data);
            cmd.regexes = [];
            for (let key in lang.tell_to_prefixes) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                cmd.regexes.push(new RegExp("^" + lang.tell_to_prefixes[key] + regexAsStr));
            }
            if (el.useThisScriptForNpcs)
                cmd.script = el.script;
            cmd.scope = [];
            for (let el2 of el.objects) {
                cmd.scope.push(el2 === (parser as any).isHeld ? (parser as any).isHeldByNpc : el2);
                cmd.scope.push(el2 === (parser as any).isWorn ? (parser as any).isWornByNpc : el2);
            }
            newCmds.push(cmd);
        }
    }
    commands.push.apply(commands, newCmds);
    for (let el of lang.exit_list) {
        if (el.type !== 'nocmd') {
            let regex = "(" + lang.go_pre_regex + ")(" + el.name + "|" + el.abbrev.toLowerCase();
            if (el.alt) {
                regex += "|" + el.alt;
            }
            regex += ")$";
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            commands.push(new ExitCmd("Go" + sentenceCase(el.name), el.name, { regexes: [new RegExp("^" + regex)] }));
            const regexes = [];
            for (let key in lang.tell_to_prefixes) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                regexes.push(new RegExp("^" + lang.tell_to_prefixes[key] + regex));
            }
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            commands.push(new NpcExitCmd("NpcGo" + sentenceCase(el.name) + "2", el.name, { regexes: regexes }));
        }
    }
}
// Useful in a command's script when handling NPCs as well as the player
function extractChar(cmd: any, objects: any) {
    let char;
    if (cmd.forNpc) {
        char = objects[0][0];
        if (!char.npc) {
            failedmsg(lang.not_npc, { char: (game as any).player, item: char });
            return world.FAILED;
        }
        objects.shift();
    }
    else {
        char = (game as any).player;
    }
    return char;
}
function findCmd(name: any) {
    return commands.find(el => el.name === name);
}
const cmdRules = {};
// Item's location is the char and it is not worn
(cmdRules as any).isHeldNotWorn = function (cmd: any, char: any, item: any, isMultiple: any) {
    if (!item.getWorn() && item.isAtLoc(char.name, world.PARSER))
        return true;
    if (item.isAtLoc(char.name, world.PARSER))
        return falsemsg(prefix(item, isMultiple) + lang.already_wearing, { char: char, garment: item });
    if (item.loc) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const holder = w[item.loc];
        if (holder.npc || holder.player)
            return falsemsg(prefix(item, isMultiple) + lang.char_has_it, { holder: holder, item: item });
    }
    return falsemsg(prefix(item, isMultiple) + lang.not_carrying, { char: char, item: item });
};
// Item's location is the char and it is worn
(cmdRules as any).isWorn = function (cmd: any, char: any, item: any, isMultiple: any) {
    if (item.getWorn() && item.isAtLoc(char.name, world.PARSER))
        return true;
    if (item.isAtLoc(char.name, world.PARSER))
        return falsemsg(prefix(item, isMultiple) + lang.not_wearing, { char: char, item: item });
    if (item.loc) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const holder = w[item.loc];
        if (holder.npc || holder.player)
            return falsemsg(prefix(item, isMultiple) + lang.char_has_it, { holder: holder, item: item });
    }
    return falsemsg(prefix(item, isMultiple) + lang.not_carrying, { char: char, item: item });
};
// Item's location is the char
(cmdRules as any).isHeld = function (cmd: any, char: any, item: any, isMultiple: any) {
    if (item.isAtLoc(char.name, world.PARSER))
        return true;
    if (item.loc) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const holder = w[item.loc];
        if (holder.npc || holder.player)
            return falsemsg(prefix(item, isMultiple) + lang.char_has_it, { holder: holder, item: item });
    }
    return falsemsg(prefix(item, isMultiple) + lang.not_carrying, { char: char, item: item });
};
// Item's location is the char's location or the char
// or item is reachable, but not held by someone else
(cmdRules as any).isHere = function (cmd: any, char: any, item: any, isMultiple: any) {
    if (item.isAtLoc(char.loc, world.PARSER))
        return true;
    if (item.isAtLoc(char.name, world.PARSER))
        return true;
    if (item.loc) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const holder = w[item.loc];
        // Has a specific location and held by someone
        if (holder.npc || holder.player)
            return falsemsg(prefix(item, isMultiple) + lang.char_has_it, { holder: holder, item: item });
    }
    if (item.scopeStatus === world.REACHABLE)
        return true;
    return falsemsg(prefix(item, isMultiple) + lang.not_here, { char: char, item: item });
};
// Item's location is the char's location or the char
// or item is reachable, but not held by someone else
(cmdRules as any).isHereNotHeld = function (cmd: any, char: any, item: any, isMultiple: any, already: any) {
    if (item.isAtLoc(char.loc, world.PARSER))
        return true;
    if (item.loc) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const holder = w[item.loc];
        if (already && holder === (game as any).player)
            return falsemsg(prefix(item, isMultiple) + lang.already_have, { char: holder, item: item });
        if (holder.npc || holder.player)
            return falsemsg(prefix(item, isMultiple) + lang.char_has_it, { holder: holder, item: item });
    }
    if (item.scopeStatus === world.REACHABLE || item.multiLoc)
        return true;
    return falsemsg(prefix(item, isMultiple) + lang.not_here, { char: char, item: item });
};
// Used by take to note if player already holding
(cmdRules as any).isHereNotHeldAlready = function (cmd: any, char: any, item: any, isMultiple: any) {
    return (cmdRules as any).isHereNotHeld(cmd, char, item, isMultiple, true);
};
(cmdRules as any).canManipulate = function (cmd: any, char: any, item: any) {
    if (!char.canManipulate(item, cmd.name))
        return false;
    return true;
};
(cmdRules as any).canTalkTo = function (cmd: any, char: any, item: any) {
    if (!char.canTalk(item))
        return false;
    if (!item.npc)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'isMultiple'.
        return falsemsg(prefix(item, isMultiple) + lang.not_able_to_hear, { char: char, item: item });
    return true;
};
(cmdRules as any).canPosture = function (cmd: any, char: any, item: any) {
    if (!char.canPosture(cmd.name))
        return false;
    return true;
};
