"use strict";
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'map'.
const map = {
    toggle: true,
    defaults: {
        mapCellSize: 20,
        mapScale: 25,
        mapLocationColour: 'yellow',
        mapBorderColour: 'black',
        mapTextColour: 'black',
        mapExitColour: '#444',
        mapExitWidth: 3,
        mapLabelOffset: 15,
        mapLabelColour: 'black',
    }
};
(map as any).defaultStyle = { position: 'fixed', display: 'block' };
// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ toggle: boolean; defaults: { m... Remove this comment to see the full error message
io.modulesToUpdate.push(map);
// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ toggle: boolean; defaults: { m... Remove this comment to see the full error message
io.modulesToInit.push(map);
// Authors can override this so there are several starting locations if there are isolated regions
(map as any).getStartingLocations = function () {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const starts = (settings as any).mapAutomapFrom ? (settings as any).mapAutomapFrom.map((el: any) => w[el]) : [w[(game as any).player.loc]];
    let count = 0;
    for (let start of starts) {
        start.mapX = 0;
        start.mapY = 0;
        start.mapZ = 0;
        start.mapRegion = count;
        count++;
    }
    return starts;
};
(map as any).init = function () {
    // First set up the HTMP page
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#quest-map').css((map as any).defaultStyle);
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#quest-map').css(settings.mapStyle);
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $("<style>")
        .prop("type", "text/css")
        .html(".map-text " + (util as any).dictionaryToCss((settings as any).mapLabelStyle, true))
        .appendTo("head");
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('.map-text').css('color', 'red');
    (settings as any).mapHeight = parseInt(settings.mapStyle.height);
    (settings as any).mapWidth = parseInt(settings.mapStyle.width);
    // Set the default values for settings
    for (let key in map.defaults) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!settings[key])
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            settings[key] = map.defaults[key];
    }
    // rooms is a list of rooms to be mapped
    // set it up with some seed rooms
    const rooms = (settings as any).mapGetStartingLocations ? (settings as any).mapGetStartingLocations() : (map as any).getStartingLocations();
    // go through each room in the list
    while (rooms.length > 0) {
        // get the next room
        const room = rooms.shift();
        // go through each exit
        for (let dir of lang.exit_list) {
            // we are only interested in compass and vertical, and if the exit exists
            if (dir.type !== 'compass' && dir.type !== 'vertical')
                continue;
            if (!room.hasExit(dir.name))
                continue;
            // For this exit, skip if flagged to ignore or points to non-room
            const exit = room[dir.name];
            if (exit.mapIgnore)
                continue;
            if (exit.name === '_')
                continue;
            // For the exit destination, skip if flagged to ignore
            // otherwise map it
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const exitRoom = w[exit.name];
            if (!exitRoom)
                throw new Error("Mapping to unknown exit: " + exit.name);
            if (exitRoom.mapIgnore) {
                exit.mapIgnore = true;
                continue;
            }
            if (exitRoom.mapMoveableLoc || room.mapMoveableLoc) {
                exit.mapMoveableLoc = true;
                (map as any).mapMultiRoomFromExit(room, exitRoom, exit, dir);
            }
            else {
                (map as any).mapRoomFromExit(room, exitRoom, exit, dir, rooms);
            }
            if (exitRoom.mapMoveableLoc && !exitRoom.mapDraw) {
                exitRoom.mapDraw = (map as any).moveableLocDraw;
            }
        }
    }
    (map as any).layers = [
        // rooms on other levels
        { name: 'otherLevels', attrs: 'stroke="' + (settings as any).mapBorderColour + '" stroke-width="1" fill="' + (settings as any).mapLocationColour + '" opacity="0.2" pointer-events="none"' },
        // exits
        { name: 'exits', attrs: 'style="stroke:' + (settings as any).mapExitColour + ';stroke-width:' + (settings as any).mapExitWidth + 'px;fill:' + (settings as any).mapExitColour + '"' },
        // rooms on this level
        { name: 'base', attrs: 'stroke="' + (settings as any).mapBorderColour + '" stroke-width="1" fill="' + (settings as any).mapLocationColour + '"' },
        // features (anything the author might want to add)
        { name: 'features', attrs: '' },
        // labels
        { name: 'labels', attrs: 'pointer-events="none" fill="' + (settings as any).mapLabelColour + '" text-anchor="middle"' },
    ];
};
// Mapping from room to exitRoom, exit is the exit linking the two, dir is an object from lang.exit_list
(map as any).mapRoomFromExit = function (room: any, exitRoom: any, exit: any, dir: any, rooms: any) {
    //console.log(exit)
    const offsetX = (exit.mapOffsetX ? exit.mapOffsetX : dir.x) * (settings as any).mapScale;
    const offsetY = (exit.mapOffsetY ? exit.mapOffsetY : dir.y) * (settings as any).mapScale;
    const offsetZ = (exit.mapOffsetZ ? exit.mapOffsetZ : dir.z);
    //console.log('' + offsetX + ', ' + offsetY + ', ' + offsetZ)
    if (exitRoom.mapX === undefined) {
        // if room not done, set coords, add to rooms
        if (!exitRoom.mapIgnore) {
            exitRoom.mapX = room.mapX + offsetX;
            exitRoom.mapY = room.mapY - offsetY;
            exitRoom.mapZ = room.mapZ + offsetZ;
            exitRoom.mapRegion = room.mapRegion;
            if (rooms)
                rooms.push(exitRoom);
            //console.log("Rooms: " + rooms.map(el => el.name).join(', '))
        }
        //console.log(exitRoom)
    }
    else {
        // if done, check coords and alert if dodgy
        if (exitRoom.mapX !== room.mapX + offsetX) {
            console.log("WARNING: Mapping exit from " + room.name + " to " + exit.name + " - funny X offset (" + exitRoom.mapX + " vs " + (room.mapX + offsetX) + ")");
            console.log(room);
            console.log(exitRoom);
            console.log(exit.mapOffsetX);
            console.log(dir.x);
            console.log('' + offsetX + ', ' + offsetY + ', ' + offsetZ);
        }
        if (exitRoom.mapY !== room.mapY - offsetY)
            console.log("WARNING: Mapping exit from " + room.name + " to " + exit.name + " - funny Y offset (" + exitRoom.mapY + " vs " + (room.mapY + offsetY) + ")");
        if (exitRoom.mapZ !== room.mapZ + offsetZ)
            console.log("WARNING: Mapping exit from " + room.name + " to " + exit.name + " - funny Z offset");
    }
};
// Mapping from room to exitRoom, exit is the exit linking the two, dir is an object from lang.exit_list
// Use when exitRoom is multi-location, so is not to be added to the room list, and needs to know each location
(map as any).mapMultiRoomFromExit = function (room: any, exitRoom: any, exit: any, dir: any) {
    //console.log(exit)
    const offsetX = (exit.mapOffsetX ? exit.mapOffsetX : dir.x) * (settings as any).mapScale;
    const offsetY = (exit.mapOffsetY ? exit.mapOffsetY : dir.y) * (settings as any).mapScale;
    const offsetZ = (exit.mapOffsetZ ? exit.mapOffsetZ : dir.z);
    //console.log('' + offsetX + ', ' + offsetY + ', ' + offsetZ)
    if (exitRoom.locations === undefined)
        exitRoom.locations = [];
    exitRoom.mapRegion = true;
    const loc = {};
    if (!exitRoom.mapIgnore) {
        (loc as any).mapX = room.mapX + offsetX;
        (loc as any).mapY = room.mapY - offsetY;
        (loc as any).mapZ = room.mapZ + offsetZ;
        (loc as any).mapRegion = room.mapRegion;
        (loc as any).connectedRoom = room;
        //loc.connection = exit
        exitRoom.locations.push(loc);
    }
};
// Draw the map
// It collects all the SVG in five lists, which are effectively layers.
// This means all the exits appear in one layer, all the labels in another
// and so labels are always on top of exits
(map as any).update = function () {
    // grab the current room region and level. If the room is missing either, give up now!
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const level = w[(game as any).player.loc].mapZ;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const region = w[(game as any).player.loc].mapRegion;
    if (level === undefined || region === undefined)
        return;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (w[(game as any).player.loc].mapIgnore)
        return;
    // Stuff gets put in any of several layers, which will be displayed in this order
    const lists = {};
    for (let el of (map as any).layers)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        lists[el.name] = ['', '<g id="otherLevels-layer" ' + el.attrs + '>'];
    // Loop through every room
    for (let key in w) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const room = w[key];
        // Do not map if in another region (if region is true, the room can handle it)
        // Only show if visited unless mapShowNotVisited
        if (room.mapRegion !== region && room.mapRegion !== true)
            continue;
        if (!(settings as any).mapShowNotVisited && !room.visited)
            continue;
        // Call mapDraw on the room if it has that, otherwise the default version
        (room.mapDraw ? room : map).mapDraw(lists, region, level, room);
    }
    // Add it all together
    const result = (settings as any).mapDefs ? (settings as any).mapDefs() : [];
    for (let key in lists) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        for (let el of lists[key])
            result.push(el);
        result.push('</g>');
    }
    //console.log(result)
    if ((settings as any).mapExtras)
        result.push(...(settings as any).mapExtras());
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    result.push((settings as any).mapMarker ? (settings as any).mapMarker(w[(game as any).player.loc]) : (map as any).marker(w[(game as any).player.loc].mapX, w[(game as any).player.loc].mapY));
    // Centre the view on the player, and draw it
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const x = w[(game as any).player.loc].mapX - (settings as any).mapWidth / 2;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const y = -(settings as any).mapHeight / 2 + w[(game as any).player.loc].mapY;
    draw((settings as any).mapWidth, (settings as any).mapHeight, result, { destination: 'quest-map', x: x, y: y });
};
// The default draw function for a room
// Puts the various bits in the appropriate lists
(map as any).mapDraw = function (lists: any, region: any, level: any, room: any) {
    // Location itself
    const destinationLayer = room.mapZ === level ? lists.base : lists.otherLevels;
    if (room.mapDrawString) {
        destinationLayer.push(room.mapDrawString);
    }
    else if (room.mapDrawBase) {
        const s = room.mapDrawBase();
        if (!room.mapRedrawEveryTurn)
            room.mapDrawString = s;
        destinationLayer.push(s);
    }
    else {
        destinationLayer.push((map as any).mapDrawDefault(room));
    }
    if (room.mapZ !== level)
        return;
    // Exits
    for (let dir of lang.exit_list) {
        if (dir.type !== 'compass')
            continue;
        if (!room.hasExit(dir.name))
            continue;
        const exit = room[dir.name];
        if (exit.mapIgnore)
            continue;
        if (exit.name === '_')
            continue;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const exitRoom = w[exit.name];
        if (exit.mapDrawString) {
            lists.exits.push(exit.mapDrawString);
        }
        else if (exit.mapDrawBase) {
            lists.exits.push(exit.mapDrawBase(room, exitRoom, region, level));
        }
        else if (exit.mapMoveableLoc) {
            // For an exit going TO a mapMoveableLoc, 
            // assume a straight exit
            //console.log('here ' + room.name + ' ' + dir.name)
            let s = '<line x1="' + room.mapX + '" y1="' + room.mapY;
            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
            s += '" x2="' + (room.mapX + dir.x * (settings as any).mapScale / 2) + '" y2="' + (room.mapY - dir.y * (settings as any).mapScale / 2);
            s += '"/>';
            exit.mapDrawString = s;
            //console.log(s)
            lists.exits.push(s);
        }
        else {
            let s = '<line x1="' + room.mapX + '" y1="' + room.mapY;
            s += '" x2="' + (exitRoom.mapX + room.mapX) / 2 + '" y2="' + (exitRoom.mapY + room.mapY) / 2;
            s += '"/>';
            if (!exit.mapRedrawEveryTurn)
                exit.mapDrawString = s;
            lists.exits.push(s);
        }
    }
    // Features
    if (room.mapDrawFeatures)
        lists.features.push(room.mapDrawFeatures());
    // Labels
    if (!(settings as any).mapDrawLabels)
        return;
    if (room.mapDrawLabelString) {
        lists.labels.push(room.mapDrawLabelString);
    }
    else if (room.mapDrawLabel) {
        const s = room.mapDrawLabel(region, level);
        if (!room.mapRedrawEveryTurn)
            room.mapDrawLabelString = s;
        lists.labels.push(s);
    }
    else {
        lists.labels.push((map as any).mapDrawLabelDefault(room));
    }
};
// The default draw function for a multi-location room
// Puts the various bits in the appropriate lists
(map as any).moveableLocDraw = function (lists: any, region: any, level: any, room: any) {
    for (let el of (this as any).locations) {
        if (el.mapRegion !== region)
            continue;
        // Location itself
        const destinationLayer = el.mapZ === level ? lists.base : lists.otherLevels;
        // if a multi-location room, give it the special draw function
        destinationLayer.push(room.mapDrawBase ? room.mapDrawBase(level, el) : (map as any).mapDrawDefault(room, el));
        // Exits
        for (let dir of lang.exit_list) {
            if (dir.type !== 'compass')
                continue;
            if (!room.hasExit(dir.name))
                continue;
            const exit = room[dir.name];
            if (exit.mapIgnore)
                continue;
            if (exit.name === '_')
                continue;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            const exitRoom = w[exit.name];
            if (exit.mapDrawBase) {
                lists.exits.push(exit.mapDrawBase(room, exitRoom, region, level));
            }
            else if (dir.name === room.transitDoorDir) {
                // For an exit going FROM a mapMoveableLoc, 
                for (let el of room.locations) {
                    if (el.mapZ !== level || el.mapRegion !== region)
                        continue;
                    let s = '<line x1="' + el.mapX + '" y1="' + el.mapY;
                    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                    s += '" x2="' + (el.mapX + dir.x * (settings as any).mapScale / 2) + '" y2="' + (el.mapY - dir.y * (settings as any).mapScale / 2);
                    s += '"/>';
                    lists.exits.push(s);
                }
            }
            else {
                let s = '<line x1="' + el.mapX + '" y1="' + room.mapY;
                s += '" x2="' + (exitRoom.mapX + el.mapX) / 2 + '" y2="' + (exitRoom.mapY + el.mapY) / 2;
                s += '"/>';
                lists.exits.push(s);
            }
        }
        // Features
        if (room.mapDrawFeatures)
            lists.features.push(room.mapDrawFeatures());
        // Labels
        if (!(settings as any).mapDrawLabels || el.mapZ !== level)
            return;
        if (room.mapDrawLabelString) {
            lists.labels.push(room.mapDrawLabelString);
        }
        else if (room.mapDrawLabel) {
            const s = room.mapDrawLabel(region, level);
            if (!room.mapRedrawEveryTurn)
                room.mapDrawLabelString = s;
            lists.labels.push(s);
        }
        else {
            lists.labels.push((map as any).mapDrawLabelDefault(room, el));
        }
    }
};
// loc has the coordinates, but defaults to o
// (used by moveableLocDraw)
(map as any).mapDrawDefault = function (o: any, loc: any) {
    if (loc === undefined)
        loc = o;
    const w = o.mapWidth ? o.mapWidth : (settings as any).mapCellSize;
    const h = o.mapHeight ? o.mapHeight : (settings as any).mapCellSize;
    let s = '<rect x="';
    s += loc.mapX - w / 2;
    s += '" y="';
    s += loc.mapY - h / 2;
    s += '" width="' + w + '" height="' + h;
    if (o.mapColour)
        s += '" fill="' + o.mapColour;
    s += '"' + (map as any).getClickAttrs(o) + '/>';
    return s;
};
(map as any).getClickAttrs = function (o: any) {
    if (!(settings as any).mapClick)
        return '';
    return ' onclick="settings.mapClick(\'' + o.name + '\')" cursor="pointer" role="button"';
};
(map as any).mapDrawLabelDefault = function (o: any, loc: any) {
    if (loc === undefined)
        loc = o;
    let s = '<text class="map-text" x="';
    s += loc.mapX;
    s += '" y="';
    s += loc.mapY - (settings as any).mapLabelOffset;
    if ((settings as any).mapLabelRotate)
        s += '" transform="rotate(' + (settings as any).mapLabelRotate + ',' + loc.mapX + ',' + (loc.mapY - (settings as any).mapLabelOffset) + ')';
    s += '">';
    s += o.mapLabel ? o.mapLabel : sentenceCase(o.alias);
    s += '</text>';
    return s;
};
(map as any).polygon = function (room: any, points: any, attrs: any) { return (map as any).polyany('polygon', room, points, attrs); };
(map as any).polyline = function (room: any, points: any, attrs: any) { return (map as any).polyany('line', room, points, attrs); };
(map as any).polyroom = function (room: any, points: any, attrs: any) { return (map as any).polyany('room', room, points, attrs); };
(map as any).polyany = function (type: any, room: any, points: any, attrs: any) {
    let s = '<poly' + (type === 'line' ? 'line' : 'gon') + ' points="';
    s += points.map((el: any) => '' + (room.mapX + el[0]) + ',' + (room.mapY + el[1])).join(' ');
    s += '" ';
    if (attrs)
        s += ' style="' + attrs + '"';
    if (type === 'room')
        s += (map as any).getClickAttrs(room);
    s += '/>';
    //console.log(s)
    return s;
};
(map as any).rectRoom = function (room: any, points: any, attrs: any) { return (map as any).rect(true, room, points, attrs); };
(map as any).rectangle = function (room: any, points: any, attrs: any) { return (map as any).rect(false, room, points, attrs); };
(map as any).rect = function (isRoom: any, room: any, points: any, attrs: any) {
    let s = '<rect x="' + (room.mapX + points[0][0]) + '" y="' + (room.mapY + points[0][1]);
    s += '" width="' + points[1][0] + '" height="' + points[1][1] + '"';
    if (attrs)
        s += ' style="' + attrs + '"';
    if (isRoom)
        s += (map as any).getClickAttrs(room);
    s += '/>';
    return s;
};
(map as any).text = function (room: any, st: any, points: any, attrs: any) {
    let s = '<text x="' + (room.mapX + points[0]) + '" y="' + (room.mapY + points[1]) + '"';
    if (attrs)
        s += ' style="' + attrs + '"';
    s += ' text-anchor="middle">' + st + '</text>';
    //console.log(s)
    return s;
};
(map as any).bezier = function (room: any, points: any, attrs: any) {
    let s = '<path d="M ';
    s += (room.mapX + points[0][0]) + ' ' + (room.mapY + points[0][1]);
    points.shift();
    s += points.length === 2 ? ' q ' : ' c ';
    s += points.map((el: any) => '' + el[0] + ' ' + el[1]).join(' ');
    s += '" ';
    if (attrs)
        s += ' style="' + attrs + '"';
    s += '/>';
    //console.log(s)
    return s;
};
(map as any).marker = function (x: any, y: any) {
    let s = '<circle cx="';
    s += x;
    s += '" cy="';
    s += y;
    s += '" r="5" stroke="black" fill="blue"/>';
    return s;
};
if ((settings as any).playMode === 'dev') {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    commands.unshift(new Cmd('DebugMap', {
        regex: /^debug map$/,
        objects: [],
        script: function () {
            for (let key in w) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (w[key].mapZ == undefined)
                    continue;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                metamsg(w[key].name + ': ' + w[key].mapX + ', ' + w[key].mapY + ', ' + w[key].mapZ + ' Region=' + w[key].mapRegion);
            }
            return world.SUCCESS_NO_TURNSCRIPTS;
        },
    }));
}
findCmd('Map').script = function () {
    if ((settings as any).hideMap) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#quest-map').show();
        delete (settings as any).hideMap;
    }
    else {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#quest-map').hide();
        (settings as any).hideMap = true;
    }
    (io as any).calcMargins();
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    msg(lang.done_msg);
};
