QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'bus_seat',
  regex: /^(me|myself|player)$/,
  money: 10,
  positionX: -1,
  positionY: -2,
  examine(isMultiple) {
    QuestJs._io.msg(
      `${QuestJs._tools.prefix(this, isMultiple)}A ${this.isFemale ? 'chick' : 'guy'} called ${
        this.alias
      }`,
    );
  },
});

QuestJs._create.createItem('knife', QuestJs._templates.TAKEABLE(), {
  loc: 'me',
  sharp: false,
  examine(isMultiple) {
    if (this.sharp) {
      QuestJs._io.msg(`${QuestJs._tools.prefix(this, isMultiple)}A really sharp knife.`);
    } else {
      QuestJs._io.msg(`${QuestJs._tools.prefix(this, isMultiple)}A blunt knife.`);
    }
  },
});

QuestJs._create.createRoom('bus_seat', {
  desc:
    'You are sat on a bus somewhere in Nevada. Out of the window you can see desert, and not a lot else.{once: You have not arrived at Salt Lake City, that is for sure! Has the bus stopped for gas or something? You wonder if you have time to buy a snack.}',
  up: new QuestJs._create.Exit('bus', { alsoDir: ['out'], msg: 'You get up, out of your seat.' }),
  alias: 'Sat on the Bus',
  backgroundNames: ['seat', 'window', 'bus'],
});

QuestJs._create.createItem('window', {
  scenery: true,
  examine:
    'The window could do with a clean, but nevertheless it gives a good view out of the right side of the bus. It had not crossed you mind that you would have the sun on you pretty much all the way when you left Fresno; the bus had been facing the other way when you got on it!.',
});

QuestJs._create.createRoom('bus', {
  desc:
    'You are stood up in the aisle of the bus, beside your seat. Ahead of you you can see out the windscreen, and the road, stretching eastwards through the desert.{once: There are four other passengers on the bus; two men and two women.}',
  east: new QuestJs._create.Exit('bus_front'),
  down: new QuestJs._create.Exit('bus_seat'),
  alias: 'aisle of the bus',
  visibleFrom: ['bus_front', 'bus_seat'],
  backgroundNames: ['seat', 'window', 'bus', 'windscreen'],
});

QuestJs._create.createItem('passengers', {
  scenery: true,
  loc: 'bus',
  examine() {
    let count = 0;
    let s = '';
    if (QuestJs._w.Lucas.isHere()) {
      count++;
      s += ' A black guy with spike blonde hair.';
    }
    if (QuestJs._w.Emily.isHere()) {
      count++;
      s += ' A redhead in tiny denim shorts.';
    }
    if (QuestJs._w.Amy.isHere()) {
      count++;
      s += ' An oriental woman in her thirties.';
    }
    if (QuestJs._w.Elijah.isHere()) {
      count++;
      s += ' An older guy in a "Ramones" tee-shirt.';
    }
    QuestJs._io.msg(`You can see ${count} passenger${count === 1 ? '' : 's'} here.${s}`);
  },
});

QuestJs._create.createRoom('bus_front', {
  desc:
    "From the front of the bus, you can see the road ahead, heading east for many, many miles of straight road, featureless other than a gas station not far away, on the left of the road. {once: There is no sign of the driver.|'What's going on?' one of the other passengers shouts down at you - a guy in his forties.|You shrug. 'Don't know; driver's not here. There's a gas station. I guess he went there.'}",
  west: new QuestJs._create.Exit('bus'),
  south: new QuestJs._create.Exit('desert'),
  out: new QuestJs._create.Exit('desert'),
  alias: 'front of the bus',
  visibleFrom: ['bus'],
  afterFirstEnter() {
    QuestJs._w.Emily.suspended = false;
  },
});

// isAtLoc looks suspect, makes assumptions!
QuestJs._create.createItem('huge_rock', ZONE_FEATURE('desert', 2, -5, 3, true), {
  featureNoExit: 'There is a big rock stopping you going #.',
  featureLook: 'To the #, you can see a huge rock.',
  examine: 'An outcropping of sandstone; it does not look like you could climb it.',
  zoneMapName: 'Huge rock',
});

QuestJs._create.createItem('cactus', ZONE_FEATURE('desert', -1, 3, 2), {
  featureLook: 'There is a big cactus to the #.',
  zoneColour: 'green',
  zoneMapName: 'Strange cactus',
  featureLookHere:
    'There is a big cactus here; it looks strangely like a hand giving you the finger.',
  examine:
    'The only thing to thrive in the desert is this solitary cactus. It looks to be a saguaro, one of the bigger species of cacti. It is strange to see one this far north.',
});

QuestJs._create.createItem('gas_station', ZONE_FEATURE('desert', 1, 0, 6), {
  featureLook: 'The gas station is # of you.',
  zoneColour: 'transparent',
  zoneMapName: 'Gas station',
  north: new QuestJs._create.Exit('desert'),
});

