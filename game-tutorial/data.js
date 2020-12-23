QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'lounge',
  regex: /^(me|myself|player)$/,
  examine: 'Just a regular guy.',
  hitpoints: 100,
  hintCounter: 0,
});

QuestJs._create.createItem('usb_stick', {
  alias: 'USB stick',
  examine: 'A plain black USB stick; you can download the files on to this.',
  loc: 'me',
});

QuestJs._create.createItem('fist', {
  alias: 'fist',
  regex: /fist|hand|arm/,
  examine: 'That funny shaped thing on the end of your arm.',
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return situation === QuestJs._world.PARSER && loc === 'me';
  },
});

QuestJs._create.createRoom('lounge', {
  desc:
    'The lounge is pleasant, if rather bare. There is a{if:kitchen_door:locked: locked} door to the north. A door to the west leads to the lift.',
  afterFirstEnter() {
    QuestJs._io.msg(
      'The man you need to find is upstairs, but the lift does not work - it has no power. How can you get to him?',
    );
    tmsg(
      'This is the first room, and the text is telling you about it. If there were things here, you would probably be told about them in the room description, but we will come on to that later. You will also usually be told of any exits. This room has an exit north, but it is currently locked.',
    );
    tmsg('We will get to the lift later.');
    tmsg(
      'Before going any further, we should look at what is on the screen. Below this text, you should see a cursor. In this game it is a > sign, but other games might use different symbols or have a box. You type commands in there. Try it now by typing WAIT (I am going to write commands for you to type in capitals to diffentiate them; you do not need to).',
    );
  },
  north: new QuestJs._create.Exit('kitchen'),
  west: new QuestJs._create.Exit('lift', {
    isLocked() {
      return !QuestJs._w.reactor_room.reactorRunning;
    },
  }),
  eventPeriod: 1,
  eventActive: true,
  eventCount: 0,
  eventScript() {
    this.eventCount += 1;
    switch (this.eventCount) {
      case 1:
        tmsg(
          'Typing WAIT made time pass in the game, while the player-character did nothing. You can also just type Z, which is a shortcut for WAIT.',
        );
        tmsg(
          'Look to the left, and you will see a panel; you can perform a lot of actions here without typing anything at all. In some games it is on the right, and many do not have it at all, so we will mostly ignore it, but for now click the &#9208; to again wait one turn.',
        );
        QuestJs._io.ambient('Light-Years_V001_Looping', 5);
        break;
      case 2:
        tmsg(
          'Some games have commands that tell you about the game or set it up differently to suit the player. In Quest 6 (but not necessarily other games) none of these count as a turn, so try a couple, and when you are done, do WAIT again.',
        );
        tmsg(
          'Type DARK to toggle dark mode; some users find if easier to see light text on a dark background. Type SPOKEN to toggle hearing the text read out. Type SILENT to toggle the sounds and music (not that there are any in this game).',
        );
        tmsg(
          'You can also type HELP to see some general instructions. You can also do ABOUT or CREDITS. Less common is the HINT command; if implemented it will give you a clue of what to do next. In this game, as it is a tutorial, it will tell you exactly what to do.',
        );
        tmsg(
          "For completeness, I will also mention TRANSCRIPT (or just SCRIPT), which will record your game session, and can be useful when testing someone's QuestJs._game. You can also use BRIEF, TERSE and VERBOSE to control how often room descriptions are shown, but I suggest we keep it VERBOSE for this tutorial.",
        );
        QuestJs._io.ambient();
        break;
      case 3:
        QuestJs._w.kitchen_door.locked = false;
        tmsg('Time to move on. Something tells me that door to the north is not locked any more.');
        tmsg(
          'You might want to look at the room again before we go. Type LOOK or just L. Hopefully it no longer says the door is locked. By the way, in some games you can use the EXITS commands to see what exits are available.',
        );
        tmsg(
          'Movement in adventure games is done following compass directions. To go north, type GO NORTH, or NORTH or just N.',
        );
        tmsg(
          'You can also use the compass rose at the top left, or, in Quest 6, if your computer has a number pad, ensure "Num Lock" is on, and press the up key (i.e., 8).',
        );
        tmsg('So I will see you in the next room...');
        hint.now('northToKitchen');
        QuestJs._io.sound('Bells4');
        break;
    }
  },
});

QuestJs._create.createRoom('kitchen', {
  desc: 'The kitchen looks clean and well-equipped.',
  afterFirstEnter() {
    hint.now('neToGarden');
  },
  south: new QuestJs._create.Exit('lounge'),
  down: new QuestJs._create.Exit('basement'),
  in: new QuestJs._create.Exit('larder'),
  northeast: new QuestJs._create.Exit('garden'),
});

