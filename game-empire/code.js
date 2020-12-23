const takeATurn = function () {
  QuestJs._io.msg('Time passes...');
};

/*
const word = {}
word.start = ['', '', 'b', 'c', 'ch', 'd', 'c', 'ch', 'd', 'f', 'fl', 'fr', 'g', 'l', 'm', 'n', 'p', 'pl', 'pr', 'r', 's', 'sl', 'st', 'sh', 't', 'tr', 'v', 'y']
word.middle = ['a', 'aa', 'ai', 'e', 'ea', 'ei', 'i', 'ie', 'o', 'oa', 'oe', 'ou', 'oo', 'u', 'ui', 'ue']
word.end = ['', '', 'b', 'mb', 'ck', 'ch', 'rk', 'd', 'nd', 'rd', 'gg', 'ng', 'gh', 'l', 'll', 'm', 'n', 'pp', 'mp', 'r', 'ss', 'sh', 't', 'rt', 'th']
word.syllable = function() { return QuestJs._random.fromArray(this.start) + QuestJs._random.fromArray(this.middle) + QuestJs._random.fromArray(this.end) }
word.word = function() {
  let s = ''
  for (let i = QuestJs._random.int(2,4); i > 0; i -= 1) s += this.syllable()
  return s
}
for (let i = 0; i < 20; i += 1) QuestJs._log.info(word.word())
*/

QuestJs._settings.startingDialogDisabled = true;

QuestJs._settings.professions = [
  'Alchemist',
  'Baronet',
  'Farm hand',
  'Glass blower',
  'Merchant',
  'Priest',
  'Prostitute',
];

$(() => {
  if (QuestJs._settings.startingDialogDisabled) {
    const p = QuestJs._game.player;
    p.job = 'Merchant';
    p.isFemale = true;
    p.alias = 'Shaala';
    return;
  }
  const diag = $('#dialog');
  diag.prop('title', 'Who are you?');
  let s;
  s = '<p>Name: <input id="namefield" type="text" value="Zoxx" /></p>';
  s += '<p>King: <input type="radio" id="male" name="sex" value="male">&nbsp;&nbsp;&nbsp;&nbsp;';
  s += 'Queen<input type="radio" id="female" name="sex" value="female" checked></p>';
  s += '<p>Background:<select id="job">';
  for (const profession of QuestJs._settings.professions) {
    s += `<option value="${profession}">${profession}</option>`;
  }
  s += '</select></p>';

  diag.html(s);
  diag.dialog({
    modal: true,
    dialogClass: 'no-close',
    width: 400,
    height: 300,
    buttons: [
      {
        text: 'OK',
        click() {
          $(this).dialog('close');
          const p = QuestJs._game.player;
          p.job = $('#job').val();
          p.isFemale = $('#female').is(':checked');
          p.alias = $('#namefield').val();
          if (QuestJs._settings.textInput) {
            $('#textbox').focus();
          }
          QuestJs._log.info(p);
        },
      },
    ],
  });
});

QuestJs._commands.push(
  new QuestJs._command.Cmd('Sleep', {
    regex: /^sleep$/,
    script() {
      if (QuestJs._game.player.loc === 'royal_bedroom') {
        takeATurn();
        return QuestJs._world.SUCCESS;
      }
      QuestJs._io.metamsg('You can only sleep in the bedroom');
      return QuestJs._world.FAILED;
    },
  }),
);
