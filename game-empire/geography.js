// A region cannot be changed!
// Must have at least one square
class Region {
  constructor(name, colour, x, ys) {
    const points = ys.split(' ');
    this.x = x;
    this.froms = [];
    this.tos = [];
    this.cities = [];
    this.name = name;
    this.colour = colour;
    this.count = 0;
    this.minX = x;
    this.maxX = x - 1;
    for (const el of points) {
      const pair = el.split(',');
      const from = parseInt(pair[0]);
      const to = parseInt(pair[1]);
      if (from > to)
        QuestJs._log.info(
          `WARNING: Numbers reversed in region (${from} is greater than ${to})`,
        );
      this.froms.push(from);
      this.tos.push(to);
      this.count += to - from + 1;
      this.maxX += 1;
      if (this.minY === undefined) {
        this.minY = from;
        this.maxY = to;
      } else {
        if (this.minY > from) this.minY = from;
        if (this.maxY < to) this.maxY = to;
      }
    }
  }

  contains(x, y) {
    x -= this.x;
    if (this.froms[x] === undefined) return false;
    if (y < this.froms[x]) return false;
    if (y > this.tos[x]) return false;
    return true;
  }

  overlaps(reg) {
    if (this.maxX < reg.minX) return false;
    if (this.minX > reg.maxX) return false;
    if (this.maxY < reg.minY) return false;
    if (this.minY > reg.maxY) return false;
    for (let x = this.minX; x <= this.maxX; x += 1) {
      for (let y = this.minY; y <= this.maxY; y += 1) {
        if (this.contains(x, y) && reg.contains(x, y)) return true;
      }
    }
    return false;
  }

  addCity(name, x, y, size, desc) {
    this.cities.push({ name, x, y, pop: size, desc });
  }

  cityAt(x, y) {
    for (const el of this.cities) {
      if (el.x === x && el.y === y) return el;
    }
    return false;
  }
}

const nation = {
  size: 36,
  map: [],
  cityAt(x, y) {
    for (const el of this.regions) {
      const city = el.cityAt(x, y);
      if (city) return city;
    }
    return false;
  },
  resource(s) {
    return this.resources.find((el) => el.name === s);
  },
  resources: [
    {
      name: "carrots",
      desc: "Rabbits eat carrots.",
      spoilage: 0.07,
      amount: 10,
    },
    { name: 'wheat', desc: 'Used to make pasta.', spoilage: 0.11, amount: 15 },
    {
      name: "pasta",
      desc: "Bears eat pasta, often with honey.",
      spoilage: 0.03,
      amount: 5,
    },
    {
      name: "honey",
      desc: "Bears like honey. A lot.",
      spoilage: 0.01,
      amount: 5,
    },
  ],
};
/*
nation.factions = [
  {name:'alchemists', desc:'Workers of magical powers, this also includes wizards, demonologists, etc.'},
  {name:'artisans', desc:'Craftsmen, usually with a workshop in a city.'},
  {name:'artists', desc:'A small number of artists, musicians, composers and writers who create culture and prestige in the nation.'},
  {name:'land owners', desc:'The landed gentry; very wealthy and so influential.'},
  {name:'military', desc:'Soldiers and sailors of all ranks.'},
  {name:'miners', desc:'As the name says.'},
  {name:'nautical workers', desc:'Dock workers, fishermen and other sailors.'},
  {name:'priests', desc:'As they claim to talk to the gods, they often have a lot of influence.'},
  {name:'rural workers', desc:'People who work the land, mostly on farms owned by someone else.'},
  {name:'service workers', desc:'Couriers, scribes, waiters/waitresses, barber, etc.'},
]

nation.resources = [
  {name:'basic food', },
  {name:'fine food', },
  {name:'base metals', },
  {name:'precious metals', },
] */

// prof moo cow

nation.regions = [
  new Region('Bunnitonia', 'orange', 4, '6,7 5,9 4,11 4,11 3,11 2,11 3,8 3,8'),
  new Region(
    'Seaside',
    '#8888ff',
    12,
    '4,7 4,7 4,8 4,9 4,12 4,13 4,14 5,14 6,15 7,15 9,14 9,13 10,12 11,11'
  ),
  new Region(
    'Piggyville',
    'pink',
    22,
    '15,18 14,21 13,21 12,20 12,20 16,20 14,18 15,16'
  ),
  new Region(
    'Nicetown',
    'yellow',
    5,
    '12,15 12,17 12,18 12,18 12,17 9,17 9,17 8,16 8,15 9,14, 10,12'
  ),
  new Region(
    'Picnicland',
    '#ff8080',
    9,
    '18,20 18,21 18,21 17,22 16,23 15,23 13,22 13,22 14,21 15,21 15,22 16,22 16,22 19,21'
  ),
];

