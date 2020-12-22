'use strict';

QuestJs._npc_utilities.talkto = function () {
  if (!QuestJs._game.player.canTalk(this)) return false;
  const topics = this.getTopics(this);
  if (topics.length === 0)
    return QuestJs._io.failedmsg(QuestJs._lang.no_topics, {
      char: QuestJs._game.player,
      item: this,
    });
  topics.push(QuestJs._lang.never_mind);

  showSidePaneOptions(this, topics, function (result) {
    $('#sidepane-menu').remove();
    if (result !== QuestJs._lang.never_mind) {
      result.runscript();
    }
  });

  return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
};

function showSidePaneOptions(item, options, fn) {
  const opts = { article: QuestJs._consts.DEFINITE, capital: true };
  QuestJs._IO.input('', options, false, fn, function (options) {
    let s =
      '<div id="sidepane-menu"><p class="sidepane-menu-title">Talk to ' +
      QuestJs._lang.getName(item, { article: QuestJs._consts.DEFINITE }) +
      ':</p>';
    for (let i = 0; i < options.length; i++) {
      s +=
        '<p value="' +
        i +
        '" onclick="QuestJs._IO.menuResponse(' +
        i +
        ')" class="sidepane-menu-option">';
      s += typeof options[i] === 'string' ? options[i] : QuestJs._lang.getName(options[i], opts);
      s += '</p>';
    }
    s += '</div>';
    $('body').append(s);
  });
}

QuestJs._create.createItem('Buddy', QuestJs._npc.NPC(false), {
  loc: 'lounge',
  money: 10,
  properName: true,
  examine: 'An orangutan!',
  talkto: function () {
    const res = quest.getState('A carrot for Buddy', this);
    QuestJs._log.info(res);
    if (!res.status) {
      QuestJs._io.msg("'Hey, Buddy,' you say.");
      QuestJs._io.msg("'Hey yourself! Say, could you get me a carrot?'");
      quest.start('A carrot for Buddy');
    } else {
      QuestJs._io.msg("'Hey, Buddy,' you say.");
      QuestJs._io.msg("'Hey yourself! Where is that carrot?'");
    }
  },
});

QuestJs._create.createItem('knife', QuestJs._templates.TAKEABLE(), {
  loc: 'Buddy',
  sharp: false,
  examine: function (isMultiple) {
    if (this.sharp) {
      QuestJs._io.msg(QuestJs._tools.prefix(this, isMultiple) + 'A really sharp knife.');
    } else {
      QuestJs._io.msg(QuestJs._tools.prefix(this, isMultiple) + 'A blunt knife.');
    }
  },
  chargeResponse: function (participant) {
    QuestJs._io.msg('There is a loud bang, and the knife is destroyed.');
    delete this.loc;
    return false;
  },
});

QuestJs._create.createRoom('lounge', {
  desc: 'A smelly room with an [old settee:couch:sofa] and a [tv:telly].',
  mapColour: 'silver',
  east: new QuestJs._create.Exit('kitchen'),
  west: new QuestJs._create.Exit('dining_room'),
  south: new QuestJs._create.Exit('conservatory'),
  up: new QuestJs._create.Exit('bedroom'),
  hint:
    'There is a lot in this room! The bricks can be picked up by number (try GET 3 BRICKS). The book can be read. The coin is stuck to the floor. There are containers too. Kyle is an NPC; you can tell him to do nearly anything the player character can do (everything except looking and talking).',
});

QuestJs._util.changePOV(QuestJs._w.Buddy);

QuestJs._create.createRoom('dining_room_on_stool', {
  desc: 'Stood on a stool, in an old-fashioned room.',
  east: new QuestJs._create.Exit('lounge', { mapIgnore: true }),
  down: new QuestJs._create.Exit('dining_room', { mapIgnore: true }),
  alias: 'dining room (on a stool)',
  //loc:"dining_room",
});

QuestJs._create.createRoom('hole', {
  desc: 'An old-fashioned room.',
});

QuestJs._create.createItem('book', QuestJs._templates.TAKEABLE(), READABLE(true), {
  loc: 'lounge',
  examine: 'A leather-bound book.',
  read: function (isMultiple, char) {
    if (QuestJs.cmdRules.isHeld(null, char, this, isMultiple)) {
      if (char === QuestJs._w.Lara) {
        QuestJs._io.msg("'Okay.' Lara spends a few minutes reading the book.");
        QuestJs._io.msg("'I meant, read it to me.'");
        QuestJs._io.msg("'All of it?'");
        QuestJs._io.msg("'Quick summary.'");
        QuestJs._io.msg(
          "'It is all about carrots. The basic gist is that all carrots should be given to me.' You are not entirely sure you believe her.",
        );
      } else {
        QuestJs._io.msg(
          QuestJs._tools.prefix(this, isMultiple) +
            'It is not in a language ' +
            QuestJs._lang.pronounVerb(char, 'understand') +
            '.',
        );
      }
      return true;
    } else {
      return false;
    }
  },
  lookinside: 'The book has pages and pages of text, but you do not even recongise the text.',
});

