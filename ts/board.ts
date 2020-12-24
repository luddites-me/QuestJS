"use strict";
const board = {};
(board as any).setup = function (settings: any) {
    (this as any).settings = settings;
    (this as any).settings.cosAngle = Math.cos((this as any).settings.angle * Math.PI / 180);
    (this as any).settings.sinAngle = Math.sin((this as any).settings.angle * Math.PI / 180);
    (this as any).settings.rootTwo = Math.sqrt(2);
    (this as any).settings.cellPoly = [
        [-(this as any).settings.sinAngle * (this as any).settings.cellSize, 0],
        [0, -(this as any).settings.cosAngle * (this as any).settings.cellSize],
        [(this as any).settings.sinAngle * (this as any).settings.cellSize, 0],
        [0, (this as any).settings.cosAngle * (this as any).settings.cellSize],
    ];
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('<div id="map" style="position: fixed;bottom: 0px; left: 200px;width:' + (this as any).settings.width + 'px;height:' + (this as any).settings.height + 'px;">This will be the board...</div>').insertAfter('#dialog');
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#main').css('margin-bottom', "420px");
    (this as any).update();
};
(board as any).update = function () {
    (this as any).map = [];
    (this as any).labels = [];
    (this as any).map.push('<defs>');
    (this as any).map.push('<linearGradient id="leftBaseGradient" gradientTransform="rotate(120)"><stop offset="0%"  stop-color="black" /><stop offset="30%" stop-color="white" /></linearGradient>');
    (this as any).map.push('<linearGradient id="rightBaseGradient" gradientTransform="rotate(60)"><stop offset="45%"  stop-color="black" /><stop offset="80%" stop-color="white" /></linearGradient>');
    if ((this as any).settings.defs)
        (this as any).map.push((this as any).settings.defs());
    (this as any).map.push('</defs>');
    if ((this as any).settings.title)
        (this as any).map.push((board as any).getTitle());
    // 0,0 is at the left, x increases towards the bottom, y to the top
    // 0,size is at the top; size,0 at the bottom; size,size at the right
    // Start at 0,size; then 0,size-1 and 1,size
    for (let i = 0; i < (this as any).settings.size; i++) {
        for (let j = 0; j < i; j++) {
            const x = j;
            const y = (this as any).settings.size - i + j;
            (board as any).handleCell(x, y);
        }
    }
    for (let i = (this as any).settings.size; i <= (2 * (this as any).settings.size); i++) {
        for (let j = 0; j < (2 * (this as any).settings.size - i); j++) {
            const x = j + i - (this as any).settings.size;
            const y = j;
            (board as any).handleCell(x, y);
        }
    }
    if ((this as any).settings.baseHeight)
        (this as any).map.push((board as any).getBase());
    if ((this as any).settings.compassPane)
        (this as any).map.push((board as any).getCompass((this as any).settings.compass.x, (this as any).settings.compass.y));
    if ((this as any).settings.switches)
        (this as any).map.push((board as any).getSwitches());
    if ((this as any).settings.extras)
        (this as any).map.push((this as any).settings.extras());
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#map').html('<svg width="' + (this as any).settings.width + '" height="' + (this as any).settings.height + '" viewBox="0 0 ' + (this as any).settings.width + ' ' + (this as any).settings.height + '" xmlns="http://www.w3.org/2000/svg">' + (this as any).map.join() + (this as any).labels.join() + '</svg>');
    return true;
};
(board as any).handleCell = function (x: any, y: any) {
    const [x2, y2] = (board as any).getCoord(x, y);
    let s = '<polygon points="';
    for (let el of (this as any).settings.cellPoly) {
        s += (x2 + el[0]) + ',' + (y2 + el[1]) + ' ';
    }
    s += '" ';
    s += (board as any).settings.cellBorder ? (board as any).settings.cellBorder(x, y) : 'stroke="none"';
    s += ' fill="' + (this as any).settings.getColourAt(x, y) + '"/>';
    if (typeof (this as any).settings.getLeftBorder === 'function') {
        const leftBorder = (this as any).settings.getLeftBorder(x, y);
        if (leftBorder) {
            s += '<line x1="' + (x2 + (this as any).settings.cellPoly[0][0]) + '" y1="' + (y2 + (this as any).settings.cellPoly[0][1]) + '" ';
            s += 'x2="' + (x2 + (this as any).settings.cellPoly[3][0]) + '" y2="' + (y2 + (this as any).settings.cellPoly[3][1]) + '" ' + leftBorder + '/>';
        }
        const rightBorder = (this as any).settings.getRightBorder(x, y);
        if (rightBorder) {
            s += '<line x1="' + (x2 + (this as any).settings.cellPoly[2][0]) + '" y1="' + (y2 + (this as any).settings.cellPoly[2][1]) + '" ';
            s += 'x2="' + (x2 + (this as any).settings.cellPoly[3][0]) + '" y2="' + (y2 + (this as any).settings.cellPoly[3][1]) + '" ' + rightBorder + '/>';
        }
    }
    for (let el of (this as any).settings.getFeaturesAt(x, y)) {
        const feature = (this as any).settings.features[el];
        if (feature === undefined) {
            console.log('WARNING: Failed to find a feature called "' + el + '" when drawing board');
            continue;
        }
        if (feature.script) {
            if (feature.layer) {
                this[feature.layer].push(feature.script(x2, y2, x, y));
            }
            else {
                s += feature.script(x2, y2, x, y);
            }
        }
        else if (feature.text) {
            const s = '<text x="' + x2 + '" y="' + (y2 + (feature.y ? feature.y : 0)) + '" style="text-anchor:middle;';
            if (feature.style)
                // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 's' because it is a constant.
                s += feature.style;
            // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 's' because it is a constant.
            s += '" ';
            if (feature.colour)
                // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 's' because it is a constant.
                s += 'fill="' + feature.colour + '"';
            // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 's' because it is a constant.
            s += '>' + feature.text + '</text>';
            (this as any).labels.push(s);
        }
        else if (feature.file) {
            let x3 = x2 - feature.width / 2;
            if (feature.x)
                x3 += feature.x;
            let y3 = y2 - feature.height;
            if (feature.y)
                y3 += feature.y;
            s += '<image href="' + settings.imagesFolder + feature.file + '" ';
            s += 'width="' + feature.width + '" height="' + feature.height + '" ';
            s += 'x="' + x3 + '" y="' + y3 + '"/>';
        }
        else if (feature.flatFile) {
            let x3 = x2 - feature.width / 2 + 18;
            let y3 = y2 - feature.height + 30.5 - 0.26 * (this as any).settings.cellSize;
            s += '<image href="' + settings.imagesFolder + feature.flatFile + '" ';
            s += 'width="' + Math.round((this as any).settings.cellSize * (this as any).settings.rootTwo) + '"';
            s += ' x="' + x3 + '" y="' + y3 + '" transform-origin="';
            s += x3 + 'px ' + y3 + 'px" transform="scale(1, ';
            s += ((this as any).settings.cosAngle / (this as any).settings.sinAngle) + ') rotate(45)"/>';
        }
    }
    (this as any).map.push(s);
};
(board as any).getTitle = function () {
    const x = (this as any).settings.titleX || 10;
    const y = (this as any).settings.titleY || ((this as any).settings.height / 4);
    let s = '<text x="' + x + '" y="' + y;
    if ((this as any).settings.titleStyle)
        s += '" style="' + (this as any).settings.titleStyle;
    s += '">' + (this as any).settings.title + '</text>';
    return s;
};
(board as any).getCompass = function (x: any, y: any) {
    let s = '<image href="' + settings.imagesFolder + 'compass45.png" width="160" height="159" x="';
    s += x + '" y="' + y;
    s += '" transform="scale(1, ' + ((this as any).settings.cosAngle / (this as any).settings.sinAngle) + ')" transform-origin="';
    s += x + 'px ' + y + 'px"/>';
    return s;
};
(board as any).getSwitches = function () {
    const x = (this as any).settings.switchesPos.x || 800;
    const y = (this as any).settings.switchesPos.y || 100;
    let s = '';
    if ((this as any).settings.switchesWidth) {
        s += '<rect x="' + x + '" y="' + y + '" width="' + (this as any).settings.switchesWidth + '" height="';
        s += ((this as any).settings.switches.length * 18 + 14) + '" fill="#eee" stroke="black"/>';
    }
    let offset = 0;
    for (let el of (this as any).settings.switches) {
        console.log(el);
        s += '<circle cx="' + (x + 14) + '" cy="' + (y + 15 + offset) + '" r="8" fill="';
        s += ((this as any).settings[el.att] ? el.on : el.off) + '" stroke="black" onclick="';
        s += el.customFunction ? el.customFunction : 'board.toggle(\'' + el.att + '\')';
        s += '"/>';
        s += '<text x="' + (x + 26) + '" y="' + (y + 20 + offset) + '" fill="black">' + el.text + '</text>';
        offset += 20;
    }
    return s;
};
(board as any).getBase = function () {
    let s = '<polygon points="';
    s += ((this as any).settings.offsetX + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY) + ' ';
    s += ((this as any).settings.offsetX + (this as any).settings.sinAngle * (this as any).settings.size * (this as any).settings.cellSize + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY + (this as any).settings.cosAngle * (this as any).settings.size * (this as any).settings.cellSize) + ' ';
    s += ((this as any).settings.offsetX + (this as any).settings.sinAngle * (this as any).settings.size * (this as any).settings.cellSize + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY + (this as any).settings.cosAngle * (this as any).settings.size * (this as any).settings.cellSize + (this as any).settings.baseHeight) + ' ';
    s += ((this as any).settings.offsetX + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY + (this as any).settings.baseHeight) + ' ';
    s += '" stroke="none" fill="url(\'#leftBaseGradient\')"/>';
    s += '<polygon points="';
    s += ((this as any).settings.offsetX + (this as any).settings.sinAngle * (this as any).settings.size * (this as any).settings.cellSize * 2 + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY) + ' ';
    s += ((this as any).settings.offsetX + (this as any).settings.sinAngle * (this as any).settings.size * (this as any).settings.cellSize + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY + (this as any).settings.cosAngle * (this as any).settings.size * (this as any).settings.cellSize) + ' ';
    s += ((this as any).settings.offsetX + (this as any).settings.sinAngle * (this as any).settings.size * (this as any).settings.cellSize + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY + (this as any).settings.cosAngle * (this as any).settings.size * (this as any).settings.cellSize + (this as any).settings.baseHeight) + ' ';
    s += ((this as any).settings.offsetX + (this as any).settings.sinAngle * (this as any).settings.size * (this as any).settings.cellSize * 2 + (this as any).settings.cellPoly[0][0]) + ',';
    s += ((this as any).settings.height / 2 + (this as any).settings.offsetY + (this as any).settings.baseHeight) + ' ';
    s += '" stroke="none" fill="url(\'#rightBaseGradient\')"/>';
    return s;
};
(board as any).getCoord = function (x: any, y: any) {
    const x2 = (this as any).settings.cellSize * (x + y) * (this as any).settings.sinAngle + (this as any).settings.offsetX;
    const y2 = (this as any).settings.height / 2 + (this as any).settings.cellSize * (x - y) * (this as any).settings.cosAngle + (this as any).settings.offsetY;
    return [x2, y2];
};
(board as any).toggle = function (att: any) {
    (board as any).settings[att] = !(board as any).settings[att];
    (board as any).update();
};
