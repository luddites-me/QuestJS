QuestJs._create.createRoom('nowhere', {});

QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'stasis_pod_room',
  regex: /^(me|myself|player)$/,
  status: 100,
  bonus: 0,
  baseOxygeUse: 6,
  oxygenUseModifier: 1,
  oxygenUse() {
    return this.baseOxygeUse * this.oxygenUseModifier;
  },
  examine(isMultiple) {
    QuestJs._io.msg(`${QuestJs._tools.prefix(this, isMultiple)}You feel fine...`);
  },
  canMove(ex) {
    let room1 = QuestJs._w[this.loc];
    if (typeof room1.vacuum === 'string') room1 = QuestJs._w[room1.vacuum];
    let room2 = QuestJs._w[ex.name];
    if (typeof room2.vacuum === 'string') room2 = QuestJs._w[room2.vacuum];
    if (room1.vacuum === room2.vacuum) return true;
    QuestJs._io.msg(
      `The door to ${QuestJs._lang.getName(room2, {
        article: QuestJs._consts.DEFINITE,
      })} will not open while it is ${
        room1.vacuum ? 'pressurised' : 'depressurised'
      } and ${QuestJs._lang.getName(room1, { article: QuestJs._consts.DEFINITE })} is not.`,
    );
    return false;
  },
});

QuestJs._create.createItem('your_jumpsuit', QuestJs._templates.WEARABLE(2, ['body']), {
  alias: 'jumpsuit',
  loc: 'stasis_pod_drawer',
  defArticle: 'your',
  indefArticle: 'your',
  examine:
    'Your jumpsuit is tight, but comfortable; a dark grey colour, with a slight metallic sheen.',
  onMove(toLoc, fromLoc) {
    if (fromLoc === 'stasis_pod_drawer') {
      delete QuestJs._w.stasis_pod_drawer.loc;
      QuestJs._io.msg('The stasis pod drawer slides shut.');
    }
  },
});

QuestJs._create.createItem('your_underwear', QuestJs._templates.WEARABLE(1, ['body']), {
  alias: 'underwear',
  loc: 'me',
  worn: true,
  defArticle: 'your',
  indefArticle: 'your',
  examine: 'Your underwear is standard issue; white and functional.',
});

//-----------------------------------------------------
// STARBOARD POD

QuestJs._create.createRoom('stasis_bay', {
  deckName: 'layer1',
  svgId: 'rect2756',
  alias: 'stasis bay',
  desc:
    'There are six stasis pods here (despite only five crew members), four on one side and two on the other. {stasis_pod_status} Above each pod is a diagnostics screen, and behind them the various pipes that keep the occupant alive. Besides the pods, there is also a large locker at the back of the room. {ifHere:pile_of_vomit:There is some vomit on the floor by your stasis pod. }The exits are to port and aft.',
  tpStatus() {
    const arr = [];
    for (const npc of NPCS) {
      if (npc.status === 'stasis') {
        arr.push(npc);
      }
    }
    switch (arr.length) {
      case 0:
        return 'All pods are currently open.';
      case 4:
        return 'Currently only your pod and the spare pod are open.';
      case 1:
        return `${QuestJs._lang.getName(arr[0], { possessive: true })} stasis pod is closed.`;
      default:
        return `The stasis pods of ${QuestJs._tools.formatList(arr)} are closed.`;
    }
  },
  vacuum: false,
  port: new QuestJs._create.Exit('hallway'),
  aft: new QuestJs._create.Exit('cargo_bay'),
  in: new QuestJs._create.Exit('stasis_pod_room', { msg: 'You climb into the stasis pod.' }),
});

QuestJs._create.createItem('pile_of_vomit', {
  scenery: true,
  regex: /vomit|sick/,
  examine:
    'A large splat of vomit, it stinks. You decide not to look too closely. You already know what you ate last, so what is the point?',
});

QuestJs._create.createItem('stasis_pod', {
  alias: 'pod',
  regex: /^(stasis )?pods?$/,
  scenery: true,
  loc: 'stasis_bay',
  examine:
    'Externally, the pods are rather less like coffins, as the sides are thick with the stasis equipment, and flared towards the floor. Each stasis pod is about waist height. {stasis_pod_status}{ifHere:pile_of_vomit: One has a slight splattering of vomit.}',
});