QuestJs._create.createItem('book_cover', QuestJs._templates.COMPONENT('book'), {
  examine: 'The book cover is very fancy.',
  parsePriority: -20,
});

QuestJs._create.createItem('boots', QuestJs._templates.WEARABLE(), {
  loc: 'lounge',
  pronouns: QuestJs._lang.pronouns.plural,
  examine: 'Some old boots.',
});

QuestJs._create.createItem('waterskin', QuestJs._templates.TAKEABLE(), {
  examine: function (isMultiple) {
    QuestJs._io.msg(
      QuestJs._tools.prefix(this, isMultiple) +
        'The waterskin is ' +
        Math.floor((this.full / this.capacity) * 100) +
        '% full.',
    );
  },
  capacity: 10,
  full: 3,
  loc: 'lounge',
  fill: function (isMultiple) {
    if (QuestJs._game.player.loc != 'garage') {
      QuestJs._io.msg(
        QuestJs._tools.prefix(this, isMultiple) + 'There is nothing to charge the torch with here.',
      );
      return false;
    } else {
      QuestJs._io.msg(
        QuestJs._tools.prefix(this, isMultiple) +
          'You charge the torch - it should last for hours now.',
      );
      this.power = 20;
      return true;
    }
  },
});

QuestJs._create.createItem(
  'glass_cabinet',
  QuestJs._templates.CONTAINER(true),
  QuestJs._templates.LOCKED_WITH(['cabinet_key', 'small_key']),
  {
    examine: 'A cabinet with a glass front.',
    transparent: true,
    isAtLoc: function (loc) {
      if (typeof loc !== 'string') loc = loc.name;
      return loc == 'lounge' || loc == 'dining_room';
    },
  },
);

QuestJs._create.createItem('cabinet_key', QuestJs._templates.KEY(), {
  loc: 'garage',
  examine: 'A small brass key.',
});

QuestJs._create.createItem(
  'jewellery_box',
  QuestJs._templates.TAKEABLE(),
  QuestJs._templates.CONTAINER(true),
  { loc: 'glass_cabinet', alias: 'jewellery box', examine: 'A nice box.' },
);

QuestJs._create.createItem('ring', QuestJs._templates.TAKEABLE(), {
  loc: 'jewellery_box',
  examine: 'A ring.',
});

QuestJs._create.createItem(
  'cardboard_box',
  QuestJs._templates.TAKEABLE(),
  QuestJs._templates.CONTAINER(true),
  {
    loc: 'lounge',
    alias: 'cardboard box',
    regex: /cardboard/,
    examine: 'A big cardboard box.',
    closed: false,
  },
);

QuestJs._create.createItem('sandwich', QuestJs._templates.EDIBLE(false), {
  loc: 'lounge',
  onIngesting: function () {
    QuestJs._io.msg('That was great!');
  },
});

QuestJs._create.createItem('ornate_doll', QuestJs._templates.TAKEABLE(), {
  loc: 'glass_cabinet',
  alias: 'ornate doll',
  examine: 'A fancy doll, eighteenth century.',
});

QuestJs._create.createItem('coin', QuestJs._templates.TAKEABLE(), {
  loc: 'lounge',
  examine: 'A gold coin.',
  take: function (isMultiple, participant) {
    QuestJs._io.msg(
      QuestJs._tools.prefix(this, isMultiple) +
        QuestJs._lang.pronounVerb(participant, 'try', true) +
        ' to pick up the coin, but it just will not budge.',
    );
    return false;
  },
});

QuestJs._create.createItem('small_key', QuestJs._templates.KEY(), {
  loc: 'lounge',
  examine: 'A small key.',
  alias: 'small key',
});

QuestJs._create.createItem(
  'flashlight',
  QuestJs._templates.TAKEABLE(),
  QuestJs._templates.SWITCHABLE(false, 'providing light'),
  {
    loc: 'lounge',
    examine: 'A small red torch.',
    regex: /^torch$/,
    lightSource: function () {
      return this.switchedon ? QuestJs._world.LIGHT_FULL : QuestJs._world.LIGHT_NONE;
    },
    eventPeriod: 1,
    eventIsActive: function () {
      return this.switchedon;
    },
    eventScript: function () {
      this.power--;
      if (this.power === 2) {
        QuestJs._io.msg('The torch flickers.');
      }
      if (this.power < 0) {
        QuestJs._io.msg(
          'The torch flickers and dies.{once: Perhaps there is a charger in the garage?}',
        );
        this.doSwitchoff();
      }
    },
    checkCanSwitchOn() {
      if (this.power < 0) {
        QuestJs._io.msg('The torch is dead.');
        return false;
      }
      return true;
    },
    power: 2,
    chargeResponse: function (participant) {
      QuestJs._io.msg(
        QuestJs._lang.pronounVerb(participant, 'push', true) +
          ' the button. There is a brief hum of power, and a flash.',
      );
      QuestJs._w.flashlight.power = 20;
      return true;
    },
  },
);