nation.regions[0].addCity('Bunniholme', 11, 5, 3, 'The city of rabbits.');
nation.regions[1].addCity(
  'Capital city',
  18,
  11,
  7,
  'The main city, on the confluence of two rivers.'
);
nation.regions[2].addCity(
  'Quieton',
  13,
  19,
  1,
  'The smallest city, and most isolated, being further from the sea.'
);
nation.regions[3].addCity('Apeville', 13, 11, 2, 'A beautiful city.');
nation.regions[4].addCity(
  'Bearport',
  26,
  15,
  5,
  'A busy port, with a notable fishing industry.'
);

nation.units = [
  {
    name: 'Carrot farm',
    script(nation) {
      nation.resource('carrots').amount += nation.carrot_farm_count;
    },
  },
  {
    name: 'Rabbits',
    script(nation) {
      nation.resource('carrots').amount -= nation.population_rabbits;
    },
  },
  {
    name: 'Mines',
    script(nation) {
      nation.resource('base_metal').amount += nation.mine_count;
    },
  },
  {
    name: 'Spoilage',
    script(nation) {
      for (const el of nation.resources) {
        if (el.spoilage) el.amount *= 1 - el.spoilage;
      }
    },
  },
];

/*
high x and low y is sea
want three rivers, one or two branching
with five cities along them, including a port and a capital
*/
for (let x = 0; x < nation.size; x += 1) {
  const row = [];
  for (let y = 0; y < nation.size; y += 1) {
    row.push({ colour: x - y > 14 ? 'blue' : 'green' });
  }
  nation.map.push(row);
}

const setRiver = function (x, y, side, n) {
  if (x < 0 || y < 0 || x >= nation.size || y >= nation.size) return;
  if (side.startsWith('l')) nation.map[x][y].riverLeft = n;
  if (side.startsWith('r')) nation.map[x][y].riverRight = n;
};

const riverRight = function (x, y, count) {
  x -= 1;
  for (let j = count; j > 0; j -= 1) {
    for (let i = 0; i < QuestJs._random.int(4) + 2; i += 1) {
      y += 1;
      setRiver(x, y, 'right', j);
    }
    y += 1;
    x += 1;
    for (let i = 0; i < QuestJs._random.int(4) + 1; i += 1) {
      x -= 1;
      setRiver(x, y, 'left', j);
    }
    x -= 1;
    y -= 1;
  }
};
const riverLeft = function (x, y, count) {
  y += 1;
  for (let j = count; j > 0; j -= 1) {
    for (let i = 0; i < QuestJs._random.int(4) + 2; i += 1) {
      x -= 1;
      setRiver(x, y, 'left', j);
    }
    x -= 1;
    y -= 1;
    for (let i = 0; i < QuestJs._random.int(4) + 1; i += 1) {
      y += 1;
      setRiver(x, y, 'right', j);
    }
    y += 1;
    x += 1;
  }
};
const riverSet = function (x, y, w, values) {
  values = values.split(' ').map((el) => parseInt(el));
  let left = true;
  for (let k = 0; k < values.length; k += 1) {
    const width = (w * (values.length - k)) / values.length;
    if (left) {
      for (let i = 0; i < values[k]; i += 1) {
        x -= 1;
        setRiver(x, y, 'left', width);
      }
      x -= 1;
      y -= 1;
    } else {
      for (let i = 0; i < values[k]; i += 1) {
        y += 1;
        setRiver(x, y, 'right', width);
      }
      y += 1;
      x += 1;
    }
    left = !left;
  }
};
nation.map[17][3].colour = 'blue';
nation.map[16][3].colour = 'blue';
nation.map[16][2].colour = 'blue';
nation.map[15][3].colour = 'blue';
riverSet(15, 4, 5, '3 5 2 3 5 3 2');

nation.map[27][13].colour = 'blue';
nation.map[27][14].colour = 'blue';
nation.map[27][15].colour = 'blue';
riverSet(27, 15, 4, '0 5 3 2 4 1');

nation.map[22][8].colour = 'blue';
nation.map[21][9].riverRight = 5;
nation.map[21][10].riverLeft = 5;
nation.map[20][10].riverLeft = 5;
nation.map[19][10].riverLeft = 5;
nation.map[18][10].riverRight = 5;
nation.map[18][11].riverLeft = 2;
nation.map[18][11].riverRight = 2;
riverSet(19, 11, 2, '0 3 2 4 2 1 3 2 4 2 3 1');
riverSet(18, 11, 2, '4 3 3 2 3 2 1');
