import { ILexicon } from '../lexicon';
import { Grammar } from './grammar';
import { Regex } from './regex';
import { Responses } from './responses';
import { Ops } from './ops';
import { Known, WorldStates } from '../../lib/constants';
import { getNameModifiers, niceDirection, sentenceCase } from '../../lib/tools/tools';
import { IProcessor } from '../processor';
import { Base } from '../../lib/base';

const {
  conjugations, list_and, pronouns, numberUnits, ordinalReplacements, numberTens,
} = Grammar;

//----------------------------------------------------------------------------------------------
// Complex responses (requiring functions)
export class Processor extends Base implements IProcessor {

  get lexicon(): ILexicon {
    return {
      ...Grammar,
      regex: {
        ...Regex,
      },
      ...Responses,
      ...Ops,
    };
  }

  // Used deep in the parser, so prefer to use function, rather than string
  object_unknown_msg(name) {
    return `${this.nounVerb(
      this.game.player,
      "can't",
      true,
    )} see anything you might call '${name}' here.`;
  }

  // For furniture
  stop_posture(char) {
    if (!char.posture || char.posture === 'standing') return '';
    let s;
    // You could split up sitting, standing and lying
    if (char.postureFurniture) {
      s = `${this.nounVerb(char, 'get', true)} off ${this.getName(
        this.state.get(char.postureFurniture),
        {
          article: Known.DEFINITE,
        },
      )}.`;
    } else {
      s = `${this.nounVerb(char, 'stand', true)} up.`;
    }
    char.posture = undefined;
    char.postureFurniture = undefined;
    return s;
  }

  // use (or potentially use) different verbs in the responses, so not simple strings
  say_no_one_here(char, verb, text) {
    return `${this.nounVerb(char, verb, true)}, '${sentenceCase(
      text,
    )},' but no one notices.`;
  }

  say_no_response(char, verb, text) {
    return 'No one seemed interested in what you say.';
  }

  say_no_response_full(char, verb, text) {
    return `${this.nounVerb(char, verb, true)}, '${sentenceCase(
      text,
    )},' but no one seemed interested in what you say.`;
  }

  // If the player does SPEAK TO MARY and Mary has some topics, this will be the menu title.
  speak_to_menu_title(char) {
    return `Talk to ${this.getName(char, { article: Known.DEFINITE })} about:`;
  }

  // If the player does TELL MARY ABOUT HOUSE this will appear before the response.
  tell_about_intro(char, text1, text2) {
    return `You tell ${this.getName(char, {
      article: Known.DEFINITE,
    })} ${text2} ${text1}.`;
  }

  // If the player does ASK MARY ABOUT HOUSE this will appear before the response.
  ask_about_intro(char, text1, text2) {
    return `You ask ${this.getName(char, {
      article: Known.DEFINITE,
    })} ${text2} ${text1}.`;
  }

  // Use when the NPC leaves a room; will give a message if the player can observe it
  npc_leaving_msg(npc, dest) {
    let s = '';
    let flag = false;
    if (
      this.state.get(this.game.player.loc.name).canViewLocs
      && this.state.get(this.game.player.loc.name).canViewLocs.includes(npc.loc)
    ) {
      s = this.state.get(this.game.player.loc.name).canViewPrefix;
      flag = true;
    }
    if (flag || npc.inSight()) {
      s += `${this.nounVerb(npc, 'leave', !flag)} ${this.getName(this.state.get(npc.loc), {
        article: Known.DEFINITE,
      })}`;
      const exit = this.state.get(npc.loc).findExit(dest);
      if (exit) s += `, heading ${exit.dir}`;
      s += '.';
      this.io.msg(s);
    }
  }

  // the NPC has already been moved, so npc.loc is the destination
  npc_entering_msg(npc, origin) {
    let s = '';
    let flag = false;
    if (
      this.state.get(this.game.player.loc.name).canViewLocs
      && this.state.get(this.game.player.loc.name).canViewLocs.includes(npc.loc)
    ) {
      // Can the player see the location the NPC enters, from another location?
      s = this.state.get(this.game.player.loc.name).canViewPrefix;
      flag = true;
    }
    if (flag || npc.inSight()) {
      s += `${this.nounVerb(npc, 'enter', !flag)} ${this.getName(this.state.get(npc.loc), {
        article: Known.DEFINITE,
      })}`;
      const exit = this.state.get(npc.loc).findExit(origin);
      if (exit) s += ` from ${niceDirection(exit.dir)}`;
      s += '.';
      this.io.msg(s);
    }
  }