QuestJs._create.createRoom('dining_room', {
  desc: 'An old-fashioned room.',
  east: new QuestJs._create.Exit('lounge'),
  west: new QuestJs._create.Exit('lift'),
  canViewLocs: ['garden'],
  canViewPrefix: 'Through the window you can see ',
  up: new QuestJs._create.Exit('dining_room_on_stool', { mapIgnore: true }),
  alias: 'dining room',
  hint:
    'This room features an NPC who will sometimes do as you ask. Compliment her, and she will go to another room, and with then pick things up and drop them (but not bricks). Also not that the glass cabinet is in this room as well as the lounge.',
});

QuestJs._create.createItem('chair', QuestJs._templates.FURNITURE({ sit: true }), {
  loc: 'dining_room',
  examine: 'A wooden chair.',
  onSit: function (char) {
    QuestJs._io.msg(
      'The chair makes a strange noise when ' + QuestJs._lang.nounVerb(char, 'sit') + ' on it.',
    );
  },
});

QuestJs._create.createRoom('lift', QuestJs._templates.TRANSIT('east'), {
  desc: 'A curious lift.',
  east: new QuestJs._create.Exit('dining_room'),
  transitMenuPrompt: 'Where do you want to go?',
  //afterEnter:transitOfferMenu,
  //transitAutoMove:true,
  //onTransitMove:function(toLoc, fromLoc) { QuestJs._io.debugmsg("MOVING to " + toLoc + " from " + fromLoc); },
  //transitCheck:function() {
  //  QuestJs._io.msg("The lift is out of order");
  //  return false;
  //},
});

// calling it button_0 make it appear before button_1 in lists
QuestJs._create.createItem('button_0', QuestJs._templates.TRANSIT_BUTTON('lift'), {
  alias: 'Button: G',
  examine: 'A button with the letter G on it.',
  transitDest: 'dining_room',
  transitDestAlias: 'Ground Floor',
  transitAlreadyHere: "You're already there mate!",
  transitGoToDest: 'The old man presses the button....',
});

QuestJs._create.createItem('button_1', QuestJs._templates.TRANSIT_BUTTON('lift'), {
  alias: 'Button: 1',
  examine: 'A button with the letter 1 on it.',
  transitDest: 'bedroom',
  transitDestAlias: 'The Bedroom',
  transitAlreadyHere: 'You press the button; nothing happens.',
  transitGoToDest:
    'You press the button; the door closes and the lift heads to the first floor. The door opens again.',
});

QuestJs._create.createItem('button_2', QuestJs._templates.TRANSIT_BUTTON('lift'), {
  alias: 'Button: 2',
  examine: 'A button with the letter 2 on it.',
  transitDest: 'attic',
  transitDestAlias: 'The Attic',
  locked: true,
  transitAlreadyHere: 'You press the button; nothing happens.',
  transitGoToDest:
    'You press the button; the door closes and the lift heads to the second floor. The door opens again.',
  transitLocked: 'That does nothing, the button does not work.',
});

QuestJs._create.createRoom('attic', {
  desc: 'An spooky attic.',
  west: new QuestJs._create.Exit('lift'),
});

QuestJs._create.createRoom('kitchen', {
  desc:
    'A clean room{if:clock:scenery:, a clock hanging on the wall}. There is a sink in the corner.',
  west: new QuestJs._create.Exit('lounge'),
  down: new QuestJs._create.Exit('basement', {
    isHidden: function () {
      return QuestJs._w.trapdoor.closed;
    },
    msg: function (isMultiple, char) {
      if (char === QuestJs._game.player) {
        QuestJs._io.msg('You go through the trapdoor, and down the ladder.');
      } else {
        QuestJs._io.msg(
          'You watch ' +
            QuestJs._lang.getName(char, { article: QuestJs._consts.DEFINITE }) +
            ' disappear through the trapdoor.',
        );
      }
    },
  }),
  north: new QuestJs._create.Exit('garage'),
  afterFirstEnter: function () {
    QuestJs._io.msg('A fresh smell here!');
  },
  hint: 'This room features two doors that open and close. The garage door needs a key.',
  source: 'water',
});

QuestJs._create.createItem('clock', QuestJs._templates.TAKEABLE(), {
  loc: 'kitchen',
  scenery: true,
  examine: 'A white clock.',
});

QuestJs._create.createItem('trapdoor', QuestJs._templates.OPENABLE(false), {
  loc: 'kitchen',
  examine: 'A small trapdoor in the floor.',
});

