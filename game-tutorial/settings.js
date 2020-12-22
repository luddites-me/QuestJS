'use strict';

// About your game
QuestJs._settings.title = 'Professor Kleinscope';
QuestJs._settings.author = 'The Pixie';
QuestJs._settings.version = '1.3';
QuestJs._settings.additionalAbout = ['Thanks to Pertex and R2T1 for beta-testing.'];
QuestJs._settings.warnings = 'No warning relevant for this QuestJs._game.';
QuestJs._settings.files = ['data', 'code', 'npcs'];
QuestJs._settings.playMode = 'play';
QuestJs._settings.noTalkTo = false;
QuestJs._settings.noAskTell = false;
QuestJs._settings.givePlayerAskTellMsg = false;
QuestJs._settings.symbolsForCompass = true;

QuestJs._settings.soundsFolder = 'sounds/';
QuestJs._settings.soundFiles = [
  'Bells4',
  'Coins3',
  'SynthChime6',
  'Laser-Shot-1',
  'Cold-Moon_Looping',
  'Dark-techno-City_Looping',
  'Light-Years_V001_Looping',
  'Theyre-Here_Looping',
];

QuestJs._settings.afterSave = function (filename) {
  if (hint.before('save')) {
    tmsg('Okay, we were not going to do saving until later, but whatever...');
    QuestJs._w.me.alreadySaved = true;
  } else if (hint.before('westRobot')) {
    if (filename.toLowerCase() === 'tutorial') {
      tmsg(
        "Great, we have saved the game - and you even followed my advice for the name. Now let's continue west down this passage.",
      );
    } else {
      tmsg(
        "Great, we have saved the game - though I am, a bit disappointed that you didn't followed my advice for the name... Oh, well, I guess we better continue west down this passage.",
      );
    }
    hint.now('westRobot');
  }
};

QuestJs._settings.afterLoad = function () {
  if (!hint.before('westRobot')) {
    tmsg(
      'Great, you not only saved the game, you loaded it too! I suggest you use the HINT command to see what to do next, and then you can get going with the tutorial again.',
    );
  }
};

QuestJs._settings.intro = [
  'Your mission is to retrieve some files from the computer of Professor Kleinscope. His office is upstairs, but getting there will not be easy.',
];

QuestJs._settings.setup = function () {
  tmsg(
    'This is a simple introduction to text adventures; comments like this will lead you by the hand as you do most of the common things in a text adventures (you can toggle these comments on and off with the TUTORIAL command).',
  );
  tmsg(
    'Text adventures are also known as interactive fiction, and there are numerous formats. This is about parser-based game, which is to say, a game where the player types commands, and the game attempts to parse the command, and update the game world accordingly.',
  );
  tmsg(
    "There is also a huge variety of parser-based games, but most start with some introductory text, as above, and then place the player in a starting location, so let's see where we are...",
  );
};

QuestJs._settings.roomTemplate = [
  '#{cap:{hereName}}',
  '{terse:{hereDesc}}',
  '{objectsHere:You can see {objects} here.}',
];