QuestJs._create.createItem(
  'kitchen_door',
  QuestJs._templates.LOCKED_DOOR([], 'lounge', 'kitchen'),
  {
    examine: 'It is plain, wooden door, painted white.',
  },
);

QuestJs._create.createRoom('basement', {
  desc:
    'A dank room, with a whole load of crates piled {ifNot:crates:moved:against the west wall}{if:crates:moved:up in the middle of the room. There is a door to the west}. Cobwebs hang from every beam.',
  darkDesc: 'The basement is dark and full of cobwebs. The only way out is back up the ladder.',
  up: new QuestJs._create.Exit('kitchen', {
    isHidden() {
      return false;
    },
  }),
  west: new QuestJs._create.Exit('secret_passage', {
    isHidden() {
      return (
        !QuestJs._w.crates.moved ||
        (!QuestJs._w.light_switch.switchedon && !QuestJs._w.flashlight.switchedon)
      );
    },
  }),
  lightSource() {
    return QuestJs._w.light_switch.switchedon
      ? QuestJs._world.LIGHT_FULL
      : QuestJs._world.LIGHT_NONE;
  },
  eventPeriod: 1,
  eventIsActive() {
    return QuestJs._w.me.loc === this.name;
  },
  eventScript() {
    if (QuestJs._w.flashlight.switchedon && !this.flag1) hint.now('turnOnLight');
    if (!QuestJs._w.flashlight.switchedon && QuestJs._w.light_switch.switchedon && !this.flag2)
      hint.now('getAll');
    if (QuestJs._parser.currentCommand.all && hint.before('moveCrates')) hint.now('moveCrates');
  },
});

QuestJs._create.createItem('light_switch', QuestJs._templates.SWITCHABLE(false), {
  loc: 'basement',
  examine: 'A switch, presumably for the light.',
  regex: /light|switch/,
});

QuestJs._create.createItem('crates', {
  loc: 'basement',
  examine: 'A bunch of old crates.',
  pronouns: QuestJs._lang.pronouns.plural,
  move() {
    if (!this.moved) {
      QuestJs._io.msg('You move the crates... And find a passage was hidden behind them.');
      hint.now('enterPassage');
      this.moved = true;
      return true;
    }
    QuestJs._io.msg(
      'You feel pretty sure moving the crates again will not reveal any more hidden doors.',
    );
    return false;
  },
  take(isMultiple, char) {
    QuestJs._io.msg(
      `${QuestJs._tools.prefix(
        this,
        isMultiple,
      )}The crates are too heavy to pick... But you might be able to move them.`,
    );
    return false;
  },
});

QuestJs._create.createItem('cobwebs', {
  examine() {
    QuestJs._io.msg(
      'There are a lot! You wonder if it is worse if there are a thousand spiders down here... Or just one very big one.',
    );
    if (!this.flag) {
      tmsg(
        "I felt embarrassed about the cobwebs not being implemented, now you can look at them to your heart's content.",
      );
      this.flag = true;
    }
  },
  take(isMultiple, char) {
    QuestJs._io.msg(
      `${QuestJs._tools.prefix(
        this,
        isMultiple,
      )}The cobwebs just disintegrate when you try to take them.`,
    );
    return false;
  },
  scenery: true,
});

QuestJs._create.createItem('old_newspaper', QuestJs._templates.TAKEABLE(), READABLE(), {
  examine: 'A newspaper from the eighties; yellow with age.',
  read:
    'You spend a few minutes reading about what happens on the day 14th June 1987 (or perhaps the day before). A somewhat mocking article about an archaeologist, Dr Ruudhorn, and Atlantis catches your eye.',
  loc: 'basement',
});

QuestJs._create.createItem('rope', QuestJs._templates.ROPE(false), {
  examine: 'About 25 foot long; it looks old, but serviceable.',
  loc: 'basement',
  ropeLength: 5,
});

QuestJs._create.createItem('apple', QuestJs._templates.EDIBLE(), {
  examine: 'A rosy red apple.',
  loc: 'basement',
});

QuestJs._create.createRoom('larder', {
  desc: 'Oh, dear, the larder is empty!',
  out: new QuestJs._create.Exit('kitchen'),
});