QuestJs._create.createItem('camera', QuestJs._templates.TAKEABLE(), {
  loc: 'kitchen',
  examine: 'A cheap digital camera.',
  regex: /^picture box$/,
});

QuestJs._create.createItem('big_kitchen_table', QuestJs._templates.SURFACE(), {
  loc: 'kitchen',
  examine: 'A Formica table.',
});

QuestJs._create.createItem('jug', QuestJs._templates.VESSEL(4), QuestJs._templates.TAKEABLE(), {
  loc: 'big_kitchen_table',
  examine: 'A small jug, stripped blue and white.',
});

QuestJs._create.createItem('kitchen_sink', {
  loc: 'kitchen',
  scenery: true,
  examine: 'A dirty sink.',
  isSourceOf: function (subst) {
    return subst === 'water' || subst === 'lemonade';
  },
});

QuestJs._create.createItem('water', QuestJs._templates.LIQUID(), {});

QuestJs._create.createItem('honey', QuestJs._templates.LIQUID(), {});

QuestJs._create.createItem('lemonade', QuestJs._templates.LIQUID(), {});

QuestJs._create.createRoom('basement', {
  desc: 'A dank room, with piles of crates everywhere.',
  darkDesc: 'It is dark, but you can just see the outline of the trapdoor above you.',
  up: new QuestJs._create.Exit('kitchen', {
    isHidden: function () {
      return false;
    },
  }),
  lightSource: function () {
    return QuestJs._w.light_switch.switchedon
      ? QuestJs._world.LIGHT_FULL
      : QuestJs._world.LIGHT_NONE;
  },
  hint:
    'The basement illustrates light and dark. There is a torch in the lounge that may be useful.',
});

QuestJs._create.createItem('light_switch', QuestJs._templates.SWITCHABLE(false), {
  loc: 'basement',
  examine: 'A switch, presumably for the light.',
  alias: 'light switch',
  checkCanSwitchOn: function () {
    if (!QuestJs._w.crates.moved) {
      QuestJs._io.msg('You cannot reach the light switch, without first moving the crates.');
      return false;
    } else {
      return true;
    }
  },
});

QuestJs._create.createItem('crates', {
  loc: 'basement',
  examine: 'A bunch of old crates.',
  move: function () {
    QuestJs._io.msg('You move the crates, so the light switch is accessible.');
    this.moved = true;
    return true;
  },
});

QuestJs._create.createRoom('garage', {
  desc: 'An empty garage.',
  south: new QuestJs._create.Exit('kitchen'),
  hint: 'The garage features a complex mechanism, with two components.',
});

QuestJs._create.createItem(
  'garage_door',
  QuestJs._templates.LOCKED_DOOR('garage_key', 'kitchen', 'garage'),
  {
    examine: 'The door to the garage.',
  },
);

QuestJs._create.createItem('garage_key', QuestJs._templates.KEY(), {
  loc: 'lounge',
  examine: 'A big key.',
});

QuestJs._create.createItem('charger', {
  loc: 'garage',
  examine:
    'A device bigger than a washing machine to charge a torch? It has a compartment and a button. {charger_state}.',
  mended: false,
  use: function () {
    QuestJs._io.metamsg(
      'To use the charge, you need to put the torch in the compartment and press the button.',
    );
  },
});

QuestJs._create.createItem(
  'charger_compartment',
  QuestJs._templates.COMPONENT('charger'),
  QuestJs._templates.CONTAINER(true),
  {
    alias: 'compartment',
    examine:
      'The compartment is just the right size for the torch. It is {if:charger_compartment:closed:closed:open}.',
    testRestrictions: function (item) {
      const contents = QuestJs._w.charger_compartment.getContents(QuestJs._world.LOOK);
      if (contents.length > 0) {
        QuestJs._io.msg('The compartment is full.');
        return false;
      }
      return true;
    },
  },
);

QuestJs._create.createItem(
  'charger_button',
  QuestJs._templates.COMPONENT('charger'),
  QuestJs._templates.BUTTON(),
  {
    examine: 'A big red button.',
    alias: 'button',
    push: function (isMultiple, char) {
      const contents = QuestJs._w.charger_compartment.getContents(QuestJs._world.ALL)[0];
      if (!QuestJs._w.charger_compartment.closed || !contents) {
        QuestJs._io.msg(
          QuestJs._lang.pronounVerb(char, 'push', true) + ' the button, but nothing happens.',
        );
        return false;
      } else if (!contents.chargeResponse) {
        QuestJs._io.msg(
          QuestJs._lang.pronounVerb(char, 'push', true) +
            ' the button. There is a brief hum of power, but nothing happens.',
        );
        return false;
      } else {
        return contents.chargeResponse(char);
      }
    },
  },
);

QuestJs._create.createRoom('bedroom', {
  desc: 'A large room, with a big [bed] and a wardrobe.',
  down: new QuestJs._create.Exit('lounge'),
  in: new QuestJs._create.Exit('wardrobe'),
  west: new QuestJs._create.Exit('lift'),
  hint: 'The bedroom has a variety of garments that can be put on - in the right order.',
});