QuestJs._create.createItem('barrier', ZONE_BORDER('desert'), {
  examine: 'It is invisible!',
  scenery: true,
  border(x, y) {
    return x * x + y * y > 85;
  },
  borderMsg: 'You try to head #, but hit an invisible barrier.',
  borderDesc: 'The air seems to kind of shimmer.',
});

QuestJs._create.createItem('barrier2', ZONE_BORDER('desert'), {
  examine: 'It is a gas station',
  scenery: true,
  border(x, y) {
    return y === 0 && (x === 0 || x === 1);
  },
  borderMsg: 'You try to head #, but hit an invisible barrier.',
});

QuestJs._create.createRoom('gas_station_interior', {
  desc: 'You are stood up inside the gas station.',
  east: new QuestJs._create.Exit('kitchen'),
  south: new QuestJs._create.Exit('desert'),
  alias: 'Inside the gas station',
  beforeEnter() {
    QuestJs._game.player.positionX = 0;
    QuestJs._game.player.positionY = -1;
  },
});

QuestJs._create.createRoom('kitchen', {
  desc: 'You are stood up in the kitchen.',
  east: new QuestJs._create.Exit('gas_station_interior'),
  north: new QuestJs._create.Exit('desert'),
  alias: 'Kitchen',
  beforeEnter() {
    QuestJs._game.player.positionX = 1;
    QuestJs._game.player.positionY = 1;
  },
});

QuestJs._create.createRoom('desert', ZONE(), {
  exits: [
    { x: -1, y: -2, dir: 'in', dest: 'bus_front', msg: 'You climb up into the bus.' },
    {
      x: 0,
      y: -1,
      dir: 'north',
      dest: 'gas_station_interior',
      msg: 'You walk inside the gas station office.',
    },
    {
      x: 0,
      y: -1,
      dir: 'in',
      dest: 'gas_station_interior',
      msg: 'You walk inside the gas station office.',
    },
    { x: 1, y: 1, dir: 'in', dest: 'kitchen', msg: 'You walk inside the back of the gas station.' },
    {
      x: 1,
      y: 1,
      dir: 'south',
      dest: 'kitchen',
      msg: 'You walk inside the back of the gas station.',
    },
  ],
  size: 10,
  mapCells: [
    '<rect x="0" y="194" width="336" height="12" stroke="none" fill="#aaa"/>',
    '<rect x="162" y="172" width="12" height="32" stroke="none" fill="#aaa"/>',
    '<rect x="160" y="160" width="32" height="16" stroke="none" fill="#666"/>',
  ],
  outsideColour: 'lemonchiffon',
  descs: [
    {
      x: -1,
      y: -2,
      desc:
        'You are stood on the road, beside the bus. The road stretches east and west for miles before disappearing in the heat haze, but there is a gas station just ahead.{once: Has the driver gone there? There is literally nothing else here. Perhaps it would be best to get back in the bus, and wait for him to get back.}',
    },
    {
      x: 0,
      y: -2,
      desc:
        'The only feature on the long straight road you are stood on is a gas station at the end of a very short side road to the north.',
    },
    {
      x: 0,
      y: -1,
      desc:
        'The gas station forecourt has two pumps, under a small awning that extends from the building to the north. It all looks a bit run down, but you cannot imagine they get much custom way out in the middle of nowhere.',
    },
    {
      x: -1,
      y: 0,
      desc:
        'You are stood outside the gas station, a single storey building, with a single window on this side, to the east.',
    },
    {
      x: 0,
      y: 1,
      desc: 'The back of the gas station, and it looks no less run down back here.',
    },
    {
      x: 1,
      y: 1,
      desc:
        'Behind the gas station, or rather the small house attached to it. There is a door to the south.',
    },
    {
      x: 2,
      y: 0,
      desc: 'On the east side of the gas station.',
    },
    {
      x: 1,
      y: -1,
      desc:
        'You are stood in front of the gas station, or rather, the house attached to it. There is no door, presumably access is via the shop (or the back perhaps).',
    },
    {
      when(x, y) {
        return y === -2 && x < -1;
      },
      desc: 'You are stood on the road, to the east you can see the bus.',
    },
    {
      when(x, y) {
        return y === -2;
      },
      desc: 'You are stood on the road, to the west you can see the gas station.',
    },
    {
      when(x, y) {
        return y > -2;
      },
      desc: 'You are stood in the desert, north of the road.',
    },
    {
      desc: 'You are stood in the desert, south of the road.',
    },
  ],
});

QuestJs._create.createItem(
  'silver_coin',
  QuestJs._templates.TAKEABLE(),
  ZONE_ITEM('desert', -2, 4),
  {
    examine: 'A curious silver coin; you do not recognise it. It says it is worth two dollars.',
  },
);

QuestJs._create.createItem('gas_pump', QuestJs._templates.TAKEABLE(), ZONE_ITEM('desert', 0, -1), {
  scenery: true,
  examine:
    'There are two gas pumps, white and slim. They are labelled "SkyChief", by Texaco, and look ancient - so old the displays are rotating drums rather than digital. The price is $1.49; surely gas has not been that cheap since the nineties?',
});
