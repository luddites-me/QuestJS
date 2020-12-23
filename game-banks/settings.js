QuestJs._settings.title = 'The Voyages of The Joseph Banks';
QuestJs._settings.author = 'The Pixie';
QuestJs._settings.version = '0.1';
QuestJs._settings.thanks = ['Kyle', 'Lara'];
QuestJs._settings.warnings =
  'This game does have swearing (including the F-word); it is possible to romance crew mates of either gender, but nothing graphic.';

// UI options
QuestJs._settings.libraries.push('shipwise');
QuestJs._settings.files = ['const', 'code', 'commands', 'text', 'data', 'npcs'];
QuestJs._settings.styleFile = 'style';
QuestJs._settings.noTalkTo =
  'You can talk to an NPC using either {color:red:ASK [name] ABOUT [topic]} or {color:red:TELL [name] ABOUT [topic]}.';
QuestJs._settings.noAskTell = false;
QuestJs._settings.givePlayerAskTellMsg = false;
QuestJs._settings.symbolsForCompass = true;

QuestJs._settings.playMode = 'dev';
QuestJs._settings.tests = true;

QuestJs._settings.dateTime.start = new Date('April 14, 2387 09:43:00');

QuestJs._settings.roomTemplate = [
  '#{cap:{hereName}}',
  '{terse:{hereDesc}}',
  '{objectsHere:You can see {objects} here.}',
];

QuestJs._settings.status = [
  function () {
    return `<td width="55px" title="You receive a bonus for collecting good data"><b>Bonus:</b></td><td width="20px"></td><td align="right"><b>$${QuestJs._game.player.bonus}k</b></td>`;
  },
  function () {
    return QuestJs._settings.statusReport(QuestJs._game.player);
  },
  function () {
    return QuestJs._settings.statusReport(QuestJs._w.Xsansi);
  },
  function () {
    return QuestJs._settings.statusReport(QuestJs._w.Ha_yoon);
  },
  function () {
    return QuestJs._settings.statusReport(QuestJs._w.Kyle);
  },
  function () {
    return QuestJs._settings.statusReport(QuestJs._w.Ostap);
  },
  function () {
    return QuestJs._settings.statusReport(QuestJs._w.Aada);
  },
  function () {
    return `<td colspan="3" style="border:black solid 1px" align="center" title="The current date and time (adjusted for relativistic effects)">${QuestJs._util.getDateTime()}</td>`;
  },
  function () {
    return QuestJs._settings.oxygenReport();
  },
];

QuestJs._settings.colours = ['red', 'yellow', 'blue', 'lime', 'lime', 'grey', 'black'];
QuestJs._settings.colourNotes = [
  'Red indicates something is seriously wrong; action should be taken to avoid death',
  'Yellow indicates cause for concern',
  'Blue indicates less than excellent, but probably no cause for concern',
  'Green indicates excellent',
  'lime',
  'Grey indicates the crewman is in stasis',
  'Black indicates the crewman is dead',
];
QuestJs._settings.intervals = [25, 50, 25, 1, 1000];
QuestJs._settings.intervalDescs = ['worrying', 'fair', 'good', 'perfect'];
QuestJs._settings.statusReport = function (obj) {
  let s;
  let colourCode;
  let tooltip;
  tooltip = `${obj.alias} is `;
  if (!obj.crewman) tooltip += obj.player ? 'the captain of the ship (i.e., you)' : 'the ship AI';
  if (typeof obj.status === 'string') {
    s = obj.status;
    colourCode = s === 'stasis' ? 5 : 6;
    if (obj.crewman) tooltip += s === 'stasis' ? 'in stasis' : 'dead';
  } else {
    s = `${obj.status.toString()}%`;
    colourCode = QuestJs._util.getByInterval(QuestJs._settings.intervals, obj.status);
    if (obj.crewman) tooltip += `in ${QuestJs._w[obj.loc].alias}`;
  }
  return `<td title="${tooltip}"><i>${obj.alias}:</i></td>${QuestJs._settings.warningLight(
    colourCode,
  )}<td align="right">${s}</td>`;
};
QuestJs._settings.oxygenReport = function (obj) {
  // 0.84 kg O2  per day
  // https://ntrs.nasa.gov/citations/20040012725
  // so 0.58 g/m
  QuestJs._log.info(QuestJs._w.ship.oxygen);
  QuestJs._log.info(
    QuestJs._util.getByInterval(QuestJs._settings.intervals, QuestJs._w.ship.oxygen / 50),
  );
  const colourCode = QuestJs._util.getByInterval(
    QuestJs._settings.intervals,
    QuestJs._w.ship.oxygen / 10,
  );
  return `<td title="The ship has a limited amount of oxygen; an adult uses about 6 g every minute, but none while in stasis"><b>Oxygen:</b></td>${QuestJs._settings.warningLight(
    colourCode,
  )}<td align="right"><span style="font-size:0.8em">${(
    Math.round(QuestJs._w.ship.oxygen) / 1000
  ).toFixed(3)} kg</span></td>`;
};

