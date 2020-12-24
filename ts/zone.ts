"use strict";
const zoneExit = function (char: any, dir: any) {
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    const newX = char.positionX + this.data.x;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    const newY = char.positionY + this.data.y;
    // Exits to other places
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    for (let el of this.origin.exits) {
        if (char.positionX === el.x && char.positionY === el.y && dir === el.dir) {
            const tpParams = { char: char, dir: dir };
            if (el.blocking) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(el.blockedmsg || lang.not_that_way, tpParams);
                return false;
            }
            if (el.isLocked) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                msg(el.lockedmsg || lang.locked_exit, tpParams);
                return false;
            }
            //console.log(this)
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            msg(el.msg || lang.go_successful, tpParams);
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.origin.onZoneExit(dir);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
            world.setRoom(char, el.dest);
            return true;
        }
    }
    // If the direction is "in", "up", or "down", just say no
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    if (this.origin.defaultToBlocked || this.data.type !== 'compass') {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg('You can\'t go ' + dir);
        return false;
    }
    // Check if a feature blocks the way
    for (let name in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const o = w[name];
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (o.zone === this.origin.name && newX === o.x && newY === o.y && o.featureNoExit) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(o.featureNoExit.replace('#', dir));
            return false;
        }
    }
    // Check if this would cross a border
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    for (let el of this.origin.getBorders()) {
        if (el.border(newX, newY)) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
            msg(el.borderMsg.replace('#', dir));
            return false;
        }
    }
    // Handle objects at the old location
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.origin.onZoneExit(dir);
    // More the player
    char.positionX = newX;
    char.positionY = newY;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    msg(lang.stop_posture(char));
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    msg(lang.go_successful, { char: char, dir: dir });
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    world.setRoom(char, this.origin.name, false, true);
    return true;
};
const ZONE = function (defaultToBlocked: any) {
    const res = {
        exits: [],
        zone: true,
        defaultToBlocked: defaultToBlocked,
        // The below are all defaults for map drawing
        insideColour: 'yellow',
        outsideColour: 'silver',
        featureColour: 'blue',
        playerColour: 'black',
        mapCells: [],
        mapFeatures: [],
        mapLabels: [],
        cellSize: 16,
        mapBorder: true,
        mapFont: '12px sans-serif',
    };
    for (let ex of lang.exit_list) {
        if (ex.type === 'nocmd')
            continue;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        res[ex.name] = new Exit("_", { use: zoneExit, data: ex });
    }
    (res as any).getExits = function (options: any) {
        const exits = [];
        for (let ex of lang.exit_list) {
            if (ex.type !== 'nocmd' && (this as any).hasExit(options))
                exits.push(ex);
        }
        return exits;
    };
    (res as any).hasExit = function (dir: any, options: any) {
        //console.log("looking " + dir+ " at " + game.player.positionX + "," + game.player.positionY)
        if (options === undefined)
            options = {};
        if (!this[dir])
            return false;
        // Check for special exit
        for (let el of this.exits) {
            //console.log("checking " + el.dest + " dir=" + el.dir + " (" + el.x + "," + el.y + ")")
            if ((game as any).player.positionX === (el as any).x && (game as any).player.positionY === (el as any).y && dir === (el as any).dir) {
                //console.log("found special")
                if ((el as any).blocking)
                    return false;
                if (options.excludeLocked && (el as any).isLocked)
                    return false;
                if (options.excludeScenery && (el as any).scenery)
                    return false;
                //console.log("it is good")
                return true;
            }
        }
        // Non-compass directions not allowed
        if (this.defaultToBlocked || this[dir].data.type !== 'compass') {
            return false;
        }
        // Check if this would cross a border
        const newX = (game as any).player.positionX + this[dir].data.x;
        const newY = (game as any).player.positionY + this[dir].data.y;
        for (let el of (this as any).getBorders()) {
            if (el.borderMsg !== undefined)
                continue;
            if (el.border(newX, newY)) {
                return false;
            }
        }
        return true;
    };
    (res as any).desc = function () {
        for (let el of (this as any).descs) {
            if (el.when !== undefined) {
                if (el.when((game as any).player.positionX, (game as any).player.positionY))
                    return (this as any).getDesc(el);
            }
            else if (el.x !== undefined) {
                if (el.x === (game as any).player.positionX && el.y === (game as any).player.positionY)
                    return (this as any).getDesc(el);
            }
            else {
                //console.log(el)
                return (this as any).getDesc(el);
            }
        }
        return "ERROR: No description found for zone at x=" + (game as any).player.positionX + ", y=" + (game as any).player.positionY;
    };
    (res as any).getDesc = function (el: any) {
        return (typeof el.desc === 'function' ? el.desc() : el.desc) + (this as any).getFeatureDescs();
    };
    (res as any).onZoneExit = function (dir: any) {
        for (let name in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const o = w[name];
            if (o.loc === (this as any).name && o !== (game as any).player) {
                delete o.loc;
                o.positionX = (game as any).player.positionX;
                o.positionY = (game as any).player.positionY;
                o.zoneElsewhere = (this as any).name;
            }
        }
    };
    (res as any).getFeatureDescs = function () {
        let s = '';
        for (let name in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const el = w[name];
            if (el.zone !== (this as any).name || el.zoneBorder)
                continue;
            if ((game as any).player.positionX === el.positionX && (game as any).player.positionY === el.positionY && el.featureLookHere) {
                s += ' ' + el.featureLookHere;
            }
            else {
                const d = (this as any).getDirection((game as any).player, el.positionX, el.positionY, el.range);
                if (d)
                    s += ' ' + el.featureLook.replace('#', d);
            }
        }
        for (let el of (this as any).getBorders()) {
            if (el.isAdjacentTo((game as any).player) && el.borderDesc)
                s += ' ' + el.borderDesc;
        }
        return s;
    };
    (res as any).beforeEnter = function () {
        if ((game as any).player.positionX === undefined)
            (game as any).player.positionX = 0;
        if ((game as any).player.positionY === undefined)
            (game as any).player.positionY = 0;
        for (let name in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const o = w[name];
            if (o.zoneElsewhere === (this as any).name && o.positionX === (game as any).player.positionX && o.positionY === (game as any).player.positionY) {
                o.loc = (this as any).name;
                delete o.zoneElsewhere;
            }
        }
    };
    // Gets the compass direction from that char to the given co-ordinate
    // If range is given, will return false if the distance is greater than that
    // No guarantee what will happen if the char is at at the coordinates
    // (because of the way floats are handled it may not be accurate/reliable)
    (res as any).getDirection = function (char: any, objX: any, objY: any, range: any) {
        const x = objX - char.positionX;
        const y = objY - char.positionY;
        const r = Math.sqrt(x * x + y * y);
        if (range && r > range)
            return false;
        const theta = Math.atan(y / x) * 180 / Math.PI;
        if (x > 0 && theta <= 22.5 && theta >= -22.5)
            return lang.exit_list[7].name;
        if (x > 0 && theta <= 67.5 && theta >= 22.5)
            return lang.exit_list[2].name;
        if (x > 0 && theta >= -67.5 && theta <= -22.5)
            return lang.exit_list[12].name;
        if (x < 0 && theta <= 22.5 && theta >= -22.5)
            return lang.exit_list[5].name;
        if (x < 0 && theta <= 67.5 && theta >= 22.5)
            return lang.exit_list[10].name;
        if (x < 0 && theta >= -67.5 && theta <= -22.5)
            return lang.exit_list[0].name;
        return y > 0 ? lang.exit_list[1].name : lang.exit_list[11].name;
    };
    (res as any).getBorders = function () {
        const borders = [];
        // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'name' because it is a constant.
        for (name in w) {
            // @ts-expect-error ts-migrate(2538) FIXME: Type 'void' cannot be used as an index type.
            if (w[name].zoneBorder && w[name].zone === (this as any).name)
                // @ts-expect-error ts-migrate(2538) FIXME: Type 'void' cannot be used as an index type.
                borders.push(w[name]);
        }
        return borders;
    };
    (res as any).getBorderAt = function (x: any, y: any) {
        for (let el of (this as any).getBorders()) {
            if (el.border(x, y)) {
                return el;
            }
        }
        return false;
    };
    (res as any).getFeatureAt = function (x: any, y: any) {
        for (let name in w) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const el = w[name];
            if (el.zone !== (this as any).name || el.zoneBorder)
                continue;
            if (x === el.positionX && y === el.positionY) {
                return el;
            }
        }
        return false;
    };
    (res as any).drawMap = function () {
        if ((this as any).size === undefined)
            return false;
        const cells = [];
        const features = [];
        const labels = [];
        for (let x = -(this as any).size; x <= (this as any).size; x++) {
            for (let y = -(this as any).size; y <= (this as any).size; y++) {
                const x2 = ((this as any).size + x) * this.cellSize;
                const y2 = ((this as any).size - y) * this.cellSize;
                if ((this as any).getBorderAt(x, y)) {
                    cells.push('<rect x="' + x2 + '" y="' + y2 + '" width="' + this.cellSize + '" height="' + this.cellSize + '" stroke="none" fill="' + this.outsideColour + '"/>');
                }
                else {
                    cells.push('<rect x="' + x2 + '" y="' + y2 + '" width="' + this.cellSize + '" height="' + this.cellSize + '" stroke="none" fill="' + this.insideColour + '"/>');
                }
                const feature = (this as any).getFeatureAt(x, y);
                if (feature) {
                    const colour = feature.zoneColour || this.featureColour;
                    features.push('<circle cx="' + (x2 + this.cellSize / 2) + '" cy="' + (y2 + this.cellSize / 2) + '" r="' + (this.cellSize / 2 - 1) + '" stroke="none" fill="' + colour + '"/>');
                    if (feature.zoneMapName)
                        labels.push('<text x="' + (x2 + this.cellSize) + '" y="' + (y2 + 5) + '" style="font: ' + this.mapFont + '; fill: black;">' + feature.zoneMapName + '</text>');
                }
            }
        }
        const map = cells.concat(this.mapCells, features, this.mapFeatures, labels, this.mapLabels);
        const x2 = ((this as any).size + (game as any).player.positionX) * this.cellSize;
        const y2 = ((this as any).size - (game as any).player.positionY) * this.cellSize;
        map.push('<rect x="' + (x2 + 4) + '" y="' + (y2 + 4) + '" width="' + (this.cellSize - 8) + '" height="' + (this.cellSize - 8) + '" stroke="none" fill="' + this.playerColour + '"/>');
        const svgSize = ((this as any).size * 2 + 1) * this.cellSize;
        if (this.mapBorder)
            map.push('<rect x="0" y="0" width="' + svgSize + '" height="' + svgSize + '" stroke="black" fill="none"/>');
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        draw(svgSize, svgSize, map);
        return true;
    };
    return res;
};
const ZONE_BORDER = function (loc: any) {
    const res = {
        zoneBorder: true,
        zone: loc,
        isAtLoc: function (loc: any, situation: any) {
            if (situation === world.LOOK && (this as any).scenery)
                return false;
            if (situation === world.SIDE_PANE && (this as any).scenery)
                return false;
            return this.isAdjacentTo((game as any).player);
        },
        isAdjacentTo: function (char: any) {
            if (char.loc !== this.zone)
                return false;
            for (let x = char.positionX - 1; x <= char.positionX + 1; x++) {
                for (let y = char.positionY - 1; y <= char.positionY + 1; y++) {
                    if ((this as any).border(x, y))
                        return true;
                }
            }
            return false;
        },
    };
    return res;
};
const ZONE_ITEM = function (loc: any, x: any, y: any) {
    const res = { positionX: x, positionY: y, zoneElsewhere: loc, };
    return res;
};
const ZONE_FEATURE = function (loc: any, x: any, y: any, range: any, adjacent: any) {
    const res = {
        positionX: x, positionY: y, range: range, adjacent: adjacent, zone: loc, scenery: true,
        isAtLoc: function (loc: any, situation: any) {
            if (situation === world.LOOK && this.scenery)
                return false;
            if (situation === world.SIDE_PANE && this.scenery)
                return false;
            if (typeof loc !== "string")
                loc = loc.name;
            if (adjacent) {
                return loc === this.zone && Math.abs((game as any).player.positionX - (this as any).x) < 2 && Math.abs((game as any).player.positionY - (this as any).y) < 2;
            }
            else {
                return loc === this.zone && (game as any).player.positionX === (this as any).x && (game as any).player.positionY === (this as any).y;
            }
        }
    };
    return res;
};