  //----------------------------------------------------------------------------------------------
  // Meta-command responses
  helpScript() {
    if (this.settings.textInput) {
      this.io.metamsg(
        'Type commands in the command bar to interact with the world. Using the arrow keys you can scroll up and down though your previous QuestJs._commands.',
      );
      this.io.metamsg(
        '{b:Movement:} To move, use the eight compass directions (or just N, NE, etc.). Up/down and in/out may be options too. When "Num Lock" is on, you can use the number pad for all eight compass directions, - and + for UP and DOWN, / and * for IN and OUT.',
      );
      this.io.metamsg(
        '{b:Other commands:} You can also LOOK (or just L or 5 on the number pad), HELP (or ?) or WAIT (or Z or the dot on the number pad). Other commands are generally of the form GET HAT or PUT THE BLUE TEAPOT IN THE ANCIENT CHEST. Experiment and see what you can do!',
      );
      this.io.metamsg(
        "{b:Using items: }You can use ALL and ALL BUT with some commands, for example TAKE ALL, and PUT ALL BUT SWORD IN SACK. You can also use pronouns, so LOOK AT MARY, then TALK TO HER. The pronoun will refer to the last subject in the last successful command, so after PUT HAT AND FUNNY STICK IN THE DRAWER, 'IT' will refer to the funny stick (the hat and the stick are subjects of the sentence, the drawer was the object).",
      );
      this.io.metamsg(
        '{b:Characters: }If you come across another character, you can ask him or her to do something. Try things like MARY,PUT THE HAT IN THE BOX, or TELL MARY TO GET ALL BUT THE KNIFE. Depending on the game you may be able to TALK TO a character, to ASK or TELL a character ABOUT a topic, or just SAY something and they will respond..',
      );
      this.io.metamsg(
        '{b:Meta-commands:} Type ABOUT to find out about the author, SCRIPT to learn about transcripts or SAVE to learn about saving games. Use WARNINGS to see any applicable sex, violence or trigger warnings.',
      );
      let s = 'You can also use BRIEF/TERSE/VERBOSE to control room descriptions. Type DARK to toggle dark mode or SILENT to toggle sounds and music (if implemented).';
      if (typeof this.map !== 'undefined') s += ' Use MAP to toggle/show the map.';
      if (typeof this.imagePane !== 'undefined') s += ' Use IMAGES to toggle/show the iage pane.';
      this.io.metamsg(s);
      this.io.metamsg(
        "{b:Shortcuts:}You can often just type the first few characters of an item's name and Quest will guess what you mean.  If fact, if you are in a room with Brian, who is holding a ball, and a box, Quest should be able to work out that B,PUT B IN B mean you want Brian to put the ball in the box.",
      );
      this.io.metamsg(
        'You can use the up and down arrows to scroll back though your previous typed commands - especially useful if you realise you spelled something wrong. If you do not have arrow keys, use OOPS to retrieve the last typed command so you can edit it. Use AGAIN or just G to repeat the last typed command.',
      );
    }
    if (this.settings.panes !== 'none') {
      this.io.metamsg(
        '{b:User Interface:} To interact with an object, click on its name in the side pane, and a set of possible actions will appear under it. Click on the appropriate action.',
      );
      if (this.settings.compassPane) {
        if (this.settings.symbolsForCompass) {
          this.io.metamsg(
            'You can also use the compass rose at the top to move around. Click the eye symbol, &#128065;, to look at you current location, the pause symbol, &#9208;, to wait or &#128712; for help.',
          );
        } else {
          this.io.metamsg(
            "You can also use the compass rose at the top to move around. Click 'Lk' to look at you current location, 'Z' to wait or '?' for help.",
          );
        }
      }
    }
    this.settings.forEach('additionalHelp', (key, val) => this.io.metamsg(val));

    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }

  hintScript() {
    this.io.metamsg('Sorry, no hints available.');
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }

  aboutScript() {
    this.io.metamsg(
      '{i:{param:settings:title} version {param:settings:version}} was written by {param:settings:author} using Quest 6 AKA Quest JS version {param:settings:questVersion}.',
      { settings: this.settings },
    );
    if (this.settings.ifdb) this.io.metamsg(`IFDB number: ${this.settings.ifdb}`);
    if (this.settings.thanks && this.settings.thanks.length > 0) {
      this.io.metamsg(
        `Thanks to ${this.utils.formatList(this.settings.thanks, {
          lastJoiner: list_and,
        })}.`,
      );
    }
    if (this.settings.additionalAbout !== undefined) {
      for (const s of this.settings.additionalAbout) this.io.metamsg(s);
    }
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }

  warningsScript() {
    switch (typeof this.settings.warnings) {
      case 'undefined':
        this.io.metamsg('No warning have been set for this game.');
        break;
      case 'string':
        this.io.metamsg(this.settings.warnings);
        break;
      default:
        this.settings.warnings.forEach(el => this.io.metamsg(el));
    }
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }

  saveLoadScript() {
    this.io.metamsg('To save your progress, type SAVE followed by the name to save with.');
    this.io.metamsg(
      'To load your game, refresh/reload this page in your browser, then type LOAD followed by the name you saved with.',
    );
    this.io.metamsg('To see a list of save games, type DIR.');
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }

  transcriptScript() {
    this.io.metamsg(
      'The TRANSCRIPT or SCRIPT command can be used to handle saving the input and output. This can be very useful when testing a game, as the author can go back through it and see exactly what happened, and how the player got there.',
    );
    this.io.metamsg(
      'Use SCRIPT ON to turn on recording and SCRIPT OFF to turn it off. Use SCRIPT SHOW to display it (it will appear in a new tab; you will not lose your place inthe game). To empty the file, use SCRIPT CLEAR.',
    );
    this.io.metamsg(
      'You can add options to the SCRIPT SHOW to hide various types of text. Use M to hide meta-information (like this), I to hide your input, P to hide parser errors (when the parser says it has no clue what you mean), E to hide programming errors and D to hide debugging messages. These can be combined, so SCRIPT SHOW ED will hide programming errors and debugging messages, and SCRIPT SHOW EDPID will show only the output game text.',
    );
    this.io.metamsg(
      'You can add a comment to the transcript by starting your text with an asterisk (*).',
    );
    this.io.metamsg(
      'You can do TRANSCRIPT WALKTHROUGH or just SCRIPT W to copy the transcript to the clipboard formatted for a walk-through. You can then paste it straight into the code.',
    );
    this.io.metamsg(
      'Everything gets saved to memory, and will be lost if you go to another web page or close your browser. The transcript is not saved when you save your game (but will not be lost when you load a game). If you complete the game the text input will disappear, however if you have a transcript a link will be available to access it.',
    );
    this.io.metamsg(`Transcript is currently: ${this.io.transcript ? 'on' : 'off'}`);
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }

  topicsScript() {
    this.io.metamsg(
      'Use TOPICS FOR [name] to see a list of topic suggestions to ask a character about (if implemented in this game).',
    );
    return WorldStates.SUCCESS_NO_TURNSCRIPTS;
  }

  betaTestIntro() {
    this.io.metamsg(
      `This version is for beta-testing (${this.settings.version}). A transcript will be automatically recorded. When you finish, do Ctrl-Enter or type SCRIPT SHOW to open the transcript in a new tab; it can then be copy-and-pasted into an e-mail.`,
    );
    if (this.settings.textInput) {
      this.io.metamsg(
        'You can add your own comments to the transcript by starting a command with *.',
      );
    }
    this.io.scriptStart();
  }

  //----------------------------------------------------------------------------------------------
  //                                   LANGUAGE FUNCTIONS

  // @DOC
  // ## Language Functions
  // @UNDOC

  // @DOC
  // Returns "the " if appropriate for this item.
  // If the item has 'defArticle' it returns that; if it has a proper name, returns an empty string.
  addDefiniteArticle(item) {
    if (item.defArticle) {
      return `${item.defArticle} `;
    }
    return item.properName ? '' : 'the ';
  }

