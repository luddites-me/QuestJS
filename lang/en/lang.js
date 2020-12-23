import { Grammar } from './grammar.js';

const { QuestJs } = window;

const {
  conjugations, list_and, pronouns, numberUnits, ordinalReplacements,
} = Grammar;

//----------------------------------------------------------------------------------------------
// Complex responses (requiring functions)
export class Language {
  // Used deep in the parser, so prefer to use function, rather than string
  static object_unknown_msg(name) {
    return `${Language.nounVerb(
      QuestJs._game.player,
      "can't",
      true,
    )} see anything you might call '${name}' here.`;
  }

  // For furniture
  static stop_posture(char) {
    if (!char.posture || char.posture === 'standing') return '';
    let s;
    // You could split up sitting, standing and lying
    if (char.postureFurniture) {
      s = `${Language.nounVerb(char, 'get', true)} off ${Language.getName(
        QuestJs._w[char.postureFurniture],
        {
          article: QuestJs._consts.DEFINITE,
        },
      )}.`;
    } else {
      s = `${Language.nounVerb(char, 'stand', true)} up.`;
    }
    char.posture = undefined;
    char.postureFurniture = undefined;
    return s;
  }

  // use (or potentially use) different verbs in the responses, so not simple strings
  static say_no_one_here(char, verb, text) {
    return `${Language.nounVerb(char, verb, true)}, '${QuestJs._tools.sentenceCase(
      text,
    )},' but no one notices.`;
  }

  static say_no_response(char, verb, text) {
    return 'No one seemed interested in what you say.';
  }

  static say_no_response_full(char, verb, text) {
    return `${Language.nounVerb(char, verb, true)}, '${QuestJs._tools.sentenceCase(
      text,
    )},' but no one seemed interested in what you say.`;
  }

  // If the player does SPEAK TO MARY and Mary has some topics, this will be the menu title.
  static speak_to_menu_title(char) {
    return `Talk to ${Language.getName(char, { article: QuestJs._consts.DEFINITE })} about:`;
  }

  // If the player does TELL MARY ABOUT HOUSE this will appear before the response.
  static tell_about_intro(char, text1, text2) {
    return `You tell ${Language.getName(char, {
      article: QuestJs._consts.DEFINITE,
    })} ${text2} ${text1}.`;
  }

  // If the player does ASK MARY ABOUT HOUSE this will appear before the response.
  static ask_about_intro(char, text1, text2) {
    return `You ask ${Language.getName(char, {
      article: QuestJs._consts.DEFINITE,
    })} ${text2} ${text1}.`;
  }

  // Use when the NPC leaves a room; will give a message if the player can observe it
  static npc_leaving_msg(npc, dest) {
    let s = '';
    let flag = false;
    if (
      QuestJs._w[QuestJs._game.player.loc].canViewLocs
      && QuestJs._w[QuestJs._game.player.loc].canViewLocs.includes(npc.loc)
    ) {
      s = QuestJs._w[QuestJs._game.player.loc].canViewPrefix;
      flag = true;
    }
    if (flag || npc.inSight()) {
      s += `${Language.nounVerb(npc, 'leave', !flag)} ${Language.getName(QuestJs._w[npc.loc], {
        article: QuestJs._consts.DEFINITE,
      })}`;
      const exit = QuestJs._w[npc.loc].findExit(dest);
      if (exit) s += `, heading ${exit.dir}`;
      s += '.';
      QuestJs._io.msg(s);
    }
  }

  // the NPC has already been moved, so npc.loc is the destination
  static npc_entering_msg(npc, origin) {
    let s = '';
    let flag = false;
    if (
      QuestJs._w[QuestJs._game.player.loc].canViewLocs
      && QuestJs._w[QuestJs._game.player.loc].canViewLocs.includes(npc.loc)
    ) {
      // Can the player see the location the NPC enters, from another location?
      s = QuestJs._w[QuestJs._game.player.loc].canViewPrefix;
      flag = true;
    }
    if (flag || npc.inSight()) {
      s += `${Language.nounVerb(npc, 'enter', !flag)} ${Language.getName(QuestJs._w[npc.loc], {
        article: QuestJs._consts.DEFINITE,
      })}`;
      const exit = QuestJs._w[npc.loc].findExit(origin);
      if (exit) s += ` from ${QuestJs._util.niceDirection(exit.dir)}`;
      s += '.';
      QuestJs._io.msg(s);
    }
  }

