QuestJs._settings.title = 'Quest 6 Map Demo';
QuestJs._settings.author = 'The Pixie';
QuestJs._settings.version = '0.1';
QuestJs._settings.thanks = [];
QuestJs._settings.warnings = 'No warnings applicable to this QuestJs._game.';
QuestJs._settings.playMode = 'dev';
QuestJs._settings.reportAllSvg = true;

QuestJs._settings.libraries.push('node-map');
QuestJs._settings.mapAndImageCollapseAt = 1000;
QuestJs._settings.mapShowNotVisited = true;
QuestJs._settings.mapCellSize = 32;
QuestJs._settings.mapScale = 50;
QuestJs._settings.mapDrawLabels = true;
QuestJs._settings.mapLabelStyle = { 'font-size': '8pt', 'font-weight': 'bold' };
QuestJs._settings.mapLabelColour = 'blue';
QuestJs._settings.mapLabelRotate = -20;
QuestJs._settings.mapLabelOffset = -5;
QuestJs._settings.mapStyle = {
  right: '0',
  top: '200px',
  width: '400px',
  height: '400px',
  'background-color': '#ddd',
  border: '3px black solid',
  'background-image': 'url(game-map/paper.jpg)',
};
QuestJs._settings.mapClick = function (name) {
  QuestJs._io.metamsg(`You clicked on ${QuestJs._w[name].alias}`);
};
QuestJs._settings.mapAutomapFrom = ['street_middle', 'glade'];
QuestJs._settings.mapMarker = function (loc) {
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
    'stroke:none;fill:black;pointer-events:none;opacity:0.3'
  );
};
QuestJs._settings.mapExtras = function () {
  const result = [];
  const room = QuestJs._w[QuestJs._game.player.loc];
  /* for (let o of [QuestJs._w.Robot, QuestJs._w.Lara, QuestJs._w.Kyle]) {
    if (QuestJs._w[o.loc].mapZ !== room.mapZ || QuestJs._w[o.loc].mapRegion !== room.mapRegion) continue
    result.push(o.mapDrawBase())
  } */
  result.push(
    map.polygon(
      room,
      [
        [150, 100],
        [147, 117],
        [130, 120],
        [147, 123],
        [150, 160],
        [153, 123],
        [170, 120],
        [153, 117],
      ],
      'stroke:black;fill:yellow;'
    ),
  );
  result.push(map.text(room, 'N', [150, 100], 'fill:black;font-size:14pt'));
  return result;
};
