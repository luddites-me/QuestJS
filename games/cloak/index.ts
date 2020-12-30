import { WorldStates } from '../../src';
import { Player } from '../../src/node/actors/player';
import { Exit } from '../../src/node/exit';
import { Item } from '../../src/node/items/item';
import { Surface } from '../../src/node/items/surface';
import { Wearable } from '../../src/node/items/wearable';
import { Room } from '../../src/node/locations/room';
import { Quest } from '../../src/Quest';

const quest = new Quest();

const cloakHere = () => {
  const cloak = quest.state.get('cloak');
  if (cloak.isAtLoc('me')) return true;
  if (cloak.isHere()) return true;

  const cloakRoom = quest.state.get('cloakroom');
  if (cloak.isAtLoc('hook') && quest.game.player.isAtLoc(cloakRoom))
    return true;
  return false;
};

quest.init({
  lexicon: {
    no_smell: 'It smells slightly musty.',
    no_listen: 'It is quiet as the grave...',
  },
  textProcessor: {
    cloakHere: (arr, params) => cloakHere() ? arr[0] : arr[1],
  },
  commands: {
    MetaCredits: {
      script: () => {
        quest.io.metamsg('This game was created by The Pixie, following the Cloak of Darkness specification by Roger Firth.');
      }
    },
    MetaHelp: {
      script: () => {
        quest.io.metamsg('Just type stuff at the prompt!');
      },
    },
    HangUp: {
      regex: /^(hang up|hang) (.+)$/,
      objects: [{ ignore: true }, { scope: quest.parser.isHeld }],
      script(objects) {
        if (!objects[0][0].isAtLoc(player)) {
          return quest.io.failedmsg("You're not carrying {sb:obj}.", {
            obj: objects[0][0],
          });
        }
        if (objects[0][0].worn) {
          return quest.io.failedmsg("Not while you're wearing {sb:obj}!", {
            obj: objects[0][0],
          });
        }
        if (!player.isAtLoc(cloakRoom)) {
          return quest.io.failedmsg('Hang {sb:obj} where, exactly?', {
            obj: objects[0][0],
          });
        }
        objects[0][0].moveToFrom('hook');
        quest.io.msg('You hang {nm:obj:the} on the hook.', {
          obj: objects[0][0],
        });
        return WorldStates.SUCCESS;
      },
    },
    HangUpOn: {
      regex: /^(hang up|hang) (.+) on (|the )hook$/,
      objects: [
        { ignore: true },
        { scope: quest.parser.isHeld },
        { ignore: true },
      ],
      script(objects) {
        if (!objects[0][0].isAtLoc(player)) {
          return quest.io.failedmsg("You're not carrying {sb:obj}.", {
            obj: objects[0][0],
          });
        }
        if (objects[0][0].worn) {
          return quest.io.failedmsg("Not while you're wearing {sb:obj}!", {
            obj: objects[0][0],
          });
        }
        if (!quest.game.player.isAtLoc(cloakRoom)) {
          return quest.io.failedmsg('Hang {sb:obj} where, exactly?', {
            obj: objects[0][0],
          });
        }
        objects[0][0].moveToFrom('hook');
        quest.io.msg('You hang {nm:obj:the} on the hook.', {
          obj: objects[0][0],
        });
        return WorldStates.SUCCESS;
      },
    }
  },
  settings: {
    title: 'Cloak of Darkness',
    author: 'The Pixie',
    version: '0.3',
    thanks: [],
    panes: 'none',
    roomTemplate: [
      '#{cap:{hereName}}',
      '{hereDesc}',
      '{objectsHere:You can see {objects} here.}',
    ],
    styleFile: 'style',
  },
});

const lobby = new Room(quest, 'lobby', {
  desc: "There is something oppressive about the {cloakHere:dark:dingy} {once:room}{notOnce:foyer}; a presence in the air that almost suffocates you. It's former glory has all but faded; the walls still sport old posters from productions that ended over twenty years ago. Paint is peeling, dust is everywhere and it smells decidedly musty. You can see doors to the north, west and south.",
  beforeFirstEnter() {
    quest.io.msg('You hurry through the night, keen to get out of the rain. Ahead, you can see the old opera house, a brightly-lit beacon of safety.');
    quest.io.msg('Moments later you are pushing though the doors into the foyer. Now that you are here it does not seem so bright. The doors close behind you with an ominous finality...');
    quest.io.msg('');
  },
  north: new Exit(quest, 'lobby', {
    use() {
      quest.io.msg('You try the doors out of the opera house, but they are locked. {once:{i:How did that happen?} you wonder.}');
      return false;
    },
  }),
  west: new Exit(quest, 'cloakroom'),
  south: new Exit(quest, 'bar'),
  onSmell: 'It smells of damp and neglect in here.',
});

const player = new Player(quest, 'me', {
  loc: lobby,
  regex: /^(me|myself|player)$/,
  examine: 'Just a regular guy.',
})