  // @DOC
  // Returns "a " or "an " if appropriate for this item.
  // If the item has 'indefArticle' it returns that; if it has a proper name, returns an empty string.
  // If it starts with a vowel, it returns "an ", otherwise "a ".
  addIndefiniteArticle(item) {
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

  getName(item, options: any = {}) {
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
        s += `${this.toWords(count)} `;
      } else if (options.article === Known.DEFINITE) {
        s += this.addDefiniteArticle(item);
      } else if (options.article === Known.INDEFINITE) {
        s += this.addIndefiniteArticle(item);
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
    s += getNameModifiers(item, options);

    return options && options.capital ? sentenceCase(s) : s;
  }

  // @DOC
  // Returns the given number in words, so 19 would be returned as 'nineteen'.
  // Numbers uner -2000 and over 2000 are returned as a string of digits,
  // so 2001 is returned as '2001'.
  toWords(n) {
    if (typeof n !== 'number') {
      this.io.errormsg('toWords can only handle numbers');
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
        s += numberTens[tens - 2];
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
  toOrdinal(number) {
    if (typeof number !== 'number') {
      this.io.errormsg('toOrdinal can only handle numbers');
      return number;
    }

    const s = this.toWords(number);
    for (const or of ordinalReplacements) {
      if (or.regex.test(s)) {
        return s.replace(or.regex, or.replace);
      }
    }
    return `${s}th`;
  }

  convertNumbers(str) {
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
  conjugate(item, verb) {
    let gender = item.pronouns.subjective;
    if (gender === 'he' || gender === 'she') {
      gender = 'it';
    }
    const arr = conjugations[gender.toLowerCase()];

    if (!arr) {
      this.io.errormsg(`No conjugations found: conjugations_${gender.toLowerCase()}`);
      return verb;
    }
    arr.forEach(conj => {
      if (conj.name === verb) {
        return conj.value;
      }
    });

    arr.forEach(conj => {
      const { name } = conj;
      const { value } = conj;
      if (name.startsWith('@') && verb.endsWith(name.substring(1))) {
        return this.conjugate(item, verb.substring(0, verb.length - name.length + 1)) + value;
      }
      if (name.startsWith('*') && verb.endsWith(name.substring(1))) {
        return verb.substring(0, verb.length - name.length + 1) + value;
      }
    });
    return verb;
  }

  // @DOC
  // Returns the pronoun for the item, followed by the conjugated verb,
  // so "go" with a ball would return "it goes", but "go" with the player (if using second person pronouns)
  // would return "you go".
  // The first letter is capitalised if 'capitalise' is true.
  pronounVerb(item, verb, capitalise) {
    let s = `${item.pronouns.subjective} ${this.conjugate(item, verb)}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? sentenceCase(s) : s;
  }

  pronounVerbForGroup(item, verb, capitalise) {
    let s = `${item.groupPronouns().subjective} ${this.conjugate(item.group(), verb)}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? sentenceCase(s) : s;
  }

  verbPronoun(item, verb, capitalise) {
    let s = `${this.conjugate(item, verb)} ${item.pronouns.subjective}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? sentenceCase(s) : s;
  }

  // @DOC
  // Returns the name for the item, followed by the conjugated verb,
  // so "go" with a ball would return "the ball goes", but "go" with
  // a some bees would return "the bees go". For the player, (if using second person pronouns)
  // would return the pronoun "you go".
  // The first letter is capitalised if 'capitalise' is true.
  nounVerb(item, verb, capitalise) {
    if (item === this.game.player && !this.game.player.useProperName) {
      return this.pronounVerb(item, verb, capitalise);
    }
    let s = `${this.getName(item, {
      article: Known.DEFINITE,
    })} ${this.conjugate(item, verb)}`;
    s = s.replace(/ +'/, "'"); // yes this is a hack!
    return capitalise ? sentenceCase(s) : s;
  }

  verbNoun(item, verb, capitalise) {
    if (item === this.game.player) {
      return this.pronounVerb(item, verb, capitalise);
    }
    let s = `${this.conjugate(item, verb)} ${this.getName(item, {
      article: Known.DEFINITE,
    })}`;
    s = s.replace(/ +\'/, "'"); // yes this is a hack!
    return capitalise ? sentenceCase(s) : s;
  }

  locked_exit(char, exit) {
    // TODO: implement
  }

  not_inside(...params) {
    // TODO: implement
  }

  not_container(...params) {
    // TODO: implement
  }
}