QuestJs._create.createRoom('garden', {
  desc: 'The garden is basically a few square feet of grass.',
  southwest: new QuestJs._create.Exit('kitchen'),
  afterFirstEnter() {
    hint.now('getHat');
  },
  east: new QuestJs._create.Exit('shed', {
    alsoDir: ['in'],
    use() {
      if (QuestJs._w.shed_door.locked) {
        QuestJs._io.msg(
          'You shed door is padlocked. If only you have something to break it off...',
        );
        return false;
      }
      QuestJs._io.msg('You walk into the shed.');
      QuestJs._world.setRoom(QuestJs._w.me, 'shed');
      return true;
    },
  }),
  onSmell() {
    QuestJs._io.msg('You can smell the freshly-cut grass!');
    if (hint.before('xBox')) {
      tmsg('You can also smell specific items, so SMELL GRASS would have also worked.');
      QuestJs._io.msg(
        'A large wooden box falls from the sky! Miraculously, it seems to have survived intact.',
      );
      tmsg(
        'The box is a container, which means you can put things inside it and maybe find things already in it. Perhaps we should start by looking at it.',
      );
      QuestJs._w.box.loc = 'garden';
      hint.now('xBox');
    }
  },
});

QuestJs._create.createItem('hat', QuestJs._templates.WEARABLE(), {
  examine: 'It is straw boater, somewhat the worse for wear.',
  loc: 'garden',
  onMove(toLoc) {
    if (!this.flag1 && toLoc === 'me') hint.now('wearHat');
  },
  onWear() {
    if (!this.flag2) hint.now('xGrass');
  },
});

QuestJs._create.createItem('grass', {
  examine() {
    QuestJs._io.msg('The grass is green, and recently cut.');
    hint.now('smell');
  },
  loc: 'garden',
  scenery: true,
  smell() {
    QuestJs._io.msg('You can smell the grass; it has just been cut!');
    if (hint.before('xBox')) {
      tmsg('You can also smell the whole location, so just SMELL would have also worked.');
      QuestJs._io.msg(
        'A large wooden box falls from the sky! Miraculously, it seems to have survived intact.',
      );
      tmsg(
        'The box is a container, which means you can put things inside it and maybe find things already in it. Perhaps we should start by looking at it.',
      );
      QuestJs._w.box.loc = 'garden';
      hint.now('xBox');
    }
  },
});

QuestJs._create.createItem(
  'box',
  READABLE(),
  QuestJs._templates.CONTAINER(true),
  QuestJs._templates.LOCKED_WITH([]),
  {
    examine() {
      const tpParams = { char: QuestJs._game.player, container: this };
      tpParams.list = this.listContents(QuestJs._world.LOOK);
      QuestJs._io.msg(
        'It is large, wooden box. It does not look very substantial, but it survived the fall nevertheless. There is a label on the {ifNot:box:closed:open }lid.',
      );
      if (!this.closed) QuestJs._io.msg(QuestJs._lang.look_inside, tpParams);
      if (!this.flag2) hint.now('readBox');
    },
    regex: /crate|label|lid/,
    read() {
      QuestJs._io.msg(
        'The label says: "The Hat and Crowbar Company - exchanging hats for crowbars since 2020."',
      );
      hint.now('openBox');
      this.locked = false;
    },
    closeMsg() {
      if (this.loc && QuestJs._w.hat.loc === 'box' && QuestJs._w.crowbar.loc !== 'box') {
        QuestJs._io.msg(
          "You close the lid. 'Thank you for your custom!' says the box. It starts to shake violently then leaps into the air, rapidly disappearing from sight.",
        );
        hint.now('hatInBox');
        delete this.loc;
      } else {
        QuestJs._io.msg(
          "'Hey!' exclaims a voice from the box, 'where's my hat?' The lid flips back open.",
        );
        this.closed = false;
      }
    },
  },
);

QuestJs._create.createItem('crowbar', QuestJs._templates.TAKEABLE(), {
  examine: 'A cheap plastic crowbar; it is red, white, blue and yellow.',
  loc: 'box',
  onMove(toLoc) {
    if (toLoc === 'me') hint.now('crowbar');
  },
  use(isMultiple, char) {
    if (char.loc === 'laboratory' && QuestJs._w.lab_door.locked) {
      QuestJs._io.msg('The crowbar is not going to help open that door.');
      tmsg('Nice try, but you have to get the robot to open this door, not the crowbar.');
      return false;
    }
    if (char.loc === 'office' && QuestJs._w.lab_door.locked) {
      QuestJs._io.msg('Use it on what?');
      return false;
    }
    if (char.loc !== 'garden')
      return QuestJs._io.falsemsg('There is nothing to use the crowbar on here.');
    return QuestJs._w.shed_door.crowbar();
  },
});