QuestJs._create.createItem('stasis_pod_drawer', QuestJs._templates.CONTAINER(false), {
  alias: 'drawer',
  scenery: true,
  loc: 'stasis_bay',
  closed: false,
  examine:
    'The drawer extends out from the foot of the pod; it is white and quite shallow, and almost the width of the pod.{ifHere:pile_of_vomit: Fortunately, it is well away from the vomit.}',
});

QuestJs._create.createItem('stasis_locker', QuestJs._templates.CONTAINER(true), {
  alias: 'locker',
  scenery: true,
  loc: 'stasis_bay',
  examine(isMultiple) {
    if (this.closed) {
      QuestJs._io.msg(
        `${QuestJs._tools.prefix(
          this,
          isMultiple,
        )}This metal locker is taller than you, and just as wide; it is where spacesuits are stored{once: (if there is an emergency, you want the spacesuits by the stasis pods)}.`,
      );
    } else {
      QuestJs._io.msg(
        `${QuestJs._tools.prefix(
          this,
          isMultiple,
        )}This metal locker is taller than you, and just as wide; it is where spacesuits are stored. Inside you can see ${QuestJs._tools.formatList(
          this.getContents(QuestJs._world.LOOK),
          {
            lastJoiner: QuestJs._lang.list_and,
            article: QuestJs._consts.INDEFINITE,
          },
        )}.`,
      );
    }
  },
});

QuestJs._create.createItem('your_spacesuit', QuestJs._templates.WEARABLE(2, ['body']), {
  alias: 'spacesuit',
  loc: 'stasis_locker',
  defArticle: 'your',
  indefArticle: 'your',
  examine:
    'Your spacesuit is a pale grey colour, with bright yellow flashes on the arms and legs for visibility.',
});

QuestJs._create.createItem('other_spacesuit', {
  alias: 'spare spacesuit',
  loc: 'stasis_locker',
  examine: 'The other spacesuit is identical to your own.',
});

QuestJs._create.createRoom('stasis_pod_room', {
  deckName: 'layer1',
  svgId: 'rect2756',
  alias: 'stasis pod',
  desc:
    'The stasis pod is shaped uncomfortably like a coffin, and is a pale grey colour. The lid is in the raised position.',
  vacuum: 'stasis_bay',
  out: new QuestJs._create.Exit('stasis_bay', {
    use() {
      QuestJs._io.msg('You climb out of the stasis pod.');
      QuestJs._world.setRoom(QuestJs._game.player, this.name, 'out');
      if (QuestJs._w.your_jumpsuit.loc === 'stasis_pod_drawer') {
        QuestJs._w.stasis_pod_drawer.loc = 'stasis_bay';
        QuestJs._io.msg('A drawer under the pod slides open to reveal your jumpsuit.');
      }
      return true;
    },
  }),
});

QuestJs._create.createItem('stasis_pod_interior', QuestJs._templates.OPENABLE(true), {
  alias: 'stasis pod',
  regex: /^(stasis pod|pod|lid)$/,
  scenery: true,
  loc: 'stasis_pod_room',
  closed: false,
  examine:
    'Externally, the pods are rather less like coffins, as the sides are thick with the stasis equipment, and flared towards the floor. Each stasis pod is about waist height. {stasis_pod_status}.{ifHere:pile_of_vomit: One has a slight splattering of vomit.}',
  close(isMultiple, char) {
    if (QuestJs._w.Kyle.deployProbeAction < 5) {
      QuestJs._io.msg(
        "You give pod lid a pull, and it starts to descend for a moment, before stopping. 'Commander,' says Xsensi, 'closing the lid of a stasis pod will put you back in stasis. That is not permitted until the satellite is deployed, and not advised until probes have been deployed and data collected.' The lid rises to its fully open position.",
      );
      return false;
    }
    if (QuestJs._w.your_jumpsuit.loc === QuestJs._game.player.name) {
      QuestJs._io.msg(
        "You give pod lid a pull, and it starts to descend for a moment, before stopping. 'Commander,' says Xsensi, 'your jumpsuit should be left outside the pod when going into stasis.' The lid rises to its fully open position.",
      );
      return false;
    }

    QuestJs._w.your_jumpsuit.loc = 'stasis_pod_drawer';
    QuestJs._w.stasis_pod_drawer.scenery = true;
    QuestJs._io.msg(
      'You give pod lid a pull, and it starts to descend, sealing you in. You feel a sharp pain in your shoulder, and almost immediately you start to feel sleepy... so sleepy you cannot keep your eyes open.',
    );
    arrival();
    // MORE STUFF HERE ???
    return true;
  },
});

