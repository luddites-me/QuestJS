"use strict";
// Should all be language neutral
const TAKEABLE_DICTIONARY = {
    onCreation: function (o: any) {
        //console.log('takeable: ' + o.name)
        o.verbFunctions.push(function (o: any, verbList: any) {
            verbList.push(o.isAtLoc((game as any).player.name) ? lang.verbs.drop : lang.verbs.take);
        });
        //console.log(o.verbFunctions.length)
    },
    takeable: true,
    drop: function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.drop_successful, tpParams);
        (this as any).moveToFrom(char.loc, char.name);
        return true;
    },
    take: function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        if ((this as any).isAtLoc(char.name)) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.already_have, tpParams);
            return false;
        }
        if (!char.canManipulate(this, "take"))
            return false;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.take_successful, tpParams);
        (this as any).moveToFrom(char.name, this.takeFromLoc(char));
        if ((this as any).scenery)
            delete (this as any).scenery;
        return true;
    },
    // This returns the location from which the item is to be taken
    // (and does not do taking from a location).
    // This can be useful for weird objects, such as ropes
    takeFromLoc: function (char: any) { return (this as any).loc; }
};
const TAKEABLE = () => TAKEABLE_DICTIONARY;
const SHIFTABLE = function () {
    const res = {
        shiftable: true,
    };
    return res;
};
const createEnsemble = function (name: any, members: any, dict: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
    const res = createItem(name, dict);
    (res as any).ensemble = true;
    (res as any).members = members;
    (res as any).parsePriority = 10;
    (res as any).inventorySkip = true;
    (res as any).takeable = true;
    (res as any).getWorn = function (situation: any) { return (this as any).isAtLoc((this as any).members[0].loc, situation) && (this as any).members[0].getWorn(); };
    (res as any).nameModifierFunctions = [function (o: any, list: any) {
            if (o.members[0].getWorn() && o.isAllTogether() && o.members[0].isAtLoc((game as any).player.name))
                list.push(lang.invModifiers.worn);
        }];
    // Tests if all parts are n the same location and either all are worn or none are worn
    // We can use this to determine if the set is together or not too
    (res as any).isAtLoc = function (loc: any, situation: any) {
        if (situation !== world.PARSER && situation !== world.SCOPING)
            return false;
        const worn = (this as any).members[0].getWorn();
        for (let member of (this as any).members) {
            if (member.loc !== loc)
                return false;
            if (member.getWorn() !== worn)
                return false;
        }
        return true;
    };
    // Tests if all parts are together
    (res as any).isAllTogether = function () {
        const worn = (this as any).members[0].getWorn();
        const loc = (this as any).members[0].loc;
        for (let member of (this as any).members) {
            if (member.loc !== loc)
                return false;
            if (member.breakEnsemble && member.breakEnsemble())
                return false;
            if (member.getWorn() !== worn)
                return false;
        }
        return true;
    };
    (res as any).drop = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.drop_successful, tpParams);
        for (let member of (this as any).members) {
            member.moveToFrom(char.loc);
        }
        return true;
    };
    (res as any).take = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        if ((this as any).isAtLoc(char.name)) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.already_have, tpParams);
            return false;
        }
        if (!char.canManipulate(this, "take"))
            return false;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.take_successful, tpParams);
        for (let member of (this as any).members) {
            member.moveToFrom(char.name);
            if (member.scenery)
                delete member.scenery;
        }
        return true;
    };
    for (let member of members) {
        member.ensembleMaster = res;
    }
    return res;
};
const MERCH = function (value: any, locs: any) {
    const res = {
        price: value,
        getPrice: function () { return this.price; },
        // The price when the player sells the item
        // By default, half the "list" price
        // 
        getSellingPrice: function (char: any) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[char.loc].buyingValue) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                return Math.round(this.getPrice() * (w[char.loc].buyingValue) / 100);
            }
            return Math.round(this.getPrice() / 2);
        },
        // The price when the player buys the item
        // Uses the sellingDiscount, as te shop is selling it!
        getBuyingPrice: function (char: any) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (w[char.loc].sellingDiscount) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                return Math.round(this.getPrice() * (100 - w[char.loc].sellingDiscount) / 100);
            }
            return this.getPrice();
        },
        isAtLoc: function (loc: any, situation: any) {
            if ((situation === world.PARSER || situation === world.SCOPING) && this.isForSale(loc))
                return true;
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
        isForSale: function (loc: any) {
            if ((this as any).loc)
                return false; // if a location is set, the item is already sold
            if ((this as any).doNotClone)
                return ((this as any).salesLoc === loc);
            return ((this as any).salesLocs.includes(loc));
        },
        canBeSoldHere: function (loc: any) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return w[loc].willBuy && w[loc].willBuy(this);
        },
        purchase: function (isMultiple: any, char: any) {
            const tpParams = { char: char, item: this };
            if (!this.isForSale(char.loc)) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                if ((this as any).doNotClone && this.isAtLoc(char.name)) {
                    return failedmsg(lang.cannot_purchase_again, tpParams);
                }
                else {
                    return failedmsg(lang.cannot_purchase_here, tpParams);
                }
            }
            const cost = this.getBuyingPrice(char);
            (tpParams as any).money = cost;
            if (char.money < cost)
                return failedmsg(prefix(this, isMultiple) + lang.cannot_afford, tpParams);
            this.purchaseScript(isMultiple, char, cost, tpParams);
        },
        purchaseScript: function (isMultiple: any, char: any, cost: any, tpParams: any) {
            char.money -= cost;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.purchase_successful, tpParams);
            if ((this as any).doNotClone) {
                (this as any).moveToFrom(char.name, char.loc);
                delete (this as any).salesLoc;
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                cloneObject(this, char.name);
            }
            return world.SUCCESS;
        },
        sell: function (isMultiple: any, char: any) {
            const tpParams = { char: char, item: this };
            if (!this.canBeSoldHere(char.loc)) {
                return failedmsg(prefix(this, isMultiple) + lang.cannot_sell_here, tpParams);
            }
            const cost = this.getSellingPrice(char);
            (tpParams as any).money = cost;
            char.money += cost;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.sell_successful, tpParams);
            if ((this as any).doNotClone) {
                (this as any).moveToFrom(char.loc, char.name);
                (this as any).salesLoc = char.loc;
            }
            delete (this as any).loc;
            return world.SUCCESS;
        },
    };
    if (!Array.isArray(locs)) {
        (res as any).doNotClone = true;
        (res as any).salesLoc = locs;
    }
    else {
        (res as any).salesLocs = locs;
    }
    return res;
};
// countableLocs should be a dictionary, with the room name as the key, and the number there as the value
const COUNTABLE = function (countableLocs: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, TAKEABLE_DICTIONARY);
    res.countable = true;
    res.countableLocs = countableLocs;
    res.multiLoc = true;
    res.extractNumber = function () {
        const md = /^(\d+)/.exec(this.cmdMatch);
        if (!md) {
            return false;
        }
        return parseInt(md[1]);
    };
    res.templatePreSave = function () {
        const l = [];
        for (let key in this.countableLocs) {
            l.push(key + "=" + this.countableLocs[key]);
        }
        this.customSaveCountableLocs = l.join(",");
        this.preSave();
    };
    res.templatePostLoad = function () {
        const l = this.customSaveCountableLocs.split(",");
        this.countableLocs = {};
        for (let el of l) {
            const parts = el.split("=");
            this.countableLocs[parts[0]] = parseInt(parts[1]);
        }
        delete this.customSaveCountableLocs;
        this.postLoad();
    };
    res.getListAlias = function (loc: any) {
        return sentenceCase(this.pluralAlias ? this.pluralAlias : this.listalias + "s") + " (" + this.countAtLoc(loc) + ")";
    };
    res.isAtLoc = function (loc: any, situation: any) {
        if (!this.countableLocs[loc]) {
            return false;
        }
        if (situation === world.LOOK && this.scenery)
            return false;
        if (situation === world.SIDE_PANE && this.scenery)
            return false;
        return (this.countableLocs[loc] > 0);
    };
    res.countAtLoc = function (loc: any) {
        if (!this.countableLocs[loc]) {
            return 0;
        }
        return this.countableLocs[loc];
    };
    res.moveToFrom = function (toLoc: any, fromLoc: any, count: any) {
        if (!count)
            count = this.extractNumber();
        if (!count)
            count = this.countAtLoc(fromLoc);
        this.takeFrom(fromLoc, count);
        this.giveTo(toLoc, count);
    };
    res.takeFrom = function (loc: any, count: any) {
        if (this.countableLocs[loc] !== INFINITY)
            this.countableLocs[loc] -= count;
        if (this.countableLocs[loc] <= 0) {
            delete this.countableLocs[loc];
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[loc].itemTaken(this, count);
    };
    res.giveTo = function (loc: any, count: any) {
        if (!this.countableLocs[loc]) {
            this.countableLocs[loc] = 0;
        }
        if (this.countableLocs[loc] !== INFINITY)
            this.countableLocs[loc] += count;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[loc].itemDropped(this, count);
    };
    res.findSource = function (sourceLoc: any, tryContainers: any) {
        // some at the specific location, so use them
        if (this.isAtLoc(sourceLoc)) {
            return sourceLoc;
        }
        if (tryContainers) {
            const containers = scopeReachable().filter(el => el.container);
            for (let container of containers) {
                if (container.closed)
                    continue;
                if (this.isAtLoc(container.name))
                    return container.name;
            }
        }
        return false;
    };
    // As this is flagged as multiLoc, need to take special care about where the thing is
    res.take = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        const sourceLoc = this.findSource(char.loc, true);
        if (!sourceLoc) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.none_here, tpParams);
            return false;
        }
        let n = this.extractNumber();
        let m = this.countAtLoc(sourceLoc);
        if (!n) {
            n = m;
        } // no number specified
        if (n > m) {
            n = m;
        } // too big number specified
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        tpParams[this.name + '_count'] = n;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.take_successful, tpParams);
        this.takeFrom(sourceLoc, n);
        this.giveTo(char.name, n);
        if (this.scenery)
            delete this.scenery;
        return true;
    };
    res.drop = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        let n = this.extractNumber();
        let m = this.countAtLoc(char.name);
        if (m === 0) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.none_held, tpParams);
            return false;
        }
        if (!n) {
            m === INFINITY ? 1 : n = m;
        } // no number specified
        if (n > m) {
            n = m;
        } // too big number specified
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        tpParams[this.name + '_count'] = n;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.drop_successful, tpParams);
        this.takeFrom(char.name, n);
        this.giveTo(char.loc, n);
        return true;
    };
    return res;
};
const WEARABLE = function (wear_layer: any, slots: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, TAKEABLE_DICTIONARY);
    res.wearable = true;
    res.armour = 0;
    res.wear_layer = wear_layer ? wear_layer : false;
    res.slots = slots && wear_layer ? slots : [];
    res.useDefaultsTo = function (char: any) {
        return char === (game as any).player ? 'Wear' : 'NpcWear';
    };
    res.getSlots = function () { return this.slots; };
    res.getWorn = function () { return this.worn; };
    res.getArmour = function () { return this.armour; };
    res.onCreation = function (o: any) {
        //console.log('wearable: ' + o.name)
        o.verbFunctions.push(function (o: any, verbList: any) {
            if (!o.isAtLoc((game as any).player.name)) {
                verbList.push(lang.verbs.take);
            }
            else if (o.getWorn()) {
                if (!o.getWearRemoveBlocker((game as any).player, false))
                    verbList.push(lang.verbs.remove);
            }
            else {
                verbList.push(lang.verbs.drop);
                if (!o.getWearRemoveBlocker((game as any).player, true))
                    verbList.push(lang.verbs.wear);
            }
        });
        //console.log(o.verbFunctions.length)
        o.nameModifierFunctions.push(function (o: any, list: any) {
            if (o.worn && o.isAtLoc((game as any).player.name))
                list.push(lang.invModifiers.worn);
        });
    };
    res.icon = () => 'garment12';
    res.getWearRemoveBlocker = function (char: any, toWear: any) {
        if (!this.wear_layer) {
            return false;
        }
        const slots = this.getSlots();
        for (let slot of slots) {
            let outer = char.getOuterWearable(slot);
            if (outer && outer !== this && (outer.wear_layer >= this.wear_layer || outer.wear_layer === 0)) {
                return outer;
            }
        }
        return false;
    };
    res.canWearRemove = function (char: any, toWear: any) {
        const outer = this.getWearRemoveBlocker(char, toWear);
        if (outer) {
            const tpParams = { char: char, garment: this, outer: outer };
            if (toWear) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(lang.cannot_wear_over, tpParams);
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(lang.cannot_remove_under, tpParams);
            }
            return false;
        }
        return true;
    };
    // Assumes the item is already held  
    res.wear = function (isMultiple: any, char: any) {
        if (!this.canWearRemove(char, true)) {
            return false;
        }
        if (!char.canManipulate(this, "wear")) {
            return false;
        }
        if (this.wearMsg) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + this.wearMsg(char, this), { garment: this, actor: char });
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.wear_successful, { garment: this, char: char });
        }
        this.worn = true;
        if (this.onWear)
            this.onWear(char);
        return true;
    };
    // Assumes the item is already held  
    res.remove = function (isMultiple: any, char: any) {
        if (!this.canWearRemove(char, false)) {
            return false;
        }
        if (!char.canManipulate(this, "remove")) {
            return false;
        }
        if (this.removeMsg) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + this.removeMsg(char, this), { garment: this, actor: char });
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.remove_successful, { garment: this, char: char });
        }
        this.worn = false;
        if (this.onRemove)
            this.onRemove(char);
        return true;
    };
    return res;
};
const OPENABLE_DICTIONARY = {
    open: function (isMultiple: any, char: any) {
        const tpParams = { char: char, container: this };
        if (!(this as any).openable) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.cannot_open, { item: this });
            return false;
        }
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'closed' does not exist on type '{ open: ... Remove this comment to see the full error message
        else if (!this.closed) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.already, { item: this });
            return false;
        }
        if ((this as any).locked) {
            if ((this as any).testKeys(char)) {
                (this as any).locked = false;
                // @ts-expect-error ts-migrate(2551) FIXME: Property 'closed' does not exist on type '{ open: ... Remove this comment to see the full error message
                this.closed = false;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(prefix(this, isMultiple) + lang.unlock_successful, tpParams);
                (this as any).openMsg(isMultiple, tpParams);
                return true;
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(prefix(this, isMultiple) + lang.locked, tpParams);
                return false;
            }
        }
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'closed' does not exist on type '{ open: ... Remove this comment to see the full error message
        this.closed = false;
        (this as any).openMsg(isMultiple, tpParams);
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'onOpen' does not exist on type '{ open: ... Remove this comment to see the full error message
        if (this.onOpen)
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'onOpen' does not exist on type '{ open: ... Remove this comment to see the full error message
            this.onOpen(char);
        return true;
    },
    close: function (isMultiple: any, char: any) {
        const tpParams = { char: char, container: this };
        if (!(this as any).openable) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.cannot_close, { item: this });
            return false;
        }
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'closed' does not exist on type '{ open: ... Remove this comment to see the full error message
        else if (this.closed) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.already, { item: this });
            return false;
        }
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'closed' does not exist on type '{ open: ... Remove this comment to see the full error message
        this.closed = true;
        this.closeMsg(isMultiple, tpParams);
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'onClose' does not exist on type '{ open:... Remove this comment to see the full error message
        if (this.onClose)
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'onClose' does not exist on type '{ open:... Remove this comment to see the full error message
            this.onClose(char);
        return true;
    },
    closeMsg: function (isMultiple: any, tpParams: any) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.close_successful, tpParams);
    },
};
const CONTAINER = function (openable: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, OPENABLE_DICTIONARY);
    res.container = true;
    res.closed = openable;
    res.openable = openable;
    res.contentsType = "container";
    res.getContents = (util as any).getContents;
    res.testForRecursion = (util as any).testForRecursion;
    res.listContents = (util as any).listContents;
    res.transparent = false;
    res.onCreation = function (o: any) {
        //console.log('container: ' + o.name)
        o.verbFunctions.push(function (o: any, verbList: any) {
            if (o.openable) {
                verbList.push(o.closed ? lang.verbs.open : lang.verbs.close);
            }
        });
        //console.log(o.verbFunctions.length)
        o.nameModifierFunctions.push((util as any).nameModifierFunctionForContainer);
        //console.log(o.nameModifierFunctions)
    },
        res.lookinside = function (isMultiple: any, char: any) {
            const tpParams = { char: char, container: this };
            if (this.closed && !this.transparent) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(prefix(this, isMultiple) + lang.nothing_inside, { char: char });
                return false;
            }
            //tpParams.list = formatList(this.getContents(world.LOOK), {article:INDEFINITE, lastJoiner:lang.list_and, nothing:lang.list_nothing})
            (tpParams as any).list = this.listContents(world.LOOK, true);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.look_inside, tpParams);
            return true;
        };
    res.openMsg = function (isMultiple: any, tpParams: any) {
        tpParams.list = this.listContents(world.LOOK);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.open_successful + " " + (tpParams.list === lang.list_nothing ? lang.it_is_empty : lang.look_inside), tpParams);
    };
    res.icon = function () {
        return this.closed ? 'closed12' : 'opened12';
    };
    res.canReachThrough = function () { return !this.closed; };
    res.canSeeThrough = function () { return !this.closed || this.transparent; };
    return res;
};
const SURFACE = function () {
    const res = {};
    (res as any).container = true;
    (res as any).getContents = (util as any).getContents;
    (res as any).testForRecursion = (util as any).testForRecursion;
    (res as any).listContents = (util as any).listContents;
    (res as any).onCreation = function (o: any) { o.nameModifierFunctions.push((util as any).nameModifierFunctionForContainer); };
    (res as any).closed = false;
    (res as any).openable = false;
    (res as any).contentsType = "surface",
        (res as any).canReachThrough = () => true;
    (res as any).canSeeThrough = () => true;
    return res;
};
const OPENABLE = function (alreadyOpen: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, OPENABLE_DICTIONARY);
    res.closed = !alreadyOpen;
    res.openable = true;
    res.onCreation = function (o: any) {
        //console.log('openable: ' + o.name)
        o.verbFunctions.push(function (o: any, verbList: any) {
            verbList.push(o.closed ? lang.verbs.open : lang.verbs.close);
        });
        o.nameModifierFunctions.push(function (o: any, list: any) {
            if (!o.closed)
                list.push(lang.invModifiers.open);
        });
    };
    res.openMsg = function (isMultiple: any, tpParams: any) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.open_successful, tpParams);
    };
    return res;
};
const LOCKED_WITH = function (keyNames: any) {
    if (typeof keyNames === "string") {
        keyNames = [keyNames];
    }
    if (keyNames === undefined) {
        keyNames = [];
    }
    const res = {
        keyNames: keyNames,
        locked: true,
        lock: function (isMultiple: any, char: any) {
            const tpParams = { char: char, container: this };
            if (this.locked)
                return falsemsg(lang.already, tpParams);
            if (!this.testKeys(char, true))
                return falsemsg(lang.no_key, tpParams);
            if (!(this as any).closed) {
                (this as any).closed = true;
                this.locked = true;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(lang.close_and_lock_successful, tpParams);
            }
            else {
                this.locked = true;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(lang.lock_successful, tpParams);
            }
            return true;
        },
        unlock: function (isMultiple: any, char: any) {
            const tpParams = { char: char, container: this };
            if (!this.locked)
                return falsemsg(lang.already, { item: this });
            if (!this.testKeys(char, false))
                return falsemsg(lang.no_key, tpParams);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(lang.unlock_successful, tpParams);
            this.locked = false;
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'onUnlock' does not exist on type '{ keyN... Remove this comment to see the full error message
            if (this.onUnlock)
                // @ts-expect-error ts-migrate(2551) FIXME: Property 'onUnlock' does not exist on type '{ keyN... Remove this comment to see the full error message
                this.onUnlock(char);
            return true;
        },
        testKeys: function (char: any, toLock: any) {
            for (let s of keyNames) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (!w[s]) {
                    errormsg("The key name for this container, `" + s + "`, does not match any key in the game.");
                    return false;
                }
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (w[s].isAtLoc(char.name)) {
                    return true;
                }
            }
            return false;
        }
    };
    return res;
};
const LOCKED_DOOR = function (key: any, loc1: any, loc2: any, name1: any, name2: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, OPENABLE(false), LOCKED_WITH(key));
    res.loc1 = loc1;
    res.loc2 = loc2;
    res.name1 = name1;
    res.name2 = name2;
    res.scenery = true;
    res._setup = function () {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const room1 = w[this.loc1];
        if (!room1)
            return errormsg("Bad location name '" + this.loc1 + "' for door " + this.name);
        const exit1 = room1.findExit(this.loc2);
        if (!exit1)
            return errormsg("No exit to '" + this.loc2 + "' for door " + this.name);
        this.dir1 = exit1.dir;
        if (!room1[this.dir1])
            return errormsg("Bad exit '" + this.dir1 + "' in location '" + room1.name + "' for door: " + this.name + " (possibly because the room is defined after the door?)");
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const room2 = w[this.loc2];
        if (!room2)
            return errormsg("Bad location name '" + this.loc2 + "' for door " + this.name);
        const exit2 = room2.findExit(this.loc1);
        if (!exit2)
            return errormsg("No exit to '" + this.loc1 + "' for door " + this.name);
        this.dir2 = exit2.dir;
        if (!room2[this.dir2])
            return errormsg("Bad exit '" + this.dir2 + "' in location '" + room2.name + "' for door: " + this.name + " (possibly because the room is defined after the door?)");
        room1[this.dir1].use = (util as any).useWithDoor;
        room1[this.dir1].door = this.name;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        room1[this.dir1].doorName = this.name1 || 'door to ' + lang.getName(w[this.loc2], { article: DEFINITE });
        room2[this.dir2].use = (util as any).useWithDoor;
        room2[this.dir2].door = this.name;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        room2[this.dir2].doorName = this.name2 || 'door to ' + lang.getName(w[this.loc1], { article: DEFINITE });
    };
    res.isAtLoc = function (loc: any, situation: any) {
        if (typeof loc !== "string")
            loc = loc.name;
        if (situation !== world.PARSER && this.scenery)
            return false;
        return (loc == this.loc1 || loc == this.loc2);
    };
    res.icon = () => 'door12';
    return res;
};
const KEY = function () {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, TAKEABLE_DICTIONARY);
    res.key = true;
    res.icon = () => 'key12';
    return res;
};
const READABLE = function (mustBeHeld: any) {
    const res = {};
    (res as any).readable = true;
    (res as any).mustBeHeld = mustBeHeld;
    (res as any).icon = () => 'readable12';
    (res as any).onCreation = function (o: any) {
        o.verbFunctions.push(function (o: any, verbList: any) {
            if (o.loc === (game as any).player.name || !o.mustBeHeld)
                verbList.push(lang.verbs.read);
        });
    };
    return res;
};
const FURNITURE = function (options: any) {
    const res = {
        testForPosture: (char: any, posture: any) => true,
        getoff: function (isMultiple: any, char: any) {
            if (!char.posture) {
                char.msg(lang.already, { item: char });
                return false;
            }
            if (char.posture) {
                char.msg(lang.stop_posture(char)); // stop_posture handles details
                return true;
            }
        },
    };
    (res as any).useDefaultsTo = function (char: any) {
        const cmd = (this as any).useCmd ? (this as any).useCmd : ((this as any).reclineon ? 'ReclineOn' : ((this as any).siton ? 'SitOn' : 'StandOn'));
        return char === (game as any).player ? cmd : 'Npc' + cmd;
    };
    (res as any).onCreation = function (o: any) {
        o.verbFunctions.push(function (o: any, verbList: any) {
            if ((game as any).player.posture && (game as any).player.postureFurniture === o.name) {
                verbList.push(lang.verbs.getOff);
                return;
            }
            if ((game as any).player.posture)
                return;
            if (o.siton)
                verbList.push(lang.verbs.sitOn);
            if (o.standon)
                verbList.push(lang.verbs.standOn);
            if (o.reclineon)
                verbList.push(lang.verbs.reclineOn);
        });
    };
    (res as any).assumePosture = function (isMultiple: any, char: any, posture: any, name: any, adverb: any) {
        const tpParams = { char: char, item: this };
        if (char.posture === posture && char.postureFurniture === (this as any).name) {
            char.msg(lang.already, { item: char });
            return false;
        }
        if (!this.testForPosture(char, posture)) {
            return false;
        }
        if (char.posture && char.postureFurniture !== (this as any).name) {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'stop_posture'.
            char.msg(stop_posture(char));
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            char.msg(lang[name + '_on_successful'], tpParams);
        }
        else if (char.posture && this[char.posture + "_to_" + posture] && (this as any).postureChangesImplemented) {
            char.msg(this[char.posture + "_to_" + posture], { actor: char, item: this });
        }
        else {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            char.msg(lang[name + '_on_successful'], tpParams);
        }
        char.posture = posture;
        char.postureFurniture = (this as any).name;
        char.postureAdverb = adverb === undefined ? 'on' : adverb;
        const eventName = 'on' + sentenceCase(name);
        if (typeof this[eventName] === "function")
            this[eventName](char);
        return true;
    };
    if (options.sit) {
        (res as any).siton = function (isMultiple: any, char: any) {
            return (this as any).assumePosture(isMultiple, char, "sitting", 'sit');
        };
    }
    if (options.stand) {
        (res as any).standon = function (isMultiple: any, char: any) {
            return (this as any).assumePosture(isMultiple, char, "standing", 'stand');
        };
    }
    if (options.recline) {
        (res as any).reclineon = function (isMultiple: any, char: any) {
            return (this as any).assumePosture(isMultiple, char, "reclining", 'recline');
        };
    }
    if (options.useCmd) {
        (res as any).useCmd = options.useCmd;
    }
    (res as any).icon = () => 'furniture12';
    return res;
};
const SWITCHABLE = function (alreadyOn: any, nameModifier: any) {
    const res = {};
    (res as any).switchedon = alreadyOn;
    (res as any).nameModifier = nameModifier;
    (res as any).onCreation = function (o: any) {
        o.verbFunctions.push(function (o: any, verbList: any) {
            if (!o.mustBeHeldToOperate || o.isAtLoc((game as any).player)) {
                verbList.push(o.switchedon ? lang.verbs.switchoff : lang.verbs.switchon);
            }
        });
        o.nameModifierFunctions.push(function (o: any, list: any) {
            if (o.nameModifier && o.switchedon)
                list.push(o.nameModifier);
        });
    };
    (res as any).switchon = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        if ((this as any).switchedon) {
            char.msg(prefix(this, isMultiple) + lang.already, { item: this });
            return false;
        }
        if (!(this as any).checkCanSwitchOn()) {
            return false;
        }
        char.msg(lang.turn_on_successful, tpParams);
        (this as any).doSwitchon();
        return true;
    };
    (res as any).doSwitchon = function () {
        let lighting = (game as any).dark;
        (this as any).switchedon = true;
        (game as any).update();
        if (lighting !== (game as any).dark) {
            (game as any).room.description();
        }
        if ((this as any).onSwitchOn)
            (this as any).onSwitchOn();
    };
    (res as any).checkCanSwitchOn = () => true;
    (res as any).switchoff = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        if (!(this as any).switchedon) {
            char.msg(prefix(this, isMultiple) + lang.already, { item: this });
            return false;
        }
        char.msg(lang.turn_off_successful, tpParams);
        (this as any).doSwitchoff();
        return true;
    };
    (res as any).doSwitchoff = function () {
        let lighting = (game as any).dark;
        (this as any).switchedon = false;
        (game as any).update();
        if (lighting !== (game as any).dark) {
            (game as any).room.description();
        }
        if ((this as any).onSwitchOff)
            (this as any).onSwitchOff();
    };
    (res as any).icon = function () {
        return (this as any).switchedon ? 'turnedon12' : 'turnedoff12';
    };
    return res;
};
// Ideally Quest will check components when doing a command for the whole
// I think?
const COMPONENT = function (nameOfWhole: any) {
    const res = {
        scenery: true,
        component: true,
        loc: nameOfWhole,
        takeable: true,
        isAtLoc: function (loc: any, situation: any) {
            if (typeof loc !== "string")
                loc = loc.name;
            if (situation !== world.PARSER)
                return false;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            let cont = w[this.loc];
            if (cont.isAtLoc(loc)) {
                return true;
            }
            return cont.isAtLoc(loc);
        },
        take: function (isMultiple: any, char: any) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.cannot_take_component, { char: char, item: this, whole: w[this.loc] });
            return false;
        },
    };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (!w[nameOfWhole])
        debugmsg("Whole is not define: " + nameOfWhole);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    w[nameOfWhole].componentHolder = true;
    return res;
};
const EDIBLE = function (isLiquid: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, TAKEABLE_DICTIONARY);
    res.isLiquid = isLiquid;
    res.eat = function (isMultiple: any, char: any) {
        const tpParam = { char: char, item: this };
        if (this.isLiquid) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.cannot_eat, tpParam);
            return false;
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.eat_successful, tpParam);
        this.loc = null;
        if (this.onIngesting)
            this.onIngesting(char);
        return true;
    };
    res.drink = function (isMultiple: any, char: any) {
        const tpParam = { char: char, item: this };
        if (!this.isLiquid) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.cannot_drink, tpParam);
            return false;
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.drink_successful, tpParam);
        this.loc = null;
        if (this.onIngesting)
            this.onIngesting(char);
        return true;
    };
    res.ingest = function (isMultiple: any, char: any) {
        if (this.isLiquid) {
            return this.drink(isMultiple, char);
        }
        else {
            return this.eat(isMultiple, char);
        }
    };
    res.icon = () => 'edible12';
    res.onCreation = function (o: any) {
        //console.log('edible: ' + o.name)
        o.verbFunctions.push(function (o: any, verbList: any) {
            verbList.push(o.isAtLoc((game as any).player.name) ? lang.verbs.drop : lang.verbs.take);
            if (o.isAtLoc((game as any).player))
                verbList.push(o.isLiquid ? lang.verbs.drink : lang.verbs.eat);
        });
        //console.log(o.verbFunctions.length)
    };
    return res;
};
const VESSEL = function (capacity: any) {
    const res = {};
    (res as any).vessel = true;
    (res as any).containedLiquidName = false;
    (res as any).volumeContained = 0;
    (res as any).capacity = capacity;
    (res as any).onCreation = function (o: any) {
        if (o.volumeContained && o.volumeContained > 0) {
            if (o.volumeContained >= o.capacity) {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'list'.
                list.push("full of " + o.containedLiquidName);
            }
            else {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'list'.
                list.push(o.volumeContained + " " + VOLUME_UNITS + " " + o.containedLiquidName);
            }
        }
    };
    (res as any).fill = function (isMultiple: any, char: any, liquid: any) {
        const tpParams = { char: char, container: this };
        if ((this as any).testRestrictions && !(this as any).testRestrictions(liquid, char))
            return false;
        const source = liquid.source(char);
        if (!source)
            return falsemsg(lang.none_here, { char: char, item: liquid });
        if (!(this as any).mix && (this as any).containedLiquidName !== liquid.name && (this as any).volumeContained > 0)
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            return falsemsg((lang as any).cannot_mix(char, this));
        if ((this as any).volumeContained >= (this as any).capacity)
            return falsemsg(prefix(this, isMultiple) + lang.already, { item: this });
        let volumeAdded = (this as any).capacity - (this as any).volumeContained;
        // limited volume available?
        if (source.getVolume) {
            const volumeAvailable = source.getVoume(liquid);
            if (volumeAvailable < volumeAdded) {
                volumeAdded = volumeAvailable;
            }
        }
        if ((this as any).mix && liquid.name !== (this as any).containedLiquidName !== liquid.name) {
            (this as any).mix(liquid, volumeAdded);
        }
        else {
            (this as any).volumeContained += volumeAdded;
            // Slight concerned that JavaScript using floats for everything means you could have a vessel 99.99% full, but that
            // does not behave as a full vessel, so if the vessel is pretty much full set the volume contained to the capacity
            if ((this as any).volumeContained * 1.01 > (this as any).capacity)
                (this as any).volumeContained = (this as any).capacity;
            (this as any).containedLiquidName = liquid.name;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.fill_successful, tpParams);
        }
        return true;
    };
    (res as any).empty = function (isMultiple: any, char: any) {
        const tpParams = { char: char, container: this };
        if ((this as any).volumeContained >= (this as any).capacity) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(prefix(this, isMultiple) + lang.already, { item: this });
            return false;
        }
        // check if liquid available
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.empty_successful, tpParams);
        return true;
    };
    return res;
};
// If locs changes, that changes are not saved!!!
// A room or item can be a source of one liquid by giving it a "isSourceOf" function:
// room.isSourceOf("water")
// 
const LIQUID = function (locs: any) {
    const res = EDIBLE(true);
    res.liquid = true;
    res.pronouns = lang.pronouns.massnoun;
    res.pluralAlias = '*';
    res.drink = function (isMultiple: any, char: any, options: any) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(prefix(this, isMultiple) + "drink: " + options.verb + " char: " + char.name);
    };
    res.sourcedAtLoc = function (loc: any) {
        if (typeof loc !== "string")
            loc = loc.name;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return w[loc].isSourceOf(this.name);
    };
    res.source = function (chr: any) {
        if (chr === undefined)
            chr = (game as any).player;
        // Is character a source?
        if (chr.isSourceOf && chr.isSourceOf(this.name))
            return chr;
        // Is the room a source?
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (w[chr.loc].isSourceOf && w[chr.loc].isSourceOf(this.name))
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return w[chr.loc];
        const items = scopeHeldBy(chr).concat(scopeHeldBy(chr.loc));
        for (let obj of items) {
            if (obj.isSourceOf && obj.isSourceOf(this.name))
                return obj;
        }
        return false;
    };
    res.isAtLoc = function (loc: any) { return false; };
    return res;
};
const ROPE = function (tetheredTo: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({
        rope: true,
        tethered: (tetheredTo !== undefined),
        tiedTo1: tetheredTo,
        locs: [],
        attachVerb: lang.rope_attach_verb,
        attachedVerb: lang.rope_attached_verb,
        detachVerb: lang.rope_detach_verb,
        isAtLoc: function (loc: any, situation: any) {
            if (this.loc) {
                this.locs = [this.loc];
                delete this.loc;
            }
            if (typeof loc !== "string")
                loc = loc.name;
            // If the rope is in the location and held by the character, only want it to appear once in the side pane
            if (situation === world.SIDE_PANE && this.locs.includes((game as any).player.name) && loc !== (game as any).player.name)
                return false;
            return this.locs.includes(loc);
        },
        isAttachedTo: function (item: any) {
            return this.tiedTo1 === item.name || this.tiedTo2 === item.name;
        },
        getUnattached: function () {
            let res = this.tiedTo1 ? [this.tiedTo1] : [];
            if (this.tiedTo2)
                res.push(this.tiedTo2);
            return res;
        },
        examineAddendum: function () {
            // It is tied to the chair, and trails into the kitchen.
            // What is it tied to (and we can see)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const obj1 = (this.tiedTo1 && w[this.tiedTo1].isHere()) ? w[this.tiedTo1] : false;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const obj2 = (this.tiedTo2 && w[this.tiedTo2].isHere()) ? w[this.tiedTo2] : false;
            // Handle the easy cases, only one loc in locs
            if (this.locs.length === 1) {
                if (obj1 && obj2)
                    return processText((lang as any).examineAddBothEnds, { rope: this, obj1: obj1, obj2: obj2 });
                if (obj1)
                    return processText(lang.rope_examine_attached_one_end, { rope: this, obj1: obj1 });
                if (obj2)
                    return processText(lang.rope_examine_attached_one_end, { rope: this, obj1: obj2 });
                return ''; // just in one place, like any ordinary object
            }
            // Who is it held by (and we can see)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const end1 = w[this.locs[0]];
            const holder1 = (end1.npc || end1.player) && end1.isHere() ? end1 : false;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const end2 = w[this.locs[this.locs.length - 1]];
            const holder2 = (end2.npc || end2.player) && end2.isHere() ? end2 : false;
            // What locations does it go to
            const index = this.locs.findIndex((el: any) => el === (game as any).player.loc);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const loc1 = (index > 0 && w[this.locs[index - 1]].room) ? w[this.locs[index - 1]] : false;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const loc2 = (index < (this.locs.length - 1) && w[this.locs[index + 1]].room) ? w[this.locs[index + 1]] : false;
            let s = '';
            let flag = false;
            if (obj1 || holder1 || loc1) {
                s += ' ' + lang.rope_one_end + ' ';
                flag = true;
            }
            if (obj1) {
                s += lang.rope_examine_end_attached.replace('obj', 'obj1');
            }
            else if (holder1) {
                s += lang.rope_examine_end_held.replace('holder', 'holder1');
            }
            else if (loc1) {
                s += lang.rope_examine_end_headed.replace('loc', 'loc1');
            }
            if (obj2 || holder2 || loc2) {
                s += ' ' + (flag ? lang.rope_other_end : lang.rope_one_end) + ' ';
                flag = true;
            }
            if (obj2) {
                s += lang.rope_examine_end_attached.replace('obj', 'obj2');
            }
            else if (holder2) {
                s += lang.rope_examine_end_held.replace('holder', 'holder2');
            }
            else if (loc2) {
                s += lang.rope_examine_end_headed.replace('loc', 'loc2');
            }
            return processText(s, { rope: this, obj1: obj1, obj2: obj2, holder1: holder1, holder2: holder2, loc1: loc1, loc2: loc2 });
        },
        canAttachTo: function (item: any) {
            return item.attachable;
        },
        attachTo: function (item: any) {
            const loc = item.loc; // may want to go deep in case tied to a component of an item !!!
            if (!this.tiedTo1) {
                if (this.locs.length > 1)
                    this.locs.shift();
                if (this.locs[0] !== loc)
                    this.locs.unshift(loc);
                this.tiedTo1 = item.name;
            }
            else {
                if (this.locs.length > 1)
                    this.locs.pop();
                if (this.locs[this.locs.length - 1] !== loc)
                    this.locs.push(loc);
                this.tiedTo2 = item.name;
            }
            if (this.onTie)
                this.onTie(item);
        },
        useWith: function (char: any, item: any) {
            return handleTieTo(char, this, item) === world.SUCCESS;
        },
        detachFrom: function (item: any) {
            if (this.tiedTo1 === item.name) {
                if (this.locs.length === 2 && this.locs.includes((game as any).player.name))
                    this.locs.shift(); // remove this room
                if (this.locs[0] !== (game as any).player.name) {
                    this.locs.unshift((game as any).player.name);
                }
                delete this.tiedTo1;
            }
            else {
                if (this.locs.length === 2 && this.locs.includes((game as any).player.name))
                    this.locs.pop(); // remove this room
                if (this.locs[this.locs.length - 1] !== (game as any).player.name)
                    this.locs.push((game as any).player.name);
                delete this.tiedTo2;
            }
            if (this.onUntie)
                this.onUntie(item);
        },
    }, TAKEABLE_DICTIONARY);
    // This MUST be sent the fromLoc unless if is only in a single location, and you must already have established it is not attached
    // once this is registered for onGoX it stays registered, even when dropped - it is much easier!
    res.moveToFrom = function (toLoc: any, fromLoc: any) {
        if (fromLoc === undefined) {
            if (this.locs.length !== 1)
                throw "Need a fromLoc here for a rope object";
            fromLoc = this.locs[0];
        }
        if (fromLoc === toLoc)
            return;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[fromLoc])
            errormsg("The location name `" + fromLoc + "`, does not match anything in the game.");
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!w[toLoc])
            errormsg("The location name `" + toLoc + "`, does not match anything in the game.");
        let end;
        if (this.locs.length === 1) {
            this.locs = [toLoc];
            end = 0;
        }
        else if (this.locs[0] === fromLoc) {
            this.locs.shift();
            this.locs.unshift(toLoc);
            end = 1;
        }
        else if (this.locs[this.locs.length - 1] === fromLoc) {
            this.locs.pop();
            this.locs.push(toLoc);
            end = 2;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (w[toLoc].onGoCheckList && !w[toLoc].onGoCheckList.includes(this.name))
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            w[toLoc].onGoCheckList.push(this.name);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (w[toLoc].onGoActionList && !w[toLoc].onGoActionList.includes(this.name))
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            w[toLoc].onGoActionList.push(this.name);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[fromLoc].itemTaken(this, end);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        w[toLoc].itemDropped(this, end);
        if (this.onMove !== undefined)
            this.onMove(toLoc, fromLoc, end);
    };
    res.takeFromLoc = function (char: any) {
        if (this.locs.includes(char.loc))
            return char.loc;
        if (this.locs.length === 1)
            return this.locs[0];
        throw "Sorry, taking ropes from containers has yet to be fully implemented";
    };
    /*  res.drop = function(isMultiple, char) {
        msg(prefix(this, isMultiple) + lang.drop_successful(char, this));
        //this.moveToFrom(char.loc);
        if (this.tiedTo1 === char.name) this.tiedTo1 = char.loc
        if (this.tiedTo2 === char.name) this.tiedTo2 = char.loc
        w[char.name].itemTaken(this);
        w[char.loc].itemDropped(this);
        if (this.onMove !== undefined) this.onMove(char.loc, char.name)  // may want to say which end
        return true;
      }*/
    res.take = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        if (this.isAtLoc(char.name))
            return falsemsg(prefix(this, isMultiple) + lang.already_have, tpParams);
        if (!char.canManipulate(this, "take"))
            return false;
        if (this.tiedTo1 && this.tiedTo2)
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            return falsemsg(prefix(this, isMultiple) + "It is tied up at both ends.");
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(prefix(this, isMultiple) + lang.take_successful, tpParams);
        this.moveToFrom(char.name, char.loc); // !!! assuming where it is going from
        if (this.scenery)
            delete this.scenery;
        return true;
    };
    res.onGoCheck = function (char: any, dest: any) {
        if (this.ropeLength === undefined) // length not set, infinitely long!
            if (this.locs.length < 3)
                return true; // just in one room
        if (!this.locs.includes(char.name))
            return true; // not carrying, so no issue
        if (this.locs[0] === char.name) {
            if (this.locs[2] === dest)
                return true; // heading back where we came from
        }
        else {
            if (this.locs[this.locs.length - 3] === dest)
                return true; // heading back where we came from
        }
        if (this.locs.length <= this.ropeLength)
            return true;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg("{nv:rope:be:true} not long enough, you cannot go any further.", { rope: this });
        return false;
    };
    res.onGoAction = function (char: any) {
        if (this.locs.length === 1)
            return; // carried as single item, treat as std item
        if (!this.locs.includes(char.name))
            return; // not carrying, so no issue
        if (this.locs[0] === char.name) {
            // suppose locs is me, lounge, kitchen, garden
            // case 1: move lounge to kitchen -> me, kitchen, garden
            // case 2: move lounge to hall -> me, hall, lounge, kitchen, garden
            this.locs.shift(); // remove me
            if (this.locs[1] === char.loc) {
                this.locs.shift();
            }
            else {
                this.locs.unshift(char.loc);
            }
            this.locs.unshift(char.name);
        }
        else {
            this.locs.pop(); // remove me
            if (this.locs[this.locs.length - 2] === char.loc) {
                this.locs.pop();
            }
            else {
                this.locs.push(char.loc);
            }
            this.locs.push(char.name);
        }
    };
    return res;
};
const BUTTON_DICTIONARY = {
    button: true,
    onCreation: function (o: any) {
        o.verbFunctions.push(function (o: any, verbList: any) {
            verbList.push(lang.verbs.push);
        });
    },
};
const BUTTON = function () {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, BUTTON_DICTIONARY);
    res.push = function (isMultiple: any, char: any) {
        const tpParams = { char: char, item: this };
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        msg(lang.push_button_successful, tpParams);
        if (this.onPress)
            this.onPress(char);
    };
    return res;
};
const TRANSIT_BUTTON = function (nameOfTransit: any) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const res = $.extend({}, BUTTON_DICTIONARY);
    res.loc = nameOfTransit,
        res.transitButton = true,
        res.isAtLoc = function (loc: any, situation: any) {
            if (situation === world.LOOK)
                return false;
            if (typeof loc !== "string")
                loc = loc.name;
            return (this.loc === loc);
        };
    res.push = function (isMultiple: any, char: any) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const transit = w[this.loc];
        if (typeof transit.transitCheck === "function" && !transit.transitCheck()) {
            if (transit.transitAutoMove)
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
                world.setRoom((game as any).player, (game as any).player.previousLoc, transit.transitDoorDir);
            return false;
        }
        const exit = transit[transit.transitDoorDir];
        if (this.locked) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            printOrRun((game as any).player, this, "transitLocked");
            return false;
        }
        else if (exit.name === this.transitDest) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            printOrRun((game as any).player, this, "transitAlreadyHere");
            return false;
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            printOrRun((game as any).player, this, "transitGoToDest");
            transit.update(this, true);
        }
    };
    return res;
};
// This is for rooms
const TRANSIT = function (exitDir: any) {
    const res = {
        saveExitDests: true,
        transitDoorDir: exitDir,
        mapMoveableLoc: true,
        mapRedrawEveryTurn: true,
        beforeEnter: function () {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            this.update((game as any).player.previousLoc);
        },
        getTransitButtons: function (includeHidden: any, includeLocked: any) {
            return (this as any).getContents(world.LOOK).filter(function (el: any) {
                if (!el.transitButton)
                    return false;
                if (!includeHidden && el.hidden)
                    return false;
                if (!includeLocked && el.locked)
                    return false;
                return true;
            });
        },
        findTransitButton: function (dest: any) {
            for (let key in w) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (w[key].loc === (this as any).name && w[key].transitDest === dest)
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    return w[key];
            }
            return null;
        },
        update: function (transitButton: any, callEvent: any) {
            if (typeof transitButton === 'string')
                transitButton = this.findTransitButton(transitButton);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const exit = this[this.transitDoorDir];
            const previousDest = exit.name;
            exit.name = transitButton.transitDest;
            (this as any).currentButtonName = transitButton.name;
            if (typeof map !== 'undefined') {
                console.log("MAPPING");
                console.log(transitButton.transitDest);
                (this as any).mapCurrentConnection = (this as any).locations.findIndex((el: any) => el.connectedRoom.name === transitButton.transitDest);
                if ((this as any).mapCurrentConnection === -1) {
                    errormsg('Failed to find a location called "' + transitButton.transitDest + '"');
                    console.log((this as any).locations);
                    return;
                }
                console.log((this as any).mapCurrentConnection);
                const loc = (this as any).locations[(this as any).mapCurrentConnection];
                console.log(loc);
                // set these so we can get the player location
                (this as any).mapX = loc.mapX;
                (this as any).mapY = loc.mapY;
                (this as any).mapZ = loc.mapZ;
                (this as any).mapRegion = loc.mapRegion;
            }
            if (callEvent && (this as any).onTransitMove)
                (this as any).onTransitMove(transitButton.transitDest, previousDest);
        },
        // The exit is not saved, so after a load, need to update the exit
        templatePostLoad: function () {
            if ((this as any).currentButtonName) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                const exit = this[this.transitDoorDir];
                exit.name = (this as any).currentButtonName.transitDest;
            }
            if ((this as any).postLoad)
                (this as any).postLoad();
        },
        transitOfferMenu: function () {
            if (typeof (this as any).transitCheck === "function" && !(this as any).transitCheck()) {
                if ((this as any).transitAutoMove)
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
                    world.setRoom((game as any).player, (game as any).player.previousLoc, this.transitDoorDir);
                return false;
            }
            const buttons = this.getTransitButtons(true, false);
            const transitDoorDir = this.transitDoorDir;
            const room = this;
            showMenu((this as any).transitMenuPrompt, buttons.map((el: any) => el.transitDestAlias), function (result: any) {
                for (let button of buttons) {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'i'.
                    if (buttons[i].transitDestAlias === result) {
                        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                        if (room[transitDoorDir].name === button.transitDest) {
                            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
                            printOrRun((game as any).player, button, "transitAlreadyHere");
                        }
                        else {
                            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
                            printOrRun((game as any).player, button, "transitGoToDest");
                            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'transit'.
                            transit.update(button.transitDest, true);
                        }
                        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                        room[transitDoorDir].name = button.transitDest;
                        if ((room as any).transitAutoMove)
                            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
                            world.setRoom((game as any).player, button.transitDest, room[transitDoorDir]);
                    }
                }
            });
        },
    };
    return res;
};
const CHARACTER = function () {
    const res = {
        // The following are used also both player and NPCs, so we can use the same functions for both
        canReachThrough: () => true,
        canSeeThrough: () => true,
        getAgreement: () => true,
        getContents: (util as any).getContents,
        pause: NULL_FUNC,
        canManipulate: () => true,
        canMove: () => true,
        canPosture: () => true,
        canTakeDrop: () => true,
        mentionedTopics: [],
        canTalkFlag: true,
        canTalk: function () { return this.canTalkFlag; },
        onGoCheckList: [],
        onGoActionList: [],
        followers: [],
        getHolding: function () {
            return this.getContents(world.LOOK).filter(function (el: any) { return !el.getWorn(); });
        },
        getWearing: function () {
            return this.getContents(world.LOOK).filter(function (el: any) { return el.getWorn() && !el.ensemble; });
        },
        getStatusDesc: function () {
            if (!(this as any).posture)
                return false;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return (this as any).posture + " " + (this as any).postureAdverb + " " + lang.getName(w[(this as any).postureFurniture], { article: DEFINITE });
        },
        isAtLoc: function (loc: any, situation: any) {
            if (situation === world.LOOK)
                return false;
            if (situation === world.SIDE_PANE)
                return false;
            if (typeof loc !== "string")
                loc = loc.name;
            return ((this as any).loc === loc);
        },
        getOuterWearable: function (slot: any) {
            const clothing = this.getWearing().filter(function (el: any) {
                if (typeof el.getSlots !== "function") {
                    console.log("Item with worn set to true, but no getSlots function");
                    console.log(el);
                }
                return el.getSlots().includes(slot);
            });
            if (clothing.length === 0) {
                return false;
            }
            let outer = clothing[0];
            for (let garment of clothing) {
                if (garment.wear_layer > outer.wear_layer) {
                    outer = garment;
                }
            }
            return outer;
        },
        // Also used by NPCs, so has to allow for that
        msg: function (s: any, params: any) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(s, params);
        },
        onCreation: function (o: any) {
            o.nameModifierFunctions.push(function (o: any, l: any) {
                let s = '';
                const state = o.getStatusDesc();
                const held = o.getHolding();
                const worn = o.getWearingVisible();
                const list = [];
                if (state) {
                    list.push(state);
                }
                if (held.length > 0) {
                    list.push(lang.invHoldingPrefix + ' ' + formatList(held, { article: INDEFINITE, lastJoiner: lang.list_and, modified: false, nothing: lang.list_nothing, loc: o.name, npc: true }));
                }
                if (worn.length > 0) {
                    list.push(lang.invWearingPrefix + ' ' + formatList(worn, { article: INDEFINITE, lastJoiner: lang.list_and, modified: false, nothing: lang.list_nothing, loc: o.name, npc: true }));
                }
                if (list.length > 0)
                    l.push(list.join('; '));
            });
            o.verbFunctions.push(function (o: any, verbList: any) {
                verbList.shift();
                verbList.push(lang.verbs.lookat);
                if (!settings.noTalkTo)
                    verbList.push(lang.verbs.talkto);
            });
        },
    };
    return res;
};
const PLAYER = function () {
    const res = CHARACTER();
    (res as any).pronouns = lang.pronouns.secondperson;
    (res as any).player = true;
    return res;
};