const cloak = new Wearable(quest, 'cloak', {
  type: 'wearable',
  examine: 'The cloak is black... Very black... So black it seems to absorb light.',
  worn: true,
  loc: player,
})

new Item(quest, 'posters', {
  examine: 'The posters are ripped and peeling off the wall.',
  read:
    "You spend a few minutes reading about the shows they put on twenty-odd years ago.... {i:Die Zauberflöte}... {i:Guillaume Tell}... {i:A Streetcar Named Desire}. Wasn't that a play?",
  scenery: true,
  plural: true,
  loc: lobby,
});

const cloakRoom = new Room(quest, 'cloakroom', {
  desc() {
    let s =
      'The cloakroom is {cloakHere:dimly:brightly} lit, and is little more than a cupboard. ';
    if (cloak.isAtLoc('hook')) {
      s += 'Your cloak is hung from the only hook.';
    } else if (cloak.isAtLoc(cloakRoom)) {
      s +=
        'There is a single hook, which apparently was not good enough for you, to judge from the cloak on the floor.';
    } else {
      s +=
        'There is a single hook, which strikes you as strange for a cloakroom.';
    }
    return `${s} The only way out is back to the east. `;
  },
  east: new Exit(quest, 'lobby'),
});

new Surface(quest, 'hook', {
  regex: /^peg$/,
  hookable: true,
  scenery: true,
  examine() {
    if (cloak.isAtLoc('hook')) {
      quest.io.msg('An ornate brass hook, with a cloak hanging from it.');
    } else {
      quest.io.msg('An ornate brass hook, ideal for hanging cloaks on.');
    }
  },
  loc: cloakRoom,
});

const bar = new Room(quest, 'bar', {
  desc() {
    if (cloakHere()) {
      return 'It is too dark to see anything except the door to the north.';
    }
    return 'The bar is dark, and somehow brooding. It is also thick with dust. So much so that someone has scrawled a message in the dust on the floor. The only exit is north.';
  },
  beforeEnter() {
    message.visible = !cloakHere();
  },
  onExit() {
    message.count = 0;
  },
  north: new Exit(quest, 'lobby'),
  onSmell:
    'There is a musty smell, but behind that, something else, something that reminds you of the zoo, perhaps?',
  onListen: 'Is there something moving?',
});

const message = new Item(quest, 'message', {
  regex: /writing|note/,
  count: 0,
  disturbed: 0,
  scenery: true,
  loc: bar,
  examine() {
    if (cloakHere()) {
      quest.io.msg('You cannot see any message, it is too dark.');
    }
    if (message.disturbed < 3) {
      quest.io.msg("The message in the dust says 'You have won!'");
    } else {
      quest.io.msg("The message in the dust says 'You have lost!'");
    }
    quest.io.finish();
  },
  read() {
    message.examine();
  },
  eventPeriod: 1,
  eventIsActive() {
    return player.isAtLoc(bar) && !this.finished;
  },
  eventScript() {
    message.count += 1;
    if (message.count > 1) {
      if (message.disturbed === 0) {
        this.io.msg(
          'You think it might be a bad idea to disturb things in the dark.'
        );
      } else if (!player.suppress_background_sounds) {
        quest.io.msg(
          'You can hear {random:scratching:something moving in the dark:rasping breathing}.'
        );
      }
      message.disturbed += 1;
    }
    return true;
  },
});

new Item(quest, 'walls', {
  examine() {
    if (cloakHere() && player.isAtLoc(bar)) {
      quest.io.msg('It is too dark to see the walls.');
    } else {
      quest.io.msg(
        'The walls are covered in a faded red and gold wallpaper, that is showing signs of damp.'
      );
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return loc.room && situation === WorldStates.PARSER;
  },
});

new Item(quest, 'ceiling', {
  examine() {
    if (cloakHere() && player.isAtLoc(bar)) {
      quest.io.msg('It is too dark to see the ceiling.');
    } else {
      quest.io.msg(
        'The ceiling is - or was - white. Now it is a dirty grey.'
      );
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return loc.room && situation === WorldStates.PARSER;
  },
});

new Item(quest, 'floor', {
  regex: /^carpet$/,
  examine() {
    if (cloakHere() && player.isAtLoc(bar)) {
      quest.io.msg('It is too dark to see the floor.');
    } else {
      quest.io.msg(
        'A red carpet covers the floor, worn almost though in places.'
      );
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return loc.room && situation === WorldStates.PARSER;
  },
});

new Item(quest, 'doors', {
  regex: /^carpet$/,
  examine() {
    if (cloakHere() && player.isAtLoc(bar)) {
      quest.io.msg('It is too dark to see the door properly.');
    } else {
      quest.io.msg('All the doors are wooden, and painted white.');
    }
  },
  isAtLoc(loc, situation) {
    if (typeof loc !== 'string') loc = loc.name;
    return loc.room && situation === WorldStates.PARSER;
  },
});
