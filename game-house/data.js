QuestJs._create.createRoom('hints', {});

QuestJs._create.createItem('h_gettheletter', {
  loc: 'hints',
  examine: 'Pick up something and the house will allow you in...',
});

QuestJs._create.createItem('h_find_animate_corpse', {
  loc: 'hints',
  examine:
    'You are going to need some muscle later on. Can you find anyone suitable? Or animate someone suitable...<br/>There are other things you can do too, so explore a bit.',
});

QuestJs._create.createItem('h_animate_corpse1', {
  loc: 'hints',
  examine() {
    QuestJs._io.msg(
      'So you have found a corpse, all ready to be brought to life by some mad scientist. All you need is..?',
    );
    this.passed = true;
  },
});

QuestJs._create.createItem('h_animate_corpse2', {
  loc: 'hints',
  examine() {
    QuestJs._io.msg(
      'So you have found a corpse, all ready to be brought to life by some mad scientist. All you need is a spark of electricity, or more specifically a bolt of lightning.',
    );
    this.passed = true;
  },
});

QuestJs._create.createItem('h_animate_corpse3', {
  loc: 'hints',
  examine() {
    QuestJs._io.msg(
      'So you have found a corpse, all ready to be brought to life by some mad scientist. All you need is a spark of electricity, or more specifically a bolt of lightning. There is a reel of wire, just apply lightning to the other end.',
    );
    this.passed = true;
  },
});

QuestJs._create.createItem('h_animate_corpse4', {
  loc: 'hints',
  examine:
    'So you have found a corpse, all ready to be brought to life by some mad scientist. All you need is a spark of electricity, or more specifically a bolt of lightning. There is a reel of wire, just apply lightning to the other end. To do that, head up, and then up again. And attach it...',
});

QuestJs._create.createItem('h_animate_corpse5', {
  loc: 'hints',
  examine: 'Now you have some muscle, you just need to get it to follow you.',
});

QuestJs._create.createItem('h_animate_corpse6', {
  loc: 'hints',
  examine() {
    QuestJs._io.msg("Patch wants to follow you, but won't. Why not?");
    this.passed = true;
  },
});

QuestJs._create.createItem('h_animate_corpse7', {
  loc: 'hints',
  examine:
    'Patch needs something on his feet. Better search around for some footwear. Big footwear.',
});

QuestJs._create.createItem('h_animate_corpse8', {
  loc: 'hints',
  examine: 'You need to get those boots repaired before Patch will put them on.',
});

QuestJs._create.createRoom('environment', {});

QuestJs._create.createItem('e_room', {
  loc: 'environment',
  scenery: true,
});

QuestJs._create.createItem('generic_window', {
  loc: 'e_room',
  scenery: true,
  examine() {
    if (!typeof QuestJs._w.player.parent.windowsface === 'string') {
      error('ERROR: Room has no windowsface set');
    }
    if (QuestJs._w.player.parent.windowsface === 'none') {
      Print('The room felt rather claustrophic with no windows in it.');
    } else if (QuestJs._w.generic_window.bricked_up) {
      if (QuestJs._w.player.parent === this.roomsmashed || this.noted) {
        Print('Mandy looked at the bricked up window. No way was she getting out that way.');
      } else {
        Print(
          `Mandy looked at the bricked up window. No way was she getting out that way. Wait. The window she had smashed was in the ${LCase(
            this.lang.getName(roomsmashed, {}),
          )}. Why was this window bricked up too?`,
        );
        this.noted = true;
      }
    } else if (QuestJs._w.player.parent.windowsface === 'north') {
      Print(
        'Mandy looked out the window at the countryside; fields, trees, and there was her home, a barn converstion her parents had purchased three years ago. But how could that be? No way was her home visible from this house; Highfield Lane twisted around far too much for that.',
      );
    } else {
      Print(
        `Mandy looked out the window at the countryside; fields, trees, and there was her home, a barn converstion her parents had purchased three years ago. But how could that be? This window faced ${QuestJs._w.player.parent.windowsface} and her home was to the north.`,
      );
    }
  },
});

QuestJs._create.createItem('e_outside', {
  loc: 'environment',
  scenery: true,
});

QuestJs._create.createRoom('nowhere', {
  down: new QuestJs._create.Exit(''),
});

QuestJs._create.createItem('glass_shards', {
  loc: 'nowhere',
  pronouns: QuestJs._lang.pronouns.plural,
  examine() {
    Print(
      'The shards were the remains of the window. Jagged pieces of glass, some as long as her arm, some almost too small to see.',
    );
  },
});

QuestJs._create.createItem('glass_shard', {
  loc: 'nowhere',
  scenery: true,
  examine() {
    Print(
      'Mandy carefully looked at shard of glass. Through it she could still see the countryside near her home. She turned it over, and there it was again, but from this side the view was reversed, as though seen through a mirror.',
    );
  },
});

QuestJs._create.createItem('yellow_balloon_remains', {
  loc: 'nowhere',
  pronouns: QuestJs._lang.pronouns.plural,
  examine: 'A ragged piece of yellow rubber.',
});

QuestJs._create.createItem('patch', QuestJs._npc.NPC(false), {
  loc: 'nowhere',
  scenery: true,
  examine() {
    if (this.state === 0) {
      const s =
        "Mandy looked at the creature she had bought to life. It was about two and a half meters tall, and very solidly built. Patches of it were hairy, other patches were dark skined, some light skinned. Its face was not attractive, it too was a mishmash of parts. Mandy really did not want to know where all the parts came from. However, it needed a name... 'I'll call you Patch,' she said. It nodded it head, possibly in acknowledgement.";
    } else {
      s =
        'Mandy looked at Patch, the creature she had bought to life. He was about two and a half meters tall, and very solidly built. Patches of him were hairy, other patches were dark skined, some light skinned. His face was not attractive, it too was a mishmash of parts. Mandy really did not want to know where all the parts came from.';
    }
    if (QuestJs._w.boots.isAtLoc('QuestJs._w.patch')) {
      if (QuestJs._w.boots.lacedup) {
        s += ' He was wearing a pair of boots, neatly laced up.';
      } else {
        s += ' He was wearing a pair of boots, unlaced.';
      }
    }
  },
});

QuestJs._create.createRoom('zone_external', {});

QuestJs._create.createRoom('highfield_lane', {
  loc: 'zone_external',
  desc() {
    Print(
      'Mandy was standing, feeling a little anxious, on the pavement outside The House, which stood in a neatly kept garden to the east. The road continued north, through the countryside, towards her home, and then onwards to Hedlington, while southward, Highfield Lane made its way back into town.',
    );
    if (QuestJs._w.letter.parent === this && letter.scenery) {
      QuestJs._io.msg(' ');
      Print('She could see a letter lying on the ground.');
    }
  },
  beforeFirstEnter() {},
  east: new QuestJs._create.Exit('garden_location'),
  south: new QuestJs._create.Exit('nowhere'),
  north: new QuestJs._create.Exit('nowhere'),
  west: new QuestJs._create.Exit('mine'),
});

QuestJs._create.createItem('player', {
  loc: 'highfield_lane',
  examine:
    'Mandy was just an ordinary 15 year old girl, with dark shoulder-length hair and a nose she felt was too big.',
});

QuestJs._create.createItem('school_bag', {
  loc: 'player',
  examine:
    'Once more Mandy looked at her bag with disgust. She had had it since she was thirteen, when she had really been into One Direction. God, what had she been thinking? She had been asking her dad to get her a new one for like six months. It still had Zayn on it!',
});

QuestJs._create.createItem('mobile_phone', {
  loc: 'school_bag',
  scenery: true,
});

QuestJs._create.createItem('pen', {
  loc: 'school_bag',
});