  //----------------------------------------------------------------------------------------------
  // Meta-command responses
  static helpScript() {
    if (QuestJs._settings.textInput) {
      QuestJs._io.metamsg(
        'Type commands in the command bar to interact with the world. Using the arrow keys you can scroll up and down though your previous QuestJs._commands.',
      );
      QuestJs._io.metamsg(
        '{b:Movement:} To move, use the eight compass directions (or just N, NE, etc.). Up/down and in/out may be options too. When "Num Lock" is on, you can use the number pad for all eight compass directions, - and + for UP and DOWN, / and * for IN and OUT.',
      );
      QuestJs._io.metamsg(
        '{b:Other commands:} You can also LOOK (or just L or 5 on the number pad), HELP (or ?) or WAIT (or Z or the dot on the number pad). Other commands are generally of the form GET HAT or PUT THE BLUE TEAPOT IN THE ANCIENT CHEST. Experiment and see what you can do!',
      );
      QuestJs._io.metamsg(
        "{b:Using items: }You can use ALL and ALL BUT with some commands, for example TAKE ALL, and PUT ALL BUT SWORD IN SACK. You can also use pronouns, so LOOK AT MARY, then TALK TO HER. The pronoun will refer to the last subject in the last successful command, so after PUT HAT AND FUNNY STICK IN THE DRAWER, 'IT' will refer to the funny stick (the hat and the stick are subjects of the sentence, the drawer was the object).",
      );
      QuestJs._io.metamsg(
        '{b:Characters: }If you come across another character, you can ask him or her to do something. Try things like MARY,PUT THE HAT IN THE BOX, or TELL MARY TO GET ALL BUT THE KNIFE. Depending on the game you may be able to TALK TO a character, to ASK or TELL a character ABOUT a topic, or just SAY something and they will respond..',
      );
      QuestJs._io.metamsg(
        '{b:Meta-commands:} Type ABOUT to find out about the author, SCRIPT to learn about transcripts or SAVE to learn about saving games. Use WARNINGS to see any applicable sex, violence or trigger warnings.',
      );
      let s = 'You can also use BRIEF/TERSE/VERBOSE to control room descriptions. Type DARK to toggle dark mode or SILENT to toggle sounds and music (if implemented).';
      if (typeof map !== 'undefined') s += ' Use MAP to toggle/show the map.';
      if (typeof imagePane !== 'undefined') s += ' Use IMAGES to toggle/show the iage pane.';
      QuestJs._io.metamsg(s);
      QuestJs._io.metamsg(
        "{b:Shortcuts:}You can often just type the first few characters of an item's name and Quest will guess what you mean.  If fact, if you are in a room with Brian, who is holding a ball, and a box, Quest should be able to work out that B,PUT B IN B mean you want Brian to put the ball in the box.",
      );
      QuestJs._io.metamsg(
        'You can use the up and down arrows to scroll back though your previous typed commands - especially useful if you realise you spelled something wrong. If you do not have arrow keys, use OOPS to retrieve the last typed command so you can edit it. Use AGAIN or just G to repeat the last typed command.',
      );
    }
    if (QuestJs._settings.panes !== 'none') {
      QuestJs._io.metamsg(
        '{b:User Interface:} To interact with an object, click on its name in the side pane, and a set of possible actions will appear under it. Click on the appropriate action.',
      );
      if (QuestJs._settings.compassPane) {
        if (QuestJs._settings.symbolsForCompass) {
          QuestJs._io.metamsg(
            'You can also use the compass rose at the top to move around. Click the eye symbol, &#128065;, to look at you current location, the pause symbol, &#9208;, to wait or &#128712; for help.',
          );
        } else {
          QuestJs._io.metamsg(
            "You can also use the compass rose at the top to move around. Click 'Lk' to look at you current location, 'Z' to wait or '?' for help.",
          );
        }
      }
    }
    if (QuestJs._settings.additionalHelp !== undefined) {
      for (const s of QuestJs._settings.additionalHelp) QuestJs._io.metamsg(s);
    }
    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  }