QuestJs._create.createItem('shed_door', {
  examine:
    'The shed is metal, a kind of beige colour{if:shed_door:locked:; the door is padlocked... but the padlock does not look that strong}.',
  loc: 'garden',
  locked: true,
  scenery: true,
  crowbar() {
    if (!this.locked) return QuestJs._io.falsemsg('The padlock is already off the lock.');
    QuestJs._io.msg('You put the crowbar to the padlock, and give a pull. The padlock breaks.');
    this.locked = false;
    return true;
  },
});

QuestJs._create.createRoom('shed', {
  desc:
    'The shed is disappointingly empty{if:flashlight:scenery:, apart from a torch in the far corner}.',
  afterFirstEnter() {
    hint.now('getTorch');
  },
  west: new QuestJs._create.Exit('garden', { alsoDir: ['out'] }),
});

QuestJs._create.createItem(
  'flashlight',
  QuestJs._templates.TAKEABLE(),
  QuestJs._templates.SWITCHABLE(false, 'providing light'),
  {
    loc: 'shed',
    scenery: true,
    examine: 'A small red torch.',
    parserAltNames: ['torch'],
    lightSource() {
      return this.switchedon ? QuestJs._world.LIGHT_FULL : QuestJs._world.LIGHT_NONE;
    },
    onMove(toLoc) {
      if (!this.flag1 && toLoc === 'me') {
        hint.now('torchOn');
        QuestJs._w.cobwebs.loc = 'basement';
      }
      this.flag1 = true;
    },
  },
);

QuestJs._create.createRoom('secret_passage', {
  desc: 'The passage heads west.',
  afterFirstEnter() {
    if (QuestJs._w.me.alreadySaved) {
      tmsg(
        "I {i:was} going to go though saving and loading at this point, but you've done that already, so we'll just press on.",
      );
      hint.now('westRobot');
    } else {
      hint.now('save');
    }
  },
  east: new QuestJs._create.Exit('basement'),
  west: new QuestJs._create.Exit('laboratory'),
});

QuestJs._create.createRoom('laboratory', {
  desc:
    'This is a laboratory of some sort. The room is full of screens and instruments, but you cannot tell what sort of science is being done here. There is a big steel door {ifNot:lab_door:closed:lying open }to the north{if:lab_door:closed:; you feel pretty sure it will be too heavy for you to open}.',
  afterFirstEnter() {
    if (hint.before('saveGame')) tmsg('Okay, so not bothering with saving...');
    hint.now('westRobot');
  },
  afterEnter() {
    hint.now('rGoNorth');
  },

  lab_door_locked: true,
  east: new QuestJs._create.Exit('secret_passage'),
  west: new QuestJs._create.Exit('lift'),
  north: new QuestJs._create.Exit('reactor_room', {
    use(char) {
      if (char === QuestJs._w.me && QuestJs._w.lab_door.closed)
        return QuestJs._io.falsemsg('The door is too heavy for you to move.');
      if (char === QuestJs._w.robot) {
        if (QuestJs._w.lab_door.closed) {
          QuestJs._io.msg('The robot opens the heavy door with ease.');
          QuestJs._w.lab_door.closed = false;
        }
        QuestJs._world.setRoom(QuestJs._w.robot, 'reactor_room', 'north');
        return true;
      }
      QuestJs._world.setRoom(QuestJs._w.me, 'reactor_room', 'north');
      return true;
    },
  }),
});

QuestJs._create.createItem('lab_door', QuestJs._templates.OPENABLE(false), {
  examine: 'A very solid, steel door.',
  loc: 'laboratory',
  open(isMultiple, char) {
    if (!this.closed) {
      QuestJs._io.msg(QuestJs._tools.prefix(this, isMultiple) + QuestJs._lang.already, {
        item: this,
      });
      return false;
    }
    if (char.strong) {
      this.closed = false;
      this.openMsg(isMultiple, { char, container: this });
      hint.now('northToReactor');
      return true;
    }
    QuestJs._io.msg(`${QuestJs._tools.prefix(this, isMultiple)}The door is too heavy to open.`);
    return false;
  },
});

QuestJs._create.createItem('screens', {
  examine:
    'There are six smaller screens attached to different instruments, each displaying graphs and numbers that are slowly evolving over time. A larger screen shows another room, with some huge device sitting in a sunked area in the middle of it. Pipes are cables seem to feed it.{if:robot:loc:reactor_room: You can see the robot in the room.}',
  loc: 'laboratory',
  scenery: true,
});

QuestJs._create.createItem('instruments', {
  examine:
    'The instruments are essentially oddly-shaped boxes. They are a mix of pale grey, light brown and white, and have various pipe and cable connections at at various points. They all have a brand badge on the front, but no other markings.',
  loc: 'laboratory',
  scenery: true,
});