QuestJs._create.createItem('shakespeare_book', {
  loc: 'school_bag',
  examine() {
    if (this.state === 0 && QuestJs._lang.getName(this, {}) == '"Antony and Cleopatra"') {
      Print(
        'Mandy glanced at her copy of Antony and Cleopatra. She really should get around to actually reading it some time, what with an exam on it in just a few weeks.',
      );
    } else {
      if (this.state === 0) {
        this.state = 1;
        Print(
          `Mandy glanced at her copy of "Antony and Cleopatra". Wait, this was not the same book! This was ${QuestJs._lang.getName(
            this,
            {},
          )}. What had happened to "Antony and Cleopatra"? Ms Coulter would be furious.`,
        );
      } else {
        Print(
          `Mandy looked at the book she now had. ${QuestJs._lang.getName(
            this,
            {},
          )}. She wondered if it would be any less boring than "Antony and Cleopatra". Probably not worth risking finding out.`,
        );
      }
      if (
        QuestJs._w.clockwork_thespian.state > 1 &&
        QuestJs._lang.getName(this, {}) === '"Hamlet"'
      ) {
        Print(
          'Then she remembered the Clockwork Thespian. The soul of wit. Hamlet, act 2, scene 2. Quickly she thumbed through. Brevity! Brevity is the soul of wit.',
        );
        this.state = 2;
        QuestJs._w.clockwork_thespian.state = 101;
      }
    }
  },
});

QuestJs._create.createItem('folder', {
  loc: 'school_bag',
  scenery: true,
});

QuestJs._create.createItem('uniform', {
  loc: 'player',
  scenery: true,
  examine() {
    Print(`Mandy was wearing ${QuestJs._w.player.parent.parent.QuestJs._w.uniform}.`);
    if (
      !QuestJs._w.player.parent.parent === QuestJs._w.zone_external &&
      !QuestJs._w.player.uniform.noted
    ) {
      QuestJs._w.player.uniform.noted = true;
      Print(
        'That was definitely not the uniform of Kyderbrook High School that she had been wearing when she had entered the house!',
      );
    }
  },
});

QuestJs._create.createItem('letter', {
  loc: 'highfield_lane',
  scenery: true,
  examine() {
    Print(
      'Mandy turned the letter over. It was addressed to "Dr Winfield Malovich, 23 Highfield Lane, Westleigh". <i>That must be who lives in The House,</i> she thought. Perhaps she should deliver it. She felt a lttle terrified at the thought, but that was ridiculous - it was only a house. Mrs Davenport was always saying you should confront your fears head-on in Personal Development lessons.',
    );
    this.addressread = true;
  },
});

QuestJs._create.createItem('house', {
  loc: 'highfield_lane',
  scenery: true,
  examine:
    'Mandy could never decide what was so sinister about the house. It was two stories high, a door in the centre of the lower floor, with bay windows either side, typical of many middle-class houses built aroud the turn of the century.',
});

QuestJs._create.createItem('other_houses', {
  loc: 'highfield_lane',
  scenery: true,
  examine: 'The other houses on the steet looked just like number 23. Just... not evil.',
});

QuestJs._create.createRoom('garden_location', {
  loc: 'zone_external',
  desc() {
    Print(
      'The garden was simple, but well maintained. A gravel path curved from the road, to the west, to The House, to the east. On either side, the lawn was lush and well-trimmed. The garden was bordered by a hedge to north and south. To the west there were rose bushes, though Mandy had never seen them have flowers.',
    );
    if (QuestJs._w.door.isopen) {
      if (exit_to_house.knocked) {
        const s = 'Mandy was sure it had been closed when she had knocked on it.';
      } else {
        s = 'Had it been open when she first looked? Mandy could not remember.';
      }
      Print(
        `The door to the house was open. ${s} Her heart was starting to pound. She could not decide if this was a good idea or not.`,
      );
      this.flag = true;
    }
  },
  west: new QuestJs._create.Exit('highfield_lane'),
  east: new QuestJs._create.Exit('front_hall'),
});

QuestJs._create.createItem('door', {
  loc: 'garden_location',
  scenery: true,
  examine() {
    let s =
      'The door was tall, and made of panelled wood painted black, set into a white doorframe with a transom above.';
    if (QuestJs._w.door.isopen) {
      s += ' It stood open, inviting...';
    }
    P(s);
  },
});

QuestJs._create.createItem('s_roses', {
  loc: 'zone_external',
  scenery: true,
  examine:
    "The only reason Mandy knew they were roses was that they were prickly. Her grandmother had some, and they had the same prickles - a bit like a sharkfin. Unlike these, her grandmother's rose blossomed every year.",
});

QuestJs._create.createItem('s_path', {
  loc: 'zone_external',
  scenery: true,
  examine:
    'The gravel path curved gently to the right, then back to the left up to the front door.',
});

QuestJs._create.createItem('s_road', {
  loc: 'zone_external',
  scenery: true,
  examine:
    'The road was tarmacked with pavements either side - like pretty much every road in Westleigh.',
});

QuestJs._create.createItem('s_pavement', {
  loc: 'zone_external',
  scenery: true,
  examine:
    'The pavement was set with flagstones. At one time - not so many years ago - Mandy would would studiously avoid the cracks between the flags. She was too old for that now, of course.',
});

QuestJs._create.createItem('s_grass', {
  loc: 'zone_external',
  scenery: true,
  examine: 'The grass was green, and proverbially boring to watch grow.',
});

QuestJs._create.createItem('transom', {
  loc: 'zone_external',
  scenery: true,
  examine:
    'The transom was a low, but wide window is a half-oval shape, above the door. The glass was dirty, but it was too high up to see though anyway.',
});

QuestJs._create.createRoom('zone_victorian', {});

QuestJs._create.createRoom('front_hall', {
  loc: 'zone_victorian',
  scenery: true,
  desc() {
    Print(
      'The hall was bigger than Mandy had expected, quite an impressive room really. There were doors to the north and south, while the east wall displayed a number of painting. The walls and ceiling were panelled with dark wood, the foor was tiled in a geometric design that was vaguely unnerving.',
    );
  },
  afterFirstEnter() {
    QuestJs._io.msg(' ');
    Print('The door slammed shut, making Mandy jump.');
    QuestJs._w.h_gettheletter.passed = true;
  },
  west: new QuestJs._create.Exit('garden_location'),
  north: new QuestJs._create.Exit('brass_dining_room'),
  south: new QuestJs._create.Exit('gallery'),
});

QuestJs._create.createItem('front_hall_floor', {
  loc: 'front_hall',
  scenery: true,
  examine() {
    Print(
      "The design on the floor was like one of those pictures Mandy's father liked; if you stared at it in just the right way a three-dimensional image emerged. Mandy was not sure why, but she really did not want to see that image.",
    );
  },
});

QuestJs._create.createItem('inside_door', {
  loc: 'front_hall',
  scenery: true,
  examine: 'Mandy tried the door; it was definitely locked shut.',
});

QuestJs._create.createItem('paintings', {
  loc: 'front_hall',
  scenery: true,
  pronouns: QuestJs._lang.pronouns.plural,
  examine:
    'There were five paints on the back wall, all portraits. To the left, an elderly gentleman, a little plump, in military attire. Next to him, a lady in a blue dress. The central portrait was a youngish man in academic attire; a mortar and gown. Next to him, another lady, perhaps in her thirties, and on the far right, a rather dapper young man in a burgundy suit.',
});

