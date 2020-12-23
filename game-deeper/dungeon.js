/*
Have one prototype dungeon room with six exits, and disable exits as appropriate
Have themes and regions
Whether an exit is present is set by exit_???, and its type by exit_???_type

*/

const dungeon = {
  size: 6,
  cellSize: 50,
  mapSize: 550,
  mapOffset: 50,
  mapOptions: { showUpDown: true, showYouAreHere: true, show: false },
  cellpercentage: 80,
  exitpercentage: 80,
  themescount: 10,
  dirs: [
    QuestJs._lang.exit_list.find((el) => el.name === 'north'),
    QuestJs._lang.exit_list.find((el) => el.name === 'east'),
    QuestJs._lang.exit_list.find((el) => el.name === 'south'),
    QuestJs._lang.exit_list.find((el) => el.name === 'west'),
  ],
  shapes: [
    {
      name: 'ew rectangle',
      descs: ['A fair-sized east-west room.', 'This room is retangular.'],
      adjective: 'rectangular',
      draw(x, y, fill) {
        return `<rect x="${x + 5}" y="${
          y + 15
        }" width="40" height="20" stroke="none" fill="${fill}"/>`;
      },
    },
    {
      name: "ns rectangle",
      descs: [
        'This rectangular room goes north-south.',
        'An oblong room, going north-south.',
      ],
      adjective: 'rectangular',
      draw(x, y, fill) {
        return `<rect x="${x + 15}" y="${
          y + 5
        }" width="20" height="40" stroke="none" fill="${fill}"/>`;
      },
    },
    {
      name: "circle",
      descs: [
        'A circular room.',
        'This is a smaller room, the walls forming a circle.',
      ],
      adjective: 'circular',
      draw(x, y, fill) {
        return `<circle cx="${x + 25}" cy="${
          y + 25
        }" r="15" stroke="none" fill="${fill}"/>`;
      },
    },
    {
      name: 'square',
      descs: ['A square room.', 'This room looks square.'],
      adjective: 'square',
      draw(x, y, fill) {
        return `<rect x="${x + 5}" y="${
          y + 5
        }" width="40" height="40" stroke="none" fill="${fill}"/>`;
      },
    },
    {
      name: 'small square',
      descs: ['A small, square room.', 'Small and square.'],
      adjective: 'square',
      draw(x, y, fill) {
        return `<rect x="${x + 10}" y="${
          y + 10
        }" width="30" height="30" stroke="none" fill="${fill}"/>`;
      },
    },
    {
      name: "octagon",
      descs: [
        'This eight-sided room is pretty large.',
        'An sizable, octagonal room.',
      ],
      adjective: 'octagonal',
      draw(x, y, fill) {
        let s = '<polygon points="';
        s += `${x + 5},${y + 17} `;
        s += `${x + 5},${y + 33} `;
        s += `${x + 17},${y + 45} `;
        s += `${x + 33},${y + 45} `;
        s += `${x + 45},${y + 33} `;
        s += `${x + 45},${y + 17} `;
        s += `${x + 33},${y + 5} `;
        s += `${x + 17},${y + 5} `;
        s += `" stroke="none" fill="${fill}"/>`;
        return s;
      },
    },
  ],
  corridor: {
    name: 'corridor',
    draw(x, y, fill) {
      return `<rect x="${x + 20}" y="${
        y + 20
      }" width="10" height="10" stroke="none" fill="blue"/>`;
    },
  },
};

//  Master function to generate the whole level.
dungeon.generateLevel = function (from_room) {
  QuestJs._log.info('About to generate...');
  const limit = (dungeon.size - 1) / 2;
  const level = from_room.level + 1;
  let theme;
  if (level < 3) {
    theme = 'e_dungeon';
  } else if (QuestJs._random.chance(50)) {
    theme = from_room.theme;
  } else if (QuestJs._random.chance(50)) {
    theme = 'e_dungeon';
  } else {
    theme = QuestJs._random.fromArray(['e_dungeon']);
  }
  dungeon.generateBasicRooms(level, theme);
  QuestJs._log.info('Rooms created');
  dungeon.setUpCentreRoom(level, from_room);
  const levellist = dungeon.checkConnectivity(level);
  const waydown = dungeon.setWayDown(levellist);
  QuestJs._log.info(`About to decorate ${levellist.length}`);
  for (const room of levellist) {
    dungeon.decorateRoom(room);
  }
  // list remove (levellist, waydown)
  // Populate (levellist, level)
};