QuestJs._create.createItem('brand_badges', QuestJs._templates.COMPONENT('instruments'), {
  examine() {
    QuestJs._io.msg(
      'The badges on the various instruments are all the same; "Zeta Industries". They appear to be hand-drawn.',
    );
    if (!this.flag1) {
      tmsg('Cool, you are using your initiative to look deeper. This can be vital in some games.');
      tmsg('But not this one.');
    }
    this.flag1 = true;
  },
  regex: /badge/,
  loc: 'laboratory',
  scenery: true,
});

QuestJs._create.createRoom('reactor_room', {
  desc() {
    return 'The reactor room is dominated by a huge zeta-reactor, extending from a sunken area some five foot below floor level, up to the ceiling. Pipes and cables of varying sizes are connected to it{if:reactor_room:reactorRunning:, and the reactor is humming with power}.{ifHere:vomit: There is vomit in the corner.}';
  },
  reactorRunning: false,
  south: new QuestJs._create.Exit('laboratory'),
  eventPeriod: 1,
  eventIsActive() {
    return QuestJs._w.me.loc === 'reactor_room';
  },
  countdown: 6,
  eventScript() {
    this.countdown -= 1;
    QuestJs._io.msg(
      "A recorded voice echoes round the room: 'Warning: Zeta-particle levels above recommended safe threshold. Death expected after approximately {reactor_room.countdown} minutes of exposure.'",
    );
    switch (this.countdown) {
      case 5:
        hint.now('getRod');
      case 4:
        QuestJs._io.msg('You are feeling a little nauseous.');
        break;
      case 3:
        QuestJs._io.msg('You start to get a headache.');
        break;
      case 2:
        QuestJs._io.msg('You are feeling very nauseous.');
        break;
      case 1:
        QuestJs._io.msg('You throw up, feeling very weak.');
        QuestJs._w.vomit.loc = this.name;
        break;
      case 0:
        QuestJs._io.msg('You have died.');
        tmsg(
          "Don't worry, you are not really dead; this is just a tutorial. Unfortunately, that does mean the next warning will say you will die in minus one minute, as the countdown goes below zero.",
        );
        break;
    }
    hint.now('rGetRod');
  },
});

QuestJs._create.createRoom('reactor', QuestJs._templates.CONTAINER(false), {
  examine() {
    return 'The reactor is composed of a series of rings, hoops and cylinders arranged on a vertical axis. Some are shiny metal, other dull black, but you have no idea of the significant of any of them.{if:reactor_room:reactorRunning: An intense blue light spills out from various points up it length.}';
  },
  scenery: true,
  loc: 'reactor_room',
  testRestrictions(object, char) {
    if (object === QuestJs._w.control_rod) return true;
    QuestJs._io.msg('That cannot go in there!');
    return false;
  },
  itemDropped(item) {
    if (QuestJs._w.control_rod.loc === this.name) {
      QuestJs._io.msg(
        'The reactor starts to glow with a blue light, and you can hear it is now buzzing.',
      );
      QuestJs._w.reactor_room.reactorRunning = true;
      hint.now('useLift');
    }
  },
});

QuestJs._create.createRoom('vomit', {
  examine:
    'You decide against looking too closely at the vomit, but it occurs to you that perhaps you should tell the robot about it.',
  scenery: true,
});

QuestJs._create.createItem('control_rod', QuestJs._templates.TAKEABLE(), {
  examine: 'The control rod is about two foot long, and a dull black colour.',
  take(isMultiple, char) {
    const tpParams = { char, item: this };
    if (this.isAtLoc(char.name)) {
      QuestJs._io.msg(
        QuestJs._tools.prefix(this, isMultiple) + QuestJs._lang.already_have,
        tpParams,
      );
      return false;
    }
    if (!char.canManipulate(this, 'take')) return false;

    if (char === QuestJs._w.me) {
      QuestJs._io.msg(
        "As you go to grab the control rod, a recorded message says: 'Warning: Control rod is highly zeta-active. Handling will result in instant death.' You decide upon reflection that you do not want to pick it up that much.",
      );
      hint.now('backToRobot');
      return false;
    }
    const flag = this.loc === 'reactor';
    QuestJs._io.msg(
      QuestJs._tools.prefix(this, isMultiple) + QuestJs._lang.take_successful,
      tpParams,
    );
    this.moveToFrom(char.name);
    if (flag) {
      QuestJs._io.msg('The blue light in the reactor winks out and the buzz dies.');
      QuestJs._w.reactor_room.reactorRunning = false;
    }
    hint.now('rRInR');
    return true;
  },
  loc: 'control_rod_repository',
});