QuestJs._create.createRoom('brass_dining_room', {
  loc: 'zone_victorian',
  scenery: true,
  desc() {
    let s =
      "This room was dominated by an elegant, dark wood table, well polished, with brass legs shaped like a lion's, and laid out with eight dinner QuestJs._settings. Eight chairs, in matching style, surrounded it.  At the table, ";
    QuestJs._io.msg(' ');
    if (this.mannequin_count < 9) {
      s += `${toWords(this.mannequin_count)} mannequins were sat, dressed up in clothes and wig.`;
    } else if (this.mannequin_count === 9) {
      s +=
        'eight mannequins were sat, dressed up in clothes and wig; a nineth was stood behind one of the chairs.';
    } else {
      s += `eight mannequins were sat, dressed up in clothes and wig; ${ToWords(
        this.mannequin_count - 8,
      )} more were was stood as though waiting to take their place.`;
    }
    s +=
      ' The north wall had a window, with dark wood cabinets on either side, and there were doors to the east, south and west.';
    P(s);
  },
  beforeEnter() {
    this.mannequin_count += 1;
  },
  afterEnter() {},
  afterFirstEnter() {
    if (!QuestJs._w.front_hall.notedasweird) {
      Print(
        "That's weird, thought Mandy, there should be a window in the west wall, looking towards the street. Where could the door possibly go?",
      );
      QuestJs._w.front_hall.notedasweird = true;
    }
  },
  south: new QuestJs._create.Exit('gallery'),
  west: new QuestJs._create.Exit('great_hall'),
  east: new QuestJs._create.Exit('steam_corridor'),
  north: new QuestJs._create.Exit('some_gothic_room'),
});

QuestJs._create.createItem('mannequins', {
  loc: 'brass_dining_room',
  scenery: true,
  examine:
    'Mandy looked closer at the mannequins. Their skin was a speckled grey, that felt cool to the touch, and sounded like wood when knocked. Their faces were only half formed; slight depressed to suggest eyes, a vague nose, but no mouth.',
});

QuestJs._create.createItem('clock', QuestJs._templates.SURFACE(open), {
  loc: 'brass_dining_room',
  scenery: true,
  examine() {
    s =
      'This was a large, old-fashioned clock. A dark wood case housed the ticking mechanism. Roman numerals ran round the clock face, ';
    if (typeof this.lookturn === 'number') {
      if (this.lookturn > QuestJs._game.turn - 10) {
        s += 'which indicated the time was now twenty past nine.';
      } else {
        s +=
          'which indicated the time was still twenty past nine. It was ticking, so had clearly not stopped; why was the time not changing?';
      }
    } else {
      s +=
        'which indicated the time was now twenty past nine. That was so wrong, Mandy could not decide if it was slow or fast.';
      this.lookturn = QuestJs._game.turn;
    }
    if (QuestJs._w.large_key.isAtLoc('this')) {
      s += ' Mandy could see the key for winding the clock up was in the side of the clock.';
    }
    Print(s);
  },
});

QuestJs._create.createItem('large_key', {
  loc: 'clock',
  scenery: true,
});

QuestJs._create.createItem('vic_chair', {
  loc: 'brass_dining_room',
  scenery: true,
  examine: 'The chair was made of dark wood, with a high back and a padded seat.',
});

QuestJs._create.createItem('vic_table', {
  loc: 'brass_dining_room',
  examine: 'The table was made of the same dark wood as the chairs.',
});

QuestJs._create.createRoom('theatre', {
  loc: 'zone_victorian',
  scenery: true,
  desc:
    'This was a large room, with perhaps two dozen chairs arranged facing a pair of curtains - presumably hiding a stage - to the west. The lower half of the walls were wood panelled, while the upper walls were painted a yellow-brown.',
  afterEnter() {},
  west: new QuestJs._create.Exit('theatre_stage'),
  east: new QuestJs._create.Exit('gallery'),
});

QuestJs._create.createRoom('theatre_stage', {
  loc: 'zone_victorian',
  scenery: true,
  desc() {
    Print(
      'This is even smaller than the stage at Kyderbrook, thought Mandy. There was barely room for both her and the inanimate figure stood to the side. The only way to go was back through the curtains to the south.',
    );
  },
  beforeFirstEnter() {
    Print(
      'Mandy pushed the curtain aside and looked beyond. She was startled for a moment to see a figure there, but it was quite inanimate.',
    );
    QuestJs._io.msg(' ');
  },
  east: new QuestJs._create.Exit('theatre'),
});

QuestJs._create.createItem('clockwork_thespian', {
  loc: 'theatre_stage',
  examine() {
    if (QuestJs._w.clockwork_thespian.state === 0) {
      Print(
        'The figure seemed to have been manufactured to resemble a man of impressive proportions, in height, but also in the girth of his chest. And its groin too, Mandy noticed with a wry smile. It, or he, was constructed of brass, and looked to be jointed. He was clothed in a frilly off-white shirt, and dark baggy trousers, as well as a floppy hat. Mandy noticed there was a hole in the back of his shirt, and a corresponding hole in his back, where a simple, if large, key might fit.',
      );
    } else {
      Print(
        'The clockwork thespian seemed to have been manufactured to resemble a man of impressive proportions, in height, but also in the girth of his chest. And his groin too, Mandy noticed with a wry smile. He was constructed of brass, and looked to be jointed. He was clothed in a frilly off-white shirt, and dark baggy trousers, as well as a floppy hat.',
      );
    }
  },
});

QuestJs._create.createRoom('gallery', {
  loc: 'zone_victorian',
  scenery: true,
  desc:
    'Mandy was stood at the end of a long gallery running south. There were doors west, east and north. A small table had a chessboard on it, and there were painting down the two long walls.',
  afterFirstEnter() {
    if (!QuestJs._w.front_hall.notedasweird) {
      QuestJs._io.msg(' ');
      Print(
        "That's weird, thought Mandy, surely the door to the west would go back into the garden? And this room was so long, surely the house was not this wide...",
      );
      QuestJs._w.front_hall.notedasweird = true;
    }
  },
  north: new QuestJs._create.Exit('brass_dining_room'),
  west: new QuestJs._create.Exit('theatre'),
  south: new QuestJs._create.Exit('gallery_south'),
  east: new QuestJs._create.Exit('room_big'),
});

QuestJs._create.createItem('gallery_n_paintings', {
  loc: 'gallery',
  scenery: true,
  examine:
    "The paintings were all oil on canvas, and to Mandy's inexpert eye the same style, though they varied in subject matter. Several were portraits, but there was a Greek temple, a huge painting of a sea battle and beautiful sunset.",
});

QuestJs._create.createItem('chessset', {
  loc: 'gallery',
  scenery: true,
  examine:
    "The chess board was set into the small table, sixty four squares of ivory and mahogany, in a circular top. The board was in mid-game, and half a dozen pieces had already been taken, mostly white's. Mandy tried to pick up one of taken pawns, and found she could not - it seemed to be glued to the table. She tried a couple more pieces - they all seemed very solidly in place.",
});

QuestJs._create.createItem('chess_pieces', {
  loc: 'gallery',
  scenery: true,
  examine:
    'The chess pieces were all wooden and exquisitely carved. The queen looked like a warrior woman in armour, the pawns held pikes. White pieces seemed to be carved from ivory, whilst black were wooden, but they were otherwise identical.',
});

QuestJs._create.createItem('white_knight', {
  loc: 'gallery',
  scenery: true,
  examine() {
    if (this.active) {
      Print(
        'Mandy looked at the white knight. She had not spotted there was only one, perhaps that was why white was losing.',
      );
    } else {
      Print(
        'The chess pieces were all wooden and exquisitely carved. The queen looked like a warrior woman in armour, the pawns held pikes. White pieces seemed to be carved from ivory, whilst black were wooden, but they were otherwise identical.',
      );
    }
  },
});

QuestJs._create.createRoom('gallery_south', {
  loc: 'zone_victorian',
  scenery: true,
  desc:
    'The south end of the gallery was much like the north, with more paintings on the long walls. There was a door at the south end, and also a door to the east.',
  north: new QuestJs._create.Exit('gallery'),
  east: new QuestJs._create.Exit('room_small'),
  south: new QuestJs._create.Exit('some_gothic_room'),
});

