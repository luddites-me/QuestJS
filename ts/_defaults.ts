"use strict";
// Should all be language neutral
const DEFAULT_OBJECT = {
    pronouns: lang.pronouns.thirdperson,
    isAtLoc: function (loc: any, situation: any) {
        if (typeof loc !== "string")
            loc = loc.name;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[loc])
            errormsg("The location name `" + loc + "`, does not match anything in the game.");
        if ((this as any).complexIsAtLoc) {
            if (!(this as any).complexIsAtLoc(loc, situation))
                return false;
        }
        else {
            if ((this as any).loc !== loc)
                return false;
        }
        if (situation === undefined)
            return true;
        if (situation === world.LOOK && (this as any).scenery)
            return false;
        if (situation === world.SIDE_PANE && (this as any).scenery)
            return false;
        return true;
    },
    isHere: function () {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        return this.isAtLoc((game as any).player.loc);
    },
    isHeld: function () {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        return this.isAtLoc((game as any).player.name);
    },
    isHereOrHeld: function () {
        return this.isHere() || this.isHeld();
    },
    countAtLoc: function (loc: any) {
        if (typeof loc !== "string")
            loc = loc.name;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        return this.isAtLoc(loc) ? 1 : 0;
    },
    scopeSnapshot: function (visible: any) {
        if ((this as any).scopeStatus)
            return; // already done this one
        (this as any).scopeStatus = visible ? world.VISIBLE : world.REACHABLE; // set the value
        if (!(this as any).getContents && !(this as any).componentHolder)
            return; // no lower levels so done
        let l;
        if ((this as any).getContents) {
            // this is a container, so get the contents
            if (!this.canSeeThrough() && !(this as any).scopeStatusForRoom && this !== (game as any).player) {
                // cannot see or reach contents
                return;
            }
            if (!this.canReachThrough() && (this as any).scopeStatusForRoom !== world.REACHABLE && this !== (game as any).player) {
                // can see but not reach contents
                visible = true;
            }
            l = (this as any).getContents(world.SCOPING);
        }
        else {
            // this has components, so get them
            l = [];
            for (let key in w) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (w[key].loc === (this as any).name)
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    l.push(w[key]);
            }
        }
        for (let el of l) {
            // go through them
            el.scopeSnapshot(visible);
        }
    },
    canReachThrough: () => false,
    canSeeThrough: () => false,
    itemTaken: NULL_FUNC,
    itemDropped: NULL_FUNC,
    canTalkPlayer: () => false,
    getExits: function () { return []; },
    hasExit: (dir: any) => false,
    getWorn: () => false,
    moveToFrom: function (toLoc: any, fromLoc: any) {
        if (fromLoc === undefined)
            fromLoc = (this as any).loc;
        if (fromLoc === toLoc)
            return;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[fromLoc])
            errormsg("The location name `" + fromLoc + "`, does not match anything in the game.");
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[toLoc])
            errormsg("The location name `" + toLoc + "`, does not match anything in the game.");
        (this as any).loc = toLoc;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[fromLoc].itemTaken(this);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[toLoc].itemDropped(this);
        if ((this as any).onMove !== undefined)
            (this as any).onMove(toLoc, fromLoc);
    },
    postLoad: NULL_FUNC,
    templatePostLoad: function () {
        this.postLoad();
    },
    preSave: NULL_FUNC,
    templatePreSave: function () {
        this.preSave();
    },
    getSaveString: function () {
        this.templatePreSave();
        let s = "Object=";
        for (let key in this) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (typeof this[key] !== "function") {
                if (key !== "name" && key !== "gameState") {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    s += saveLoad.encode(key, this[key]);
                }
            }
        }
        return s;
    },
    eventActive: false,
    eventCountdown: 0,
    eventIsActive: function () { return this.eventActive; },
    doEvent: function (turn: any) {
        //console.log("this=" + this.name);
        // Not active, so stop
        if (!this.eventIsActive())
            return;
        // Countdown running, so stop
        if (this.eventCountdown > 1) {
            this.eventCountdown--;
            return;
        }
        // If there is a condition and it is not met, stop
        //console.log("this=" + this.name);
        if ((this as any).eventCondition && !(this as any).eventCondition(turn))
            return;
        //console.log("this=" + this.name);
        (this as any).eventScript(turn);
        if (typeof (this as any).eventPeriod === "number") {
            this.eventCountdown = (this as any).eventPeriod;
        }
        else {
            this.eventActive = false;
        }
    },
};
const DEFAULT_ROOM = {
    room: true,
    beforeEnter: NULL_FUNC,
    beforeFirstEnter: NULL_FUNC,
    afterEnter: NULL_FUNC,
    afterEnterIf: {},
    afterEnterIfFlags: '',
    afterFirstEnter: NULL_FUNC,
    onExit: NULL_FUNC,
    visited: 0,
    lightSource: () => world.LIGHT_FULL,
    description: function () {
        if ((game as any).dark) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            printOrRun((game as any).player, this, "darkDesc");
            return true;
        }
        for (let line of settings.roomTemplate) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(line);
        }
        return true;
    },
    examine: function () {
        if ((game as any).dark) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            printOrRun((game as any).player, this, "darkDesc");
            return true;
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(typeof (this as any).desc === 'string' ? (this as any).desc : (this as any).desc());
        return true;
    },
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    darkDescription: () => msg("It is dark."),
    getContents: (util as any).getContents,
    getExits: function (options: any) {
        const list = [];
        for (let exit of lang.exit_list) {
            if (this.hasExit(exit.name, options)) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                list.push(this[exit.name]);
            }
        }
        return list;
    },
    // returns null if there are no exits
    getRandomExit: function (options: any) { return (random as any).fromArray(this.getExits(options)); },
    hasExit: function (dir: any, options: any) {
        //console.log(this.name)
        //console.log(dir)
        if (options === undefined)
            options = {};
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!this[dir])
            return false;
        //console.log(this[dir])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (options.excludeLocked && this[dir].isLocked())
            return false;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (options.excludeScenery && this[dir].scenery)
            return false;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return !this[dir].isHidden();
    },
    findExit: function (dest: any, options: any) {
        if (typeof dest === "object")
            dest = dest.name;
        for (let exit of lang.exit_list) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (this.hasExit(exit.name, options) && this[exit.name].name === dest) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                return this[exit.name];
            }
        }
        return null;
    },
    // Lock or unlock the exit indicated
    // Returns false if the exit does not exist or is not an Exit object
    // Returns true if successful
    setExitLock: function (dir: any, locked: any) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!this[dir]) {
            return false;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const ex = this[dir];
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        this[dir].locked = locked;
        return true;
    },
    // Hide or unhide the exit indicated
    // Returns false if the exit does not exist or is not an Exit object
    // Returns true if successful
    setExitHide: function (dir: any, hidden: any) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!this[dir]) {
            return false;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        this[dir].hidden = hidden;
        return true;
    },
    templatePreSave: function () {
        /*for (let i = 0; i < lang.exit_list.length; i++) {
          const dir = lang.exit_list[i].name;
          if (this[dir] !== undefined) {
            this["customSaveExit" + dir] = (this[dir].locked ? "locked" : "");
            this["customSaveExit" + dir] += "/" + (this[dir].hidden ? "hidden" : "");
            if (this.saveExitDests) this["customSaveExitDest" + dir] = this[dir].name;
          }
        }*/
        (this as any).preSave();
    },
    templatePostLoad: function () {
        for (let exit of lang.exit_list) {
            const dir = exit.name;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (this["customSaveExit" + dir]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                this[dir].locked = /locked/.test(this["customSaveExit" + dir]);
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                this[dir].hidden = /hidden/.test(this["customSaveExit" + dir]);
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                delete this["customSaveExit" + dir];
                if ((this as any).saveExitDests) {
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    this[dir].name = this["customSaveExitDest" + dir];
                    //console.log("Just set " + dir + " in " + this.name + " to " + this["customSaveExitDest" + dir])
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    delete this["customSaveExitDest" + dir];
                }
            }
        }
        (this as any).postLoad();
    },
    // @ts-expect-error ts-migrate(7023) FIXME: 'getReverseExit' implicitly has return type 'any' ... Remove this comment to see the full error message
    getReverseExit: function (dir: any) {
        const reverseDir = lang.exit_list.find(el => el.name === dir);
        // @ts-expect-error ts-migrate(7022) FIXME: 'dest' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        const dest = this[dir];
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'undefined' cannot be used as an index type.
        return dest[reverseDir];
    },
};
const DEFAULT_ITEM = {
    lightSource: () => world.LIGHT_NONE,
    icon: () => "",
    testKeys: (char: any, toLock: any) => false,
    getVerbs: function () {
        const verbList: any = [];
        //console.log('verbs for ' + this.name)
        //console.log('count ' + this.verbFunctions.length)
        //console.log(verbList)
        for (let f of (this as any).verbFunctions)
            f(this, verbList);
        //console.log(verbList)
        if (!(this as any).isAtLoc((game as any).player.name)) {
            if ((this as any).hereVerbs) {
                for (let s of (this as any).hereVerbs)
                    verbList.push(s);
            }
        }
        else if ((this as any).getWorn()) {
            if ((this as any).wornVerbs) {
                for (let s of (this as any).wornVerbs)
                    verbList.push(s);
            }
        }
        else {
            if ((this as any).heldVerbs) {
                for (let s of (this as any).heldVerbs)
                    verbList.push(s);
            }
        }
        if ((this as any).verbFunction)
            (this as any).verbFunction(verbList);
        return verbList;
    },
};
