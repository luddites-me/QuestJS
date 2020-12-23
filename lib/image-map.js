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
    mapMarker(loc) {
      return map.polygon(
        loc,
        [
          [0, 0],
          [-5, -25],
          [-7, -20],
          [-18, -45],
          [-20, -40],
          [-25, -42],
          [-10, -18],
          [-15, -20],
        ],
        'stroke:none;fill:black;pointer-events:none;opacity:0.5'
      );
    },
    mapDrawPointOfInterest(point) {
      let s = '<g>';
      s += `<text x="${point.mapX / QuestJs._settings.mapScale + 18}" y="${
        point.mapY / QuestJs._settings.mapScale - 23
      }" fill="${point.fill}">`;
      s += `${point.text}</text>`;
      s += map.polygon(
        {
          mapX: point.mapX / QuestJs._settings.mapScale,
          mapY: point.mapY / QuestJs._settings.mapScale,
        },
        [
          [0, 0],
          [5, -12],
          [7, -10],
          [18, -22],
          [20, -20],
          [25, -21],
          [10, -9],
          [15, -10],
        ],
        'stroke:none;fill:black;pointer-events:none;opacity:0.5'
      );
      s += '</g>';
      return s;
    },
  },
};

map.defaultStyle = { position: 'fixed', display: 'block' };
QuestJs._IO.modulesToUpdate.push(map);
QuestJs._IO.modulesToInit.push(map);

map.init = function () {
  // First set up the HTML page
  $('#quest-map').css(map.defaultStyle);
  $('#quest-map').css(QuestJs._settings.mapStyle);
  $('<style>')
    .prop('type', 'text/css')
    .html(
      `.map-text ${QuestJs._util.dictionaryToCss(
        QuestJs._settings.mapLabelStyle,
        true,
      )}`,
    )
    .appendTo('head');
  $('.map-text').css('color', 'red');
  QuestJs._settings.mapHeight = parseInt(QuestJs._settings.mapStyle.height);
  QuestJs._settings.mapWidth = parseInt(QuestJs._settings.mapStyle.width);

  // Set the default values for settings
  for (const key in map.defaults) {
    if (!settings[key]) settings[key] = map.defaults[key];
  }

  map.questMapDiv = document.getElementById('quest-map');
  map.questMapDiv.addEventListener('mouseup', map.mouseDoneEvent);
  map.questMapDiv.addEventListener('mouseleave', map.mouseDoneEvent);
  map.questMapDiv.addEventListener('wheel', (e) => {
    e.preventDefault();
    QuestJs._settings.mapScale -=
      (e.deltaY * -0.01 * QuestJs._settings.mapScale) / 4;
    QuestJs._settings.mapScale = Math.min(
      Math.max(0.2, QuestJs._settings.mapScale),
      2.5,
    );
    map.redraw();
  });
  map.questMapDiv.addEventListener('mousedown', (e) => {
    map.mouseX = e.offsetX;
    map.mouseY = e.offsetY;
    map.mouseMoving = true;
  });
  map.questMapDiv.addEventListener('mousemove', (e) => {
    if (!map.mouseMoving) return;
    // QuestJs._log.info('@' + (e.offsetX - map.mouseX) + ',' + (e.offsetY - map.mouseY))
    map.redraw(map.mouseX - e.offsetX, map.mouseY - e.offsetY);
  });
};

map.mouseDoneEvent = function (e) {
  if (!map.mouseMoving) return;
  map.mouseMoving = false;
  // QuestJs._log.info('#' + (e.offsetX - map.mouseX) + ',' + (e.offsetY - map.mouseY))
  QuestJs._settings.mapOffsetX += map.mouseX - e.offsetX;
  QuestJs._settings.mapOffsetY += map.mouseY - e.offsetY;
  map.redraw();
};