QuestJs._create.createItem('gallery_s_paintings', {
  loc: 'gallery_south',
  scenery: true,
  examine:
    'The most striking of the paintings was a family portrait, which must have been about life size, despite the subjects being painted full length. Mandy could see a father, in suit and top hat, and a mother, together with three young children.',
});

QuestJs._create.createRoom('room_big', {
  loc: 'zone_victorian',
  scenery: true,
  desc() {
    let s =
      'The drawing room was rather well appointed with wood paneling on the walls, and an ornate ceiling. A window to the east had portraits on either side, whilst the fireplace to the south had a painting of a battle above the mantleplace.';
    if (QuestJs._w.mahogany_cabinet.moved) {
      s += ' The mahogany cabinet had been pulled out from the north wall.';
    } else {
      s += ' There was a mahogany cabinet on the north wall.';
    }
    Print(s);
  },
  beforeEnter() {
    // foreach (itm, GetDirectChildren(QuestJs._w.room_small)) {
    //   if (DoesInherit(itm, "sizechangeobject")) {
    //     itm.shrink()
    //     itm.parent = this
    //   }
    // }
    // foreach (itm, GetDirectChildren(QuestJs._w.drawing_room_south)) {
    //   if (DoesInherit(itm, "sizechangeobject")) {
    //     itm.shrink()
    //     itm.parent = this
    //   }
    // }
    // foreach (itm, GetDirectChildren(QuestJs._w.drawing_room_north)) {
    //   if (DoesInherit(itm, "sizechangeobject")) {
    //     itm.shrink()
    //     itm.parent = this
    //   }
    // }
  },
  west: new QuestJs._create.Exit('gallery'),
  north: new QuestJs._create.Exit('nowhere'),
});

QuestJs._create.createItem('mahogany_cabinet', {
  loc: 'room_big',
  scenery: true,
  examine() {
    let s =
      'The mahogany cabinet looked like it came straight out of "Antiques Roadshow". Two doors at the front, a curious section on top at the back with four small draws that looks suggestive of a castle wall, with towers at each end.';
    if (QuestJs._w.mahogany_cabinet.moved) {
      s +=
        ' It was standing a little way from the wall and Mandy could just see a hole in the wall behind it a few inches across.';
    }
    P(s);
  },
});

QuestJs._create.createItem('small_rug', {
  loc: 'room_big',
  scenery: true,
  examine:
    'The rug had a depiction of two overs kissing, with a geometric pattern around the edge.',
});

QuestJs._create.createRoom('room_small', {
  loc: 'zone_victorian',
  scenery: true,
  desc:
    "This was a drawing room of immense size. Perhaps a hundred meters above her, Mandy could see the ornate ceiling. The walls, panelled in wood, stretched an even greater distance. Huge painting, way about Mandy's head, hung from the walls. In the centre of the room was a thick rug, about the size of a football pitch. The pile was so great, it would stop Mandy going across it. She could, however go round the sides, to the northeast or southeast. The door to the west looked very much out of place, being normal height in such a huge wall.",
  beforeEnter() {
    // foreach (itm, GetDirectChildren(QuestJs._w.room_big)) {
    //   if (DoesInherit(itm, "sizechangeobject")) {
    //     itm.grow()
    //     if (itm.dest === "north") {
    //       itm.parent = QuestJs._w.drawing_room_north
    //     }
    //     else if (itm.dest === "south") {
    //       itm.parent = QuestJs._w.drawing_room_south
    //     }
    //     else {
    //       itm.parent = this
    //     }
    //   }
    // }
  },
  west: new QuestJs._create.Exit('gallery_south'),
  northeast: new QuestJs._create.Exit('drawing_room_north'),
  southeast: new QuestJs._create.Exit('drawing_room_south'),
});

QuestJs._create.createRoom('drawing_room_south', {
  loc: 'zone_victorian',
  scenery: true,
  beforeEnter() {
    if (QuestJs._w.boots.parent === this && boots.size == 1) {
      exit_in_to_boots.visible = true;
    } else {
      exit_in_to_boots.visible = false;
    }
  },
  northwest: new QuestJs._create.Exit('room_small'),
  in: new QuestJs._create.Exit('boots'),
});

QuestJs._create.createRoom('drawing_room_north', {
  loc: 'zone_victorian',
  scenery: true,
  desc() {
    let s =
      'Mandy was stood on a narrow strip of wooden floor, between the colossal wall to the north, and the forest-like carpet to the south. To the east, the rug was flush against the wall, so that was not an option, but she could head south west, back to the door.';
    if (QuestJs._w.mahogany_cabinet.moved) {
      s +=
        ' Above her towered a huge mahogany cabinet, standing proud of the wall. Behind it, to the north, was a large hole in the otherwise perfect wall.';
    } else {
      s +=
        ' Above her towered a huge mahogany cabinet, standing against the wall. Peering behind it, at the gap above the skirting board, Mandy thought there might be a hole in the wall.';
    }
    Print(s);
  },
  southwest: new QuestJs._create.Exit('room_small'),
  north: new QuestJs._create.Exit('secret_room'),
});

QuestJs._create.createItem('huge_cabinet', {
  loc: 'drawing_room_north',
  scenery: true,
  examine() {
    let s =
      'The mahogany cabinet towered over Mandy; it had to be higher than the science block at Kyderbrook High.';
    if (QuestJs._w.mahogany_cabinet.moved) {
      s +=
        ' It was standing a little way from the wall - like about 10 foot - and Mandy could see a hole in the wall behind it.';
    } else {
      s += ' Mandy could just see a hole in the wall behind it.';
    }
    P(s);
  },
});

QuestJs._create.createRoom('secret_room', {
  loc: 'zone_victorian',
  scenery: true,
  desc() {
    let s =
      'After the opulence of the other roooms, this one was decidedly bare - but at least it of reasonable proportions. More or less square, the walls were white, or had been  at one time. The floor and ceiling were wood.';
    if (!QuestJs._w.boots.pickedup) {
      s += ' The only feature of note was a large pair of boots in one corner.';
    }
    P(s);
  },
  south: new QuestJs._create.Exit('drawing_room_north'),
});

QuestJs._create.createItem('boots', {
  loc: 'secret_room',
  scenery: true,
  examine() {
    switch (this.size) {
      case 0:
        let s = this.intdesc;
        break;
      case -1:
        s = this.smalldesc;
        break;
      case 1:
        s = this.bigdesc;
        break;
      case -2:
        s = this.vsmalldesc;
        break;
      case 2:
        s = this.vbigdesc;
        break;
      default:
        if (this.size > 0) {
          s = `The ${LCase(QuestJs._lang.getName(this, {}))} was of gigantic proportions!`;
          break;
        } else {
          s = `The ${LCase(QuestJs._lang.getName(this, {}))} was too tiny to see properly.`;
        }
    }
    if (!this.mended) {
      s += ' The left boot was in a sorry, with a large hole in the sole.';
    } else {
      s +=
        ' The tiny man had done a good job mending the left boot, Mandy could hardly see where the hole had been.';
    }
    P(s);
  },
  out: new QuestJs._create.Exit('drawing_room_south'),
});

QuestJs._create.createItem('victorian_floor', {
  loc: 'zone_victorian',
  scenery: true,
  examine: 'The floor was wooden, and well-polished.',
});

QuestJs._create.createItem('victorian_walls', {
  loc: 'zone_victorian',
  scenery: true,
  examine: 'The walls were all panelled in wood.',
});

QuestJs._create.createItem('victorian_ceiling', {
  loc: 'zone_victorian',
  scenery: true,
  examine() {
    if (QuestJs._w.player.stoodon === null) {
      Print('The ceiling was white, with simple decorations along each side.');
    } else {
      Print(
        `The ceiling turned out to be no more interesting from up here. Mandy wondered why she had bothered stabding on the ${QuestJs._w.player.lang.getName(
          stoodon,
          {},
        )}.`,
      );
    }
  },
});