QuestJs._create.createItem('wardrobe', QuestJs._defaults.DEFAULT_ROOM, {
  out: new QuestJs._create.Exit('bedroom'),
  loc: 'bedroom',
  examine: 'It is so big you could probably get inside it.',
  desc: 'Oddly empty of fantasy worlds.',
});

QuestJs._create.createItem('bed', QuestJs._templates.FURNITURE({ sit: true, recline: true }), {
  loc: 'bedroom',
  scenery: true,
  examine: 'What would a bedroom be without a bed?',
});

QuestJs._create.createItem('underwear', QuestJs._templates.WEARABLE(1, ['lower']), {
  loc: 'bedroom',
  pronouns: QuestJs._lang.pronouns.massnoun,
  examine: 'Clean!',
});

QuestJs._create.createItem('jeans', QuestJs._templates.WEARABLE(2, ['lower']), {
  loc: 'bedroom',
  pronouns: QuestJs._lang.pronouns.plural,
  examine: 'Clean!',
});

QuestJs._create.createItem('shirt', QuestJs._templates.WEARABLE(2, ['upper']), {
  loc: 'bedroom',
  examine: 'Clean!',
});

QuestJs._create.createItem('coat', QuestJs._templates.WEARABLE(3, ['upper']), {
  loc: 'bedroom',
  examine: 'Clean!',
});

QuestJs._create.createItem('jumpsuit', QuestJs._templates.WEARABLE(2, ['upper', 'lower']), {
  loc: 'bedroom',
  examine: 'Clean!',
});

QuestJs._create.createItem('suit_trousers', QuestJs._templates.WEARABLE(2, ['lower']), {
  loc: 'wardrobe',
  examine: 'The trousers.',
  pronouns: QuestJs._lang.pronouns.plural,
});

QuestJs._create.createItem('jacket', QuestJs._templates.WEARABLE(3, ['upper']), {
  loc: 'wardrobe',
  examine: 'The jacket',
});

QuestJs._create.createItem('waistcoat', QuestJs._templates.WEARABLE(2, ['upper']), {
  loc: 'wardrobe',
  examine: 'The waistcoat',
});

QuestJs._templates.createEnsemble(
  'suit',
  [QuestJs._w.suit_trousers, QuestJs._w.jacket, QuestJs._w.waistcoat],
  { examine: 'A complete suit.', regex: /xyz/ },
);

QuestJs._create.createRoom('conservatory', {
  desc: 'A light airy room.',
  north: new QuestJs._create.Exit('lounge'),
  west: new QuestJs._create.Exit('garden'),
  hint: 'The conservatory features a pro-active NPC.',
});

QuestJs._create.createItem('crate', QuestJs._templates.FURNITURE({ stand: true }), SHIFTABLE(), {
  loc: 'conservatory',
  examine: 'A large wooden crate, probably strong enough to stand on.',
});

QuestJs._create.createItem('broken_chair', {
  loc: 'conservatory',
  examine: 'A broken chair.',
  attachable: true,
});

QuestJs._create.createItem('rope', QuestJs._templates.ROPE(), {
  loc: 'conservatory',
  ropeLength: 3,
  examine: "The rope is about 40' long.",
});

QuestJs._create.createRoom('garden', {
  desc:
    'Very overgrown. The garden opens onto a road to the west, whilst the conservatory is east. There is a hook on the wall.',
  mapColour: 'green',
  east: new QuestJs._create.Exit('conservatory'),
  west: new QuestJs._create.Exit('road'),
});

QuestJs._create.createItem('hook', {
  loc: 'garden',
  scenery: true,
  examine: 'A rusty hook, on the wall of the house.',
  attachable: true,
});

QuestJs._create.createRoom('far_away', {
  north: new QuestJs._create.Exit('lounge'),
});

QuestJs._create.createItem('Arthur', QuestJs._npc.NPC(false), {
  loc: 'garden',
  examine: function (isMultiple) {
    if (this.suspended) {
      QuestJs._io.msg(QuestJs._tools.prefix(item, isMultiple) + 'Arthur is asleep.');
    } else {
      QuestJs._io.msg(QuestJs._tools.prefix(item, isMultiple) + 'Arthur is awake.');
    }
  },
  suspended: true,
  properName: true,
  agenda: [
    'text:Arthur stands up and stretches.',
    "text:'I'm going to find Lara, and show her the garden,' says Arthur.:'Whatever!'",
    "walkTo:Lara:'Hi, Lara,' says Arthur. 'Come look at the garden.'",
    "joinedBy:Lara:'Sure,' says Lara.",
    "walkTo:garden:inTheGardenWithLara:'Look at all the beautiful flowers,' says Arthur.:Through the window you see Arthur say something to Lara.",
    'text:Lara smells the flowers.',
  ],
  inTheGardenWithLara: function (arr) {
    if (this.isHere()) {
      QuestJs._io.msg(arr[0]);
    }
    if (QuestJs._game.player.loc === 'dining_room') {
      QuestJs._io.msg(arr[1]);
    }
  },
  talkto: function () {
    QuestJs._io.msg("'Hey, wake up,' you say to Arthur.");
    this.suspended = false;
    this.pause();
    this.multiMsg([
      "'What?' he says, opening his eyes. 'Oh, it's you.'",
      "'I am awake!'",
      false,
      "'Stop it!'",
    ]);
    return true;
  },
});