map.update = function () {
  QuestJs._settings.mapOffsetX = 0;
  QuestJs._settings.mapOffsetY = 0;
  QuestJs._settings.mapScale = 1;
  map.redraw();
};

// Draw the map
// It collects all the SVG in five lists, which are effectively layers.
// This means all the exits appear in one layer, all the labels in another
// and so labels are always on top of exits
map.redraw = function (offX, offY) {
  // grab the current room region and level. If the room is missing either, give up now!
  if (QuestJs._w[QuestJs._game.player.loc].mapX)
    QuestJs._game.player.mapX =
      QuestJs._w[QuestJs._game.player.loc].mapX / QuestJs._settings.mapScale;
  if (QuestJs._w[QuestJs._game.player.loc].mapY)
    QuestJs._game.player.mapY =
      QuestJs._w[QuestJs._game.player.loc].mapY / QuestJs._settings.mapScale;
  if (QuestJs._w[QuestJs._game.player.loc].mapRegion)
    QuestJs._game.player.mapRegion =
      QuestJs._w[QuestJs._game.player.loc].mapRegion;

  if (!QuestJs._game.player.mapRegion)
    QuestJs._game.player.mapRegion = QuestJs._settings.mapImages[0].name;
  const mapImage = QuestJs._settings.mapImages.find(
    (el) => el.name === QuestJs._game.player.mapRegion,
  );
  if (!mapImage)
    return QuestJs._io.errormsg(
      `Failed to find a map region called '${QuestJs._game.player.mapRegion}'`,
    );

  const result = [];
  result.push('<g id="map-top">');
  result.push(
    `<image width="${mapImage.width / QuestJs._settings.mapScale}" height="${
      mapImage.height / QuestJs._settings.mapScale
    }", x="0", y="0" href="${mapImage.file}"/>`,
  );
  result.push(QuestJs._settings.mapMarker(QuestJs._game.player));

  for (const point of QuestJs._settings.mapPointsOfInterest) {
    if (!point.mapRegion) point.mapRegion = QuestJs._settings.mapImages[0].name;
    if (point.mapRegion !== QuestJs._game.player.mapRegion) continue;
    if (!point.isActive || point.isActive())
      result.push(QuestJs._settings.mapDrawPointOfInterest(point));
  }
  result.push('</g>');

  let offsetX = QuestJs._settings.mapOffsetX - QuestJs._settings.mapWidth / 2;
  if (offX) offsetX += offX;
  let offsetY = QuestJs._settings.mapOffsetY - QuestJs._settings.mapHeight / 2;
  if (offY) offsetY += offY;

  // Centre the view on the player, and draw it
  const x = QuestJs._game.player.mapX + offsetX;
  const y = QuestJs._game.player.mapY + offsetY;
  QuestJs._io.draw(
    QuestJs._settings.mapWidth,
    QuestJs._settings.mapHeight,
    result,
    {
      destination: 'quest-map',
      x,
      y,
      background: 'black',
    },
  );
};

map.polygon = function (room, points, attrs) {
  return map.polyany('polygon', room, points, attrs);
};
map.polyline = function (room, points, attrs) {
  return map.polyany('line', room, points, attrs);
};

map.polyany = function (type, room, points, attrs) {
  let s = `<poly${type === 'line' ? 'line' : 'gon'} points="`;
  s += points
    .map((el) => `${room.mapX + el[0]},${room.mapY + el[1]}`)
    .join(' ');
  s += '" ';
  if (attrs) s += ` style="${attrs}"`;
  s += '/>';
  // QuestJs._log.info(s)
  return s;
};

QuestJs._command.findCmd('Map').script = function () {
  if (QuestJs._settings.hideMap) {
    $('#quest-map').show();
    delete QuestJs._settings.hideMap;
  } else {
    $('#quest-map').hide();
    QuestJs._settings.hideMap = true;
  }
  QuestJs._IO.calcMargins();
  QuestJs._io.msg(QuestJs._lang.done_msg);
};