QuestJs._create.createItem('floor', {
  loc: 'zone_victorian',
  scenery: true,
  examine:
    'Mandy was not quite sure what it was about the tiles. They did not depict a demon or murder or anything really; they just had a strange effect on her eyes that was... disturbing.',
});

QuestJs._create.createRoom('zone_flora', {});

QuestJs._create.createItem('flora_floor', {
  loc: 'zone_flora',
  scenery: true,
  examine: 'The floor was a lattice of wrought iron, painted white, and flaking in a few places.',
});

QuestJs._create.createItem('flora_walls', {
  loc: 'zone_flora',
  examine: 'The walls were windows, in white frames.',
});

QuestJs._create.createItem('flora_ceiling', {
  loc: 'zone_flora',
  scenery: true,
  examine: 'The walls arched over to form the ceiling.',
});

QuestJs._create.createRoom('greenhouse_west', {
  loc: 'zone_flora',
  scenery: true,
  west: new QuestJs._create.Exit('steam_hall'),
  east: new QuestJs._create.Exit('greenhouse_east'),
});

QuestJs._create.createRoom('greenhouse_east', {
  loc: 'zone_flora',
  scenery: true,
  west: new QuestJs._create.Exit('greenhouse_west'),
  east: new QuestJs._create.Exit('great_hall'),
});

QuestJs._create.createRoom('greenhouse_catwalk_west', {
  loc: 'zone_flora',
  scenery: true,
  west: new QuestJs._create.Exit('upper_steam_hall'),
  east: new QuestJs._create.Exit('greenhouse_catwalk_east'),
});

QuestJs._create.createRoom('greenhouse_catwalk_east', {
  loc: 'zone_flora',
  scenery: true,
  west: new QuestJs._create.Exit('greenhouse_catwalk_west'),
  east: new QuestJs._create.Exit('great_gallery'),
});

QuestJs._create.createRoom('zone_central', {});

QuestJs._create.createItem('central_floor', {
  loc: 'zone_central',
  scenery: true,
  examine: 'The floor was wooden, and well-polished.',
});

QuestJs._create.createItem('central_walls', {
  loc: 'zone_central',
  scenery: true,
  examine: 'The walls were all panelled in wood.',
});

QuestJs._create.createItem('central_ceiling', {
  loc: 'zone_central',
  examine: 'The ceiling was white, with simple decorations along each side.',
});

QuestJs._create.createRoom('central_control', {
  loc: 'zone_central',
  scenery: true,
  west: new QuestJs._create.Exit('some_gothic_room'),
});

QuestJs._create.createItem('winfield_malovich', {
  loc: 'central_control',
});

QuestJs._create.createItem('wm_hello', QuestJs._npc.TOPIC(true), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'Who are you?' Mandy asked the man at te desk.");
    QuestJs._io.msg('');
    QuestJs._io.msg("'Me? I'm Winfield Malovich. This is my house. Who are you?'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'I was just passing the house.. and I kind of got trapped here.'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'<i>Story of my life</i>! This was my house once,' he said. 'I built the analytical machine you see before you. Now, well, I think it belongs to itself now. You can talk to it, you know. Only thing that keeps me sane, oh the <i>midnight memories</i> we've shared.' Mandy felt unconvinced it had kept him sane.",
    );

    this.songlist = Split('Story of my life|Midnight memories', '|');
  },
});

QuestJs._create.createItem('wm_what_happened', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'What... happened?'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'It came alive. My fault really. I suppose there really are things that man should not mess with.'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'Bullshit. What about iPods and Facebook and XBox; where would they be if mankind took that attitude?'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg("'I... have no idea what you are talking about.'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'No, you don't, which is kind the point really. So just tell me what happened.'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'It got sick. The silvers, I don't know where they came from, but they infected it like a virus. They wanted to infect other houses, <i>more than this</i> one.",
    );

    // list add (this.songlist, "More than this")
    // if (analytical_engine.state = 1) {
    //   do (wm_same_question, "show")
    // }
  },
});

QuestJs._create.createItem('wm_no_way_out', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'Is there no way out?'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'None. The walls might as well be made of <i>steel, my girl</i>.'");

    // list add (this.songlist, "Steal my girl")
  },
});

QuestJs._create.createItem('wm_same_question', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'It keeps asking the same question. What direction?'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'I'm sorry, I can't help you. I rather think it's <i>gotta be you</i>, you see. You have to solve this <i>one thing</i>.'",
    );

    // list add (this.songlist, "Gotta be you")
    // list add (this.songlist, "One thing")
  },
});

QuestJs._create.createItem('wm_i_dont_know', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'I don't know what to do!'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'Well, you have to do it, <i>one way or another</i>. Otherwise <i>you and I</i> are here for a very long time.'",
    );

    // list add (this.songlist, "One way or another")
    // list add (this.songlist, "You and I")
  },
});

QuestJs._create.createItem('wm_i_will_think', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'I'll have a good think.'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'Don't take too long. The <i>night changes</i> things around. And not for the better. Some nights the silvers try to <i>drag me down</i> to their lair; oh, you need your wits about you once it gets dark.'",
    );

    // list add (this.songlist, "Night changes")
    // list add (this.songlist, "Drag me down")
  },
});

QuestJs._create.createItem('wm_how_long', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'How long have you been here?'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'A long time. It feels like several years, but I suspect considerably longer has passed on the outside.Your mode of dress looks quite alien to me, for <i>one thing</i<>; the colours are garnish, the thread I cannot guess at. <i>More than this</i>, your hemline is, well, it would be considered scandalous in 1911. And yet I suppose they are common in your time?'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "Mandy glaned down at her uniform, now inexplicably red and hot pink. 'I was wearing grey and navy when I entered the house. But yeah, its 2016.'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg("'Over a hundred years...'");

    // list add (this.songlist, "One thing")
    // list add (this.songlist, "More than this")
  },
});

QuestJs._create.createItem('wm_1911', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'You have been here since 1911?'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'The King was due to have his Delhi Durbar in a few weeks.'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'Er, which king was that?'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'George V. I suppose he is just <history</i> to you. Who's king now?'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'Queen. Queen Elizabeth II.'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'A queen? Jolly good. England became great under Queen Victoria.'");
  },
});

QuestJs._create.createItem('wm_what_happened7', QuestJs._npc.TOPIC(false), {
  loc: 'winfield_malovich',
});

QuestJs._create.createItem('analytical_engine', {
  loc: 'central_control',
});

QuestJs._create.createRoom('zone_medieval', {});

QuestJs._create.createItem('medieval_floor', {
  loc: 'zone_medieval',
  scenery: true,
  examine: 'The floor was rough wood.',
});

QuestJs._create.createItem('medieval_walls', {
  loc: 'zone_medieval',
  scenery: true,
  examine: 'The walls were all rough-cut stone.',
});

QuestJs._create.createItem('medieval_ceiling', {
  loc: 'zone_medieval',
  scenery: true,
  examine: 'The ceiling was wood, like the floor, supported by thick beams.',
});

QuestJs._create.createRoom('great_gallery', {
  loc: 'zone_medieval',
  scenery: true,
  desc:
    'The great gallery was a wooden platform that overlooked the great hall. A flight of wooden stairs led back down to the hall, while a narrow spiral staircase led further upwards. The walls were of rough cut stone, and the window to the east was small and arched. Doorways led south and west.',
  down: new QuestJs._create.Exit('great_hall'),
  south: new QuestJs._create.Exit('solar'),
  up: new QuestJs._create.Exit('observatory'),
  west: new QuestJs._create.Exit('greenhouse_catwalk_east'),
});