QuestJs._create.createRoom('cargo_bay', {
  deckName: 'layer1',
  svgId: 'rect2758',
  desc:
    "The cargo bay is a large, open area, with numerous [crates:crate], several with their own stasis fields. Yellow lines on the floor indicate access ways to be kept clear. The ship's airlock is to port, whilst engineering is aft. The stasis bay is forward, and to starboard, stairs lead up to the top deck, where the living quarters are.",
  vacuum: false,
  forward: new QuestJs._create.Exit('stasis_bay'),
  port: new QuestJs._create.Exit('top_deck_aft', {
    msg: 'You walk up the narrow stair way to the top deck.',
    alsoDir: ['up'],
  }),
  starboard: new QuestJs._create.Exit('airlock'),
  aft: new QuestJs._create.Exit('engineering3'),
});

QuestJs._create.createRoom('airlock', {
  deckName: 'layer1',
  svgId: 'rect2770',
  desc:
    'The airlock is just big enough for two persons wearing spacesuits, and is featureless besides the doors, port and starboard, and the [controls].',
  vacuum: false,
  port: new QuestJs._create.Exit('cargo_bay'),
  starboard: new QuestJs._create.Exit('space', { locked: true }),
});

//-----------------------------------------------------
// CENTRAL AXIS

QuestJs._create.createRoom('hallway', {
  deckName: 'layer1',
  svgId: 'rect2768',
  desc:
    'This is, in a sense, the central nexus of the ship. The flight-deck is forward, the stasis bay to starboard, the labs to port. A ladder goes up to the living quarters and down to the probe hangers.',
  vacuum: false,
  starboard: new QuestJs._create.Exit('stasis_bay'),
  port: new QuestJs._create.Exit('biolab'),
  up: new QuestJs._create.Exit('top_deck_forward'),
  down: new QuestJs._create.Exit('probes_forward'),
  forward: new QuestJs._create.Exit('flightdeck'),
  aft: new QuestJs._create.Exit('service_passage', {
    isHidden() {
      return true;
    },
  }),
});

QuestJs._create.createRoom('service_passage', {
  deckName: 'layer1',
  svgId: 'rect16',
  desc:
    'A narrow passage running along the spine of the ship, the walls are covered in piping, conduits and cabling.',
  vacuum: false,
  forward: new QuestJs._create.Exit('hallway', {
    isHidden() {
      return true;
    },
  }),
  aft: new QuestJs._create.Exit('engineering2', {
    isHidden() {
      return true;
    },
  }),
});

QuestJs._create.createRoom('flightdeck', {
  deckName: 'layer1',
  svgId: 'path841',
  alias: 'flight-deck',
  desc:
    'The flight deck is semi-circular, with windows looking out in all directions. In the centre is the command chair, and there are four other chairs at the various workstations. The flight-deck can be used as an escape capsule, and can be landed on a suitable planet (but cannot be used to get back to space). The only exit is aft.',
  vacuum: false,
  aft: new QuestJs._create.Exit('hallway'),
});

//-----------------------------------------------------
// LABS

QuestJs._create.createRoom('biolab', {
  deckName: 'layer1',
  svgId: 'rect2752',
  alias: 'Bio-lab',
  desc:
    'The bio-lab is really just a large office, with two chairs, a desk and lots of compuer screens.',
  vacuum: false,
  starboard: new QuestJs._create.Exit('hallway'),
  aft: new QuestJs._create.Exit('geolab'),
});

QuestJs._create.createRoom('geolab', {
  deckName: 'layer1',
  svgId: 'rect2754',
  alias: 'Geo-lab',
  desc:
    'The geo-lab is really just a large office, with two chairs, a desk and lots of compuer screens.',
  vacuum: false,
  forward: new QuestJs._create.Exit('biolab'),
  starboard: new QuestJs._create.Exit('probes_aft', {
    msg: 'You walk down the narrow stair way to the bottom deck.',
    alsoDir: ['down'],
  }),
  aft: new QuestJs._create.Exit('engineering1'),
});

//-----------------------------------------------------
// ENGINEERING

QuestJs._create.createRoom('engineering1', {
  deckName: 'layer1',
  svgId: 'path2760',
  desc:
    'This is where the fusion micro-reactor stands, a vaguely cylindrical device about a meter across, and stretching from floor to ceiling. Cables run to a small console nearby.',
  alias: 'Engineering (port)',
  properName: true,
  vacuum: 'engineering2',
  starboard: new QuestJs._create.Exit('engineering2'),
  forward: new QuestJs._create.Exit('geolab'),
});