QuestJs._create.createItem('ball', {
  //loc:"Kyle",
  examine: 'Some old boots.',
});

QuestJs._create.createItem('Kyle', QuestJs._npc.NPC(false), {
  loc: 'lounge',
  //alias:'Bobby',
  examine: 'A grizzly bear. But cute.',
  properName: true,
  //agenda:["text:Hello", "wait:2:ending", "text:goodbye"],
  //agenda:["patrol:dining_room:lounge:kitchen:lounge"],
  askOptions: [
    {
      name: 'House',
      test: function (p) {
        return p.text.match(/house/);
      },
      msg: "'I like it,' says Kyle.",
    },
    {
      name: 'Garden',
      test: function (p) {
        return p.text.match(/garden/);
      },
      responses: [
        {
          test: function (p) {
            return QuestJs._w.garden.fixed;
          },
          msg: "'Looks much better now,' Kyle says with a grin.",
        },
        {
          test: function (p) {
            return QuestJs._w.Kyle.needsWorkCount === 0;
          },
          msg: "'Needs some work,' Kyle says with a sign.",
          script: function (p) {
            QuestJs._w.Kyle.needsWorkCount++;
          },
        },
        {
          msg: "'I'm giving up hope of it ever getting sorted,' Kyle says.",
        },
      ],
    },
    {
      test: function (p) {
        return p.text.match(/park/);
      },
      responses: [
        {
          name: 'Park',
          mentions: ['Swings'],
          msg:
            "'Going to the park sounds like fun,' Kyle says with a grin. 'We can go on the swings!'",
        },
      ],
    },
    {
      name: 'Fountain',
      test: function (p) {
        return p.text.match(/fountain/) && p.actor.specialFlag;
      },
      msg: "'The fountain does not work.'",
    },
    {
      name: 'Swings',
      silent: true,
      test: function (p) {
        return p.text.match(/swing/);
      },
      msg: "'The swings are fun!'",
    },
    {
      msg: 'Kyle has no interest in that subject.',
      failed: true,
    },
  ],
  needsWorkCount: 0,
  talkto: function () {
    switch (this.talktoCount) {
      case 0:
        QuestJs._io.msg("You say 'Hello,' to Kyle, and he replies in kind.");
        break;
      case 1:
        QuestJs._io.msg(
          "You ask Kyle how to get upstairs. 'You know,' he replies, 'I have no idea.'",
        );
        break;
      case 2:
        QuestJs._io.msg("'Where do you sleep?' you ask Kyle.");
        QuestJs._io.msg("'What's \"sleep\"?'");
        break;
      default:
        QuestJs._io.msg('You wonder what you can talk to Kyle about.');
        break;
    }
    this.pause();
    return true;
  },
});

QuestJs._create.createItem('kyle_question', QuestJs._npc.QUESTION(), {
  responses: [
    {
      regex: /^(yes)$/,
      response: function () {
        QuestJs._io.msg("'Oh, cool,' says Kyle.");
      },
    },
    {
      regex: /^(no)$/,
      response: function () {
        QuestJs._io.msg(
          "'Oh, well, Lara, this is Tester, he or she is testing Quest 6,' says Kyle.",
        );
      },
    },
    {
      response: function () {
        QuestJs._io.msg(
          "'I don't know what that means,' says Kyle. 'It's a simple yes-no question.'",
        );
        QuestJs._w.Kyle.askQuestion('kyle_question');
      },
    },
  ],
});

QuestJs._create.createItem('straw_boater', QuestJs._templates.WEARABLE(false), {
  loc: 'Kyle',
  examine: 'A straw boater.',
  worn: true,
});

QuestJs._create.createItem('Kyle_The_Garden', QuestJs._npc.TOPIC(true), {
  loc: 'Kyle',
  alias: "What's the deal with the garden?",
  nowShow: ['Mary_The_Garden_Again'],
  script: function () {
    QuestJs._io.msg("You ask Kyle about the garden, but he's not talking.");
  },
});

QuestJs._create.createItem('Kyle_The_Garden_Again', QuestJs._npc.TOPIC(false), {
  loc: 'Kyle',
  alias: "Seriously, what's the deal with the garden?",
  script: function () {
    QuestJs._io.msg("You ask Kyle about the garden, but he's STILL not talking.");
  },
});