QuestJs._create.createItem('control_rod_repository', QuestJs._templates.SURFACE(), {
  examine:
    'The control rod repository is a cross between a shelf and a cradle; it is attached to the wall like a shelf, but shaped like a cradle to hold the control rod.',
  loc: 'reactor_room',
});

QuestJs._create.createRoom('office', {
  desc() {
    return 'The office is a fair-size, dominated by a large desk. {ifNot:Professor_Kleinscope:flag:Sat behind the desk is Professor Kleinscope. }There is an elderly computer sat on the desk {once:- this must be the computer with the files on it; getting the files will not be possible while the Professor is sat there, however}. Behind the desk is a large window, and on the wall to the right is an odd painting.';
  },
  west: new QuestJs._create.Exit('lift', {
    use() {
      if (QuestJs._w.office.lift_exit_locked)
        return QuestJs._io.falsemsg(
          'The lift door is closed. You suspect Professor Kleinscope is in he lift and on his way up right now.',
        );
      QuestJs._io.msg('You walk back into the lift.');
      QuestJs._world.setRoom(QuestJs._w.me, this.name, this.dir);
    },
  }),
  out: new QuestJs._create.Exit('garden', {
    use() {
      if (!QuestJs._w.office_window.smashed)
        QuestJs._io.falsemsg('There is a pane of glass in the way.');
      if (!QuestJs._w.rope.locs.includes('outside')) {
        QuestJs._io.msg(
          'You look out the window. If is a long way down to the ground, and there are no hand-holds. You need a way to climb down.',
        );
        hint.now('climbOut');
        return false;
      }
      QuestJs._io.msg(
        'You climb out the window, and down the rope, quickly reaching the ground. You jump in your SUV, and drive away. A job well done.',
      );
      QuestJs._io.msg(' ');
      QuestJs._io.msg('Congratulations, you have won!');
      QuestJs._io.msg(' ');
      tmsg(
        'So this is where we say good bye; you have completed the game, and hopefully now have a pretty good idea of how to play parser-based adventure games (and perhaps even write some too).',
      );
      QuestJs._IO.finish();
      return true;
    },
    isHidden() {
      return !QuestJs._w.office_window.smashed;
    },
  }),
  afterFirstEnter() {
    hint.now('useComputer');
  },
});

QuestJs._create.createItem('office_window', {
  examine() {
    if (this.smashed) {
      QuestJs._io.msg('The window is tall and wide... and smashed.');
    } else {
      QuestJs._io.msg('The window is tall and wide; it does not look like it will open.');
    }
    if (!this.lookedout) {
      tmsg(
        'You might want to try LOOK OUT WINDOW; may be more interesting than the window itself.',
      );
      this.lookedout = true;
    }
  },
  loc: 'office',
  scenery: true,
  outside: [],
  lookout() {
    let s =
      'Out of the window you can see the street at the front of the house. Your black SUV is parked at the side on the road.';
    if (this.outside.length > 0)
      s += ` On the street below the house you can see ${QuestJs._tools.formatList(this.outside, {
        article: QuestJs._consts.DEFINITE,
        lastJoiner: QuestJs._lang.list_and,
      })}.`;
    QuestJs._io.msg(s);
  },
  smash() {
    if (this.smashed) {
      return QuestJs._io.falsemsg('The window is already smashed.');
    }
    if (QuestJs._w.old_newspaper.fist_wrapped) {
      QuestJs._io.msg(
        'With your fist wrapped in the old newspaper, you punch it through the window, breaking the glass. You take a moment to knock away the remaining jagged shards in the frame.',
      );
      this.smashed = true;
      hint.now('out');
      return true;
    }
    QuestJs._io.msg(
      'You are about to put your fist through the window when it occurs to you that your hand will get ripped to shreds by the glass fragments, and you really do not want to leave DNA evidence here. It is definitely not that you hate the sight of blood.',
    );
    hint.now('wrapFist');
    return false;
  },
  isThrowThroughable(item) {
    if (this.smashed) return true;
    return QuestJs._io.falsemsg("You can't throw anything out of the window, it is closed.");
  },
  throwThrough(item) {
    if (item !== QuestJs._w.rope) {
      QuestJs._io.msg('You lob {nm:item:the} out the window; it lands on the street below.');
      delete item.loc;
      office_window.outside.push(item);
      return true;
    }
    if (!item.tiedTo1 && !item.tiedTo2)
      return QuestJs._io.falsemsg(
        'You are about to heave the rope out the window when it occurs to you that it might be useful to tie one end to something first.',
      );
    if (item.tiedTo1 && item.tiedTo2)
      falsedmsg(
        'The rope is tied to both {nm:obj1:the} and {nm:obj2:the}; which end were you hoping to throw out?',
        { obj1: QuestJs._w[rope.tiedTo1], obj2: QuestJs._w[rope.tiedTo2] },
      );

    QuestJs._io.msg('You throw the end of the rope out the window.');
    if (item.tiedTo1) {
      item.locs.push('outside');
    } else {
      item.locs.unshift('outside');
    }
  },
  open() {
    return QuestJs._io.falsemsg('The window does not open.');
  },
});

