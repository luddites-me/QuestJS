

// A command has an arbitrary name, a regex or pattern, 
// and a script as a minimum.
// regex           A regex to match against
// objects         An array of matches in the regex (see wiki)
// script          This will be run on a successful match
// attName         If there is no script, then this attribute on the object will be used
// nothingForAll   If the player uses ALL and there is nothing there, use this error message
// noobjecterror   If the player specifies an object
// noTurnscripts   Set to true to prevent turnscripts firing even when this command is successful

const cmdDirections = []
for (let exit of QuestJs._lang.exit_list) {
  if (exit.type === 'nocmd') continue
  cmdDirections.push(exit.name)
  cmdDirections.push(exit.abbrev.toLowerCase())
  if (exit.alt) cmdDirections.push(exit.alt)
}



QuestJs._commands = [
  // ----------------------------------
  // Single word commands
  
  // Cannot just set the script to helpScript as we need to allow the
  // author to change it in code.js, which is loaded after this.
  new QuestJs._command.Cmd('MetaHelp', {
    script:QuestJs._lang.helpScript,
  }),    
  new QuestJs._command.Cmd('MetaHint', {
    script:QuestJs._lang.hintScript,
  }),
  new QuestJs._command.Cmd('MetaCredits', {
    script:QuestJs._lang.aboutScript,
  }),
  new QuestJs._command.Cmd('MetaDarkMode', {
    script:QuestJs._IO.toggleDarkMode,
  }),
  new QuestJs._command.Cmd('MetaSilent', {
    script:function() {
      if (QuestJs._settings.silent) {
        QuestJs._io.metamsg(QuestJs._lang.mode_silent_off)
        QuestJs._settings.silent = false
      }
      else {
        QuestJs._io.metamsg(QuestJs._lang.mode_silent_on)
        QuestJs._settings.silent = true
        QuestJs._io.ambient()
      }
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaWarnings', {
    script:QuestJs._lang.warningsScript,
  }),
  
  
  new QuestJs._command.Cmd('MetaSpoken', {
    script:function() {
      if (QuestJs._IO.spoken) {
        QuestJs._IO.spoken = false
        QuestJs._io.metamsg(QuestJs._lang.spoken_off)
      }
      else {
        QuestJs._IO.spoken = true
        QuestJs._io.metamsg(QuestJs._lang.spoken_on)
      }
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaIntro', {
    script:function() {
      QuestJs._IO.spoken = true;
      if (typeof QuestJs._settings.intro === "string") {
        QuestJs._io.msg(QuestJs._settings.intro)
      }
      else {
        for (let el of QuestJs._settings.intro) QuestJs._io.msg(el)
      }
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaBrief', {
    script:function() {
      game.verbosity = QuestJs._world.BRIEF
      QuestJs._io.metamsg(QuestJs._lang.mode_brief)
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaTerse', {
    script:function() {
      game.verbosity = QuestJs._world.TERSE
      QuestJs._io.metamsg(QuestJs._lang.mode_terse)
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaVerbose', {
    script:function() {
      game.verbosity = QuestJs._world.VERBOSE
      QuestJs._io.metamsg(llang.mode_verbose)
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  
  new QuestJs._command.Cmd('MetaTranscript', {
    script:QuestJs._lang.transcriptScript,
  }),
  new QuestJs._command.Cmd('MetaTranscriptOn', {
    script:function() {
      if (QuestJs._IO.transcript) {
        QuestJs._io.metamsg(QuestJs._lang.transcript_already_on)
        return QuestJs._world.FAILED
      }
      QuestJs._IO.scriptStart()
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaTranscriptOff', {
    script:function() {
      if (!QuestJs._IO.transcript) {
        QuestJs._io.metamsg(QuestJs._lang.transcript_already_off)
        return QuestJs._world.FAILED
      }
      QuestJs._IO.scriptEnd()
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaTranscriptClear', {
    script:function() {
      QuestJs._IO.scriptClear()
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaTranscriptShow', {
    script:function() {
      QuestJs._IO.scriptShow()
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaTranscriptShowWithOptions', {
    script:function(arr) {
      QuestJs._IO.scriptShow(arr[0])
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
    objects:[
      {text:true},
    ]
  }),
  new QuestJs._command.Cmd('MetaTranscriptToWalkthrough', {
    script:function() {
      QuestJs._IO.scriptShow('w')
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaPlayerComment', {
    script:function(arr) {
      QuestJs._io.metamsg("Comment: " + arr[0])
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
    objects:[
      {text:true},
    ]
  }),
  
  // ----------------------------------
  // File system commands
  new QuestJs._command.Cmd('MetaSave', {
    script:QuestJs._lang.saveLoadScript,
  }),
  new QuestJs._command.Cmd('MetaSaveGame', {
    script:function(arr) {
      QuestJs._saveLoad.saveGame(arr[0])
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
    objects:[
      {text:true},
    ]
  }),
  new QuestJs._command.Cmd('MetaLoad', {
    script:QuestJs._lang.saveLoadScript,
  }),
  new QuestJs._command.Cmd('MetaLoadGame', {
    script:function(arr) {
      QuestJs._saveLoad.loadGame(arr[0])
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
    objects:[
      {text:true},
    ]
  }),
  new QuestJs._command.Cmd('MetaDir', {
    script:function() {
      QuestJs._saveLoad.dirGame()
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaDeleteGame', {
    script:function(arr) {
      QuestJs._saveLoad.deleteGame(arr[0])
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
    objects:[
      {text:true},
    ]
  }),


  new QuestJs._command.Cmd('MetaUndo', {
    script:function() {
      if (QuestJs._settings.maxUndo === 0) {
        QuestJs._io.metamsg(QuestJs._lang.undo_disabled)
        return QuestJs._world.FAILED
      }
      if (game.gameState.length < 2) {
        QuestJs._io.metamsg(QuestJs._lang.undo_not_available)
        return QuestJs._world.FAILED
      }
      game.gameState.pop()
      const gameState = game.gameState[game.gameState.length - 1]
      QuestJs._io.metamsg(QuestJs._lang.undo_done)
      QuestJs._saveLoad.loadTheWorld(gameState)
      QuestJs._w[game.player.loc].description()
    },
  }),
  new QuestJs._command.Cmd('MetaAgain', {
    script:function() {
      return QuestJs._IO.againOrOops(true)
    },
  }),
  new QuestJs._command.Cmd('MetaOops', {
    script:function() {
      return QuestJs._IO.againOrOops(false)
    },
  }),
  new QuestJs._command.Cmd('MetaRestart', {
    script:function() {
      QuestJs._io.askQuestion(QuestJs._lang.restart_are_you_sure, function(result) {
        if (result.match(QuestJs._lang.yes_regex)) {
          location.reload()
        }
        else {
          QuestJs._io.metamsg(QuestJs._lang.restart_no)
        }
      });
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }),
  new QuestJs._command.Cmd('MetaPronouns', {
    script:function() {
      QuestJs._io.metamsg('See the developer console (F12) for the current pronouns')
      QuestJs._log.info(QuestJs._parser.pronouns)
    },
  }),
  new QuestJs._command.Cmd('MetaScore', {
    script:function() {
      QuestJs._io.metamsg(QuestJs._lang.scores_not_implemented)
    },
  }),


  
  
  
  new QuestJs._command.Cmd('Look', {
    script:function() {
      game.room.description();
      return QuestJs._settings.lookCountsAsTurn ? QuestJs._world.SUCCESS : QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
  new QuestJs._command.Cmd('Exits', {
    script:function() {
      QuestJs._io.msg(QuestJs._lang.can_go);
      return QuestJs._settings.lookCountsAsTurn ? QuestJs._world.SUCCESS : QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
  new QuestJs._command.Cmd('Wait', {
    script:function() {
      QuestJs._io.msg(QuestJs._lang.wait_msg);
      return QuestJs._world.SUCCESS;
    },
  }),
  new QuestJs._command.Cmd('TopicsNote', {
    script:QuestJs._lang.topicsScript,
  }),
  
  new QuestJs._command.Cmd('Inv', {
    script:function() {
      const listOfOjects = game.player.getContents(QuestJs._world.INVENTORY);
      QuestJs._io.msg(QuestJs._lang.inventory_prefix + " " + QuestJs._tools.formatList(listOfOjects, {article:QuestJs._consts.INDEFINITE, lastJoiner:QuestJs._lang.list_and, modified:true, nothing:QuestJs._lang.list_nothing, loc:game.player.name}) + ".");
      return QuestJs._settings.lookCountsAsTurn ? QuestJs._world.SUCCESS : QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
  new QuestJs._command.Cmd('Map', {
    script:function() {
      if (typeof showMap !== 'undefined') {
        showMap();
        return QuestJs._settings.lookCountsAsTurn ? QuestJs._world.SUCCESS : QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
      }
      else {
        const zone = QuestJs._w[game.player.loc]
        if (!zone.zone) {
          return QuestJs._io.failedmsg(QuestJs._lang.no_map);
        }
        else {
          const flag = zone.drawMap()
          if (!flag) return QuestJs._io.failedmsg(QuestJs._lang.no_map);
          return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
        }
      }
    },
  }),
  new QuestJs._command.Cmd('Smell', {
    script:function() {
      if (game.room.onSmell) {
        QuestJs._tools.printOrRun(game.player, game.room, "onSmell");
      }
      else {
        QuestJs._io.msg(QuestJs._lang.no_smell, {char:game.player});
      }
      return QuestJs._world.SUCCESS;
    },
  }),
  new QuestJs._command.Cmd('Listen', {
    script:function() {
      if (game.room.onListen) {
        QuestJs._tools.printOrRun(game.player, game.room, "onListen");
      }
      else {
        QuestJs._io.msg(QuestJs._lang.no_listen, {char:game.player});
      }
      return QuestJs._world.SUCCESS;
    },
  }),
  new QuestJs._command.Cmd('PurchaseFromList', {
    script:function() {
      const l = [];
      for (let key in QuestJs._w) {
        if (QuestJs._parser.isForSale(QuestJs._w[key])) {
          const price = QuestJs._w[key].getBuyingPrice(game.player)
          const row = [QuestJs._tools.sentenceCase(QuestJs._w[key].getName()), QuestJs._world.Money(price)]
          row.push(price > game.player.money ? "-" : "{cmd:buy " + QuestJs._w[key].alias + ":" + buy + "}")
          l.push(row)
        }
      }
      if (l.length === 0) {
        return QuestJs._io.failedmsg(QuestJs._lang.nothing_for_sale);
      }
      QuestJs._io.msg(current_money + ": " + QuestJs._world.Money(game.player.money));
      QuestJs._io.msgTable(l, buy_headings)
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
  



  
  // ----------------------------------
  // Verb-object commands
  new QuestJs._command.Cmd('Examine', {
    npcCmd:true,
    objects:[
      {scope:QuestJs._parser.isPresent, multiple:true}
    ],
    defmsg:QuestJs._lang.default_examine,
  }),
  new QuestJs._command.Cmd('LookAt', {  // used for NPCs
    npcCmd:true,
    attName:'examine',
    objects:[
      {scope:QuestJs._parser.isPresentOrMe}
    ],
    defmsg:QuestJs._lang.default_examine,
  }),
  new QuestJs._command.Cmd('LookOut', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent}
    ],
    attName:"lookout",
    defmsg:QuestJs._lang.cannot_look_out,
  }),
  new QuestJs._command.Cmd('LookBehind', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHere],
    attName:"lookbehind",
    objects:[
      {scope:QuestJs._parser.isPresent}
    ],
    defmsg:QuestJs._lang.nothing_there,
  }),
  new QuestJs._command.Cmd('LookUnder', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHere],
    attName:"lookunder",
    objects:[
      {scope:QuestJs._parser.isPresent}
    ],
    defmsg:QuestJs._lang.nothing_there,
  }),  
  new QuestJs._command.Cmd('LookInside', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHere],
    attName:"lookinside",
    objects:[
      {scope:QuestJs._parser.isPresent}
    ],
    defmsg:QuestJs._lang.nothing_inside,
  }),  
  new QuestJs._command.Cmd('Search', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHere],
    attName:"search",
    objects:[
      {scope:QuestJs._parser.isPresent}
    ],
    defmsg:QuestJs._lang.nothing_there,
  }),  

  new QuestJs._command.Cmd('Take', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHereNotHeldAlready, QuestJs.cmdRules.canManipulate],
    objects:[
      {scope:QuestJs._parser.isHereOrContained, multiple:true},
    ],
    defmsg:QuestJs._lang.cannot_take,
  }),
  new QuestJs._command.Cmd('Drop', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHeldNotWorn, QuestJs.cmdRules.canManipulate],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:function(char, item) {
      if (item.isAtLoc(char)) return QuestJs._lang.cannot_drop
      return QuestJs._lang.not_carrying
    }
  }),
  new QuestJs._command.Cmd('Wear2', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHeldNotWorn, QuestJs.cmdRules.isHeld, QuestJs.cmdRules.canManipulate],
    attName:"wear",
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:function(char, item) {
      return item.ensemble ? QuestJs._lang.cannot_wear_ensemble : QuestJs._lang.cannot_wear;
    },
  }),
  new QuestJs._command.Cmd('Wear', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHeldNotWorn, QuestJs.cmdRules.canManipulate],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:function(char, item) {
      return item.ensemble ? QuestJs._lang.cannot_wear_ensemble : QuestJs._lang.cannot_wear;
    },
  }),
  new QuestJs._command.Cmd('Remove', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isWorn, QuestJs.cmdRules.canManipulate],
    objects:[
      {scope:QuestJs._parser.isWorn, multiple:true},
    ],
    defmsg:function(char, item) {
      return item.ensemble ? QuestJs._lang.cannot_wear_ensemble : QuestJs._lang.not_wearing;
    },
  }),
  new QuestJs._command.Cmd('Remove2', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isWorn, QuestJs.cmdRules.canManipulate],
    attName:"remove",
    objects:[
      {scope:QuestJs._parser.isWorn, multiple:true},
    ],
    defmsg:function(char, item) {
      return item.ensemble ? QuestJs._lang.cannot_wear_ensemble : QuestJs._lang.not_wearing;
    },
  }),
  new QuestJs._command.Cmd('Read', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:QuestJs._lang.cannot_read,
  }),
  new QuestJs._command.Cmd('Eat', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHeldNotWorn, QuestJs.cmdRules.canManipulate],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true, attName:"ingest"},
    ],
    defmsg:QuestJs._lang.cannot_eat,
  }),
  new QuestJs._command.Cmd('Purchase', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate],
    objects:[
      {scope:QuestJs._parser.isForSale},
    ],
    defmsg:QuestJs._lang.cannot_purchase_here,
  }),
  new QuestJs._command.Cmd('Sell', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.isHeldNotWorn, QuestJs.cmdRules.canManipulate],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:QuestJs._lang.cannot_sell_here,
  }),
  new QuestJs._command.Cmd('Smash', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:QuestJs._lang.cannot_smash,
  }),
  new QuestJs._command.Cmd('SwitchOn', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    attName:"switchon",
    cmdCategory:"SwitchOn",
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:QuestJs._lang.cannot_switch_on,
  }),
  new QuestJs._command.Cmd('SwitchOn2', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    attName:"switchon",
    cmdCategory:"SwitchOn",
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
    ],
    defmsg:QuestJs._lang.cannot_switch_on,
  }),
  
  new QuestJs._command.Cmd('SwitchOff2', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    attName:"switchoff",
    cmdCategory:"SwitchOff",
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true, attName:"switchon"},
    ],
    defmsg:QuestJs._lang.cannot_switch_off,
  }),
  new QuestJs._command.Cmd('SwitchOff', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    attName:"switchoff",
    cmdCategory:"SwitchOff",
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true, attName:"switchoff"},
    ],
    defmsg:QuestJs._lang.cannot_switch_off,
  }),
  
  new QuestJs._command.Cmd('Open', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent, multiple:true, attName:"open"},
    ],
    defmsg:QuestJs._lang.cannot_open,
  }),
  
  new QuestJs._command.Cmd('Close', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent, multiple:true, attName:"close"},
    ],
    defmsg:QuestJs._lang.cannot_close,
  }),
  
  new QuestJs._command.Cmd('Lock', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent, multiple:true, attName:"lock"},
    ],
    defmsg:QuestJs._lang.cannot_lock,
  }),
  
  new QuestJs._command.Cmd('Unlock', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent, multiple:true, attName:"unlock"},
    ],
    defmsg:QuestJs._lang.cannot_unlock,
  }),
  
  new QuestJs._command.Cmd('Push', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent},
    ],
    defmsg:QuestJs._lang.nothing_useful,
  }),

  new QuestJs._command.Cmd('Pull', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent},
    ],
    defmsg:QuestJs._lang.nothing_useful,
  }),
  new QuestJs._command.Cmd('Fill', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {scope:QuestJs._parser.isPresent},
    ],
    defmsg:QuestJs._lang.cannot_fill,
  }),
  new QuestJs._command.Cmd('Empty', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {scope:QuestJs._parser.isPresent},
    ],
    defmsg:QuestJs._lang.cannot_empty,
  }),

  new QuestJs._command.Cmd('SmellItem', {
    npcCmd:true,
    attName:"smell",
    objects:[
      {scope:QuestJs._parser.isPresent, attName:"smell"},
    ],
    defmsg:QuestJs._lang.cannot_smell,
  }),
  new QuestJs._command.Cmd('ListenToItem', {
    npcCmd:true,
    attName:"listen",
    objects:[
      {scope:QuestJs._parser.isPresent, attName:"listen"},
    ],
    defmsg:QuestJs._lang.cannot_listen,
  }),
  new QuestJs._command.Cmd('Eat', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {text:true},
      {scope:QuestJs._parser.isPresent, attName:"ingest"},
    ],
    defmsg:QuestJs._lang.cannot_eat,
  }),
  new QuestJs._command.Cmd('Drink', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {text:true},
      {scope:QuestJs._parser.isPresent, attName:"ingest"},
    ],
    defmsg:QuestJs._lang.cannot_drink,
  }),
  new QuestJs._command.Cmd('Ingest', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {text:true},
      {scope:QuestJs._parser.isPresent, attName:"ingest"},
    ],
    defmsg:QuestJs._lang.cannot_ingest,
  }),

  new QuestJs._command.Cmd('SitOn', {
    npcCmd:true,
    cmdCategory:"Posture",
    rules:[QuestJs.cmdRules.canPosture, QuestJs.cmdRules.isHereNotHeld],
    attName:"siton",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"assumePosture"},
    ],
    defmsg:QuestJs._lang.cannot_sit_on,
  }),
  new QuestJs._command.Cmd('StandOn', {
    npcCmd:true,
    cmdCategory:"Posture",
    rules:[QuestJs.cmdRules.canPosture, QuestJs.cmdRules.isHereNotHeld],
    attName:"standon",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"assumePosture"},
    ],
    defmsg:QuestJs._lang.cannot_stand_on,
  }),
  new QuestJs._command.Cmd('ReclineOn', {
    npcCmd:true,
    cmdCategory:"Posture",
    rules:[QuestJs.cmdRules.canPosture, QuestJs.cmdRules.isHereNotHeld],
    attName:"reclineon",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"assumePosture"},
    ],
    defmsg:QuestJs._lang.cannot_recline_on,
  }),
  new QuestJs._command.Cmd('GetOff', {
    npcCmd:true,
    cmdCategory:"Posture",
    score:5, // to give priority over TAKE
    rules:[QuestJs.cmdRules.canPosture, QuestJs.cmdRules.isHereNotHeld],
    attName:"getoff",
    cmdCategory:"Posture",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"assumePosture"},
    ],
    defmsg:QuestJs._lang.already,
  }),

  new QuestJs._command.Cmd('Use', {
    npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent},
    ],
    script:function(objects, matches) {
      const obj = objects[0][0]
      
      if (obj.use) {
        const result = this.processCommand(game.player, obj, false, matches[0][0])
        return result ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
      }
      
      if (obj.useDefaultsTo) {
        const cmd = QuestJs._command.findCmd(obj.useDefaultsTo())
        if (cmd) {
          const result = cmd.processCommand(game.player, obj, false, matches[0][0], );
          return result ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
        }
        else {
          throw new Error("USE command defaulting to unknown command " + obj.useDefaultsTo)
        }
      }

      this.default(obj, false, game.player)
      return QuestJs._world.FAILED; 
    },
    defmsg:QuestJs._lang.cannot_use,
  }),
  
  new QuestJs._command.Cmd('TalkTo', {
    rules:[QuestJs.cmdRules.canTalkTo],
    attName:"talkto",
    objects:[
      {scope:QuestJs._parser.isNpcAndHere},
    ],
    default:function(item) {
      return QuestJs._io.failedmsg(QuestJs._lang.cannot_talk_to, {char:game.player, item:item});
    },
  }),

  new QuestJs._command.Cmd('Topics', {
    attName:"topics",
    objects:[
      {scope:QuestJs._parser.isNpcAndHere},
    ],
    default:function(item) {
      return QuestJs._io.failedmsg(QuestJs._lang.no_topics, {char:game.player, item:item});
    },
  }),

  
  // ----------------------------------
  // Complex commands
  
  
  
  new QuestJs._command.Cmd('Say', {
    script:function(arr) {
      const l = [];
      for (let key in QuestJs._w) {
        if (QuestJs._w[key].sayCanHear && QuestJs._w[key].sayCanHear(game.player, arr[0])) l.push(QuestJs._w[key]);
      }
      l.sort(function(a, b) { return (b.sayPriority + b.sayBonus) - (a.sayPriority + b.sayBonus); });
      if (l.length === 0) {
        QuestJs._io.msg(QuestJs._lang.say_no_one_here(game.player, arr[0], arr[1]));
        return QuestJs._world.SUCCESS;
      }

      if (QuestJs._settings.givePlayerSayMsg) QuestJs._io.msg(QuestJs._lang.nounVerb(game.player, arr[0], true) + ", '" + QuestJs._tools.sentenceCase(arr[1]) + ".'");
      for (let chr of l) {
        if (chr.sayQuestion && QuestJs._w[chr.sayQuestion].sayResponse(chr, arr[1])) return QuestJs._world.SUCCESS;
        if (chr.sayResponse && chr.sayResponse(arr[1], arr[0])) return QuestJs._world.SUCCESS;
      }
      if (QuestJs._settings.givePlayerSayMsg) {
        QuestJs._io.msg(QuestJs._lang.say_no_response(game.player, arr[0], arr[1]));
      }
      else {      
        QuestJs._io.msg(QuestJs._lang.say_no_response_full(game.player, arr[0], arr[1]));
      }
      return QuestJs._world.SUCCESS;
    },
    objects:[
      {text:true},
      {text:true},
    ]
  }),
  
  
  new QuestJs._command.Cmd('Stand', {
    rules:[QuestJs.cmdRules.canPosture],
    script:handleStandUp,
  }),
  new QuestJs._command.Cmd('NpcStand', {
    rules:[QuestJs.cmdRules.canPosture],
    cmdCategory:"Posture",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
    ],
    script:handleStandUp,
  }),
  
  
  
  
  new QuestJs._command.Cmd('FillWith', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {scope:QuestJs._parser.isHeld},
      {scope:QuestJs._parser.isLiquid},
    ],
    script:function(objects) {
      return handleFillWithLiquid(game.player, objects[0][0], objects[1][0]);
    },
  }),
  new QuestJs._command.Cmd('NpcFillWith', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    cmdCategory:"FillWith",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {scope:QuestJs._parser.isHeld},
      {scope:QuestJs._parser.isLiquid},
    ],
    script:function(objects) {
      const npc = objects[0][0]
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift()
      return handleFillWithLiquid(npc, objects[0][0], objects[1][0])
    },
  }),


  new QuestJs._command.Cmd('PutIn', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
      {scope:QuestJs._parser.isPresent, attName: "container"},
    ],
    script:function(objects) {
      return handlePutInContainer(game.player, objects);
    },
  }),
  
  new QuestJs._command.Cmd('NpcPutIn', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    cmdCategory:"PutIn",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {scope:QuestJs._parser.isHeldByNpc, multiple:true},
      {scope:QuestJs._parser.isPresent, attName: "container"},
    ],
    script:function(objects) {
      const npc = objects[0][0]
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift()
      return handlePutInContainer(npc, objects)
    },
  }),

  new QuestJs._command.Cmd('TakeOut', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isContained, multiple:true},
      {scope:QuestJs._parser.isPresent, attName: "container"},
    ],
    script:function(objects) {
      return handleTakeFromContainer(game.player, objects);
    },
  }),
  
  new QuestJs._command.Cmd('NpcTakeOut', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    cmdCategory:"TakeOut",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {scope:QuestJs._parser.isContained, multiple:true},
      {scope:QuestJs._parser.isPresent, attName: "container"},
    ],
    script:function(objects) {
      const npc = objects[0][0]
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift()
      return handleTakeFromContainer(npc, objects)
    },
  }),

  new QuestJs._command.Cmd('GiveTo', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    objects:[
      {scope:QuestJs._parser.isHeld, multiple:true},
      {scope:QuestJs._parser.isPresent, attName: "npc"},
    ],
    script:function(objects) {
      return handleGiveToNpc(game.player, objects)
    },
  }),
  new QuestJs._command.Cmd('NpcGiveTo', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    cmdCategory:"Give",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {scope:QuestJs._parser.isHeldByNpc, multiple:true},
      {scope:QuestJs._parser.isPresentOrMe, attName: "npc"},
    ],
    script:function(objects) {
      const npc = objects[0][0];
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift()
      return handleGiveToNpc(npc, objects)
    },
  }),



  new QuestJs._command.Cmd('PushExit', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHereNotHeld],
    cmdCategory:"Push",
    script:function(objects) {
      return handlePushExit(game.player, objects);
    },
    objects:[
      {text:true},
      {scope:QuestJs._parser.isHere, attName:"shiftable"},
      {text:true},
    ]
  }),
  new QuestJs._command.Cmd('NpcPushExit', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHereNotHeld],
    cmdCategory:"Push",
    script:function(objects) {
      const npc = objects[0][0];
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift();
      return handlePushExit(npc, objects);
    },
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {text:true},
      {scope:QuestJs._parser.isHere, attName:"shiftable"},
      {text:true},
    ]
  }),





  new QuestJs._command.Cmd('TieTo', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    cmdCategory:"Tie",
    objects:[
      {scope:QuestJs._parser.isHeld, attName:"rope"},
      {scope:QuestJs._parser.isHere, attName:"attachable"},
    ],
    script:function(objects) { return handleTieTo(game.player, objects[0][0], objects[1][0]) },
  }),
  new QuestJs._command.Cmd('NpcTieTo', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHeld],
    cmdCategory:"Tie",
    script:function(objects) {
      const npc = objects[0][0];
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift();
      return handleTieTo(npc, objects[0][0], objects[1][0])
    },
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {text:true},
      {scope:QuestJs._parser.isHere, attName:"shiftable"},
      {text:true},
    ]
  }),

  new QuestJs._command.Cmd('Untie', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    cmdCategory:"Untie",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"rope"},
    ],
    script:function(objects) { handleUntieFrom(game.player, objects[0][0]) },
  }),
  new QuestJs._command.Cmd('NpcUntie', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    cmdCategory:"Tie",
    script:function(objects) {
      const npc = objects[0][0];
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift();
      return handleUntieFrom(npc, objects[0][0], objects[1][0])
    },
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {text:true},
      {scope:QuestJs._parser.isHere, attName:"shiftable"},
      {text:true},
    ]
  }),

  new QuestJs._command.Cmd('UntieFrom', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    cmdCategory:"Untie",
    objects:[
      {scope:QuestJs._parser.isHere, attName:"rope"},
      {scope:QuestJs._parser.isHere, attName:"attachable"},
    ],
    script:function(objects) { handleUntieFrom(game.player, objects[0][0], objects[1][0]) },
  }),
  new QuestJs._command.Cmd('NpcUntieFrom', {
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    cmdCategory:"Tie",
    script:function(objects) {
      const npc = objects[0][0];
      if (!npc.npc) return QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc})
      objects.shift()
      return handleUntieFrom(npc, objects[0][0], objects[1][0])
    },
    objects:[
      {scope:QuestJs._parser.isHere, attName:"npc"},
      {text:true},
      {scope:QuestJs._parser.isHere, attName:"shiftable"},
      {text:true},
    ]
  }),


  new QuestJs._command.Cmd('UseWith', {
    //npcCmd:true,
    rules:[QuestJs.cmdRules.canManipulate, QuestJs.cmdRules.isHere],
    objects:[
      {scope:QuestJs._parser.isPresent},
      {scope:QuestJs._parser.isPresent},
    ],
    script:function(objects, matches) {
      const obj = objects[0][0]
      const obj2 = objects[1][0]
      
      if (obj.useWith) {
        const result = obj.useWith(game.player, obj2)
        return result ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
      }
      if (obj2.withUse) {
        const result = obj2.withUse(game.player, obj)
        return result ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
      }
      
      if (obj.useWithDefaultsTo) {
        const cmd = QuestJs._command.findCmd(obj.useWithDefaultsTo())
        if (cmd) {
          const result = cmd.script(objects, matches)
          return result ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
        }
        else {
          throw new Error("USE command defaulting to unknown command " + obj.useWithDefaultsTo)
        }
      }
      if (obj2.withUseDefaultsTo) {
        const cmd = QuestJs._command.findCmd(obj2.withUseDefaultsTo())
        if (cmd) {
          const result = cmd.script(objects, matches)
          return result ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
        }
        else {
          throw new Error("USE command defaulting to unknown command " + obj2.withUseDefaultsTo)
        }
      }

      this.default(obj, false, game.player)
      return QuestJs._world.FAILED; 
    },
    defmsg:QuestJs._lang.cannot_use,
  }),
  





  
  

  new QuestJs._command.Cmd('AskAbout', {
    rules:[QuestJs.cmdRules.canTalkTo],
    script:function(arr) {
      if (!game.player.canTalk()) return false
      if (!arr[0][0].askabout) return QuestJs._io.failedmsg(QuestJs._lang.cannot_ask_about, {char:game.player, item:arr[0][0], text:arr[2]})

      return arr[0][0].askabout(arr[2], arr[1]) ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
    },
    objects:[
      {scope:QuestJs._parser.isNpcAndHere},
      {text:true},
      {text:true},
    ]
  }),
  new QuestJs._command.Cmd('TellAbout', {
    rules:[QuestJs.cmdRules.canTalkTo],
    script:function(arr) {
      if (!game.player.canTalk()) return false
      if (!arr[0][0].tellabout) return QuestJs._io.failedmsg(cannot_tell_about, {char:game.player, item:arr[0][0], text:arr[1]})

      return arr[0][0].tellabout(arr[2], arr[1]) ? QuestJs._world.SUCCESS : QuestJs._world.FAILED
    },
    objects:[
      {scope:QuestJs._parser.isNpcAndHere},
      {text:true},
      {text:true},
    ]
  }),
  
]




