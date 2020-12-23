quest.create('A carrot for Buddy', [
  { text: 'Go find a carrot.' },
  { text: 'Give the carrot to Buddy.' },
]);

function firstTimeTesting() {
  firsttime(
    232646,
    () => {
      QuestJs._io.msg(
        `${QuestJs._tools.spaces(
          5,
        )}{font:trade winds:Te first time 10{sup:2} CH{sub:4} Er {smallcaps:This is small caps}.}`,
      );
    },
    () => {
      QuestJs._io.msg(
        'Every {huge:other} {big:time} betweeb {small:is} {tiny:very small} notmasl.',
      );
    },
  );
  const a = ['one', 'two', 'three'];
  QuestJs._log.info(a);
  QuestJs._array.remove(a, 'two');
  QuestJs._log.info(a);
  QuestJs._array.remove(a, 'three');
  QuestJs._log.info(a);
  QuestJs._array.remove(a, 'three');
  QuestJs._log.info(a);
  QuestJs._array.remove(a, 'one');
  QuestJs._log.info(a);
}

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('Test input', {
    npcCmd: true,
    rules: [QuestJs.cmdRules.isHere],
    regex: /^inp/,
    script() {
      QuestJs._io.msg('First some preamble...');
      QuestJs._io.showMenu(
        'What colour?',
        [QuestJs._w.book, QuestJs._w.coin, QuestJs._w.Kyle, 'None of them'],
        (result) => {
          if (typeof result === 'string') {
            QuestJs._io.msg(`You picked ${result}.`);
          } else {
            QuestJs._io.msg(
              `You picked ${QuestJs._lang.getName(result, { article: QuestJs._consts.DEFINITE })}.`,
            );
          }
        },
      );
      /*    QuestJs._io.askQuestion("What colour?", function(result) {
      QuestJs._io.msg("You picked " + result + ".");
      QuestJs._io.showYesNoMenu("Are you sure?", function(result) {
        QuestJs._io.msg("You said " + result + ".")
      })
    }) */
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('TextReveal', {
    regex: /^reveal$/,
    script() {
      QuestJs._io.msg('Some text');
      QuestJs._io.msg('More');
      QuestJs._io._msg(
        'The characters will appear randomly from dots.',
        {},
        {
          action: 'effect',
          tag: 'p',
          effect: QuestJs._IO.unscrambleEffect,
          randomPlacing: true,
          pick() {
            return '.';
          },
        },
      );
      QuestJs._io.wait();
      QuestJs._io._msg(
        'Or appears as though typed.',
        {},
        { action: 'effect', tag: 'p', effect: QuestJs._IO.typewriterEffect },
      );
      QuestJs._io._msg(
        'The real message is revealed!!',
        {},
        {
          action: 'effect',
          tag: 'pre',
          effect: QuestJs._IO.unscrambleEffect,
          randomPlacing: true,
          incSpaces: true,
          pick(i) {
            return 'At first this message is shown'.charAt(i);
          },
        },
      );
      QuestJs._io.wait();
      QuestJs._io.clearScreen();
      QuestJs._io.msg('Some more text.');
      QuestJs._io.wait(3, 'Wait three seconds...');
      QuestJs._io.msg('... and done!'); /**/
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('Image', {
    regex: /^img$/,
    script() {
      QuestJs._io.msg('Some more text.');
      QuestJs._io.picture('favicon.png');
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('Audio', {
    regex: /^beep$/,
    script() {
      QuestJs._io.msg('Can you hear this?');
      QuestJs._io.sound('hrn06.wav');
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('Alpha', {
    regex: /^alpha$/,
    script() {
      QuestJs._io.msg(
        'Some text in Greek: {encode:391:3AC:The quick brown fox jumped over the lazy dog}.',
      );
      QuestJs._io.msg(
        'Some text in Cyrillic: {encode:402:431:The quick brown fox jumped over the lazy dog}.',
      );
      QuestJs._io.msg(
        'Some text in Armenian {encode:531:561:The quick brown fox jumped over the lazy dog}.',
      );

      QuestJs._io.msg(
        'Some text in Devanagari: {encode:904:904:The quick brown fox jumped over the lazy dog}.',
      );
      QuestJs._io.msg(
        'Some text in Thai {encode:E01:E01:The quick brown fox jumped over the lazy dog}.',
      );
      QuestJs._io.msg(
        'Some text in Tibetan {encode:F20:F20:The quick brown fox jumped over the lazy dog}.',
      );
      QuestJs._io.msg(
        'Some text in Khmer {encode:1780:1780:The quick brown fox jumped over the lazy dog}.',
      );
      QuestJs._io.msg(
        'Some text in Javan {encode:A985:A985:The quick brown fox jumped over the lazy dog}.',
      );
      QuestJs._io.msg(
        'Some text in Nko {encode:7C1:7C1:The quick brown fox jumped over the lazy dog}.',
      );
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('EgKick', {
    npcCmd: true,
    rules: [QuestJs.cmdRules.isHere],
    regex: /^(kick) (.+)$/,
    objects: [{ ignore: true }, { scope: QuestJs._parser.isPresent }],
    default(item, isMultiple, char) {
      return QuestJs._io.failedmsg(
        `${
          QuestJs._tools.prefix(this, isMultiple) + QuestJs._lang.pronounVerb(char, 'kick', true)
        } ${this.pronouns.objective}, but nothing happens.`,
      );
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('EgCharge', {
    npcCmd: true,
    rules: [QuestJs.cmdRules.isHeld],
    regex: /^(charge) (.+)$/,
    objects: [{ ignore: true }, { scope: QuestJs._parser.isHeld }],
    default(item, isMultiple, char) {
      return QuestJs._io.failedmsg(
        `${
          QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.pronounVerb(item, "'be", true)
        } not something you can charge.`,
      );
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('EgMove', {
    npcCmd: true,
    rules: [QuestJs.cmdRules.isHere],
    regex: /^(move) (.+)$/,
    objects: [{ ignore: true }, { scope: QuestJs._parser.isHere }],
    default(item, isMultiple, char) {
      return QuestJs._io.failedmsg(
        `${
          QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.pronounVerb(item, "'be", true)
        } not something you can move.`,
      );
    },
  }),
);

QuestJs._command.findCmd('MetaHint').script = function () {
  if (QuestJs._w[QuestJs._game.player.loc].hint) {
    QuestJs._io.metamsg(QuestJs._w[QuestJs._game.player.loc].hint);
  } else {
    return QuestJs._lang.hintScript();
  }
};

const clues = [
  {
    question: 'How do I get the hat?',
    clues: [
      'What is the lamp for?',
      'What happens if you rub the lamp?',
      'Rub the lamp, and ask the genie.',
    ],
  },
  {
    question: 'Where is the bear?',
    clues: ['In the lounge, where you started.'],
  },
];

// How to save???
QuestJs._command.findCmd('MetaHint').script = function () {
  for (const clue of clues) {
    if (clue.count === undefined) clue.count = 0;
    QuestJs._io.metamsg(clue.question);
    for (let i = 0; i < clue.clues.length; i += 1) {
      if (i < clue.count) {
        QuestJs._io.metamsg(clue.clues[i]);
      } else {
        // hidden!!!
        QuestJs._io.metamsg(clue.clues[i]);
      }
    }
  }
};

QuestJs._tp.addDirective('charger_state', () => {
  if (QuestJs._w.charger_compartment.closed) {
    return 'The compartment is closed';
  }
  const contents = QuestJs._w.charger_compartment.getContents(QuestJs._world.LOOK);
  if (contents.length === 0) {
    return 'The compartment is empty';
  }
  return `The compartment contains ${QuestJs._tools.formatList(contents, {
    article: QuestJs._consts.INDEFINITE,
  })}`;
});