QuestJs._create.createItem('painting', {
  examine:
    'The painting at first glance is abstract, but after staring at it for a few minutes, you realise is is actually a portrait of a woman in a blue dress with a bizarre hat.',
  loc: 'office',
  scenery: true,
  lookbehind() {
    if (QuestJs._w.Professor_Kleinscope.loc === 'office') {
      QuestJs._io.msg(
        "'Please don't touch that,' says the Professor as you reach out, 'it's very expensive.'",
      );
    } else {
      QuestJs._io.msg(
        'You look behind the painting, but inexplicably there is no safe there. But there is a post-it note stuck to the back of the picture.',
      );
    }
  },
});

QuestJs._create.createItem('postit_note', QuestJs._templates.TAKEABLE(), READABLE(), {
  alias: 'post-it note',
  examine: 'The sticky yellow note has something written on it; the number {show:computer:code}.',
  read: 'The post-it note just has six digits written on it: {show:computer:code}.',
  loc: 'office',
  scenery: true,
});

QuestJs._create.createItem('chair', QuestJs._templates.FURNITURE({ sit: true, stand: true }), {
  examine: 'This is an elegant, white office chair in good condition.',
  loc: 'office',
  scenery: true,
  onSit(char) {
    if (QuestJs._w.Professor_Kleinscope.loc === 'office') {
      QuestJs._io.msg("'Making yourself at home, I see...' notes Professor Kleinscope.");
    }
  },
  onStand(char) {
    if (QuestJs._w.Professor_Kleinscope.loc === 'office') {
      QuestJs._io.msg(
        "'I'd rather you kept your feet {i:off} the furniture,' says Professor Kleinscope crossly.",
      );
    }
  },
  testForPosture(char, posture) {
    if (QuestJs._w.Professor_Kleinscope.flag) return true;
    QuestJs._io.msg(
      `You think about ${posture} on the chair, but are unsure how Professor Kleinscope feel about it - given he is already sat on it.`,
    );
    return false;
  },
});

QuestJs._create.createItem('desk', {
  examine: 'The desk is artfully curved, and made of a pale wood.',
  loc: 'office',
  scenery: true,
  attachable: true,
});