QuestJs._create.createRoom('great_hall', {
  loc: 'zone_medieval',
  scenery: true,
  desc:
    'The great hall was an impressive size. It looked older than the rest of the house, a lot older, being built of rough cut stone. There were doors to east and west, and a wooden staircase led up to a wooden gallery that ran along the west side of the hall. To the south, a doorway led to a flight of steps heading downwards.',
  east: new QuestJs._create.Exit('brass_dining_room'),
  up: new QuestJs._create.Exit('great_gallery'),
  down: new QuestJs._create.Exit('alchemy_lab'),
  south: new QuestJs._create.Exit('alchemy_lab'),
  west: new QuestJs._create.Exit('greenhouse_east'),
});

QuestJs._create.createRoom('alchemy_lab', {
  loc: 'zone_medieval',
  scenery: true,
  desc() {
    // let s = "This appeared to be some kind of laboratory, though nothing like the ones at school. While they had their own distinctive smell, this room was altogether worse,with an almost over-powering smell of rotten eggs. Visually, the room was dominated by a very solid wooden bench"
    // if (QuestJs._w.patchwork_body.isAtLoc("this")) {
    //   if (QuestJs._w.patchwork_body.state === 0) {
    //     s += ", with a corpse on it; was it there to be dissected?"
    //   }
    //   else {
    //     s += ", with a patchwork body on it."
    //   }
    //   s += " The body was connected to some strange device stood at the head of the table by a number of thick wires."
    // }
    // else {
    //   s += ". At one end of the bench a strange device stood with wires dangling from it."
    // }
    // if ((QuestJs._w.reel.parent === this) && reel.scenery) {
    //   s += " A reel of wire sat on the floor, one end attached to the device")
    // }
    // s += " A shelf held a bizarre hotch-potch of glassware on it. A layer of dust suggested it had not been used for some time. Above the table, a crocodile was suspended."
    // Print (s)
  },
  afterFirstEnter() {
    QuestJs._w.h_find_animate_corpse.passed = true;
  },
  up: new QuestJs._create.Exit('great_hall'),
  north: new QuestJs._create.Exit('great_hall'),
});

QuestJs._create.createItem('reel', {
  loc: 'alchemy_lab',
  examine() {
    let s = 'The wire was about a millimeter thick, and ';
    if (this.count === 0) {
      s +=
        'she guessed there was over twenty meters of wire, the end of which was soldered to the side of the machine at the head of the table on the wall. The spindle was also made of metal.';
    } else if (this.count === 1) {
      s +=
        'she guessed there was about twenty meters of wire on the spindle (which was also metal), and more heading down the stairs to the laboratory.';
    } else if (this.count === 1 && QuestJs._w.player.parent == QuestJs._w.great_gallery) {
      s +=
        'she guessed there was about fifteen meters of wire on the spindle (which was also metal), and more dropping down to the hall below and heading down the stairs to the laboratory.';
    } else if (this.count === 5) {
      s +=
        'now it had run out she could see this end was soldered to the spindle, which was also metal.';
    } else {
      s += `she guessed there was about ${
        25 - 5 * this.count
      } meters of wire on the spindle (which was also metal), and more heading elsewhere.`;
    }
    Print(s);
    this.lookedat = true;
  },
});

QuestJs._create.createItem('stuffed_crocodile', {
  loc: 'alchemy_lab',
  scenery: true,
  examine:
    'The crocodile was a little over a meter long, and hanging from the ceiling on four wires. It looked like it was stuffed, and it was kind of creeping imagining that once it had been alive.',
});

QuestJs._create.createItem('alchemy_bench', {
  loc: 'alchemy_lab',
  examine:
    'The wood of the bench had black rings and circles scorched into it, testament to years of use. Or perhaps week of use by an inept experimenter, Mandy mused.',
});

QuestJs._create.createItem('scorch_marks', {
  loc: 'alchemy_lab',
  scenery: true,
  examine: 'Mandy could not tell if the scorch marks were caused by heat or acid.',
});

QuestJs._create.createItem('glass_apparatus', {
  loc: 'alchemy_lab',
  scenery: true,
  examine:
    "Mandy took a better look at the glass apparatus. Mr Turnbill had once set up a distillation in chemistry, and she tried to remember what it had looked like it. She had a feeling nothing like this, but she seemed to remember spending the lesson passing notes to Finley O'Donnell, trying to convince him that Claire Grossman fancied him.",
});

QuestJs._create.createItem('patchwork_body', {
  loc: 'alchemy_lab',
  examine() {
    this.state = 1;
    Print(
      'Mandy gingerly inspected the corpse on the table. It was naked, but nothing to suggest it was either male or female. As she looked closer, she could see stitch marks, and with a growing sense of nausea, she relaised it was not a corpse, but the stitched together parts of several corpses.',
    );
  },
});

QuestJs._create.createItem('alchemy_device', {
  loc: 'alchemy_lab',
  examine() {
    let s =
      'The machine at the head of the table was about a meter and a half tall, a wooden cabinet, with  brass fittings. On the front were a series of dials and knobs. ';
    if (QuestJs._w.patchwork_body.isAtLoc('QuestJs._w.alchemy_lab')) {
      s +=
        'About a dozen wires ran from the machine to the body, each attached to its own brass bolt on the machine, and to a clip on the body.';
    } else {
      s +=
        'About a dozen wires hung down from the machine, each attached to its own brass bolt on the machine.';
    }
    Print(s);
  },
});

QuestJs._create.createRoom('observatory', {
  loc: 'zone_medieval',
  scenery: true,
  desc:
    'The room was dominated, filled even, by a telescope and its supporting mechanism, which was not difficult, as the room was not big. There were some controls on the wall, and the only exit was the stairs she had just come up.{if telescope.roofopen: A section of roof was open on the west side of the dome.}',
  down: new QuestJs._create.Exit('great_gallery'),
  up: new QuestJs._create.Exit('observatory_up'),
  climb: new QuestJs._create.Exit('observatory_up'),
});

QuestJs._create.createItem('telescope', {
  loc: 'observatory',
  scenery: true,
  examine() {
    let s =
      'The telescope itself was about two meters long. It was held in place by a complicated mechanism, involving cogs and gears, and the whole thing was made of brass, giving it a strange beauty.';
    switch (QuestJs._w.left_wheel.state) {
      case 1:
        s += ' It was currently almost vertically,';
        break;
      case 3:
        s += ' It was currently angled about thirty degrees above the horizontal,';
        break;
      default:
        s += ' It was currently angled about sixty degrees above the horizontal,';
        break;
    }
    switch (QuestJs._w.middle_wheel.state) {
      case 0:
        s += ' and pointing to the east.';
        break;
      case 1:
        s += ' and pointing southward.';
        break;
      case 2:
        s += ' and pointing westward.';
        break;
      case 3:
        s += ' and pointing northward.';
        break;
      case 4:
        s += ' and pointing eastward.';
        break;
    }
    Print(s);
  },
});

QuestJs._create.createItem('left_wheel', {
  loc: 'observatory',
  scenery: true,
  examine: 'The left wheel was about seven centimeters across, and made of brass.',
});

QuestJs._create.createItem('middle_wheel', {
  loc: 'observatory',
  scenery: true,
  examine: 'The midde wheel was about seven centimeters across, and made of brass.',
});

QuestJs._create.createItem('right_wheel', {
  loc: 'observatory',
  scenery: true,
  examine: 'The right wheel was about seven centimeters across, and made of brass.',
});

QuestJs._create.createItem('controls', {
  loc: 'observatory',
  scenery: true,
  examine:
    'The controls comsisted of three wheels, one on the left, one in the middle, one on the right, set into a panel, all in brass.',
});

QuestJs._create.createRoom('solar', {
  loc: 'zone_medieval',
  scenery: true,
  desc:
    "The solar. Mandy knew the name from history class; this is where the lord of the castle would sleep. None to comfoortable to Mandy's eyes, but possibly the height of luxury a thousand years ago. A large bed, crudely built of wood, a tapestry hung from one wall, a chamber pot under the bed.",
  north: new QuestJs._create.Exit('great_gallery'),
});

QuestJs._create.createItem('solar_bed', {
  loc: 'solar',
});

