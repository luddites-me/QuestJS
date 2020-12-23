const cloakHere = function () {
  if (QuestJs._w.cloak.isAtLoc('me')) return true;
  if (QuestJs._w.cloak.isHere()) return true;
  if (QuestJs._w.cloak.isAtLoc('hook') && QuestJs._game.player.isAtLoc('cloakroom')) return true;
  return false;
};

QuestJs._lang.no_smell = 'It smells slightly musty.';

QuestJs._lang.no_listen = 'It is quiet as the grave...';

QuestJs._tp.addDirective('cloakHere', (arr, params) => (cloakHere() ? arr[0] : arr[1]));

QuestJs._command.findCmd('MetaCredits').script = function () {
  QuestJs._io.metamsg(
    'This game was created by The Pixie, following the Cloak of Darkness specification by Roger Firth.',
  );
};

QuestJs._command.findCmd('MetaHelp').script = function () {
  QuestJs._io.metamsg('Just type stuff at the prompt!');
};

QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'lobby',
  regex: /^(me|myself|player)$/,
  examine: 'Just a regular guy.',
});

QuestJs._create.createItem('cloak', QuestJs._templates.WEARABLE(), {
  examine: 'The cloak is black... Very black... So black it seems to absorb light.',
  worn: true,
  loc: 'me',
});

QuestJs._create.createRoom('lobby', {
  desc:
    "There is something oppressive about the {cloakHere:dark:dingy} {once:room}{notOnce:foyer}; a presence in the air that almost suffocates you. It's former glory has all but faded; the walls still sport old posters from productions that ended over twenty years ago. Paint is peeling, dust is everywhere and it smells decidedly musty. You can see doors to the north, west and south.",
  beforeFirstEnter() {
    QuestJs._io.msg(
      'You hurry through the night, keen to get out of the rain. Ahead, you can see the old opera house, a brightly-lit beacon of safety.',
    );
    QuestJs._io.msg(
      'Moments later you are pushing though the doors into the foyer. Now that you are here it does not seem so bright. The doors close behind you with an ominous finality...',
    );
    QuestJs._io.msg('');
  },
  north: new QuestJs._create.Exit('lobby', {
    use() {
      QuestJs._io.msg(
        'You try the doors out of the opera house, but they are locked. {once:{i:How did that happen?} you wonder.}',
      );
      return false;
    },
  }),
  west: new QuestJs._create.Exit('cloakroom'),
  south: new QuestJs._create.Exit('bar'),
  onSmell: 'It smells of damp and neglect in here.',
});

QuestJs._create.createItem('posters', {
  examine: 'The posters are ripped and peeling off the wall.',
  read:
    "You spend a few minutes reading about the shows they put on twenty-odd years ago.... {i:Die Zauberflöte}... {i:Guillaume Tell}... {i:A Streetcar Named Desire}. Wasn't that a play?",
  scenery: true,
  plural: true,
  loc: 'lobby',
});

QuestJs._create.createRoom('cloakroom', {
  desc() {
    let s = 'The cloakroom is {cloakHere:dimly:brightly} lit, and is little more than a cupboard. ';
    if (QuestJs._w.cloak.isAtLoc('hook')) {
      s += 'Your cloak is hung from the only hook.';
    } else if (QuestJs._w.cloak.isAtLoc(this)) {
      s +=
        'There is a single hook, which apparently was not good enough for you, to judge from the cloak on the floor.';
    } else {
      s += 'There is a single hook, which strikes you as strange for a cloakroom.';
    }
    return `${s} The only way out is back to the east. `;
  },
  east: new QuestJs._create.Exit('lobby'),
});

QuestJs._create.createItem('hook', QuestJs._templates.SURFACE(), {
  regex: /^peg$/,
  hookable: true,
  scenery: true,
  examine() {
    if (QuestJs._w.cloak.isAtLoc('hook')) {
      QuestJs._io.msg('An ornate brass hook, with a cloak hanging from it.');
    } else {
      QuestJs._io.msg('An ornate brass hook, ideal for hanging cloaks on.');
    }
  },
  loc: 'cloakroom',
});

QuestJs._create.createRoom('bar', {
  desc() {
    if (cloakHere()) {
      return 'It is too dark to see anything except the door to the north.';
    }
    return 'The bar is dark, and somehow brooding. It is also thick with dust. So much so that someone has scrawled a message in the dust on the floor. The only exit is north.';
  },
  beforeEnter() {
    QuestJs._w.message.visible = !cloakHere();
  },
  onExit() {
    QuestJs._w.message.count = 0;
  },
  north: new QuestJs._create.Exit('lobby'),
  onSmell:
    'There is a musty smell, but behind that, something else, something that reminds you of the zoo, perhaps?',
  onListen: 'Is there something moving?',
});