QuestJs._create.createItem('computer', {
  examine: 'The computer is so old it is beige.',
  loc: 'office',
  scenery: true,
  code: QuestJs._random.int(10000, 999999).toString(),
  use() {
    if (!QuestJs._w.Professor_Kleinscope.flag) {
      QuestJs._io.msg(
        'You cannot use the computer while Professor Kleinscope is sat there using it himself!',
      );
      hint.now('talkProf');
    } else if (QuestJs._w.Professor_Kleinscope.loc === 'office') {
      QuestJs._io.msg(
        "You reach a hand out to the keyboard. 'Hands off!' insists the Professor.{once: 'I have some very important files on there, and I don't want the likes of you messing with them.'}",
      );
      tmsg(
        'I have a feeling if we just wait a few turns Kleinscope will head off and look for his dinner.',
      );
    } else {
      QuestJs._io.msg(
        "You press a key on the keyboard, and a message appears on the screen: 'Please input your six digit PIN.'",
      );
      QuestJs._io.askQuestion('PIN?', (result) => {
        if (result === QuestJs._w.computer.code) {
          QuestJs._io.msg(
            `You type "${result}", and unlock the computer. You put in your USB stick, and download the files... It takes nearly twenty minutes; this is one slow computer.`,
          );
          if (hint.before('smashWindow')) {
            tmsg('Cool, you found the number without any prompting from me.');
          }
          QuestJs._io.msg(
            "As you remove the USB stick, an alarm sounds, and you hear a voice: 'Warning: Illegal access to USB port detected. Warning: Illegal access to USB port detected.'",
          );
          tmsg(
            'Who knew such an old computer would be protected like that? The Professor will be here soon, coming up the lift. You need to find another way out. How about the window?',
          );
          tmsg(
            "I've held you hand for long enough, let's see if you can do this on your own - but remember, you can use the HINT command if you are stuck.",
          );
          if (
            QuestJs._w.old_newspaper.loc !== 'me' &&
            QuestJs._w.rope.isAtLoc('me') &&
            QuestJs._w.old_newspaper.loc !== 'office' &&
            !QuestJs._w.rope.isAtLoc('office')
          ) {
            tmsg(
              'That said, I see you lost the newspaper and the rope somewhere. First rule of playing adventure games; never leave anything behind unless you have to. Through the magical power of Tutorial-Guy, I will summon them here for you, just on the off-chance they will be needed.',
            );
            QuestJs._w.old_newspaper.loc = 'office';
            QuestJs._w.rope.locs = ['office'];
            delete QuestJs._w.rope.tiedTo1;
            delete QuestJs._w.rope.tiedTo2;
          } else if (
            QuestJs._w.old_newspaper.loc !== 'me' &&
            QuestJs._w.old_newspaper.loc !== 'office'
          ) {
            tmsg(
              'That said, I see you lost the newspaper somewhere. First rule of playing adventure games; never leave anything behind unless you have to. Through the magical power of Tutorial-Guy, I will summon it here for you, just on the off-chance it will be needed.',
            );
            QuestJs._w.old_newspaper.loc = 'office';
          } else if (!QuestJs._w.rope.isAtLoc('me') && !QuestJs._w.rope.isAtLoc('office')) {
            tmsg(
              'That said, I see you lost the rope somewhere. First rule of playing adventure games; never leave anything behind unless you have to. Through the magical power of Tutorial-Guy, I will summon it here for you, just on the off-chance it will be needed.',
            );
            QuestJs._w.rope.locs = ['office'];
            delete QuestJs._w.rope.tiedTo1;
            delete QuestJs._w.rope.tiedTo2;
          }

          hint.now('smashWindow');
          QuestJs._w.office.lift_exit_locked = true;
        } else {
          QuestJs._io.msg(`You type "${result}", but it fails to unlock the computer.`);
          hint.now('findCode');
        }
      });
    }
  },
});

QuestJs._create.createRoom('lift', QuestJs._templates.TRANSIT('east'), {
  regex: /elevator/,
  desc() {
    return 'The lift is small; according the plaque it is limited to just three people. There are three buttons, labelled one to three. A label above indicates the lift is at "{transitDest}".';
  },
  east: new QuestJs._create.Exit('laboratory'),
  afterFirstEnter() {
    hint.now('press3');
  },
  transitCheck() {
    if (!QuestJs._w.reactor_room.reactorRunning) {
      QuestJs._io.msg('The lift does not seem to be working.');
      hint.now('askRLift');
      return false;
    }
    if (QuestJs._w.rope.locs.includes('lift') && QuestJs._w.rope.locs.length > 2) {
      QuestJs._io.msg('The lift door closes... gets stopped by the rope, and then opens again.');
      if (!this.ropeFlag) {
        tmsg(
          "What have you done? I said nothing about tying the rope to something! I've got a bad feeling about this...",
        );
        this.ropeFlag;
      }
      return false;
    }
    return true;
  },
  onTransitMove(transitDest, exitName) {
    if (transitDest === 'office') hint.now('eastOffice');
  },
});

QuestJs._create.createItem('button_3', QuestJs._templates.TRANSIT_BUTTON('lift'), {
  alias: 'Button: 3',
  examine: 'A button with the letter 3 on it.',
  transitDest: 'office',
  title: 'Level 3: Office',
  transitAlreadyHere: 'You press the button; nothing happens.',
  transitGoToDest: 'You press the button; the door closes and the lift ascends.',
});

QuestJs._create.createItem('button_2', QuestJs._templates.TRANSIT_BUTTON('lift'), {
  alias: 'Button: 2',
  examine: 'A button with the letter 2 on it.',
  title: 'Level 2: Lounge',
  transitDest: 'lounge',
  transitAlreadyHere: 'You press the button; nothing happens.',
  transitGoToDest: 'You press the button; the door closes and the lift moves.',
});

QuestJs._create.createItem('button_1', QuestJs._templates.TRANSIT_BUTTON('lift'), {
  alias: 'Button: 1',
  examine: 'A button with the letter 1 on it.',
  title: 'Level 1: Laboratory',
  transitDest: 'laboratory',
  transitAlreadyHere: 'You press the button; nothing happens.',
  transitGoToDest: 'You press the button; the door closes and the lift descends.',
});