  static hintScript() {
    QuestJs._io.metamsg('Sorry, no hints available.');
    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  }

  static aboutScript() {
    QuestJs._io.metamsg(
      '{i:{param:settings:title} version {param:settings:version}} was written by {param:settings:author} using Quest 6 AKA Quest JS version {param:settings:questVersion}.',
      { settings: QuestJs._settings },
    );
    if (QuestJs._settings.ifdb) QuestJs._io.metamsg(`IFDB number: ${QuestJs._settings.ifdb}`);
    if (QuestJs._settings.thanks && QuestJs._settings.thanks.length > 0) {
      QuestJs._io.metamsg(
        `Thanks to ${QuestJs._tools.formatList(QuestJs._settings.thanks, {
          lastJoiner: list_and,
        })}.`,
      );
    }
    if (QuestJs._settings.additionalAbout !== undefined) {
      for (const s of QuestJs._settings.additionalAbout) QuestJs._io.metamsg(s);
    }
    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  }

  static warningsScript() {
    switch (typeof QuestJs._settings.warnings) {
    case 'undefined':
      QuestJs._io.metamsg('No warning have been set for this game.');
      break;
    case 'string':
      QuestJs._io.metamsg(QuestJs._settings.warnings);
      break;
    default:
      for (const el of QuestJs._settings.warnings) QuestJs._io.metamsg(el);
    }
    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  }

  static saveLoadScript() {
    QuestJs._io.metamsg('To save your progress, type SAVE followed by the name to save with.');
    QuestJs._io.metamsg(
      'To load your game, refresh/reload this page in your browser, then type LOAD followed by the name you saved with.',
    );
    QuestJs._io.metamsg('To see a list of save games, type DIR.');
    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  }

  static transcriptScript() {
    QuestJs._io.metamsg(
      'The TRANSCRIPT or SCRIPT command can be used to handle saving the input and output. This can be very useful when testing a game, as the author can go back through it and see exactly what happened, and how the player got there.',
    );
    QuestJs._io.metamsg(
      'Use SCRIPT ON to turn on recording and SCRIPT OFF to turn it off. Use SCRIPT SHOW to display it (it will appear in a new tab; you will not lose your place inthe game). To empty the file, use SCRIPT CLEAR.',
    );
    QuestJs._io.metamsg(
      'You can add options to the SCRIPT SHOW to hide various types of text. Use M to hide meta-information (like this), I to hide your input, P to hide parser errors (when the parser says it has no clue what you mean), E to hide programming errors and D to hide debugging messages. These can be combined, so SCRIPT SHOW ED will hide programming errors and debugging messages, and SCRIPT SHOW EDPID will show only the output game text.',
    );
    QuestJs._io.metamsg(
      'You can add a comment to the transcript by starting your text with an asterisk (*).',
    );
    QuestJs._io.metamsg(
      'You can do TRANSCRIPT WALKTHROUGH or just SCRIPT W to copy the transcript to the clipboard formatted for a walk-through. You can then paste it straight into the code.',
    );
    QuestJs._io.metamsg(
      'Everything gets saved to memory, and will be lost if you go to another web page or close your browser. The transcript is not saved when you save your game (but will not be lost when you load a game). If you complete the game the text input will disappear, however if you have a transcript a link will be available to access it.',
    );
    QuestJs._io.metamsg(`Transcript is currently: ${QuestJs._IO.transcript ? 'on' : 'off'}`);
    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  }

  static topicsScript() {
    QuestJs._io.metamsg(
      'Use TOPICS FOR [name] to see a list of topic suggestions to ask a character about (if implemented in this game).',
    );
    return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
  }

