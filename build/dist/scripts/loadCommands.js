import {Helpers} from "../lib/command/helpers.js";
import {sentenceCase} from "../lib/index.js";
import {Known, WorldStates} from "../lib/constants.js";
export const loadCommands = (quest) => {
  const cmdDirections = [];
  for (const exit of quest.i18n.lexicon.exit_list) {
    if (exit.type === "nocmd")
      continue;
    cmdDirections.push(exit.name);
    cmdDirections.push(exit.abbrev.toLowerCase());
    if (exit.alt)
      cmdDirections.push(exit.alt);
  }
  const cmdFactory = quest.commandFactory;
  const helpers2 = new Helpers(quest);
  const commands = [
    cmdFactory.makeCmd("MetaHelp", {
      script: quest.i18n.processor.helpScript
    }),
    cmdFactory.makeCmd("MetaHint", {
      script: quest.i18n.processor.hintScript
    }),
    cmdFactory.makeCmd("MetaCredits", {
      script: quest.i18n.processor.aboutScript
    }),
    cmdFactory.makeCmd("MetaDarkMode", {
      script: quest.io.toggleDarkMode
    }),
    cmdFactory.makeCmd("MetaSilent", {
      script() {
        if (quest.settings.silent) {
          quest.io.metamsg(quest.i18n.lexicon.mode_silent_off);
          quest.settings.silent = false;
        } else {
          quest.io.metamsg(quest.i18n.lexicon.mode_silent_on);
          quest.settings.silent = true;
          quest.io.ambient();
        }
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaWarnings", {
      script: quest.i18n.processor.warningsScript
    }),
    cmdFactory.makeCmd("MetaSpoken", {
      script() {
        if (quest.io.spoken) {
          quest.io.spoken = false;
          quest.io.metamsg(quest.i18n.lexicon.spoken_off);
        } else {
          quest.io.spoken = true;
          quest.io.metamsg(quest.i18n.lexicon.spoken_on);
        }
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaIntro", {
      script() {
        quest.io.spoken = true;
        if (typeof quest.settings.intro === "string") {
          quest.io.msg(quest.settings.intro);
        } else {
          Object.keys(quest.settings.intro).forEach((key) => quest.io.msg(quest.settings.intro[key]));
        }
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaBrief", {
      script() {
        quest.game.verbosity = WorldStates.BRIEF;
        quest.io.metamsg(quest.i18n.lexicon.mode_brief);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaTerse", {
      script() {
        quest.game.verbosity = WorldStates.TERSE;
        quest.io.metamsg(quest.i18n.lexicon.mode_terse);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaVerbose", {
      script() {
        quest.game.verbosity = WorldStates.VERBOSE;
        quest.io.metamsg(quest.i18n.lexicon.mode_verbose);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaTranscript", {
      script: quest.i18n.processor.transcriptScript
    }),
    cmdFactory.makeCmd("MetaTranscriptOn", {
      script() {
        if (quest.io.transcript) {
          quest.io.metamsg(quest.i18n.lexicon.transcript_already_on);
          return WorldStates.FAILED;
        }
        quest.io.scriptStart();
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaTranscriptOff", {
      script() {
        if (!quest.io.transcript) {
          quest.io.metamsg(quest.i18n.lexicon.transcript_already_off);
          return WorldStates.FAILED;
        }
        quest.io.scriptEnd();
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaTranscriptClear", {
      script() {
        quest.io.scriptClear();
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaTranscriptShow", {
      script() {
        quest.io.scriptShow();
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaTranscriptShowWithOptions", {
      script(arr) {
        quest.io.scriptShow(arr[0]);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{text: true}]
    }),
    cmdFactory.makeCmd("MetaTranscriptToWalkthrough", {
      script() {
        quest.io.scriptShow("w");
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaPlayerComment", {
      script(arr) {
        quest.io.metamsg(`Comment: ${arr[0]}`);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{text: true}]
    }),
    cmdFactory.makeCmd("MetaSave", {
      script: quest.i18n.processor.saveLoadScript
    }),
    cmdFactory.makeCmd("MetaSaveGame", {
      script(arr) {
        quest.saveLoad.saveGame(arr[0]);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{text: true}]
    }),
    cmdFactory.makeCmd("MetaLoad", {
      script: quest.i18n.processor.saveLoadScript
    }),
    cmdFactory.makeCmd("MetaLoadGame", {
      script(arr) {
        quest.saveLoad.loadGame(arr[0]);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{text: true}]
    }),
    cmdFactory.makeCmd("MetaDir", {
      script() {
        quest.saveLoad.dirGame();
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaDeleteGame", {
      script(arr) {
        quest.saveLoad.deleteGame(arr[0]);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{text: true}]
    }),
    cmdFactory.makeCmd("MetaUndo", {
      script() {
        if (quest.settings.maxUndo === 0) {
          quest.io.metamsg(quest.i18n.lexicon.undo_disabled);
          return WorldStates.FAILED;
        }
        if (quest.game.gameState.length < 2) {
          quest.io.metamsg(quest.i18n.lexicon.undo_not_available);
          return WorldStates.FAILED;
        }
        quest.game.gameState.pop();
        const gameState = quest.game.gameState[quest.game.gameState.length - 1];
        quest.io.metamsg(quest.i18n.lexicon.undo_done);
        quest.saveLoad.loadTheWorld(gameState);
        quest.state.get(quest.game.player.loc.name).description();
      }
    }),
    cmdFactory.makeCmd("MetaAgain", {
      script() {
        return quest.io.againOrOops(true);
      }
    }),
    cmdFactory.makeCmd("MetaOops", {
      script() {
        return quest.io.againOrOops(false);
      }
    }),
    cmdFactory.makeCmd("MetaRestart", {
      script() {
        quest.io.askQuestion(quest.i18n.lexicon.restart_are_you_sure, (result) => {
          if (result.match(quest.i18n.lexicon.yes_regex)) {
            location.reload();
          } else {
            quest.io.metamsg(quest.i18n.lexicon.restart_no);
          }
        });
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaPronouns", {
      script() {
        quest.io.metamsg("See the developer console (F12) for the current pronouns");
        quest.logger.info(quest.parser.pronouns);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("MetaScore", {
      script() {
        quest.io.metamsg(quest.i18n.lexicon.scores_not_implemented);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("Look", {
      script() {
        quest.game.room.description();
        return quest.settings.lookCountsAsTurn ? WorldStates.SUCCESS : WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("Exits", {
      script() {
        quest.io.msg(quest.i18n.lexicon.can_go);
        return quest.settings.lookCountsAsTurn ? WorldStates.SUCCESS : WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("Wait", {
      script() {
        quest.io.msg(quest.i18n.lexicon.wait_msg);
        return WorldStates.SUCCESS;
      }
    }),
    cmdFactory.makeCmd("TopicsNote", {
      script: quest.i18n.processor.topicsScript
    }),
    cmdFactory.makeCmd("Inv", {
      script() {
        const listOfOjects = quest.game.player.getContents(WorldStates.INVENTORY);
        quest.io.msg(`${quest.i18n.lexicon.inventory_prefix} ${quest.utils.formatList(listOfOjects, {
          article: Known.INDEFINITE,
          lastJoiner: quest.i18n.lexicon.list_and,
          modified: true,
          nothing: quest.i18n.lexicon.list_nothing,
          loc: quest.game.player.name
        })}.`);
        return quest.settings.lookCountsAsTurn ? WorldStates.SUCCESS : WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("Map", {
      script() {
        if (quest.game.showMap != Known.NOOP) {
          quest.game.showMap();
          return quest.settings.lookCountsAsTurn ? WorldStates.SUCCESS : WorldStates.SUCCESS_NO_TURNSCRIPTS;
        }
        const zone = quest.state.get(quest.game.player.loc.name);
        if (!zone.zone) {
          return quest.io.failedmsg(quest.i18n.lexicon.no_map);
        }
        const flag = zone.drawMap();
        if (!flag)
          return quest.io.failedmsg(quest.i18n.lexicon.no_map);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("Smell", {
      script() {
        if (quest.game.room.onSmell) {
          quest.utils.printOrRun(quest.game.player, quest.game.room, "onSmell");
        } else {
          quest.io.msg(quest.i18n.lexicon.no_smell, {char: quest.game.player});
        }
        return WorldStates.SUCCESS;
      }
    }),
    cmdFactory.makeCmd("Listen", {
      script() {
        if (quest.game.room.onListen) {
          quest.utils.printOrRun(quest.game.player, quest.game.room, "onListen");
        } else {
          quest.io.msg(quest.i18n.lexicon.no_listen, {char: quest.game.player});
        }
        return WorldStates.SUCCESS;
      }
    }),
    cmdFactory.makeCmd("PurchaseFromList", {
      script() {
        const l = [];
        quest.state.forEach((key, val) => {
          if (quest.parser.isForSale(val)) {
            const price = val.getBuyingPrice(quest.game.player);
            const row = [
              sentenceCase(val.getName())
            ];
            row.push(price > quest.game.player.money ? "-" : `{cmd:buy ${val.alias}:${price}}`);
            l.push(row);
          }
        });
        if (l.length === 0) {
          return quest.io.failedmsg(quest.i18n.lexicon.nothing_for_sale);
        }
        quest.io.msg(`${quest.i18n.lexicon.current_money}: ${WorldStates.Money(quest.game.player.money)}`);
        quest.io.msgTable(l, quest.i18n.lexicon.buy_headings);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("Examine", {
      npcCmd: true,
      objects: [{scope: quest.parser.isPresent, multiple: true}],
      defmsg: quest.i18n.lexicon.default_examine
    }),
    cmdFactory.makeCmd("LookAt", {
      npcCmd: true,
      attName: "examine",
      objects: [{scope: quest.parser.isPresentOrMe}],
      defmsg: quest.i18n.lexicon.default_examine
    }),
    cmdFactory.makeCmd("LookOut", {
      npcCmd: true,
      rules: [quest.parser.isHere],
      objects: [{scope: quest.parser.isPresent}],
      attName: "lookout",
      defmsg: quest.i18n.lexicon.cannot_look_out
    }),
    cmdFactory.makeCmd("LookBehind", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHere],
      attName: "lookbehind",
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.nothing_there
    }),
    cmdFactory.makeCmd("LookUnder", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHere],
      attName: "lookunder",
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.nothing_there
    }),
    cmdFactory.makeCmd("LookInside", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHere],
      attName: "lookinside",
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.nothing_inside
    }),
    cmdFactory.makeCmd("Search", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHere],
      attName: "search",
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.nothing_there
    }),
    cmdFactory.makeCmd("Take", {
      npcCmd: true,
      rules: [
        cmdFactory.rules.isHereNotHeldAlready,
        cmdFactory.rules.canManipulate
      ],
      objects: [{scope: quest.parser.isHereOrContained, multiple: true}],
      defmsg: quest.i18n.lexicon.cannot_take
    }),
    cmdFactory.makeCmd("Drop", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHeldNotWorn, cmdFactory.rules.canManipulate],
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg(char, item) {
        if (item.isAtLoc(char))
          return quest.i18n.lexicon.cannot_drop;
        return quest.i18n.lexicon.not_carrying;
      }
    }),
    cmdFactory.makeCmd("Wear2", {
      npcCmd: true,
      rules: [
        cmdFactory.rules.isHeldNotWorn,
        cmdFactory.rules.isHeld,
        cmdFactory.rules.canManipulate
      ],
      attName: "wear",
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg(char, item) {
        return item.ensemble ? quest.i18n.lexicon.cannot_wear_ensemble : quest.i18n.lexicon.cannot_wear;
      }
    }),
    cmdFactory.makeCmd("Wear", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHeldNotWorn, cmdFactory.rules.canManipulate],
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg(char, item) {
        return item.ensemble ? quest.i18n.lexicon.cannot_wear_ensemble : quest.i18n.lexicon.cannot_wear;
      }
    }),
    cmdFactory.makeCmd("Remove", {
      npcCmd: true,
      rules: [cmdFactory.rules.isWorn, cmdFactory.rules.canManipulate],
      objects: [{scope: quest.parser.isWorn, multiple: true}],
      defmsg(char, item) {
        return item.ensemble ? quest.i18n.lexicon.cannot_wear_ensemble : quest.i18n.lexicon.not_wearing;
      }
    }),
    cmdFactory.makeCmd("Remove2", {
      npcCmd: true,
      rules: [cmdFactory.rules.isWorn, cmdFactory.rules.canManipulate],
      attName: "remove",
      objects: [{scope: quest.parser.isWorn, multiple: true}],
      defmsg(char, item) {
        return item.ensemble ? quest.i18n.lexicon.cannot_wear_ensemble : quest.i18n.lexicon.not_wearing;
      }
    }),
    cmdFactory.makeCmd("Read", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHere],
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg: quest.i18n.lexicon.cannot_read
    }),
    cmdFactory.makeCmd("Eat", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHeldNotWorn, cmdFactory.rules.canManipulate],
      objects: [
        {scope: quest.parser.isHeld, multiple: true, attName: "ingest"}
      ],
      defmsg: quest.i18n.lexicon.cannot_eat
    }),
    cmdFactory.makeCmd("Purchase", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate],
      objects: [{scope: quest.parser.isForSale}],
      defmsg: quest.i18n.lexicon.cannot_purchase_here
    }),
    cmdFactory.makeCmd("Sell", {
      npcCmd: true,
      rules: [cmdFactory.rules.isHeldNotWorn, cmdFactory.rules.canManipulate],
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg: quest.i18n.lexicon.cannot_sell_here
    }),
    cmdFactory.makeCmd("Smash", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg: quest.i18n.lexicon.cannot_smash
    }),
    cmdFactory.makeCmd("SwitchOn", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      attName: "switchon",
      category: "SwitchOn",
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg: quest.i18n.lexicon.cannot_switch_on
    }),
    cmdFactory.makeCmd("SwitchOn2", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      attName: "switchon",
      category: "SwitchOn",
      objects: [{scope: quest.parser.isHeld, multiple: true}],
      defmsg: quest.i18n.lexicon.cannot_switch_on
    }),
    cmdFactory.makeCmd("SwitchOff2", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      attName: "switchoff",
      category: "SwitchOff",
      objects: [
        {scope: quest.parser.isHeld, multiple: true, attName: "switchon"}
      ],
      defmsg: quest.i18n.lexicon.cannot_switch_off
    }),
    cmdFactory.makeCmd("SwitchOff", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      attName: "switchoff",
      category: "SwitchOff",
      objects: [
        {scope: quest.parser.isHeld, multiple: true, attName: "switchoff"}
      ],
      defmsg: quest.i18n.lexicon.cannot_switch_off
    }),
    cmdFactory.makeCmd("Open", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [
        {scope: quest.parser.isPresent, multiple: true, attName: "open"}
      ],
      defmsg: quest.i18n.lexicon.cannot_open
    }),
    cmdFactory.makeCmd("Close", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [
        {scope: quest.parser.isPresent, multiple: true, attName: "close"}
      ],
      defmsg: quest.i18n.lexicon.cannot_close
    }),
    cmdFactory.makeCmd("Lock", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [
        {scope: quest.parser.isPresent, multiple: true, attName: "lock"}
      ],
      defmsg: quest.i18n.lexicon.cannot_lock
    }),
    cmdFactory.makeCmd("Unlock", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [
        {scope: quest.parser.isPresent, multiple: true, attName: "unlock"}
      ],
      defmsg: quest.i18n.lexicon.cannot_unlock
    }),
    cmdFactory.makeCmd("Push", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.nothing_useful
    }),
    cmdFactory.makeCmd("Pull", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.nothing_useful
    }),
    cmdFactory.makeCmd("Fill", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.cannot_fill
    }),
    cmdFactory.makeCmd("Empty", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [{scope: quest.parser.isPresent}],
      defmsg: quest.i18n.lexicon.cannot_empty
    }),
    cmdFactory.makeCmd("SmellItem", {
      npcCmd: true,
      attName: "smell",
      objects: [{scope: quest.parser.isPresent, attName: "smell"}],
      defmsg: quest.i18n.lexicon.cannot_smell
    }),
    cmdFactory.makeCmd("ListenToItem", {
      npcCmd: true,
      attName: "listen",
      objects: [{scope: quest.parser.isPresent, attName: "listen"}],
      defmsg: quest.i18n.lexicon.cannot_listen
    }),
    cmdFactory.makeCmd("Eat", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [
        {text: true},
        {scope: quest.parser.isPresent, attName: "ingest"}
      ],
      defmsg: quest.i18n.lexicon.cannot_eat
    }),
    cmdFactory.makeCmd("Drink", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [
        {text: true},
        {scope: quest.parser.isPresent, attName: "ingest"}
      ],
      defmsg: quest.i18n.lexicon.cannot_drink
    }),
    cmdFactory.makeCmd("Ingest", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [
        {text: true},
        {scope: quest.parser.isPresent, attName: "ingest"}
      ],
      defmsg: quest.i18n.lexicon.cannot_ingest
    }),
    cmdFactory.makeCmd("SitOn", {
      npcCmd: true,
      category: "Posture",
      rules: [cmdFactory.rules.canPosture, cmdFactory.rules.isHereNotHeld],
      attName: "siton",
      objects: [{scope: quest.parser.isHere, attName: "assumePosture"}],
      defmsg: quest.i18n.lexicon.cannot_sit_on
    }),
    cmdFactory.makeCmd("StandOn", {
      npcCmd: true,
      category: "Posture",
      rules: [cmdFactory.rules.canPosture, cmdFactory.rules.isHereNotHeld],
      attName: "standon",
      objects: [{scope: quest.parser.isHere, attName: "assumePosture"}],
      defmsg: quest.i18n.lexicon.cannot_stand_on
    }),
    cmdFactory.makeCmd("ReclineOn", {
      npcCmd: true,
      category: "Posture",
      rules: [cmdFactory.rules.canPosture, cmdFactory.rules.isHereNotHeld],
      attName: "reclineon",
      objects: [{scope: quest.parser.isHere, attName: "assumePosture"}],
      defmsg: quest.i18n.lexicon.cannot_recline_on
    }),
    cmdFactory.makeCmd("GetOff", {
      npcCmd: true,
      category: "Posture",
      score: 5,
      rules: [cmdFactory.rules.canPosture, cmdFactory.rules.isHereNotHeld],
      attName: "getoff",
      objects: [{scope: quest.parser.isHere, attName: "assumePosture"}],
      defmsg: quest.i18n.lexicon.already
    }),
    cmdFactory.makeCmd("Use", {
      npcCmd: true,
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [{scope: quest.parser.isPresent}],
      script(objects, matches) {
        const obj = objects[0][0];
        if (obj.use) {
          const result = this.processCommand(quest.game.player, obj, false, matches[0][0]);
          return result ? WorldStates.SUCCESS : WorldStates.FAILED;
        }
        if (obj.useDefaultsTo) {
          const cmd2 = cmdFactory.findCmd(obj.useDefaultsTo());
          if (cmd2) {
            const result = cmd2.processCommand(quest.game.player, obj, false, matches[0][0]);
            return result ? WorldStates.SUCCESS : WorldStates.FAILED;
          }
          throw new Error(`USE command defaulting to unknown command ${obj.useDefaultsTo}`);
        }
        this.default(obj, false, quest.game.player);
        return WorldStates.FAILED;
      },
      defmsg: quest.i18n.lexicon.cannot_use
    }),
    cmdFactory.makeCmd("TalkTo", {
      rules: [cmdFactory.rules.canTalkTo],
      attName: "talkto",
      objects: [{scope: quest.parser.isNpcAndHere}],
      default(item) {
        quest.io.failedmsg(quest.i18n.lexicon.cannot_talk_to, {
          char: quest.game.player,
          item
        });
        return false;
      }
    }),
    cmdFactory.makeCmd("Topics", {
      attName: "topics",
      objects: [{scope: quest.parser.isNpcAndHere}],
      default(item) {
        quest.io.failedmsg(quest.i18n.lexicon.no_topics, {
          char: quest.game.player,
          item
        });
        return false;
      }
    }),
    cmdFactory.makeCmd("Say", {
      script(arr) {
        const l = [];
        quest.state.forEach((key, val) => {
          if (val.sayCanHear && val.sayCanHear(quest.game.player, arr[0])) {
            l.push(val);
          }
        });
        l.sort((a, b) => b.sayPriority + b.sayBonus - (a.sayPriority + b.sayBonus));
        if (l.length === 0) {
          quest.io.msg(quest.i18n.processor.say_no_one_here(quest.game.player, arr[0], arr[1]));
          return WorldStates.SUCCESS;
        }
        if (quest.settings.givePlayerSayMsg)
          quest.io.msg(`${quest.i18n.processor.nounVerb(quest.game.player, arr[0], true)}, '${sentenceCase(arr[1])}.'`);
        for (const chr of l) {
          if (chr.sayQuestion && quest.state.get(chr.sayQuestion).sayResponse(chr, arr[1]))
            return WorldStates.SUCCESS;
          if (chr.sayResponse && chr.sayResponse(arr[1], arr[0]))
            return WorldStates.SUCCESS;
        }
        if (quest.settings.givePlayerSayMsg) {
          quest.io.msg(quest.i18n.processor.say_no_response(quest.game.player, arr[0], arr[1]));
        } else {
          quest.io.msg(quest.i18n.processor.say_no_response_full(quest.game.player, arr[0], arr[1]));
        }
        return WorldStates.SUCCESS;
      },
      objects: [{text: true}, {text: true}]
    }),
    cmdFactory.makeCmd("Stand", {
      rules: [cmdFactory.rules.canPosture],
      script: helpers2.handleStandUp
    }),
    cmdFactory.makeCmd("NpcStand", {
      rules: [cmdFactory.rules.canPosture],
      category: "Posture",
      objects: [{scope: quest.parser.isHere, attName: "npc"}],
      script: helpers2.handleStandUp
    }),
    cmdFactory.makeCmd("FillWith", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [
        {scope: quest.parser.isHeld},
        {scope: quest.parser.isLiquid}
      ],
      script(objects) {
        return helpers2.handleFillWithLiquid(quest.game.player, objects[0][0], objects[1][0]);
      }
    }),
    cmdFactory.makeCmd("NpcFillWith", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      category: "FillWith",
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {scope: quest.parser.isHeld},
        {scope: quest.parser.isLiquid}
      ],
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handleFillWithLiquid(npc, objects[0][0], objects[1][0]);
      }
    }),
    cmdFactory.makeCmd("PutIn", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [
        {scope: quest.parser.isHeld, multiple: true},
        {scope: quest.parser.isPresent, attName: "container"}
      ],
      script(objects) {
        return helpers2.handlePutInContainer(quest.game.player, objects);
      }
    }),
    cmdFactory.makeCmd("NpcPutIn", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      category: "PutIn",
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {scope: quest.parser.isHeldByNpc, multiple: true},
        {scope: quest.parser.isPresent, attName: "container"}
      ],
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handlePutInContainer(npc, objects);
      }
    }),
    cmdFactory.makeCmd("TakeOut", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [
        {scope: quest.parser.isContained, multiple: true},
        {scope: quest.parser.isPresent, attName: "container"}
      ],
      script(objects) {
        return helpers2.handleTakeFromContainer(quest.game.player, objects);
      }
    }),
    cmdFactory.makeCmd("NpcTakeOut", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      category: "TakeOut",
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {scope: quest.parser.isContained, multiple: true},
        {scope: quest.parser.isPresent, attName: "container"}
      ],
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handleTakeFromContainer(npc, objects);
      }
    }),
    cmdFactory.makeCmd("GiveTo", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      objects: [
        {scope: quest.parser.isHeld, multiple: true},
        {scope: quest.parser.isPresent, attName: "npc"}
      ],
      script(objects) {
        return helpers2.handleGiveToNpc(quest.game.player, objects);
      }
    }),
    cmdFactory.makeCmd("NpcGiveTo", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      category: "Give",
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {scope: quest.parser.isHeldByNpc, multiple: true},
        {scope: quest.parser.isPresentOrMe, attName: "npc"}
      ],
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handleGiveToNpc(npc, objects);
      }
    }),
    cmdFactory.makeCmd("PushExit", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHereNotHeld],
      category: "Push",
      script(objects) {
        return helpers2.handlePushExit(quest.game.player, objects);
      },
      objects: [
        {text: true},
        {scope: quest.parser.isHere, attName: "shiftable"},
        {text: true}
      ]
    }),
    cmdFactory.makeCmd("NpcPushExit", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHereNotHeld],
      category: "Push",
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handlePushExit(npc, objects);
      },
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {text: true},
        {scope: quest.parser.isHere, attName: "shiftable"},
        {text: true}
      ]
    }),
    cmdFactory.makeCmd("TieTo", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      category: "Tie",
      objects: [
        {scope: quest.parser.isHeld, attName: "rope"},
        {scope: quest.parser.isHere, attName: "attachable"}
      ],
      script(objects) {
        return helpers2.handleTieTo(quest.game.player, objects[0][0], objects[1][0]);
      }
    }),
    cmdFactory.makeCmd("NpcTieTo", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHeld],
      category: "Tie",
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handleTieTo(npc, objects[0][0], objects[1][0]);
      },
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {text: true},
        {scope: quest.parser.isHere, attName: "shiftable"},
        {text: true}
      ]
    }),
    cmdFactory.makeCmd("Untie", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      category: "Untie",
      objects: [{scope: quest.parser.isHere, attName: "rope"}],
      script(objects) {
        helpers2.handleUntieFrom(quest.game.player, objects[0][0]);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("NpcUntie", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      category: "Tie",
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handleUntieFrom(npc, objects[0][0], objects[1][0]);
      },
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {text: true},
        {scope: quest.parser.isHere, attName: "shiftable"},
        {text: true}
      ]
    }),
    cmdFactory.makeCmd("UntieFrom", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      category: "Untie",
      objects: [
        {scope: quest.parser.isHere, attName: "rope"},
        {scope: quest.parser.isHere, attName: "attachable"}
      ],
      script(objects) {
        helpers2.handleUntieFrom(quest.game.player, objects[0][0], objects[1][0]);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }),
    cmdFactory.makeCmd("NpcUntieFrom", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      category: "Tie",
      script(objects) {
        const npc = objects[0][0];
        if (!npc.npc)
          return quest.io.failedmsg(quest.i18n.lexicon.not_npc, {
            char: quest.game.player,
            item: npc
          });
        objects.shift();
        return helpers2.handleUntieFrom(npc, objects[0][0], objects[1][0]);
      },
      objects: [
        {scope: quest.parser.isHere, attName: "npc"},
        {text: true},
        {scope: quest.parser.isHere, attName: "shiftable"},
        {text: true}
      ]
    }),
    cmdFactory.makeCmd("UseWith", {
      rules: [cmdFactory.rules.canManipulate, cmdFactory.rules.isHere],
      objects: [
        {scope: quest.parser.isPresent},
        {scope: quest.parser.isPresent}
      ],
      script(objects, matches) {
        const obj = objects[0][0];
        const obj2 = objects[1][0];
        if (obj.useWith) {
          const result = obj.useWith(quest.game.player, obj2);
          return result ? WorldStates.SUCCESS : WorldStates.FAILED;
        }
        if (obj2.withUse) {
          const result = obj2.withUse(quest.game.player, obj);
          return result ? WorldStates.SUCCESS : WorldStates.FAILED;
        }
        if (obj.useWithDefaultsTo) {
          const cmd2 = cmdFactory.findCmd(obj.useWithDefaultsTo());
          if (cmd2) {
            const result = cmd2.script(objects, matches);
            return result ? WorldStates.SUCCESS : WorldStates.FAILED;
          }
          throw new Error(`USE command defaulting to unknown command ${obj.useWithDefaultsTo}`);
        }
        if (obj2.withUseDefaultsTo) {
          const cmd2 = cmdFactory.findCmd(obj2.withUseDefaultsTo());
          if (cmd2) {
            const result = cmd2.script(objects, matches);
            return result ? WorldStates.SUCCESS : WorldStates.FAILED;
          }
          throw new Error(`USE command defaulting to unknown command ${obj2.withUseDefaultsTo}`);
        }
        this.default(obj, false, quest.game.player);
        return WorldStates.FAILED;
      },
      defmsg: quest.i18n.lexicon.cannot_use
    }),
    cmdFactory.makeCmd("AskAbout", {
      rules: [cmdFactory.rules.canTalkTo],
      script(arr) {
        if (!quest.game.player.canTalk())
          return WorldStates.FAILED;
        if (!arr[0][0].askabout) {
          quest.io.failedmsg(quest.i18n.lexicon.cannot_ask_about, {
            char: quest.game.player,
            item: arr[0][0],
            text: arr[2]
          });
          return WorldStates.FAILED;
        }
        return arr[0][0].askabout(arr[2], arr[1]) ? WorldStates.SUCCESS : WorldStates.FAILED;
      },
      objects: [
        {scope: quest.parser.isNpcAndHere},
        {text: true},
        {text: true}
      ]
    }),
    cmdFactory.makeCmd("TellAbout", {
      rules: [cmdFactory.rules.canTalkTo],
      script(arr) {
        if (!quest.game.player.canTalk())
          return WorldStates.FAILED;
        if (!arr[0][0].tellabout) {
          quest.io.failedmsg(quest.i18n.lexicon.cannot_tell_about, {
            char: quest.game.player,
            item: arr[0][0],
            text: arr[1]
          });
          return WorldStates.FAILED;
        }
        return arr[0][0].tellabout(arr[2], arr[1]) ? WorldStates.SUCCESS : WorldStates.FAILED;
      },
      objects: [
        {scope: quest.parser.isNpcAndHere},
        {text: true},
        {text: true}
      ]
    })
  ];
  if (quest.settings.playMode === "dev") {
    commands.push(cmdFactory.makeCmd("DebugWalkThrough", {
      objects: [{text: true}],
      script(objects) {
        if (typeof quest.walkthroughs === "undefined") {
          quest.io.errormsg("No walkthroughs set");
          return WorldStates.FAILED;
        }
        const wt = quest.walkthroughs[objects[0]];
        if (wt === void 0) {
          quest.io.errormsg(`No walkthrough found called ${objects[0]}`);
          return WorldStates.FAILED;
        }
        for (const el of wt) {
          if (typeof el === "string") {
            quest.io.msgInputText(el);
            quest.parser.parse(el);
          } else {
            quest.settings.walkthroughMenuResponses = Array.isArray(el.menu) ? el.menu : [el.menu];
            quest.logger.info(el.cmd);
            quest.logger.info(quest.settings.walkthroughMenuResponses);
            quest.io.msgInputText(el.cmd);
            quest.parser.parse(el.cmd);
            quest.settings.walkthroughMenuResponses = [];
          }
        }
      }
    }));
    commands.push(cmdFactory.makeCmd("DebugInspect", {
      script(arr) {
        const item = arr[0][0];
        quest.io.debugmsg(`See the console for details on the object ${item.name} (press F12 to WorldStates. the console)`);
        quest.logger.info(item);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{scope: quest.parser.isInWorld}]
    }));
    commands.push(cmdFactory.makeCmd("DebugInspectByName", {
      script(arr) {
        const item_name = arr[0];
        if (!quest.state.get(item_name)) {
          quest.io.debugmsg(`No object called ${item_name}`);
          return WorldStates.FAILED;
        }
        quest.io.debugmsg(`See the console for details on the object ${item_name} (press F12 to WorldStates. the console)`);
        quest.logger.info(quest.state.get(item_name));
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{text: true}]
    }));
    commands.push(cmdFactory.makeCmd("DebugTest", {
      script() {
        if (!quest.settings.tests) {
          quest.io.metamsg("The TEST command is for unit testing during game development, and is not activated (F12 for more).");
          quest.logger.info("To activate testing in your game, set quest.settings.tests to true. More details here: https://github.com/ThePix/QuestJS/wiki/Unit-testing");
          return WorldStates.SUCCESS_NO_TURNSCRIPTS;
        }
        if (typeof quest.test.runTests !== "function") {
          quest.logger.info(test);
          return WorldStates.FAILED;
        }
        quest.test.runTests();
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      }
    }));
    commands.push(cmdFactory.makeCmd("DebugInspectCommand", {
      script(arr) {
        quest.io.debugmsg(`Looking for ${arr[0]}`);
        for (const cmd2 of commands) {
          if (cmd2.name.toLowerCase() === arr[0] || cmd2.category && cmd2.category.toLowerCase() === arr[0]) {
            quest.io.debugmsg(`Name: ${cmd2.name}`);
            for (const key in cmd2) {
              if (cmd2.hasOwnProperty(key)) {
                quest.io.debugmsg(` -= 1${key}: ${cmd2[key]}`);
              }
            }
          }
        }
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: [{text: true}]
    }));
    commands.push(cmdFactory.makeCmd("DebugListCommands", {
      script(arr) {
        let count = 0;
        for (const cmd2 of commands) {
          if (!cmd2.name.match(/\d$/)) {
            let s = `${cmd2.name} (${cmd2.regex}`;
            let altCmd;
            let n = 2;
            do {
              altCmd = commands.find((el) => el.name === cmd2.name + n);
              if (altCmd)
                s += ` or ${altCmd.regex}`;
              n += 1;
            } while (altCmd);
            s += ")";
            const npcCmd = commands.find((el) => el.name === `Npc${cmd2.name}2`);
            if (npcCmd)
              s += " - NPC too";
            quest.io.debugmsg(s);
            count += 1;
          }
        }
        quest.io.debugmsg(`... Found ${count} commands.`);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: []
    }));
    commands.push(cmdFactory.makeCmd("DebugListCommands2", {
      script(arr) {
        let count = 0;
        for (const cmd2 of commands) {
          const s = `${cmd2.name} (${cmd2.regex})`;
          quest.io.debugmsg(s);
          count += 1;
        }
        quest.io.debugmsg(`... Found ${count} commands.`);
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: []
    }));
    commands.push(cmdFactory.makeCmd("DebugParserToggle", {
      script(arr) {
        if (quest.parser.debug) {
          quest.parser.debug = false;
          quest.io.debugmsg("Parser debugging messages are off.");
        } else {
          quest.parser.debug = true;
          quest.io.debugmsg("Parser debugging messages are on.");
        }
        return WorldStates.SUCCESS_NO_TURNSCRIPTS;
      },
      objects: []
    }));
  }
  initNpcCommands(quest, cmdFactory, commands);
  return commands;
};
const initNpcCommands = (quest, cmdFactory, commands) => {
  for (const el of commands) {
    if (el.regex) {
      el.regexes = [el.regex];
    }
    if (el.npcCmd) {
      if (!Array.isArray(el.regexes))
        quest.logger.info(el);
      const regexAsStr = el.regexes[0].source.substr(1);
      const objects = el.objects.slice();
      objects.unshift({scope: quest.parser.isHere, attName: "npc"});
      const regexes = [];
      Object.keys(quest.i18n.lexicon.tell_to_prefixes).forEach((key) => {
        regexes.push(new RegExp(`^${quest.i18n.lexicon.tell_to_prefixes[key]}${regexAsStr}`));
      });
      let script;
      if (el.useThisScriptForNpcs)
        script = el.script;
      const scope = [];
      for (const el2 of el.objects) {
        scope.push(el2 === quest.parser.isHeld ? quest.parser.isHeldByNpc : el2);
        scope.push(el2 === quest.parser.isWorn ? quest.parser.isWornByNpc : el2);
      }
      cmdFactory.makeNpcCmd(`Npc${el.name}`, {
        objects,
        attName: el.attName,
        default: el.default,
        defmsg: el.defmsg,
        rules: el.rules,
        score: el.score,
        category: el.category ? el.category : el.name,
        forNpc: true,
        regexes,
        script,
        scope
      });
    }
  }
  Object.keys(quest.i18n.lexicon.exit_list).forEach((key) => {
    const el = quest.i18n.lexicon.exit_list[key];
    if (el.type !== "nocmd") {
      let regex = `(${quest.i18n.lexicon.go_pre_regex})(${el.name}|${el.abbrev.toLowerCase()}`;
      if (el.alt) {
        regex += `|${el.alt}`;
      }
      regex += ")$";
      commands.push(cmdFactory.makeExitCmd(`Go${sentenceCase(el.name)}`, {
        regexes: [new RegExp(`^${regex}`)]
      }, el.name));
      const regexes = [];
      Object.keys(quest.i18n.lexicon.tell_to_prefixes).forEach((key2) => {
        regexes.push(new RegExp(`^${quest.i18n.lexicon.tell_to_prefixes[key2]}${regex}`));
      });
      commands.push(cmdFactory.makeNpcExitCmd(`NpcGo${sentenceCase(el.name)}2`, {
        regexes
      }, el.name));
    }
  });
};