// DEBUG commands

if (QuestJs._settings.playMode === 'dev') {
  QuestJs._commands.push(new QuestJs._command.Cmd('DebugWalkThrough', {
    objects:[
      {text:true},
    ],
    script:function(objects) {
      if (typeof walkthroughs === "undefined") return QuestJs._io.errormsg("No walkthroughs set")
      const wt = walkthroughs[objects[0]]
      if (wt === undefined) return QuestJs._io.errormsg("No walkthrough found called " + objects[0])
      for (let el of wt) {
        if (typeof el === "string") {
          QuestJs._IO.msgInputText(el)
          QuestJs._parser.parse(el)
        }
        else {
          QuestJs._settings.walkthroughMenuResponses = Array.isArray(el.menu) ? el.menu : [el.menu]
          QuestJs._log.info(el.cmd)
          QuestJs._log.info(QuestJs._settings.walkthroughMenuResponses)
          QuestJs._IO.msgInputText(el.cmd)
          QuestJs._parser.parse(el.cmd)
          QuestJs._settings.walkthroughMenuResponses = []
        }
      }
    },
  })) 

  QuestJs._commands.push(new QuestJs._command.Cmd('DebugInspect', {
    script:function(arr) {
      const item = arr[0][0];
      QuestJs._io.debugmsg("See the console for details on the object " + item.name + " (press F12 to QuestJs._world. the console)");
      QuestJs._log.info(item);
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS; 
    },
    objects:[
      {scope:QuestJs._parser.isInWorld},
    ],
  }))

  QuestJs._commands.push(new QuestJs._command.Cmd('DebugInspectByName', {
    script:function(arr) {
      const item_name = arr[0]
      if (!QuestJs._w[item_name]) {
        QuestJs._io.debugmsg("No object called " + item_name);
        return QuestJs._world.FAILED;
      }
       
      QuestJs._io.debugmsg("See the console for details on the object " + item_name + " (press F12 to QuestJs._world. the console)");
      QuestJs._log.info(QuestJs._w[item_name]);
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS; 
    },
    objects:[
      {text:true},
    ],
  }))

  QuestJs._commands.push(new QuestJs._command.Cmd('DebugTest', {
    script:function() {
      if (!QuestJs._settings.tests) {
        QuestJs._io.metamsg('The TEST command is for unit testing during game development, and is not activated (F12 for more).')
        QuestJs._log.info('To activate testing in your game, set QuestJs._settings.tests to true. More details here: https://github.com/ThePix/QuestJS/wiki/Unit-testing')
        return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
      }
      if (typeof QuestJs._test.runTests !== 'function') {
        QuestJs._log.info(test)
        return QuestJs._world.FAILED
      }
      QuestJs._test.runTests();
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }))

  QuestJs._commands.push(new QuestJs._command.Cmd('DebugInspectCommand', {
    script:function(arr) {
      debugmsg ("Looking for " + arr[0]);
      for (let cmd of QuestJs._commands) {
        if (cmd.name.toLowerCase() === arr[0] || (cmd.cmdCategory && cmd.cmdCategory.toLowerCase() === arr[0])) {
          QuestJs._io.debugmsg("Name: " + cmd.name);
          for (let key in cmd) {
            if (cmd.hasOwnProperty(key)) {
               QuestJs._io.debugmsg("--" + key + ": " + cmd[key]);
            }
          }
        }
      }        
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS; 
    },
    objects:[
      {text:true},
    ],
  }))

  QuestJs._commands.push(new QuestJs._command.Cmd('DebugListCommands', {
    script:function(arr) {
      let count = 0;
      for (let cmd of QuestJs._commands) {
        if (!cmd.name.match(/\d$/)) {
          let s = cmd.name + " (" + cmd.regex
          
          let altCmd
          let n = 2
          do {
            altCmd = QuestJs._commands.find(el => el.name === cmd.name + n)
            if (altCmd) s += " or " + altCmd.regex
            n++
          } while (altCmd)
          s += ")"
        
          const npcCmd = QuestJs._commands.find(el => el.name === "Npc" + cmd.name + "2")
          if (npcCmd) s += " - NPC too"
          QuestJs._io.debugmsg(s);
          count++;
        }
      }        
      QuestJs._io.debugmsg("... Found " + count + " QuestJs._commands.");
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS; 
    },
    objects:[
    ],
  }))

  QuestJs._commands.push(new QuestJs._command.Cmd('DebugListCommands2', {
    script:function(arr) {
      let count = 0;
      for (let cmd of QuestJs._commands) {
        let s = cmd.name + " (" + cmd.regex + ")"
        QuestJs._io.debugmsg(s);
        count++;
      }        
      QuestJs._io.debugmsg("... Found " + count + " commands.");
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS; 
    },
    objects:[
    ],
  }))

  QuestJs._commands.push(new QuestJs._command.Cmd('DebugParserToggle', {
    script:function(arr) {
      if (QuestJs._parser.debug) {
        QuestJs._parser.debug = false
        debugmsg ("Parser debugging messages are off.");
      }
      else {
        QuestJs._parser.debug = true
        debugmsg ("Parser debugging messages are on.");
      }
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS; 
    },
    objects:[
    ],
  }))
}







    
// Functions used by commands 
// (but not in the commands array)


// Cannot handle multiple vessels
function handleFillWithLiquid(char, vessel, liquid) {
  const tpParams = {char:char, container:vessel, liquid:liquid}
  if (!vessel.vessel) return QuestJs._io.failedmsg(QuestJs._lang.not_vessel, tpParams);
  if (vessel.closed) return  QuestJs._io.failedmsg(QuestJs._lang.container_closed, tpParams);
  if (!char.canManipulate(vessel, "fill")) return QuestJs._world.FAILED;
  if (!char.getAgreement("Fill", vessel)) return QuestJs._world.FAILED;
  if (!vessel.isAtLoc(char.name)) return QuestJs._io.failedmsg(QuestJs._lang.not_carrying, {char:char, item:obj});

  return vessel.fill(false, char, liquid) ? QuestJs._world.SUCCESS: QuestJs._world.FAILED;
}

function handlePutInContainer(char, objects) {
  let success = false;
  const container = objects[1][0];
  const multiple = objects[0].length > 1 || QuestJs._parser.currentCommand.all;
  const tpParams = {char:char, container:container}
  
  if (!container.container) return QuestJs._io.failedmsg(QuestJs._lang.not_container, {char, container})
  if (container.closed) return QuestJs._io.failedmsg(QuestJs._lang.container_closed, tpParams)
  if (!char.canManipulate(objects[0], "put")) return QuestJs._world.FAILED

  for (let obj of objects[0]) {
    let flag = true;
    if (!char.getAgreement("Put/in", obj)) {
      // The getAgreement should give the response
      continue;
    }
    if (!container.testForRecursion(char, obj)) {
      flag = false;
    }
    if (container.testRestrictions) {
      flag = container.testRestrictions(obj, char);
    }
    if (flag) {
      if (!obj.isAtLoc(char.name)) {
        QuestJs._io.failedmsg(QuestJs._tools.prefix(obj, multiple) + QuestJs._lang.not_carrying, {char:char, item:obj});
      }
      else {
        obj.moveToFrom(container.name, char.name);
        QuestJs._io.msg(QuestJs._tools.prefix(obj, multiple) + QuestJs._lang.done_msg);
        success = true;
      }
    }
  }
  if (success === QuestJs._world.SUCCESS) char.pause();
  return success ? QuestJs._world.SUCCESS : QuestJs._world.FAILED;
}

function handleTakeFromContainer(char, objects) {
  let success = false;
  const container = objects[1][0];
  const multiple = objects[0].length > 1 || QuestJs._parser.currentCommand.all;
  const tpParams = {char:char, container:container}
  if (!container.container) {
    QuestJs._io.failedmsg(QuestJs._lang.not_container(char, container));
    return QuestJs._world.FAILED; 
  }
  if (container.closed) {
    QuestJs._io.failedmsg(QuestJs._lang.container_closed, tpParams);
    return QuestJs._world.FAILED; 
  }
  if (!char.canManipulate(objects[0], "get")) {
    return QuestJs._world.FAILED;
  }
  for (let obj of objects[0]) {
    let flag = true;
    if (!char.getAgreement("Take", obj)) {
      // The getAgreement should give the response
      continue;
    }
    if (flag) {
      if (!obj.isAtLoc(container.name)) {
        QuestJs._io.failedmsg(QuestJs._tools.prefix(obj, multiple) + QuestJs._lang.not_inside(container, obj));
      }
      else {
        obj.moveToFrom(char.name, container.name);
        QuestJs._io.msg(QuestJs._tools.prefix(obj, multiple) + QuestJs._lang.done_msg);
        success = true;
      }
    }
  }
  if (success === QuestJs._world.SUCCESS) char.pause();
  return success ? QuestJs._world.SUCCESS : QuestJs._world.FAILED;
}



function handleGiveToNpc(char, objects) {
  let success = false;
  const npc = objects[1][0];
  const multiple = objects[0].length > 1 || QuestJs._parser.currentCommand.all;
  if (!npc.npc && npc !== game.player) {
    QuestJs._io.failedmsg(QuestJs._lang.not_npc_for_give, {char:char, item:npc});
    return QuestJs._world.FAILED; 
  }
  for (let obj of objects[0]) {
    let flag = true;
    if (!char.getAgreement("Give", obj)) {
      // The getAgreement should give the response
    }
    if (npc.testRestrictions) {
      flag = npc.testRestrictions(obj);
    }
    if (!npc.canManipulate(obj, "give")) {
      return QuestJs._world.FAILED;
    }
    if (flag) {
      if (!obj.isAtLoc(char.name)) {
        QuestJs._io.failedmsg(QuestJs._tools.prefix(obj, multiple) + QuestJs._lang.not_carrying, {char:char, item:obj});
      }
      else {
        if (npc.giveReaction) {
          npc.giveReaction(obj, multiple, char);
        }
        else {
          QuestJs._io.msg(QuestJs._tools.prefix(obj, multiple) + QuestJs._lang.done_msg);
          obj.moveToFrom(npc.name, char.name);
        }
        success = true;
      }
    }
  }
  if (success === QuestJs._world.SUCCESS) char.pause();
  return success ? QuestJs._world.SUCCESS : QuestJs._world.FAILED;
}


function handleStandUp(objects) {
  let char
  if (objects.length === 0) {
    char = game.player
  }
  else {
    const npc = objects[0][0]
    if (!npc.npc) {
      QuestJs._io.failedmsg(QuestJs._lang.not_npc, {char:game.player, item:npc});
      return QuestJs._world.FAILED; 
    }
    if (!npc.posture) {
      QuestJs._io.failedmsg(QuestJs._lang.already, {item:npc});
      return QuestJs._world.FAILED;
    }
    if (npc.getAgreementPosture && !npc.getAgreementPosture("stand")) {
      // The getAgreement should give the response
      return QuestJs._world.FAILED;
    }
    else if (!npc.getAgreementPosture && npc.getAgreement && !npc.getAgreement("Posture", "stand")) {
      return QuestJs._world.FAILED;
    }
    char = npc
  }  
  
  if (!char.canPosture()) {
    return QuestJs._world.FAILED;
  }
  if (char.posture) {
    QuestJs._io.msg(QuestJs._lang.stop_posture(char))
    char.pause();
    return QuestJs._world.SUCCESS;
  }  
}

// we know the char can manipulate, we know the obj is here and not held
function handlePushExit(char, objects) {
  const verb = QuestJs._tools.getDir(objects[0]);
  const obj = objects[1][0];
  const dir = QuestJs._tools.getDir(objects[2]);
  const room = QuestJs._w[char.loc]
  const tpParams = {char:char, item:obj, dir:dir}
  
  if (!obj.shiftable && obj.takeable) {
    QuestJs._io.msg(QuestJs._lang.take_not_push, tpParams);
    return QuestJs._world.FAILED;
  }
  if (!obj.shiftable) {
    QuestJs._io.msg(QuestJs._lang.cannot_push, tpParams);
    return QuestJs._world.FAILED;
  }
  if (!room[dir] || room[dir].isHidden()) {
    QuestJs._io.msg(QuestJs._lang.not_that_way, tpParams);
    return QuestJs._world.FAILED;
  }
  if (room[dir].isLocked()) {
    QuestJs._io.msg(QuestJs._lang.locked_exit(char, room[dir]));
    return QuestJs._world.FAILED;
  }
  if (typeof room[dir].noShiftingMsg === "function") {
    QuestJs._io.msg(room[dir].noShiftingMsg(char, item));
    return QuestJs._world.FAILED;
  }
  if (typeof room[dir].noShiftingMsg === "string") {
    QuestJs._io.msg(room[dir].noShiftingMsg);
    return QuestJs._world.FAILED;
  }
  
  if (typeof obj.shift === "function") {
    const res = obj.shift(char, dir, verb);
    return res ? QuestJs._world.SUCCESS : QuestJs._world.FAILED;
  }
  
  // by default, objects cannot be pushed up
  if (dir === "up") {
    QuestJs._io.msg(QuestJs._lang.cannot_push_up, tpParams);
    return QuestJs._world.FAILED;
  }
  
  // not using moveToFrom; if there are 
  const dest = room[dir].name;
  obj.moveToFrom(dest);
  char.loc = dest;
  tpParams.dest = QuestJs._w[dest]
  QuestJs._io.msg(QuestJs._lang.push_exit_successful, tpParams);
  return QuestJs._world.SUCCESS;
}



const handleTieTo = function(char, rope, obj2) {
  if (!rope.rope) return QuestJs._io.failedmsg("You cannot attach that to anything.", {rope:rope})
  if (!obj2.attachable) return QuestJs._io.failedmsg("That is not something you can {rope.attachVerb} {nm:rope:the} to.", {rope:rope})
  
  if (rope.tiedTo1 === obj2.name) return QuestJs._io.failedmsg("It already is.")
  if (rope.tiedTo2 === obj2.name) return QuestJs._io.failedmsg("It already is.")
  if (rope.tiedTo1 && rope.tiedTo2) return QuestJs._io.failedmsg("It is already {rope.attachedVerb} to {nm:obj1:the} and {nm:obj12:the}.", {rope:QuestJs._w[rope.tiedTo1], obj1:QuestJs._w[rope.tiedTo2], obj2:QuestJs._w[rope.tiedTo2]})

  QuestJs._io.msg("{nv:char:" + rope.attachVerb + ":true} {nm:rope:the} to {nm:obj2:the}.", {char:char, rope:rope, obj2:obj2})
  rope.attachTo(obj2)
  return QuestJs._world.SUCCESS
}

const handleUntieFrom = function(char, rope, obj2) {
  if (rope !== QuestJs._w.rope) return QuestJs._io.failedmsg("You cannot attach that to - or detach it from - anything.", {rope:rope})
  if (obj2 === undefined) {
    // obj2 not set; can we guess it?
    if (!rope.tiedTo1 && !rope.tiedTo2) return QuestJs._io.failedmsg("{nv:rope:be:true} not {rope.attachedVerb} to anything.", {rope:rope})
    if (rope.tiedTo1 && !rope.tiedTo2) {
      obj2 = QuestJs._w[rope.tiedTo1]
    }
    else if (!rope.tiedTo1 && rope.tiedTo2) {
      obj2 = QuestJs._w[rope.tiedTo2]
    } 
    else if (QuestJs._w[rope.tiedTo1].isHere() && !QuestJs._w[rope.tiedTo2].isHere()) {
      obj2 = QuestJs._w[rope.tiedTo1]
    } 
    else if (!QuestJs._w[rope.tiedTo1].isHere() && QuestJs._w[rope.tiedTo2].isHere()) {
      obj2 = QuestJs._w[rope.tiedTo2]
    } 
    else {
      return QuestJs._io.failedmsg("Which end of {nm:rope:the} do you want to {rope.detachVerb}?", {rope:rope})
    }
  }
  else {
    if (rope.tiedTo1 !== obj2.name && rope.tiedTo2 !== obj2.name) {
      return QuestJs._io.failedmsg("{nv:rope:be:true} not {rope.attachedVerb} to {nm:obj2:the}.", {rope:rope, obj2:obj2})
    }
  }
  if (obj2 === rope.tiedTo1 && rope.tethered) return QuestJs._io.failedmsg("{nv:char:can:true} not {rope.detachVerb} {nm:rope:the} from {nm:obj2:the}.", {char:char, rope:rope, obj2:obj2})
  

  QuestJs._io.msg("{nv:char:" + rope.detachVerb + ":true} {nm:rope:the} from {nm:obj2:the}.", {char:char, rope:rope, obj2:obj2})
  rope.detachFrom(obj2)
  return QuestJs._world.SUCCESS
}