QuestJs._create.createRoom('engineering2', {
  deckName: 'layer1',
  svgId: 'path4106',
  desc:
    'The main engineers are here, five huge light-drives that project out the rear of the ship.',
  alias: 'Engineering (aft)',
  properName: true,
  vacuum: false,
  starboard: new QuestJs._create.Exit('engineering3'),
  port: new QuestJs._create.Exit('engineering1'),
  forward: new QuestJs._create.Exit('service_passage', {
    isHidden() {
      return true;
    },
  }),
});

QuestJs._create.createRoom('engineering3', {
  deckName: 'layer1',
  svgId: 'path4108',
  desc:
    'The various life-support machinery is housed on this side of engineering, including the CO2 scrubbers and water recycler.',
  properName: true,
  alias: 'Engineering (starboard)',
  vacuum: 'engineering2',
  port: new QuestJs._create.Exit('engineering2'),
  forward: new QuestJs._create.Exit('cargo_bay'),
});

//-----------------------------------------------------
// LOWER DECK

QuestJs._create.createRoom('probes_forward', {
  deckName: 'layer3',
  svgId: 'rect3634',
  alias: 'Forward probe hanger',
  desc:
    'The forward probe hanger is where the satellites are stored ready for deployment. The six satellites are kept in a dust-free environment on the starboard side of the hanger, each on a cradle. A robot arm is available to pick them up and eject them through a hatch in the floor.|On the port side, the seeder pods are stored. Each pod contains a variety of simple lifeforms, such as algae, which, it is hoped, will kick-start life on a suitable planet. It is a long term plan. There are six pods, three to be deployed at distant locations on a planet.| There is a control console to handle it all, though it can also be done remotely.',
  vacuum: false,
  up: new QuestJs._create.Exit('hallway'),
  aft: new QuestJs._create.Exit('probes_aft'),
  forward: new QuestJs._create.Exit('server_room'),
});

QuestJs._create.createRoom('probes_aft', {
  deckName: 'layer3',
  svgId: 'rect3638',
  alias: 'Aft probe hanger',
  desc:
    'The aft probe hanger has the scientific probes. Each probe is contained in a crate, and needs unpacking before deployment. On the port side there is a delivery system into which a probe can be placed, to be sent to the planet. Various types of probes are available.',
  vacuum: false,
  port: new QuestJs._create.Exit('geolab', {
    msg: 'You walk up the narrow stair way to the middle deck.',
    alsoDir: ['up'],
  }),
  forward: new QuestJs._create.Exit('probes_forward'),
});

QuestJs._create.createRoom('server_room', {
  deckName: 'layer3',
  svgId: 'path3619',
  desc:
    'The heart of the IT systems, including Xsansi, This room holds three racks of processors, each rack having four shelves and each shelf having eight units. The room is kept cool and smells slightly of ozone.',
  vacuum: false,
  aft: new QuestJs._create.Exit('probes_forward'),
});

//-----------------------------------------------------
// UPPER DECK

QuestJs._create.createRoom('lounge', {
  deckName: 'layer4',
  svgId: 'path3973',
  desc:
    'The lounge has five well-padded seats, all facing the large windows that curve round the front of the ship, and over the ceiling too.',
  vacuum: false,
  aft: new QuestJs._create.Exit('top_deck_forward'),
});

QuestJs._create.createRoom('top_deck_forward', {
  deckName: 'layer4',
  svgId: 'rect4090',
  desc() {
    if (!QuestJs._w.top_deck_aft.meFirst) {
      this.meFirst = true;
      return QuestJs._w.top_deck_aft.descStart + this.descThis + QuestJs._w.top_deck_aft.descFinish;
    }

    return this.descThis;
  },
  descThis:
    'You are stood at the forward end of a narrow corridor, with your cabin to port, and the canteen to starboard. Ahead, is the lounge.',
  vacuum: false,
  down: new QuestJs._create.Exit('hallway'),
  starboard: new QuestJs._create.Exit('canteen'),
  port: new QuestJs._create.Exit('your_cabin'),
  aft: new QuestJs._create.Exit('top_deck_aft'),
  forward: new QuestJs._create.Exit('lounge'),
});