dungeon.decorateRoom = function (room, level, theme) {
  room.theme = theme;
  const exits = room.getExits();
  if (
    (room.x === 0 && room.y === 0) ||
    exits.length === 1 ||
    QuestJs._random.chance(25) ||
    room.exit_down
  ) {
    room.roomType = QuestJs._random.fromArray(dungeon.shapes);
    room.desc = QuestJs._random.fromArray(room.roomType.descs);

    if (exits.length === 1) {
      room.desc += ` The only exit is ${exits.map((el) => el.name)}.`;
    } else {
      room.desc += ' There are exits ';
      room.desc += QuestJs._tools.formatList(
        exits.map((el) => el.name),
        { lastJoiner: QuestJs._lang.list_and },
      );
      room.desc += '.';
    }
  } else {
    room.roomType = dungeon.corridor;
    if (exits.length === 4) {
      room.desc = 'Two tunnels meet and cross.';
    }
    if (exits.length === 3) {
      if (!room.exit_north)
        room.desc = 'A tunnel from the south meets one going east to west.';
      if (!room.exit_east)
        room.desc =
          'You are at a junction between a tunnel from the west and another going north to south.';
      if (!room.exit_south)
        room.desc =
          'A tunnel going east to west has a side passage to the north.';
      if (!room.exit_west)
        room.desc =
          'This is an intersection between a tunnel from the east and another going north to south.';
    }
    if (exits.length === 2) {
      if (room.exit_north && room.exit_south) {
        room.desc = 'You are stood in a passage going north to south.';
      } else if (room.exit_east && room.exit_west) {
        room.desc = 'You are stood in a tunnel that runs from east to west.';
      } else
        room.desc = `The tunnel turns a corner here, going ${QuestJs._tools.formatList(
          room.getExits().map((el) => el.name),
          { def: 'a', joiner: ' and' },
        )}.`;
    }
  }
};

// Creates each room of the level.
// Rooms are created in a grid, with a random chance of being there depending
// on the distance from the centre.
dungeon.generateBasicRooms = function (level, theme) {
  for (let x = -dungeon.size; x <= dungeon.size; x += 1) {
    for (let y = -dungeon.size; y <= dungeon.size; y += 1) {
      // QuestJs._log.info('x=' + x + ' y=' + y + ' p=' + (100 - dungeon.cellpercentage * dungeon.fromCentre(x, y) / dungeon.size))
      if (
        QuestJs._random.chance(
          100 -
            (dungeon.cellpercentage * dungeon.fromCentre(x, y)) / dungeon.size,
        )
      ) {
        dungeon.generateBasicRoom(level, x, y, theme);
      }
    }
  }
};

// Creates a single room with default values.
// Also creates exits to south and west if there is a room there and at QuestJs._random.
dungeon.generateBasicRoom = function (level, x, y, theme) {
  const name = dungeon.getRoomName(x, y, level);
  // QuestJs._log.info(name)
  const name_west = dungeon.getRoomName(x - 1, y, level);
  const name_south = dungeon.getRoomName(x, y - 1, level);
  const room = QuestJs._create.cloneObject(
    'dungeon_cell_prototype',
    undefined,
    name,
  );
  // QuestJs._log.info(room)
  room.accessible = false;
  room.alias = 'Lost in a dungeon';
  room.level = level;
  room.x = x;
  room.y = y;
  const room_west = QuestJs._w[name_west];
  if (
    room_west !== undefined &&
    QuestJs._random.chance(dungeon.exitpercentage)
  ) {
    room.exit_west = true;
    room_west.exit_east = true;
    room_west.exit_east_type = room.exit_west_type = QuestJs._random.int(
      dungeon.themescount,
    );
  }
  const room_south = QuestJs._w[name_south];
  if (
    room_south !== undefined &&
    QuestJs._random.chance(dungeon.exitpercentage)
  ) {
    room.exit_south = true;
    room_south.exit_north = true;
    room_south.exit_north_type = room.exit_south_type = QuestJs._random.int(
      dungeon.themescount,
    );
  }
  QuestJs._w[name] = room;
};