QuestJs._create.createItem('message', {
  regex: /writing|note/,
  count: 0,
  disturbed: 0,
  scenery: true,
  loc: 'bar',
  examine() {
    if (cloakHere()) {
      QuestJs._io.msg('You cannot see any message, it is too dark.');
    }
    if (this.disturbed < 3) {
      QuestJs._io.msg("The message in the dust says 'You have won!'");
    } else {
      QuestJs._io.msg("The message in the dust says 'You have lost!'");
    }
    QuestJs._IO.finish();
  },
  read() {
    this.examine();
  },
  eventPeriod: 1,
  eventIsActive() {
    return QuestJs._game.player.isAtLoc('bar') && !this.finished;
  },
  eventScript() {
    this.count += 1;
    if (this.count > 1) {
      if (this.disturbed === 0) {
        QuestJs._io.msg('You think it might be a bad idea to disturb things in the dark.');
      } else if (!QuestJs._game.player.suppress_background_sounds) {
        QuestJs._io.msg(
          'You can hear {random:scratching:something moving in the dark:rasping breathing}.',
        );
      }
      this.disturbed += 1;
    }
  },
});

QuestJs._create.createItem('walls', {
  examine() {
    if (cloakHere() && QuestJs._game.player.isAtLoc('bar')) {
      QuestJs._io.msg('It is too dark to see the walls.');
    } else {
      QuestJs._io.msg(
        'The walls are covered in a faded red and gold wallpaper, that is showing signs of damp.',
      );
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return QuestJs._w[loc].room && situation === QuestJs._w.PARSER;
  },
});

QuestJs._create.createItem('ceiling', {
  examine() {
    if (cloakHere() && QuestJs._game.player.isAtLoc('bar')) {
      QuestJs._io.msg('It is too dark to see the ceiling.');
    } else {
      QuestJs._io.msg('The ceiling is - or was - white. Now it is a dirty grey.');
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return QuestJs._w[loc].room && situation === QuestJs._w.PARSER;
  },
});

QuestJs._create.createItem('floor', {
  regex: /^carpet$/,
  examine() {
    if (cloakHere() && QuestJs._game.player.isAtLoc('bar')) {
      QuestJs._io.msg('It is too dark to see the floor.');
    } else {
      QuestJs._io.msg('A red carpet covers the floor, worn almost though in places.');
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return QuestJs._w[loc].room && situation === QuestJs._w.PARSER;
  },
});

QuestJs._create.createItem('doors', {
  regex: /^carpet$/,
  examine() {
    if (cloakHere() && QuestJs._game.player.isAtLoc('bar')) {
      QuestJs._io.msg('It is too dark to see the door properly.');
    } else {
      QuestJs._io.msg('All the doors are wooden, and painted white.');
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return QuestJs._w[loc].room && situation === QuestJs._w.PARSER;
  },
});

QuestJs._commands.push(
  new QuestJs._command.Cmd('HangUp', {
    regex: /^(hang up|hang) (.+)$/,
    objects: [{ ignore: true }, { scope: QuestJs._parser.isHeld }],
    script(objects) {
      if (!objects[0][0].isAtLoc(QuestJs._game.player)) {
        return failedmsg("You're not carrying {sb:obj}.", { obj: objects[0][0] });
      }
      if (objects[0][0].worn) {
        return failedmsg("Not while you're wearing {sb:obj}!", { obj: objects[0][0] });
      }
      if (!QuestJs._game.player.isAtLoc('cloakroom')) {
        return failedmsg('Hang {sb:obj} where, exactly?', { obj: objects[0][0] });
      }
      objects[0][0].moveToFrom('hook');
      QuestJs._io.msg('You hang {nm:obj:the} on the hook.', { obj: objects[0][0] });
      return QuestJs._w.SUCCESS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HangUp', {
    regex: /^(hang up|hang) (.+) on (|the )hook$/,
    objects: [{ ignore: true }, { scope: QuestJs._parser.isHeld }, { ignore: true }],
    script(objects) {
      if (!objects[0][0].isAtLoc(QuestJs._game.player)) {
        return failedmsg("You're not carrying {sb:obj}.", { obj: objects[0][0] });
      }
      if (objects[0][0].worn) {
        return failedmsg("Not while you're wearing {sb:obj}!", { obj: objects[0][0] });
      }
      if (!QuestJs._game.player.isAtLoc('cloakroom')) {
        return failedmsg('Hang {sb:obj} where, exactly?', { obj: objects[0][0] });
      }
      objects[0][0].moveToFrom('hook');
      QuestJs._io.msg('You hang {nm:obj:the} on the hook.', { obj: objects[0][0] });
      return QuestJs._w.SUCCESS;
    },
  }),
);
