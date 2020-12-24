"use strict";
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'map'.
const map = {
    toggle: true,
    defaults: {
        mapScale: 1,
        mapOffsetX: 0,
        mapOffsetY: 0,
        mapTextColour: 'black',
        mapLabelColour: 'black',
        mapScrollSpeed: 1,
        mapPointsOfInterest: [],
        mapStyle: {
            right: '0',
            top: '200px',
            width: '400px',
            height: '400px',
            'background-color': 'black',
            border: '3px black solid',
        },
        mapMarker: function (loc: any) {
            return (map as any).polygon(loc, [
                [0, 0], [-5, -25], [-7, -20], [-18, -45], [-20, -40], [-25, -42], [-10, -18], [-15, -20]
            ], 'stroke:none;fill:black;pointer-events:none;opacity:0.5');
        },
        mapDrawPointOfInterest: function (point: any) {
            let s = '<g>';
            s += '<text x="' + (point.mapX / (settings as any).mapScale + 18) + '" y="' + (point.mapY / (settings as any).mapScale - 23) + '" fill="' + point.fill + '">';
            s += point.text + '</text>';
            s += (map as any).polygon({
                mapX: point.mapX / (settings as any).mapScale,
                mapY: point.mapY / (settings as any).mapScale,
            }, [
                [0, 0], [5, -12], [7, -10], [18, -22], [20, -20], [25, -21], [10, -9], [15, -10]
            ], 'stroke:none;fill:black;pointer-events:none;opacity:0.5');
            s += '</g>';
            return s;
        },
    }
};
(map as any).defaultStyle = { position: 'fixed', display: 'block' };
// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ toggle: boolean; defaults: { m... Remove this comment to see the full error message
io.modulesToUpdate.push(map);
// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ toggle: boolean; defaults: { m... Remove this comment to see the full error message
io.modulesToInit.push(map);
(map as any).init = function () {
    // First set up the HTML page
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
    (map as any).questMapDiv = document.getElementById("quest-map");
    (map as any).questMapDiv.addEventListener("mouseup", (map as any).mouseDoneEvent);
    (map as any).questMapDiv.addEventListener("mouseleave", (map as any).mouseDoneEvent);
    (map as any).questMapDiv.addEventListener("wheel", function (e: any) {
        e.preventDefault();
        (settings as any).mapScale -= e.deltaY * -0.01 * (settings as any).mapScale / 4;
        (settings as any).mapScale = Math.min(Math.max(.2, (settings as any).mapScale), 2.5);
        (map as any).redraw();
    });
    (map as any).questMapDiv.addEventListener("mousedown", function (e: any) {
        (map as any).mouseX = e.offsetX;
        (map as any).mouseY = e.offsetY;
        (map as any).mouseMoving = true;
    });
    (map as any).questMapDiv.addEventListener("mousemove", function (e: any) {
        if (!(map as any).mouseMoving)
            return;
        //console.log('@' + (e.offsetX - map.mouseX) + ',' + (e.offsetY - map.mouseY))
        (map as any).redraw((map as any).mouseX - e.offsetX, (map as any).mouseY - e.offsetY);
    });
};
(map as any).mouseDoneEvent = function (e: any) {
    if (!(map as any).mouseMoving)
        return;
    (map as any).mouseMoving = false;
    //console.log('#' + (e.offsetX - map.mouseX) + ',' + (e.offsetY - map.mouseY))
    (settings as any).mapOffsetX += (map as any).mouseX - e.offsetX;
    (settings as any).mapOffsetY += (map as any).mouseY - e.offsetY;
    (map as any).redraw();
};
(map as any).update = function () {
    (settings as any).mapOffsetX = 0;
    (settings as any).mapOffsetY = 0;
    (settings as any).mapScale = 1;
    (map as any).redraw();
};
// Draw the map
// It collects all the SVG in five lists, which are effectively layers.
// This means all the exits appear in one layer, all the labels in another
// and so labels are always on top of exits
(map as any).redraw = function (offX: any, offY: any) {
    // grab the current room region and level. If the room is missing either, give up now!
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (w[(game as any).player.loc].mapX)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        (game as any).player.mapX = w[(game as any).player.loc].mapX / (settings as any).mapScale;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (w[(game as any).player.loc].mapY)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        (game as any).player.mapY = w[(game as any).player.loc].mapY / (settings as any).mapScale;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (w[(game as any).player.loc].mapRegion)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        (game as any).player.mapRegion = w[(game as any).player.loc].mapRegion;
    if (!(game as any).player.mapRegion)
        (game as any).player.mapRegion = (settings as any).mapImages[0].name;
    const mapImage = (settings as any).mapImages.find((el: any) => el.name === (game as any).player.mapRegion);
    if (!mapImage)
        return errormsg("Failed to find a map region called '" + (game as any).player.mapRegion + "'");
    const result = [];
    result.push('<g id="map-top">');
    result.push('<image width="' + (mapImage.width / (settings as any).mapScale) + '" height="' + (mapImage.height / (settings as any).mapScale) + '", x="0", y="0" href="' + mapImage.file + '"/>');
    result.push((settings as any).mapMarker((game as any).player));
    for (let point of (settings as any).mapPointsOfInterest) {
        if (!point.mapRegion)
            point.mapRegion = (settings as any).mapImages[0].name;
        if (point.mapRegion !== (game as any).player.mapRegion)
            continue;
        if (!point.isActive || point.isActive())
            result.push((settings as any).mapDrawPointOfInterest(point));
    }
    result.push('</g>');
    let offsetX = (settings as any).mapOffsetX - (settings as any).mapWidth / 2;
    if (offX)
        offsetX += offX;
    let offsetY = (settings as any).mapOffsetY - (settings as any).mapHeight / 2;
    if (offY)
        offsetY += offY;
    // Centre the view on the player, and draw it
    const x = (game as any).player.mapX + offsetX;
    const y = (game as any).player.mapY + offsetY;
    draw((settings as any).mapWidth, (settings as any).mapHeight, result, { destination: 'quest-map', x: x, y: y, background: 'black' });
};
(map as any).polygon = function (room: any, points: any, attrs: any) { return (map as any).polyany('polygon', room, points, attrs); };
(map as any).polyline = function (room: any, points: any, attrs: any) { return (map as any).polyany('line', room, points, attrs); };
(map as any).polyany = function (type: any, room: any, points: any, attrs: any) {
    let s = '<poly' + (type === 'line' ? 'line' : 'gon') + ' points="';
    s += points.map((el: any) => '' + (room.mapX + el[0]) + ',' + (room.mapY + el[1])).join(' ');
    s += '" ';
    if (attrs)
        s += ' style="' + attrs + '"';
    s += '/>';
    //console.log(s)
    return s;
};
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