// Checks all rooms are connected, deleting any that are not.
dungeon.checkConnectivity = function (level) {
  // loop through each room, flagging those that are connected
  // keep going until no new ones are flagged
  QuestJs._w[dungeon.getRoomName(0, 0, level)].accessible = true;
  let flag = true;
  while (flag) {
    QuestJs._log.info('LOOP');
    flag = false;
    for (let x = -dungeon.size; x <= dungeon.size; x += 1) {
      for (let y = -dungeon.size; y <= dungeon.size; y += 1) {
        const room = QuestJs._w[dungeon.getRoomName(x, y, level)];
        if (room !== undefined && room.accessible) {
          flag = flag || dungeon.flagAllAdjacent(room);
        }
      }
    }
  }

  // now delete rooms that are not accessible
  // and pick the way to next level
  const levellist = [];
  for (let x = -dungeon.size; x <= dungeon.size; x += 1) {
    for (let y = -dungeon.size; y <= dungeon.size; y += 1) {
      const room = QuestJs._w[dungeon.getRoomName(x, y, level)];
      if (room !== undefined) {
        if (!room.accessible) {
          delete QuestJs._w[room.name];
        } else {
          levellist.push(room);
        }
      }
    }
  }
  return levellist;
};

// Picks a room to be the way down.
dungeon.setWayDown = function (levellist) {
  const sublist = [];
  let dist = 7;
  while (sublist.length === 0) {
    for (const o of levellist) {
      if (dungeon.fromCentre(o.x, o.y) > dist) sublist.push(o);
    }
    dist -= 1;
    // QuestJs._io.msg(dist)
  }
  const waydown = QuestJs._random.fromArray(sublist);
  waydown.exit_down = true;
  return waydown;
};

dungeon.fromCentre = function (x, y) {
  return Math.abs(x) + Math.abs(y);
};

dungeon.getRoomName = function (x, y, level) {
  return `cell_${x}_${y}_${level}`;
};

dungeon.exitCount = function (room) {
  let count = 0;
  for (const dir of dungeon.dirs) {
    if (room[`exit_${dir.name}`]) count += 1;
  }
  return count;
};

dungeon.flagAllAdjacent = function (room) {
  let flag = false;
  for (const dir of dungeon.dirs)
    flag = flag || dungeon.flagAdjacent(room, dir);
  return flag;
};

// Attempts to find the adjacent room in the given direction.
// Returns false if there is no room or if there is no exit from this room to that room.
// Expects dir to be a dictionary from QuestJs._lang.exit_list
dungeon.findAdjacent = function (room, dir) {
  if (!room[`exit_${dir.name}`]) return false;
  return QuestJs._w[
    dungeon.getRoomName(room.x + dir.x, room.y + dir.y, room.level)
  ];
};

// Attempts to flag the room in the given direction as accessible.
// Returns false if there is no room, or if it is already flagged, true otherwise.
// Expects dir to be a dictionary from QuestJs._lang.exit_list
dungeon.flagAdjacent = function (room, dir) {
  const adj = dungeon.findAdjacent(room, dir);
  if (!adj || adj.accessible) return false;
  adj.accessible = true;
  return true;
};

// Mostly just creates an exit from the centre to the from_room.
dungeon.setUpCentreRoom = function (level, from_room) {
  const centreroom = QuestJs._w[dungeon.getRoomName(0, 0, level)];
  centreroom.exit_up = true;
  from_room.exit_down = true;
};

dungeon.drawMap = function () {
  if (!dungeon.mapOptions.show) {
    QuestJs._io.metamsg('You do not have a map.');
    return;
  }

  const room = QuestJs._w[QuestJs._game.player.loc];
  QuestJs._log.info(room);
  if (!room.level) {
    QuestJs._io.metamsg('No map available here.');
    return;
  }

  // if (QuestJs._w[this.getRoomName(0, 0, room.level)] === undefined) return false

  const map = [];
  map.push(
    '<defs><marker id="head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="black" /></marker></defs>',
  );

  map.push(
    `<rect x="0" y="0" width="${dungeon.mapSize}" height="${dungeon.mapSize}" stroke="black" fill="none"/>`,
  );
  for (let x = -this.size; x <= this.size; x += 1) {
    for (let y = -this.size; y <= this.size; y += 1) {
      const r = QuestJs._w[this.getRoomName(x, y, room.level)];
      if (r === undefined) continue;
      map.push(
        r.getSvg(
          (x + this.size) * this.cellSize - dungeon.mapOffset,
          (this.size - y) * this.cellSize - dungeon.mapOffset,
        ),
      );
    }
  }
  map.push(
    `<text x="15" y="35" fill="black" font-size="2em">Level ${room.level}</text>`,
  );

  if (room.x !== undefined && dungeon.mapOptions.showYouAreHere) {
    map.push(
      `<text x="75" y="${
        dungeon.mapSize - 20
      }" text-anchor="middle" fill="black" font-size="1.5em">You are here</text>`,
    );
    const x2 = (room.x + this.size + 0.3) * this.cellSize - dungeon.mapOffset;
    const y2 = (this.size - room.y + 0.7) * this.cellSize - dungeon.mapOffset;
    map.push(
      `<line x1="75" y1="${
        dungeon.mapSize - 35
      }" x2="${x2}" y2="${y2}" stroke="black" marker-end="url(#head)"/>`,
    );
  }
  // if (this.mapBorder)
  QuestJs._io.draw(dungeon.mapSize, dungeon.mapSize, map);
  return true;
};