QuestJs._create.createRoom('top_deck_aft', {
  deckName: 'layer4',
  svgId: 'rect3976',
  descStart: 'The top deck is where the living quarters - such as they are - are accessed. ',
  descFinish:
    ' The corridor is very utilitarian, with a metal floor and ceiling. The sides are mostly covered in white plastic panels, as a small concession to aesthetics.',
  desc() {
    if (!QuestJs._w.top_deck_forward.meFirst) {
      this.meFirst = true;
      return QuestJs._w.top_deck_aft.descStart + this.descThis + QuestJs._w.top_deck_aft.descFinish;
    }

    return this.descThis;
  },
  descThis:
    "You are stood at the aft end of a narrow corridor, with the women's cabin behind you, the men's to port. To starboard, steps lead down to the cargo bay on the lower deck.",
  vacuum: 'top_deck_forward',
  port: new QuestJs._create.Exit('guys_cabin'),
  aft: new QuestJs._create.Exit('girls_cabin'),
  starboard: new QuestJs._create.Exit('cargo_bay', {
    msg: 'You walk down the narrow stair way to the middle deck.',
    alsoDir: ['down'],
  }),
  forward: new QuestJs._create.Exit('top_deck_forward'),
});

QuestJs._create.createRoom('canteen', {
  deckName: 'layer4',
  svgId: 'rect3979',
  desc:
    'The canteen, like everything else of the ship, is pretty small. There is a table, with one short side against the wall, and five plastic [chairs:chair] around it.{table_desc} At the back is the food preparation area; a work surface across the width of the room, with a sink on the right and a hob on the left.',
  vacuum: false,
  port: new QuestJs._create.Exit('top_deck_forward'),
});

QuestJs._create.createItem('canteen_table', QuestJs._templates.SURFACE(), {
  alias: 'table',
  loc: 'canteen',
  scenery: true,
  tpDesc() {
    return ' The table is bare.';
  },
  examine:
    'The table is plastic, attached to the wall at one end, and held up by a single leg at the other end.{table_desc}',
});

QuestJs._create.createRoom('your_cabin', {
  deckName: 'layer4',
  svgId: 'rect3981',
  desc: 'This is you cabin, not much more than a bed and a locker.',
  vacuum: false,
  starboard: new QuestJs._create.Exit('top_deck_forward'),
});

QuestJs._create.createRoom('guys_cabin', {
  deckName: 'layer4',
  svgId: 'rect3983',
  desc: 'Two bunk beds and two lockers pretty much sums up this room.',
  alias: "Men's cabin",
  vacuum: false,
  starboard: new QuestJs._create.Exit('top_deck_aft'),
});

QuestJs._create.createRoom('girls_cabin', {
  deckName: 'layer4',
  svgId: 'rect3985',
  desc: 'Two bunk beds and two lockers pretty much sums up this room.',
  alias: "Women's cabin",
  vacuum: false,
  forward: new QuestJs._create.Exit('top_deck_aft'),
});

//-----------------------------------------------------
// EXTERIOR

QuestJs._create.createRoom('space', {
  desc: '',
  vacuum: true,
  isSpace: true,
  port: new QuestJs._create.Exit('airlock'),
  notOnShip: true,
});

// status
// 0 not detected
// 1 detected
// 2 approached
// 3 docked

QuestJs._create.createItem('alienShip', {
  regex: /^alien ship|alien vessel|ship|vessel$/,
  desc: '',
  isShip: true,
  status: 0,
});

QuestJs._create.createItem('ship', {
  regex: /^ship|alien vessel|ship|vessel$/,
  desc: '',
  isShip: true,
  oxygen: 9546,
  status: 0,
  eventIsActive() {
    return true;
  },
  eventPeriod: 1,
  eventScript() {
    this.oxygen -= QuestJs._game.player.oxygenUse(); // player using it
    for (const npc of NPCS) {
      this.oxygen -= npc.oxygenUse();
    }
  },
});

//-----------------------------------------------------
// SPECIAL ITEMS