QuestJs._create.createItem('Kyle_The_Weather', QuestJs._npc.TOPIC(true), {
  loc: 'Kyle',
  alias: 'The weather',
  script: function () {
    QuestJs._io.msg('You talk to Kyle about the weather.');
  },
});

QuestJs._create.createItem('Lara', QuestJs._npc.NPC(true), {
  loc: 'dining_room',
  examine: 'A normal-sized bunny.',
  properName: true,
  happy: false,
  giveReaction: function (item, multiple, char) {
    if (item === QuestJs._w.ring) {
      QuestJs._io.msg(
        "'Oh, my,' says Lara. 'How delightful.' She slips the ring on her finger, then hands you a key.",
      );
      QuestJs._w.ring.loc = 'Lara';
      QuestJs._w.ring.worn = true;
      QuestJs._w.garage_key.loc = char.name;
    }
    if (item === QuestJs._w.book) {
      QuestJs._io.msg("'Hmm, a book about carrots,' says Lara. 'Thanks.'");
      QuestJs._w.book.loc = 'Lara';
    } else {
      QuestJs._io.msg("'Why would I want {i:that}?'");
    }
  },
  getAgreementTake: function (item) {
    if (item === QuestJs._w.brick) {
      QuestJs._io.msg("'I'm not picking up any bricks,' says Lara indignantly.");
      return false;
    }
    return true;
  },
  getAgreementGo: function (dir) {
    if (!this.happy) {
      QuestJs._io.msg(
        "'I'm not going " + dir + ",' says Lara indignantly. 'I don't like that room.'",
      );
      return false;
    }
    return true;
  },
  getAgreementDrop: function () {
    return true;
  },
  getAgreementStand: function () {
    return true;
  },
  getAgreementRead: function () {
    return true;
  },
  getAgreementPosture: function () {
    if (!this.happy) {
      QuestJs._io.msg("'I don't think so!' says Lara indignantly.");
      return false;
    }
    return true;
  },
  getAgreement() {
    QuestJs._io.msg("'I'm not doing that!' says Lara indignantly.");
    return false;
  },
  canTalkPlayer: function () {
    return true;
  },

  sayPriority: 3,
  sayResponses: [
    {
      regex: /^(hi|hello)$/,
      id: 'hello',
      response: function () {
        QuestJs._io.msg("'Oh, hello there,' replies Lara.");
        if (QuestJs._w.Kyle.isHere()) {
          QuestJs._io.msg("'Have you two met before?' asks Kyle.");
          QuestJs._w.Kyle.askQuestion('kyle_question');
        }
      },
    },
  ],
});

QuestJs._create.createItem('Lara_garage_key', QuestJs._npc.TOPIC(true), {
  loc: 'Lara',
  alias: 'Can I have the garden key?',
  script: function () {
    QuestJs._io.msg(
      'You ask Lara about the garage key; she agrees to give it to you if you give her a ring. Perhaps there is one in the glass cabinet?',
    );
  },
});

QuestJs._create.createItem('Lara_very_attractive', QuestJs._npc.TOPIC(true), {
  loc: 'Lara',
  alias: "You're very attractive",
  script: function () {
    QuestJs._io.msg(
      "You tell Lara she looks very attractive. 'Why thank you!' she replies, smiling at last.",
    );
    QuestJs._w.Lara.happy = true;
  },
});

QuestJs._create.createItem('Lara_carrots', QuestJs._npc.TOPIC(true), {
  loc: 'Lara',
  alias: 'I hear you like carrots',
  script: function () {
    QuestJs._io.msg(
      "'Need carrots!' she says with feeling. 'Fading away bunny!' She looks mournfully at her ample tummy.",
    );
    QuestJs._w.Lara.happy = true;
  },
});

QuestJs._create.createItem('walls', {
  examine: "They're walls, what are you expecting?",
  regex: /^wall$/,
  scenery: true,
  isAtLoc: function (loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return QuestJs._w[loc].room && situation === QuestJs._world.PARSER;
  },
});

QuestJs._create.createItem('brick', QuestJs._templates.COUNTABLE({ lounge: 7, dining_room: 1 }), {
  examine: 'A brick is a brick.',
  regex: /^(\d+ )?bricks?$/,
});

QuestJs._create.createRoom('shop', {
  desc: 'A funny little shop.',
  south: new QuestJs._create.Exit('road'),
  willBuy: function (obj) {
    return obj === QuestJs._w.trophy;
  },
});

QuestJs._create.createRoom('road', {
  desc: 'A road heading west over a bridge. You can see a shop to the north.',
  east: new QuestJs._create.Exit('garden'),
  west: new QuestJs._create.Exit('bridge'),
  north: new QuestJs._create.Exit('shop'),
});

QuestJs._create.createItem(
  'carrot',
  QuestJs._templates.TAKEABLE(),
  QuestJs._templates.MERCH(2, ['shop']),
  {
    examine: "It's a carrot!",
  },
);