const showMap = function () {
  dungeon.drawMap();
};

QuestJs._create.createRoom('entrance', {
  level: 0,
  theme: 0,
  desc: 'The stairs go down...',
  down: new QuestJs._create.Exit(dungeon.getRoomName(0, 0, 1)),
  afterFirstEnter() {
    dungeon.generateLevel(this);
  },
});

dungeon.exitScript = function (char, dirName) {
  const origin = QuestJs._w[char.loc];
  if (!origin.hasExit(dirName)) {
    QuestJs._io.msg(`You can't go ${dirName}`);
    return false;
  }

  const dir = QuestJs._lang.exit_list.find((el) => el.name === dirName);

  // up and down are different!!!
  const dest =
    QuestJs._w[
      dungeon.getRoomName(origin.x + dir.x, origin.y + dir.y, origin.level)
    ];

  QuestJs._io.msg(QuestJs._lang.stop_posture(char));
  QuestJs._io.msg(QuestJs._lang.go_successful, { char, dir: dirName });
  QuestJs._world.setRoom(char, dest);
  return true;
};

QuestJs._create.createRoom('dungeon_cell_prototype', {
  level: 0,
  theme: 0,
  desc: 'The stairs go down...',
  down: new QuestJs._create.Exit('entrance', { use: dungeon.exitScript }),
  up: new QuestJs._create.Exit('entrance', { use: dungeon.exitScript }),
  north: new QuestJs._create.Exit('entrance', { use: dungeon.exitScript }),
  south: new QuestJs._create.Exit('entrance', { use: dungeon.exitScript }),
  east: new QuestJs._create.Exit('entrance', { use: dungeon.exitScript }),
  west: new QuestJs._create.Exit('entrance', { use: dungeon.exitScript }),
  afterFirstEnter() {
    if (this.exit_down) {
      dungeon.generateLevel(this);
    }
  },

  getExits(options) {
    const exits = [];
    for (const ex of QuestJs._lang.exit_list) {
      if (ex.type !== 'nocmd' && this.hasExit(ex.name, options)) {
        exits.push(ex);
      }
    }
    return exits;
  },

  hasExit(dir, options) {
    if (!this[dir]) return false;
    return this[`exit_${dir}`];
  },

  getSvg(x, y) {
    const fill =
      (this.exit_up || this.exit_down) && dungeon.mapOptions.showUpDown
        ? 'yellow'
        : 'red';
    // const fill = this.accessible ? 'yellow' : 'red'
    let s = '';
    if (this.exit_south)
      s += `<rect x="${x + 20}" y="${
        y + 30
      }" width="10" height="20" stroke="none" fill="blue"/>`;
    if (this.exit_east)
      s += `<rect x="${x + 30}" y="${
        y + 20
      }" width="20" height="10" stroke="none" fill="blue"/>`;
    if (this.exit_north)
      s += `<rect x="${
        x + 20
      }" y="${y}" width="10" height="20" stroke="none" fill="blue"/>`;
    if (this.exit_west)
      s += `<rect x="${x}" y="${
        y + 20
      }" width="20" height="10" stroke="none" fill="blue"/>`;
    s += this.roomType.draw(x, y, fill);
    if (dungeon.mapOptions.showUpDown) {
      if (this.exit_up)
        s += `<text text-anchor="middle" x="${x + dungeon.cellSize / 2}" y="${
          y + 30
        }" fill="black">Up</text>`;
      if (this.exit_down)
        s += `<text text-anchor="middle" x="${x + dungeon.cellSize / 2}" y="${
          y + 30
        }" fill="black">Down</text>`;
    }
    return s;
  },
});