// Probes are cloned from this
//
QuestJs._create.createItem('probe_prototype', QuestJs._templates.COUNTABLE([]), {
  alias: 'probe',
  regex: /^(\d+ )?(bio-|geo-|bio|geo)?(probe|satellite|satelite)s?$/,
  launch(isMultiple, char) {
    if (!char.probeType)
      return QuestJs._io.falsemsg(
        'To launch a probe, see either Aada or Ostap. For a satellite see Kyle.',
      );

    let number = this.extractNumber();
    if (!number) number = 1;

    if (number === 1) {
      QuestJs._io.msg(
        `'Launch a ${char.probeType},' you say to ${QuestJs._lang.getName(char, {
          article: QuestJs._consts.DEFINITE,
        })}.`,
      );
    } else {
      QuestJs._io.msg(
        `'Launch ${number} ${char.probeType}s,' you say to ${QuestJs._lang.getName(char, {
          article: QuestJs._consts.DEFINITE,
        })}.`,
      );
    }
    if (number > char.probesRemaining) {
      return QuestJs._io.falsemsg(
        `'We only have ${char.probesRemaining} and we should save some for the other planets on our itinerary.'`,
      );
    }

    if (char.probeType === 'satellite') {
      if (number > 2 - char.deployProbeTotal) {
        QuestJs._io.msg(
          "'Are you sure? Protocol says we should deploy no more than two around a single planet.'",
        );
        QuestJs._io.msg(
          "'Hey, I'm the captain. It's my bonus on the line here. Get those satellites deployed.'",
        );
      }
    } else if (number > 5 - char.deployProbeTotal) {
      QuestJs._io.msg(
        "'Are you sure? Protocol says we should deploy no more than five on a single planet.'",
      );
      QuestJs._io.msg(
        "'Hey, I'm the captain. It's my bonus on the line here. Get those probes deployed.'",
      );
    }

    if (char.deployProbeAction === 0 || char.deployProbeAction === 4) {
      QuestJs._io.msg("'Okay captain.'");
      char.setAgenda([
        `walkTo:probes_aft:${QuestJs._lang.getName(char, {
          article: QuestJs._consts.DEFINITE,
        })} goes to the probe deployment console.`,
        `text:deployProbe:${number}`,
      ]);
      char.deployProbeAction = 0;
      char.deployProbeCount = 0;
    } else {
      // already part way through launching
      // skip walking there, skip first deploy action
      // the old number should be replaced
      QuestJs._io.msg("'Okay captain.'");
      char.setAgenda([`text:deployProbe:${number}`]);
      char.deployProbeAction = 1;
    }
    return true;
  },
  launchCounter: 0,
  status: 'In flight',
  countAtLoc(loc) {
    return 0;
  },
  eventIsActive() {
    return this.clonePrototype;
  },
  cloneMe(owner) {
    const probe = QuestJs._create.cloneObject(this);
    probe.alias = `${QuestJs._tools.sentenceCase(owner.probeType)} ${QuestJs._tools.toRoman(
      owner.deployProbeOverallTotal,
    )}`;
    probe.probeType = owner.probeType;
    probe.planetNumber = QuestJs._w.Xsansi.currentPlanet;
    probe.probeNumber = owner.deployProbeTotal;
    probe.owner = owner.name;
    probe.parsePriority = -100;
    probe.eventScript =
      owner.probeType === 'satellite' ? this.satelliteEventScript : this.probeEventScript;
    return probe;
  },

  probeEventScript() {
    this.launchCounter++;
    if (this.launchCounter === TURNS_TO_LANDING) {
      if (probeLandsOkay()) {
        this.status = 'Landing';
        shipAlert(`${this.alias} has successfully landed on the planet.`);
      } else {
        shipAlert(
          `Contact with ${this.alias} has been lost as it attempted to land on the planet.`,
        );
        this.launched = false;
        this.status = 'Destroyed';
      }
    }
    if (this.launchCounter === TURNS_TO_LANDING + 1) {
      this.status = 'Exploring';
    }
    const arr =
      PLANETS[this.planetNumber][`${this.probeType.substring(0, 3)}ProbeRanks`][
        this.probeNumber - 1
      ];
    if (arr !== undefined && arr.includes(this.launchCounter - TURNS_TO_LANDING)) {
      QuestJs._w[this.owner][`rank${this.planetNumber}`]++;
      QuestJs._game.player.bonus +=
        PLANETS[this.planetNumber][`${this.probeType.substring(0, 3)}ProbeBonusPerRank`];
    }
  },

  satelliteEventScript() {
    this.launchCounter++;
    if (this.launchCounter === TURNS_TO_ORBIT) {
      this.status = 'In orbit';
      shipAlert(`${this.alias} has successfully entered orbit around the planet.`);
    }
    if (this.launchCounter === TURNS_TO_ORBIT + 1) {
      this.status = 'Scanning';
    }
    if (this.launchCounter > TURNS_TO_ORBIT + 1 && this.launchCounter % 4 === 0) {
      QuestJs._game.player.bonus += 1;
      QuestJs._w[this.owner].rank++;
    }
  },
});