QuestJs._settings.warningLight = function (colourCode) {
  // return "<td style=\"margin:3px;border:black solid 2px; background:" + colour + "\">&nbsp;</td>"

  let s = `<td title="${QuestJs._settings.colourNotes[colourCode]}">`;
  s += '<svg height="12" width="10">';
  s += `<circle cx="5" cy="5" r="5" stroke="black" stroke-width="1" fill="${QuestJs._settings.colours[colourCode]}" />`;
  s += '</svg>';
  s += '</td>';
  return s;
};

QuestJs._settings.inventoryPane = false;

QuestJs._settings.setup = function () {
  arrival();
  $('#map').appendTo('#panes');
  updateMap();
};

QuestJs._settings.updateCustomUI = function () {
  updateMap();
};

QuestJs._settings.onDarkToggle = function () {
  updateMap();
};

const professions = [
  { name: 'Engineer', bonus: 'mech' },
  { name: 'Scientist', bonus: 'science' },
  { name: 'Medical officer', bonus: 'medicine' },
  { name: 'Soldier', bonus: 'combat' },
  { name: 'Computer specialist', bonus: 'computers' },
  { name: 'Dancer', bonus: 'agility' },
  { name: 'Advertising exec', bonus: 'deceit' },
  { name: 'Urban poet', bonus: 'social' },
];

const backgrounds = [
  { name: 'Bored dilettante', bonus: 'social' },
  { name: 'Wannabe explorer', bonus: 'science' },
  { name: 'Fame-seeker', bonus: 'none' },
  { name: 'Debtor', bonus: 'none' },
  { name: 'Criminal escaping justice', bonus: 'deceit' },
  { name: 'Anti-social loner', bonus: 'none' },
  { name: 'Conspiracy crackpot', bonus: 'none' },
  { name: 'Religious fanatic', bonus: 'none' },
];

let s =
  '<p>You are on a mission to survey planets around five stars, the captain of a crew of five (including yourself). There is also a computer system, Xsansi (you can also use "AI" or "computer"), that you can talk to anywhere on the ship. </p><p>Your objective is to maximise your bonus. Collecting data will give a bonus, but geo-data about planets suitable for mining and bio-data about planets suitable for colonisation will give higher bonuses. Evidence of alien intelligence will be especially rewarding!</p><p>You have just arrived at your first destination after years in a "stasis" pod in suspended animation. ASK AI ABOUT MISSION or CREW might be a good place to start, once you have created your character. Later you want to try OSTAP, LAUNCH PROBE or ASK AADA ABOUT PLANET. You can also use HELP if you want more details.</p>';

s += '<table>';
s +=
  '<tr><td>Name:</td><td><input id="namefield" type="text" value="Ariel" style="width:300px" /></td></tr>';
s +=
  '<tr><td>Sex:</td><td>Male: <input type="radio" id="male" name="sex" value="male">&nbsp;&nbsp;&nbsp;&nbsp;';
s += 'Female<input type="radio" id="female" name="sex" value="female" checked></td></tr>';
s += '<tr><td>Profession:</td><td><select id="job" style="width:300px">';
for (const prof of professions) {
  s += `<option value="${prof.name}">${prof.name}</option>`;
}
s += '</select></td></tr>';
s += '<tr><td>Background:</td><td><select id="background" style="width:300px">';
for (const back of backgrounds) {
  s += `<option value="${back.name}">${back.name}</option>`;
}
s += '</select></td></tr></table>';

// QuestJs._settings.startingDialogEnabled = true
QuestJs._settings.startingDialogTitle = 'To start with...';
QuestJs._settings.startingDialogWidth = 555;
QuestJs._settings.startingDialogHeight = 565;
QuestJs._settings.startingDialogHtml = s;
QuestJs._settings.startingDialogOnClick = function () {
  const p = QuestJs._game.player;
  const jobName = $('#job').val();
  const job = professions.find((el) => el.name === jobName);
  QuestJs._w.me.job = job.name;
  QuestJs._w.me.jobBonus = job.bonus;
  const backgroundName = $('#background').val();
  const background = backgrounds.find((el) => el.name === backgroundName);
  QuestJs._w.me.background = background.name;
  QuestJs._w.me.backgroundBonus = background.bonus;
  QuestJs._w.me.isFemale = $('#female').is(':checked');
  QuestJs._w.me.alias = $('#namefield').val();
};
QuestJs._settings.startingDialogInit = function () {
  $('#namefield').focus();
};
QuestJs._settings.startingDialogAlt = function () {
  QuestJs._w.me.job = professions[0].name;
  QuestJs._w.me.jobBonus = professions[0].bonus;
  QuestJs._w.me.isFemale = true;
  QuestJs._w.me.alias = 'Shaala';
};