  static betaTestIntro() {
    QuestJs._io.metamsg(
      `This version is for beta-testing (${QuestJs._settings.version}). A transcript will be automatically recorded. When you finish, do Ctrl-Enter or type SCRIPT SHOW to open the transcript in a new tab; it can then be copy-and-pasted into an e-mail.`,
    );
    if (QuestJs._settings.textInput) {
      QuestJs._io.metamsg(
        'You can add your own comments to the transcript by starting a command with *.',
      );
    }
    QuestJs._IO.scriptStart();
  }

  //----------------------------------------------------------------------------------------------
  //                                   LANGUAGE FUNCTIONS

  // @DOC
  // ## Language Functions
  // @UNDOC

  // @DOC
  // Returns "the " if appropriate for this item.
  // If the item has 'defArticle' it returns that; if it has a proper name, returns an empty string.
  static addDefiniteArticle(item) {
    if (item.defArticle) {
      return `${item.defArticle} `;
    }
    return item.properName ? '' : 'the ';
  }

  // @DOC
  // Returns "a " or "an " if appropriate for this item.
  // If the item has 'indefArticle' it returns that; if it has a proper name, returns an empty string.
  // If it starts with a vowel, it returns "an ", otherwise "a ".
  static addIndefiniteArticle(item) {
    if (item.indefArticle) {
      return `${item.indefArticle} `;
    }
    if (item.properName) {
      return '';
    }
    if (item.pronouns === pronouns.plural) {
      return 'some ';
    }
    if (item.pronouns === pronouns.massnoun) {
      return '';
    }
    if (/^[aeiou]/i.test(item.alias)) {
      return 'an ';
    }
    return 'a ';
  }

  static getName(item, options = {}) {
    if (!item.alias) item.alias = item.name;
    let s = '';
    let count = options[`${item.name}_count`] ? options[`${item.name}_count`] : false;
    if (!count && options.loc && item.countable) count = item.countAtLoc(options.loc);

    if (
      item.pronouns === pronouns.firstperson
      || item.pronouns === pronouns.secondperson
    ) {
      s = options.possessive ? item.pronouns.poss_adj : item.pronouns.subjective;
    } else {
      if (count && count > 1) {
        s += `${Language.toWords(count)} `;
      } else if (options.article === QuestJs._consts.DEFINITE) {
        s += Language.addDefiniteArticle(item);
      } else if (options.article === QuestJs._consts.INDEFINITE) {
        s += Language.addIndefiniteArticle(item, count);
      }
      if (item.getAdjective) {
        s += item.getAdjective();
      }
      if (!count || count === 1) {
        s += item.alias;
      } else if (item.pluralAlias) {
        s += item.pluralAlias;
      } else {
        s += `${item.alias}s`;
      }
      if (options.possessive) {
        if (s.endsWith('s')) {
          s += "'";
        } else {
          s += "'s";
        }
      }
    }
    s += QuestJs._util.getNameModifiers(item, options);

    return options && options.capital ? QuestJs._tools.sentenceCase(s) : s;
  }

  // @DOC
  // Returns the given number in words, so 19 would be returned as 'nineteen'.
  // Numbers uner -2000 and over 2000 are returned as a string of digits,
  // so 2001 is returned as '2001'.
  static toWords(n) {
    if (typeof n !== 'number') {
      QuestJs._io.errormsg('toWords can only handle numbers');
      return n;
    }
    let number = n;
    let s = '';
    if (number < 0) {
      s = 'minus ';
      number = -number;
    }
    if (number < 2000) {
      const hundreds = Math.floor(number / 100);
      number %= 100;
      if (hundreds > 0) {
        s = `${s + numberUnits[hundreds]} hundred `;
        if (number > 0) {
          s += 'and ';
        }
      }
      if (number < 20) {
        if (number !== 0 || s === '') {
          s += numberUnits[number];
        }
      } else {
        const units = number % 10;
        const tens = Math.floor(number / 10) % 10;
        s += Language.numberTens[tens - 2];
        if (units !== 0) {
          s += numberUnits[units];
        }
      }
    } else {
      s = number.toString();
    }
    return s;
  }