QuestJs._create.createItem('solar_tapestry', {
  loc: 'solar',
});

QuestJs._create.createItem('chamber_pot', {
  loc: 'solar',
});

QuestJs._create.createRoom('observatory_up', {
  loc: 'zone_medieval',
  desc() {
    let s = 'Mandy was stood on the top of the mechanism that supported the telescope. ';
    if (QuestJs._w.telescope.roofopen) {
      s +=
        'If she reached, she could probably pull herself up onto the roof from her, she thought.';
    } else {
      s += 'If she reached, she could probably touch the ceiling from her, she thought.';
    }
    Print(s);
  },
  up: new QuestJs._create.Exit('roof_location'),
  down: new QuestJs._create.Exit('observatory'),
  climb: new QuestJs._create.Exit('roof_location'),
});

QuestJs._create.createItem('ceiling', {
  loc: 'observatory_up',
  scenery: true,
});

QuestJs._create.createItem('telescope_up', {
  loc: 'observatory_up',
  scenery: true,
  examine:
    'From here, with her arms and legs wrapped around it, the telescope was a brass cylinder of security to cling to.',
});

QuestJs._create.createRoom('roof_location', {
  loc: 'zone_medieval',
  scenery: true,
  desc:
    'The roof was a metal dome, made of eight sections, about three meters of each side, and did not offer as much grip as Mandy would have liked. The only way down was back through the opening. At the apex there was a black metal spike, pointing skywards. Below her, Mandy could see the house, but it was hard to properly make out, kind of like it was misty, but not quite. It looked a long way down - how could she be so high up, it was only a two story house! Further a field she could see the town of Westleigh to the south.',
  beforeFirstEnter() {
    Print('At last Mandy was outside! And about a hundred meters up...');
  },
  beforeEnter() {},
  afterFirstEnter() {
    Print(
      'As she looked harder, she realised she could not see the Ash Tree Estate, instead there were only fields. Perhaps no bad thing, she thought, but then she noticed that there was no modern housing at all. This was what the town had looked like before the war.',
    );
  },
  down: new QuestJs._create.Exit('observatory_up'),
});

QuestJs._create.createItem('roof', {
  loc: 'roof_location',
  scenery: true,
  examine:
    'The roof was an octagonal pyramid, covered in slates, which made no sense giving the inside was a metal dome, but Mandy was getting used to that. The opening in the dome was an oddly-shaped skylight from this side. At the apex of the roof was a metal spike.',
});

QuestJs._create.createItem('spike', {
  loc: 'roof_location',
  scenery: true,
  examine() {
    if (this.wireattached) {
      Print(
        'The spike was made of black metal, and was straight apart from a single loop, to which a wire was attached.',
      );
    } else {
      Print('The spike was made of black metal, and was straight apart from a single loop.');
    }
  },
});

QuestJs._create.createItem('sky', {
  loc: 'roof_location',
  scenery: true,
  examine() {
    switch (this.state) {
      case 0:
        Print('The sky was blue, with the odd fluffy cloud.');
        break;
      case 1:
        Print('The sky was blue, with the odd fluffy cloud.');
        break;
      case 2:
        Print('Mandy looked at the sky. There were definitely more clouds.');
        break;
      case 3:
        Print('It was pretty cloudy now, Mandy noticed.');
        break;
      case 4:
        Print('The clouds were a dirty dark grey.');
        break;
      case 5:
        Print('The dark clouds threatened rain at any moment.');
        break;
      default:
        Print('The sky was looking thundery.');
        break;
    }
  },
});

QuestJs._create.createRoom('zone_steampunk', {});

QuestJs._create.createItem('steampunk_floor', {
  loc: 'zone_steampunk',
  scenery: true,
  examine: 'The floor was wooden, and well-polished.',
});

QuestJs._create.createItem('steampunk_walls', {
  loc: 'zone_steampunk',
  scenery: true,
  examine: 'The walls were all panelled in wood.',
});

QuestJs._create.createItem('steampunk_ceiling', {
  loc: 'zone_steampunk',
  scenery: true,
  examine: 'The ceiling was white, with simple decorations along each edge.',
});

QuestJs._create.createRoom('steam_hall', {
  loc: 'zone_steampunk',
  scenery: true,
  south: new QuestJs._create.Exit('lift'),
  west: new QuestJs._create.Exit('steam_corridor'),
  east: new QuestJs._create.Exit('greenhouse_west'),
});

QuestJs._create.createRoom('lower_steam_hall', {
  loc: 'zone_steampunk',
  scenery: true,
  south: new QuestJs._create.Exit('lift'),
  east: new QuestJs._create.Exit('mine'),
});

QuestJs._create.createItem('giant_spider', {
  loc: 'lower_steam_hall',
  examine:
    'The giant spider was big, black and hairy. It was a couple of meters across, and each of it five eyes were staring at Mandy. And it was holding a shovel.',
});

QuestJs._create.createRoom('steam_corridor', {
  loc: 'zone_steampunk',
  scenery: true,
  east: new QuestJs._create.Exit('steam_hall'),
  west: new QuestJs._create.Exit('brass_dining_room'),
});

QuestJs._create.createRoom('upper_steam_hall', {
  loc: 'zone_steampunk',
  scenery: true,
  south: new QuestJs._create.Exit('lift'),
  west: new QuestJs._create.Exit('nursery'),
  east: new QuestJs._create.Exit('greenhouse_catwalk_west'),
});

QuestJs._create.createRoom('lift', {
  loc: 'zone_steampunk',
  scenery: true,
  north: new QuestJs._create.Exit('steam_hall'),
});

QuestJs._create.createItem('top_lift_button', {
  loc: 'lift',
  scenery: true,
});

QuestJs._create.createItem('middle_lift_button', {
  loc: 'lift',
});

QuestJs._create.createItem('bottom_lift_button', {
  loc: 'lift',
});

QuestJs._create.createRoom('nursery', {
  loc: 'zone_steampunk',
  scenery: true,
  desc:
    'This seemed to be a nursery, or at least what a nursery might have looked like a century ago. Two china dolls were stood on a chair, and there was a dolls house near them. A cream-painted cot stood near the window.',
  beforeEnter() {},
  afterEnter() {
    // If the balloon is here
    // if (QuestJs._w.yellow_balloon.isAtLoc("QuestJs._w.nursery")) {
    //   // each toime she goes in the room is apparently the first
    //   // reset the count
    //   // record every item she is holding, && every item in her bag, and every item in the room
    //   Print ("Mandy noticed a yellow balloon gently floating down from the ceiling, near the centre of the room.")
    //   QuestJs._w.nursery.count = 0
    //   const QuestJs._game.nurseryheld = []()
    //   foreach (itm, GetDirectChildren(QuestJs._w.player)) {
    //     QuestJs._game.nurseryheld.push(itm)
    //   }
    //   const QuestJs._game.nurserybag = []()
    //   foreach (itm, GetDirectChildren(QuestJs._w.school_bag)) {
    //     QuestJs._game.nurserybag.push(itm)
    //   }
    //   const QuestJs._game.nurseryfloor = []()
    //   foreach (itm, GetDirectChildren(QuestJs._w.nursery)) {
    //     QuestJs._game.nurseryfloor.push(itm)
    //   }
    //   ConvReset
    // }
  },
  east: new QuestJs._create.Exit('upper_steam_hall'),
});

QuestJs._create.createItem('yellow_balloon', {
  loc: 'nursery',
  scenery: true,
  examine:
    'The balloon was bright yellow, and pretty much spherical, except for the bit where it was blown up.',
});

QuestJs._create.createItem('dollshouse', {
  loc: 'nursery',
  scenery: true,
  examine() {
    let s =
      'Like the room, the dolls house was old fashioned. Made of wood, the roof looked like maybe it had been carved to look like it was thatched. The walls were white, the window frames were metal, and it stood on a base painted green. ';
    if (!this.isopen) {
      s += 'It looked like the back would open up.';
    } else {
      s += 'The back was opened up, and inside Mandy could see a tiny man.';
    }
    Print(s);
  },
});