QuestJs._create.createItem(
  'honey_pasta',
  QuestJs._templates.TAKEABLE(),
  QuestJs._templates.MERCH(5, ['shop']),
  {
    examine: "It's pasta. With honey on it.",
  },
);

QuestJs._create.createItem(
  'trophy',
  QuestJs._templates.TAKEABLE(),
  QuestJs._templates.MERCH(15, 'shop'),
  {
    examine: 'It is a unique trophy!',
    doNotClone: true,
  },
);

QuestJs._create.createItem('cactus', ZONE_FEATURE('desert', 1, -2, 3), {
  featureLook: 'There is a big cactus to the #.',
  zoneColour: 'green',
  zoneMapName: 'Strange cactus',
  examine: 'Prickly!',
});

QuestJs._create.createItem('tower', ZONE_FEATURE('desert', -1, 3, 4), {
  featureLook: 'There is a tower to the #.',
  featureLookHere: 'There is a tall stone tower here.',
  zoneMapName: 'Ancient tower',
  examine: 'The tower looks ancient, but in a fair state of repair. It is about four storeys high.',
});

QuestJs._create.createItem('barrier', ZONE_BORDER('desert'), {
  examine: 'It is invisible!',
  scenery: true,
  border: function (x, y) {
    return x * x + y * y > 55;
  },
  borderMsg: 'You try to head #, but hit an invisible barrier.',
  borderDesc: 'The air seems to kind of shimmer.',
});

QuestJs._create.createItem('canyon', ZONE_BORDER('desert'), {
  examine: 'It looks very deep!',
  scenery: true,
  border: function (x, y) {
    return x - y > 5;
  },
  //borderMsg:"You cannot go #, the canyon is too wide to jump and too steep to climb.",
  borderDesc:
    'There is a deep canyon southeast of you, running from the southwest to the northeast.',
});

QuestJs._create.createRoom('desert', ZONE(), {
  exits: [
    {
      x: -1,
      y: 3,
      dir: 'in',
      dest: 'inside_tower',
      msg: 'You step inside the tower, and climb the step, spiral staircase to the top.',
    },
    { x: 5, y: 0, dir: 'east', dest: 'bridge', msg: 'You start across the bridge.' },
  ],
  descs: [
    {
      x: 5,
      y: 0,
      desc: 'You are stood on a road heading west through a desert, and east over a bridge.',
    },
    {
      when: function (x, y) {
        return y === 0;
      },
      desc: 'You are stood on a road running east to west through a desert.',
    },
    {
      when: function (x, y) {
        return y > 0;
      },
      desc: 'You are stood in the desert, north of the road.',
    },
    {
      desc: 'You are stood in the desert, south of the road.',
    },
  ],
  size: 8,
  outsideColour: 'transparent', // Locations the player cannot access
  mapBorder: false, // Hide the map border
  featureColour: 'blue', // Default colour for features
  playerColour: 'black', // Colour of the player
  cellSize: 20, // The size of each location, if less than 10 the player will disappear!
  mapFont: 'italic 10px serif', // Style of the labels for features
  mapCells: ['<rect x="0" y="162" width="336" height="16" stroke="none" fill="#999"/>'],
});

QuestJs._create.createItem(
  'silver_coin',
  QuestJs._templates.TAKEABLE(),
  ZONE_ITEM('desert', 1, 1),
  {
    examine: 'A curious silver coin; you do not recognise it. It says it is worth two dollars.',
  },
);

QuestJs._create.createRoom('bridge', {
  desc: 'From the bridge you can just how deep the canyon is.',
  west: new QuestJs._create.Exit('desert'),
  east: new QuestJs._create.Exit('road'),
  beforeEnter: function () {
    QuestJs._game.player.positionX = 5;
    QuestJs._game.player.positionY = 0;
  },
});

QuestJs._create.createRoom('inside_tower', {
  desc:
    'A tower, looking out over the desert. To the south is the road, heading east back to your house. To the north is a magic portal, going who knows where.',
  down: new QuestJs._create.Exit('desert'),
  north: new QuestJs._create.Exit('shop'),
  alias: 'Inside the tower',
  properName: true,
  beforeEnter: function () {
    QuestJs._game.player.positionX = -1;
    QuestJs._game.player.positionY = 3;
  },
});

QuestJs._create.createItem('piggy_suu', QuestJs._npc.NPC(true), {
  loc: 'bridge',
  alias: 'Piggy-suu',
  money: 10,
  examine: 'Piggy-suu is a pig.',
});

QuestJs._create.createItem('timetable', QuestJs._npc.AGENDA_FOLLOWER(), {
  counter: 0,
  script: function (n) {
    this.counter += n[0] ? parseInt(n[0]) : 1;
  },
  check: function () {
    return this.flag;
  },
});