  // @DOC
  // Returns the given number in words as the ordinal, so 19 would be returned as 'nineteenth'.
  // Numbers uner -2000 and over 2000 are returned as a string of digits with 'th' appended,
  // so 2001 is returned as '2001th'.
  static toOrdinal(number) {
    if (typeof number !== 'number') {
      QuestJs._io.errormsg('toOrdinal can only handle numbers');
      return number;
    }

    const s = Language.toWords(number);
    for (const or of ordinalReplacements) {
      if (or.regex.test(s)) {
        return s.replace(or.regex, or.replace);
      }
    }
    return `${s}th`;
  }

  static convertNumbers(str) {
    let s = str;
    for (let i = 0; i < numberUnits.length; i += 1) {
      const regex = new RegExp(`\\b${numberUnits[i]}\\b`);
      if (regex.test(s)) s = s.replace(regex, `${i}`);
    }
    return s;
  }

  // Conjugating

  // @DOC
  // Returns the verb properly conjugated for the item, so "go" with a ball would return
  // "goes", but "go" with the player (if using second person pronouns).
  static conjugate(item, verb) {
    let gender = item.pronouns.subjective;
    if (gender === 'he' || gender === 'she') {
      gender = 'it';
    }
    const arr = conjugations[gender.toLowerCase()];

    if (!arr) {
      QuestJs._io.errormsg(`No conjugations found: conjugations_${gender.toLowerCase()}`);
      return verb;
    }
    for (const conj of arr) {
      if (conj.name === verb) {
        return conj.value;
      }
    }

    for (const conj of arr) {
      const { name } = conj;
      const { value } = conj;
      if (name.startsWith('@') && verb.endsWith(name.substring(1))) {
        return Language.conjugate(item, verb.substring(0, verb.length - name.length + 1)) + value;
      }
      if (name.startsWith('*') && verb.endsWith(name.substring(1))) {
        return item, verb.substring(0, verb.length - name.length + 1) + value;
      }
    }
    return verb;
  }

  // @DOC
  // Returns the pronoun for the item, followed by the conjugated verb,
  // so "go" with a ball would return "it goes", but "go" with the player (if using second person pronouns)
  // would return "you go".
  // The first letter is capitalised if 'capitalise' is true.
  static pronounVerb(item, verb, capitalise) {
    let s = `${item.pronouns.subjective} ${Language.conjugate(item, verb)}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? QuestJs._tools.sentenceCase(s) : s;
  }

  static pronounVerbForGroup(item, verb, capitalise) {
    let s = `${item.groupPronouns().subjective} ${Language.conjugate(item.group(), verb)}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? QuestJs._tools.sentenceCase(s) : s;
  }

  static verbPronoun(item, verb, capitalise) {
    let s = `${Language.conjugate(item, verb)} ${item.pronouns.subjective}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? QuestJs._tools.sentenceCase(s) : s;
  }

  // @DOC
  // Returns the name for the item, followed by the conjugated verb,
  // so "go" with a ball would return "the ball goes", but "go" with
  // a some bees would return "the bees go". For the player, (if using second person pronouns)
  // would return the pronoun "you go".
  // The first letter is capitalised if 'capitalise' is true.
  static nounVerb(item, verb, capitalise) {
    if (item === QuestJs._game.player && !QuestJs._game.player.useProperName) {
      return Language.pronounVerb(item, verb, capitalise);
    }
    let s = `${Language.getName(item, {
      article: QuestJs._consts.DEFINITE,
    })} ${Language.conjugate(item, verb)}`;
    s = s.replace(/ +'/, "'"); // yes this is a hack!
    return capitalise ? QuestJs._tools.sentenceCase(s) : s;
  }

  static verbNoun(item, verb, capitalise) {
    if (item === QuestJs._game.player) {
      return Language.pronounVerb(item, verb, capitalise);
    }
    let s = `${Language.conjugate(item, verb)} ${Language.getName(item, {
      article: QuestJs._consts.DEFINITE,
    })}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? QuestJs._tools.sentenceCase(s) : s;
  }
}