QuestJs._create.createItem('tiny_man', QuestJs._npc.NPC(false), {
  loc: 'dollshouse',
  scenery: true,
  examine() {
    let s =
      'The man was only about ten centimeters tall, but looked normally proportioned. He was dressed in blue overalls, and had dark hair, that was going grey. ';
    if (this.state < 10) {
      s += 'He seemed to be making a pair of shoes.';
    } else if (this.state < 20) {
      s += 'He was mending the boots Mandy had given him.';
    } else {
      s += 'He was once again making a pair of shoes.';
    }
    P(s);
  },
});

QuestJs._create.createItem('tinyman_hello', QuestJs._npc.TOPIC(false), {
  loc: 'tiny_man',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'Er, hi,' Mandy said to the little man.");
    QuestJs._io.msg('');
    QuestJs._io.msg("He looked up from his work. 'Hello, miss,' he said in a high-pitched voice.");
  },
});

QuestJs._create.createItem('tinyman_live_here', QuestJs._npc.TOPIC(false), {
  loc: 'tiny_man',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'Do you live here?'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'No, no. I'm just 'ere quick-like to use the tools. Er, this this your 'ouse? You looks a bit big for it.'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'No. I live about half a mile that way.' She pointed northwards. 'I think. Things seem a bit twisted around here.'",
    );
  },
});

QuestJs._create.createItem('tinyman_what_doing', QuestJs._npc.TOPIC(false), {
  loc: 'tiny_man',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'What are you doing?'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'I'm making meself some shoes. So 'ard to find any me size, so I 'aves to make me own, see. I've gotten quite good over the years, if I say so meself.'",
    );

    // if (boots.parent = player) {
    //   if (boots.size = 0) {
    //     do (tinyman_mend_boots_normal, "show")
    //   }
    //   if (boots.size = -1) {
    //     do (tinyman_mend_boots_small, "show")
    //   }
  },
});

QuestJs._create.createItem('tinyman_mend_boots_normal', QuestJs._npc.TOPIC(false), {
  loc: 'tiny_man',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'Could you mend some boots?' Mandy showed him the boots.");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'Are you kidding me? They're enormous! 'ow could I get a needle through leather that thick?'",
    );
  },
});

QuestJs._create.createItem('tinyman_mend_boots_small', QuestJs._npc.TOPIC(false), {
  loc: 'tiny_man',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'Could you mend some boots?' Mandy showed him the boots.");
    QuestJs._io.msg('');
    QuestJs._io.msg("'I should think so. Toss 'em over here, and I'll 'ave a go.'");

    tiny_man.state = 1;
  },
});

QuestJs._create.createItem('tinyman_where_live', QuestJs._npc.TOPIC(false), {
  loc: 'tiny_man',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg("'So where <i>do </i>you live?'");
    QuestJs._io.msg('');
    QuestJs._io.msg("'14 Clarence Street. Least, that's where I lived before I come in 'ere.'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'Clarence Street? I know that road, Charlene Porter lives there.' It was a terrace house, built in the later ninettenth century, near the centre of town.",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg("'I don't know no Charlene. French is she?'");
  },
});

QuestJs._create.createItem('tinyman_very_small', QuestJs._npc.TOPIC(false), {
  loc: 'tiny_man',
  runscript() {
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'I can't help noticing...,' said Mandy wondering how she say this, 'that you quite... well, small.'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg("'Or maybe you're freakishly tall.'");
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'Well, maybe. But this room looks to me like a nursery for people my  size, and you're in a toy house.'",
    );
    QuestJs._io.msg('');
    QuestJs._io.msg(
      "'Ah, you got me. Yeah, it's me. I'm small. Never used to be; used to tower over me old mum, I did. Then I got trapped in this 'ouse, see. Went exploring, trying to find a way out, like, walked in room, big as normal, came out like this! '",
    );
  },
});

QuestJs._create.createRoom('zone_gothic', {});

QuestJs._create.createItem('gothic_floor', {
  loc: 'zone_gothic',
  scenery: true,
  examine: 'The floor was wooden, and well-polished.',
});

QuestJs._create.createItem('gothic_walls', {
  loc: 'zone_gothic',
  examine: 'The walls were all panelled in wood.',
});

QuestJs._create.createItem('gothic_ceiling', {
  loc: 'zone_gothic',
  examine: 'The ceiling was white, with simple decorations along each side.',
});

QuestJs._create.createRoom('some_gothic_room', {
  loc: 'zone_gothic',
  scenery: true,
  south: new QuestJs._create.Exit('brass_dining_room'),
  north: new QuestJs._create.Exit('gallery_south'),
  east: new QuestJs._create.Exit('central_control'),
  west: new QuestJs._create.Exit('library'),
});

QuestJs._create.createItem('library', {
  loc: 'zone_gothic',
  scenery: true,
  east: new QuestJs._create.Exit('some_gothic_room'),
});

QuestJs._create.createRoom('zone_subterrenea', {});

QuestJs._create.createItem('subterrenea_floor', {
  loc: 'zone_subterrenea',
  scenery: true,
  examine: 'The floor was rock, strewn with loose stones and pebbles.',
});

QuestJs._create.createItem('subterrenea_walls', {
  loc: 'zone_subterrenea',
  scenery: true,
  examine: 'The walls were rock, some looked like it was coal.',
});

QuestJs._create.createItem('subterrenea_ceiling', {
  loc: 'zone_subterrenea',
  scenery: true,
  examine: 'The ceiling, like the walls, was rock.',
});

QuestJs._create.createRoom('mine', {
  loc: 'zone_subterrenea',
  scenery: true,
  west: new QuestJs._create.Exit('lower_steam_hall'),
  southeast: new QuestJs._create.Exit('deeper_mine'),
});

QuestJs._create.createRoom('deeper_mine', {
  loc: 'zone_subterrenea',
  scenery: true,
  desc() {
    let s =
      'It was dark and cold in the coal mine, and Mandy felt she could sense the tonnes of rock above her head, even though logically she had only come a short, and was hardly deep underground.';
    if (this.state === 3) {
      s +=
        ' There were bits of coal and rock strewn across the floor, and Patch was busy adding to them.';
    } else if (this.state === 4) {
      s += ' The floor was ankle deep in coal and rock, and Patch was busy adding to them.';
    } else if (this.state === 5) {
      s +=
        ' The floor was knee deep in coal and rock, and the tunnel now continued some way to the southeast. Mandy could heard Patch still working down there.';
    }
    Print(s);
  },
  beforeEnter() {},
  afterEnter() {
    if (this.state === 3) {
      this.state = 4;
    } else if (this.state === 4) {
      this.state = 5;
    } else if (this.state === 5) {
      exit_to_even_deeper_mine.visible = true;
      QuestJs._w.patch.parent = QuestJs._w.even_deeper_mine;
    }
  },
  northwest: new QuestJs._create.Exit('mine'),
  southeast: new QuestJs._create.Exit('even_deeper_mine'),
});

QuestJs._create.createItem('pickaxe', {
  loc: 'deeper_mine',
  examine:
    'The pickaxe was like every other pickaxe Mandy had seen; a wooden handle, a metal head.',
});

QuestJs._create.createItem('coal', {
  loc: 'deeper_mine',
  scenery: true,
  pronouns: QuestJs._lang.pronouns.plural,
  examine: 'As Mandy looked closely, she could see there was definitely coal in the rockface here.',
});

QuestJs._create.createItem('sack', {
  loc: 'deeper_mine',
});

QuestJs._create.createRoom('even_deeper_mine', {
  loc: 'zone_subterrenea',
  northwest: new QuestJs._create.Exit('deeper_mine'),
});
