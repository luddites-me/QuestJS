'use strict';

/*
QuestJs._commands.push(new QuestJs._command.Cmd('Kick', {
  npcCmd:true,
  rules:[QuestJs.cmdRules.isHere],
  regex:/^(kick) (.+)$/,
  objects:[
    {ignore:true},
    {scope:QuestJs._parser.isPresent}
  ],
  default:function(item, isMultiple, char) {
    QuestJs._io.msg(QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.pronounVerb(char, "kick", true) + " " + item.pronouns.objective + ", but nothing happens.");
    return false;
  },
}));

QuestJs._commands.push(new QuestJs._command.Cmd('Move', {
  npcCmd:true,
  rules:[QuestJs.cmdRules.isHere],
  regex:/^(move) (.+)$/,
  objects:[
    {ignore:true},
    {scope:QuestJs._parser.isHere}
  ],
  default:function(item, isMultiple, char) {
    QuestJs._io.msg(QuestJs._tools.prefix(item, isMultiple) + QuestJs._lang.pronounVerb(item, "'be", true) + " not something you can move.");
    return false;
  },
}));
*/

// kyle, in stasis

QuestJs._commands.push(
  new QuestJs._command.Cmd('Get in pod1', {
    regex: /^(.+), (?:get in|go in|in) (?:stasis pod|stasis|pod)$/,
    npcCmd: true,
    attName: 'stasis',
    objects: [{ scope: QuestJs._parser.isHere, attName: 'npc' }],
    defmsg: "That's not about to get in a stasis!",
  }),
);
QuestJs._commands.push(
  new QuestJs._command.Cmd('Get in pod2', {
    regex: /^tell (.+) to (?:get in|go in|in) (?:stasis pod|stasis|pod)$/,
    npcCmd: true,
    attName: 'stasis',
    objects: [{ scope: QuestJs._parser.isHere, attName: 'npc' }],
    defmsg: "That's not about to get in a stasis!",
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('Stop1', {
    regex: /^(.+), (?:stop|halt|forget it)$/,
    npcCmd: true,
    attName: 'stopAgenda',
    objects: [{ scope: QuestJs._parser.isHere, attName: 'npc' }],
    defmsg: "That's not doing anything!",
  }),
);
QuestJs._commands.push(
  new QuestJs._command.Cmd('Stop2', {
    regex: /^tell (.+) to (?:stop|halt|forget it)$/,
    npcCmd: true,
    attName: 'stopAgenda',
    objects: [{ scope: QuestJs._parser.isHere, attName: 'npc' }],
    defmsg: "That's not doing anything",
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('Launch', {
    regex: /^(launch|deploy) (.+)$/,
    npcCmd: true,
    objects: [{ ignore: true }, { scope: QuestJs._parser.isInWorld }],
    defmsg: "You can't launch that!",
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('Revive', {
    regex: /^(revive|wake|awaken) (.+)$/,
    npcCmd: true,
    objects: [{ ignore: true }, { scope: QuestJs._parser.isInWorld }],
    defmsg: "You can't revive that!",
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('Pressurise', {
    regex: /^pressuri[sz]e (.+)$/,
    npcCmd: true,
    objects: [{ scope: 'isRoom' }],
    script: function (objects) {
      return handlePressurise(QuestJs._game.player, objects, true);
    },
  }),
);
QuestJs._commands.push(
  new QuestJs._command.Cmd('Depressurise', {
    regex: /^(depressuri[sz]e|evacuate) (.+)$/,
    npcCmd: true,
    objects: [{ ignore: true }, { scope: 'isRoom' }],
    script: function (objects) {
      return handlePressurise(QuestJs._game.player, objects, false);
    },
  }),
);

/*QuestJs._commands.push(new QuestJs._command.Cmd('NpcPressurise1', {
  regex:/^(.+), ?pressuri[sz]e (.+)$/,
  objects:[
    {scope:QuestJs._parser.isHere, attName:"npc"},
    {scope:'isRoom'},
  ],
  script:function(objects) {
    var npc = objects[0][0];
    npc.actedThisTurn = true;
    if (!npc.npc) {
      QuestJs._io.msg(CMD_not_npc(npc));
      return QuestJs._world.FAILED; 
    }
    objects.shift();
    return handlePressurise(npc, objects, true);
  },
}));
QuestJs._commands.push(new QuestJs._command.Cmd('NpcPressurise2', {
  regex:/^tell (.+) to pressuri[sz]e (.+)$/,
  objects:[
    {scope:QuestJs._parser.isHere, attName:"npc"},
    {scope:'isRoom'},
  ],
  script:function(objects) {
    var npc = objects[0][0];
    npc.actedThisTurn = true;
    if (!npc.npc) {
      QuestJs._io.msg(CMD_not_npc(npc));
      return QuestJs._world.FAILED; 
    }
    objects.shift();
    return handlePressurise(npc, objects, true);
  },
}));
QuestJs._commands.push(new QuestJs._command.Cmd('NpcDepressurise1', {
  regex:/^(.+), ?(depressuri[sz]e|evacuate) (.+)$/,
  objects:[
    {scope:QuestJs._parser.isHere, attName:"npc"},
    {ignore:true},
    {scope:'isRoom'},
  ],
  script:function(objects) {
    var npc = objects[0][0];
    npc.actedThisTurn = true;
    if (!npc.npc) {
      QuestJs._io.msg(CMD_not_npc(npc));
      return QuestJs._world.FAILED; 
    }
    objects.shift();
    return handlePressurise(npc, objects, false);
  },
}));
QuestJs._commands.push(new QuestJs._command.Cmd('NpcDepressurise2', {
  regex:/^tell (.+) to (depressuri[sz]e|evacuate) (.+)$/,
  objects:[
    {scope:QuestJs._parser.isHere, attName:"npc"},
    {ignore:true},
    {scope:'isRoom'},
  ],
  script:function(objects) {
    var npc = objects[0][0];
    npc.actedThisTurn = true;
    if (!npc.npc) {
      QuestJs._io.msg(CMD_not_npc(npc));
      return QuestJs._world.FAILED; 
    }
    objects.shift();
    return handlePressurise(npc, objects, false);
  },
}));*/

function handlePressurise(char, objects, pressurise) {
  const baseRoom = objects[0][0];
  if (!baseRoom.room) {
    QuestJs._io.msg("You can't " + (pressurise ? pressurise : depressurise) + ' that.');
    return QuestJs._world.FAILED;
  }
  if (char === QuestJs._game.player) {
    QuestJs._io.metamsg(
      'You need to ask Xsansi to pressurise or depressurise any part of the ship.',
    );
    return QuestJs._world.FAILED;
  }
  // I am counting these as successes as the player has successfully made the request, even if it was refused
  if (char.name !== 'Xsansi') {
    QuestJs._io.msg("'You need to ask Xsansi to pressurise or depressurise any part of the ship.'");
    return QuestJs._world.SUCCESS;
  }
  if (baseRoom.isSpace) {
    QuestJs._io.msg(
      "'Scientists estimates the volume of space to be infinite. The ship does not have sufficient air to pressure space.'",
    );
    return QuestJs._world.SUCCESS;
  }
  const mainRoom = typeof baseRoom.vacuum === 'string' ? QuestJs._w[baseRoom.vacuum] : baseRoom;
  if (mainRoom.vacuum !== pressurise) {
    QuestJs._io.msg(
      "'" +
        QuestJs._tools.sentenceCase(
          QuestJs._lang.getName(mainRoom, { article: QuestJs._consts.DEFINITE }),
        ) +
        ' is already ' +
        (pressurise ? 'pressurised' : 'depressurised') +
        '.',
    );
    return QuestJs._world.SUCCESS;
  }
  if (!QuestJs._w.Xsansi.pressureOverride && mainRoom.name !== 'airlock' && !pressurise) {
    QuestJs._io.msg(
      "'Safety interlocks prevent depressurising parts of the ship while the crew are active.'",
    );
    return QuestJs._world.SUCCESS;
  }
  if (!pressurise) {
    QuestJs._io.msg(
      "'Evacuating " +
        QuestJs._lang.getName(mainRoom, { article: QuestJs._consts.DEFINITE }) +
        "... Room is now under vacuum.'",
    );
    mainRoom.vacuum = true;
    return QuestJs._world.SUCCESS;
  }
  if (mainRoom.leaks) {
    QuestJs._io.msg(
      "'Pressurising " +
        QuestJs._lang.getName(mainRoom, { article: QuestJs._consts.DEFINITE }) +
        "... Pressurisation failed.'",
    );
    return QuestJs._world.SUCCESS;
  }

  QuestJs._io.msg(
    "'Pressurising " +
      QuestJs._lang.getName(mainRoom, { article: QuestJs._consts.DEFINITE }) +
      "... Room is now pressurised.'",
  );
  mainRoom.vacuum = false;
  return QuestJs._world.SUCCESS;
}

QuestJs._commands.push(
  new QuestJs._command.Cmd('Approach', {
    regex: /^approach (.+)$/,
    objects: [{ scope: 'isShip' }],
    script: function (objects) {
      if (!objects[0][0].isShip) {
        QuestJs._io.metamsg(
          'The APPROACH command is for piloting the ship to a specific destination; a satellite or vessel for example.',
        );
        return QuestJs._world.FAILED;
      }
      if (QuestJs._game.player.loc !== 'flightdeck') {
        QuestJs._io.msg('You need to be on the flight-deck to pilot the ship.');
        return QuestJs._world.FAILED;
      }
      if (QuestJs._w.alienShip.status === 0) {
        QuestJs._io.msg('There is no ship detected.');
        return QuestJs._world.FAILED;
      }
      if (QuestJs._w.alienShip.status > 1) {
        QuestJs._io.msg("The {i:Joseph Banks} is already adjacent to the unidentified vessel.'");
        return QuestJs._world.FAILED;
      }
      QuestJs._io.msg(
        'You sit at the controls, and unlock the console. You type the co-ordinates into the system, and feel a noticeable pull as the ship accelerates to the target. At the half way point, the ship swings around, so the rockets are firing towards the target, slowing the ship down, so it comes to a stop, relative to the other ship.',
      );
      QuestJs._w.alienShip.status = 2;
      return QuestJs._world.SUCCESS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('Scan', {
    regex: /^scan (.+)$/,
    objects: [{ scope: 'isShip' }],
    script: function (objects) {
      if (!objects[0][0].isShip) {
        QuestJs._io.metamsg(
          'The SCAN command is for scanning a target nearby in space, having approached it; a satellite or vessel for example.',
        );
        return QuestJs._world.FAILED;
      }
      if (QuestJs._game.player.loc !== 'flightdeck') {
        QuestJs._io.msg('You need to be on the flight-deck to scan the ship.');
        return QuestJs._world.FAILED;
      }
      if (QuestJs._w.alienShip.status === 0) {
        QuestJs._io.msg('There is no ship detected.');
        return QuestJs._world.FAILED;
      }
      if (QuestJs._w.alienShip.status === 1) {
        QuestJs._io.msg('The source of the radio signal is too far away to be properly scanned.');
        return QuestJs._world.FAILED;
      }
      QuestJs._io.msg('Sat at the controls, you initiate a scan of the unknown ship...');
      QuestJs._io.msg(
        'While you await the results, you look at the image on the screen. It is not big, less than half the length of the Joseph Banks, and a dull grey colour. It is all curves, without a straight edge anywhere, but it nevertheless looks lumpy rather than sleek. There is no obvious propulsion system, but you can see what might be an opening. There are no marking as far as you can see, and  no obvious weapons.',
      );
      QuestJs._io.msg(
        'The results of the scan appear on the screen. Unsurprisingly, the ship is not in the database. An XDR scan of the hull indicates it is made of an unknown intermetallic alloy of aluminium, nickel and arsenic.',
      );
      QuestJs._io.msg(
        'A look at the infrared camera shows the ship is radiating low level thermal energy, especially from the aft area (relative to the Joseph Banks). The radio signal is emanating from a point lower port forward section.',
      );
      QuestJs._io.msg(
        'There are no other electromagnetic emissions detected, and no significant magnetic, electrical or gravity fields detected.',
      );
      QuestJs._io.msg(
        'There are no other electromagnetic emissions detected, and no significant magnetic, electrical or gravity fields detected.',
      );
      QuestJs._w.alienShip.status = 2;
      return QuestJs._world.SUCCESS;
    },
  }),
);

function isShip(item) {
  return item.isShip;
}

QuestJs._commands.push(
  new QuestJs._command.Cmd('ProbeStatus', {
    regex: /^probes?$/,
    script: function () {
      const arr = getProbes();
      QuestJs._io.metamsg('Found ' + arr.length + ' probes');
      for (let probe of arr) {
        QuestJs._io.metamsg('------------------');
        QuestJs._io.metamsg('Probe:' + probe.alias);
        QuestJs._io.metamsg('Status:' + probe.status);
        QuestJs._io.metamsg('launchCounter:' + probe.launchCounter);
        QuestJs._io.metamsg('probeType:' + probe.probeType);
        QuestJs._io.metamsg('planetNumber:' + probe.planetNumber);
      }
      QuestJs._io.metamsg('------------------');
      QuestJs._io.metamsg('Geology:' + currentPlanet().geology);
      QuestJs._io.metamsg('Biology:' + currentPlanet().biology);
      QuestJs._io.metamsg('Radio:' + currentPlanet().coms);
      QuestJs._io.metamsg('Satellite:' + currentPlanet().satellite);
      QuestJs._io.metamsg('Active:' + currentPlanet().eventIsActive());
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('MapUpdate', {
    regex: /^map?$/,
    script: function () {
      updateMap();
      QuestJs._io.metamsg('Done');
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._command.findCmd('MetaHelp').script = function () {
  QuestJs._io.metamsg('Help is available on a number of topics...');
  QuestJs._io.metamsg('{color:red:HELP GENERAL} or {color:red:HELP GEN}: How to play parser games');
  QuestJs._io.metamsg('{b:Commands to help you play this game:}');
  QuestJs._io.metamsg('{color:red:HELP GAME}: Suggestions on what to actually do');
  QuestJs._io.metamsg('{color:red:HELP NPC}: Interacting with other characters');
  QuestJs._io.metamsg('{color:red:HELP PROBE}: How to deploy and use probes');
  QuestJs._io.metamsg(
    '{color:red:HELP STASIS}: How to use stasis pods (and hence travel to the next planet)',
  );
  if (QuestJs._w.Xsansi.currentPlanet !== 0)
    QuestJs._io.metamsg('{color:red:HELP VACUUM}: How to handle the cold vacuum of space');
  if (QuestJs._w.alienShip.status > 0)
    QuestJs._io.metamsg('{color:red:HELP DOCKING}: How to dock with another ship');
  QuestJs._io.metamsg('{b:Commands that give meta-information about the game:}');
  QuestJs._io.metamsg('{color:red:HELP UNIVERSE}: Notes about the universe the game is set in');
  QuestJs._io.metamsg('{color:red:HELP SYSTEM}: About the game system');
  QuestJs._io.metamsg('{color:red:HELP CREDITS}: Credits, obviously!');
  QuestJs._io.metamsg('You can use {color:red:?} as a shorthand for {color:red:HELP}');
  return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
};

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpGen', {
    regex: /^(?:\?|help) gen.*$/,
    script: function () {
      QuestJs._lang.helpScript();
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpGame', {
    regex: /^(?:\?|help) game$/,
    script: function () {
      QuestJs._io.metamsg(
        'At each planet, you need to assess how many bio-probes and how many geo-probes to launch. Do {color:red:HELP PROBES} for details on that. You can {color:red:ASK AI ABOUT SHIP} to find how many of each probe is left.',
      );
      QuestJs._io.metamsg(
        'You have five planets to visit, before returning to Earth. Return to the stasis pod to go back into stasis. Xsansi will then navigate the ship to the next destination.',
      );
      QuestJs._io.metamsg(
        'As the captain, the welfare of the crew is important, so {color:red:ASK KYLE ABOUT HIS HEALTH}, etc.',
      );
      QuestJs._io.metamsg(
        'You can talk to Xsansi anywhere on the ship (and can just call her "ai"). Do {color:red:ASK AI ABOUT CREW} to find out where the crew are. Do {color:red:ASK AI ABOUT KYLE}, for example, for more specific information; the last crew mate yoiu asked about will appear in blue on the map, helping you find him or her (until you meet, where the room will turn green for one turn).',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpNPCs', {
    regex: /^(?:\?|help) npcs?$/,
    script: function () {
      QuestJs._io.metamsg('{b:Interacting with NPCs:}');
      QuestJs._io.metamsg(
        'You can ask an NPC to do something by using the same command you would use to have yourself do something, but prefixed with {color:red:[name],} (note the comma) or {color:red:TELL [name] TO}.',
      );
      QuestJs._io.metamsg(QuestJs._settings.noTalkTo);
      QuestJs._io.metamsg(
        'Use the {color:red:TOPICS} command for some suggested topics. There are rather more for ASK than TELL, as you might expect.',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpProbes', {
    regex: /^(?:\?|help) probes?$/,
    script: function () {
      QuestJs._io.metamsg('{b:Using probes:}');
      QuestJs._io.metamsg(
        'Kyle will automatically deploy a satellite on arrival at a new planet, but you need to tell your crew to deploy probes for the surface. Wait for Xsansi to announce that the satellite is in orbit, then {color:red:ASK XSANSI ABOUT PLANET}. You can then assess what probes you want to deploy.',
      );
      QuestJs._io.metamsg(
        'For a bio-probe, talk to Ostap, for a geo-probe, talk to Aada. They will then walk to the probe hanger, and launch the probe. You can tell them to launch several at once (eg {color:red:OSTAP, LAUNCH 3 PROBES}), but remember, you only have sixteen of each for all five planets.',
      );
      QuestJs._io.metamsg(
        'Once a probe has been launched, it is on its own; you cannot control it.',
      );
      QuestJs._io.metamsg(
        'After a probe has landed, it will send data back to the ship, for your crew to analyse. If the data has value, your bonus will automatically increase. The first probe on a planet might get you two or three bonuses, but the third may not get you any and by the tenth, it is not going to find anything new. Ask the crew about the planet once the probes have explored it. You may decide you want to launch more.',
      );
      QuestJs._io.metamsg(
        'After thirty turns a probe will have got everything it can - and usually much sooner. Why not get to know your crew while you wait?',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpStasis', {
    regex: /^(?:\?|help) stasis$/,
    script: function () {
      QuestJs._io.metamsg('{b:Stasis:}');
      QuestJs._io.metamsg(
        'Once you are in stasis, years will pass whilst the ship navigates to the next star system, so this is how to move the story forward to the next planet to survey.',
      );
      QuestJs._io.metamsg('To go into stasis, climb into your pod, and close the lid.');
      QuestJs._io.metamsg(
        'You can tell a crew member to go to stasis at any time (eg {color:red:AADA, GET IN STASIS POD} or just {color:red:HA, IN POD}). Once in stasis they cannot be revived until the ship arrives at the next destination, so make sure they have done everything they need to first. Crew members will automatically go into stasis anyway once you do.',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpVacuum', {
    regex: /^(?:\?|help) (?:vacuum|d?e?pressur.+)$/,
    script: function () {
      QuestJs._io.metamsg('{b:Vacuum:}');
      QuestJs._io.metamsg(
        'Each section of the ship can be pressurised or depressurised by Xsansi, just ask {color:red:XSANSI, PRESSURIZE THE CARGO BAY} or {color:red:AI, DEPRESSURISE ENGINEERING}. Note that safety overrides may prevent Xsansi from complying.',
      );
      QuestJs._io.metamsg(
        'To find out what areas are pressurised, {color:red: ASK XSANSI ABOUT WHERE IS PRESSURISED} or {color:red:ASK AI ABOUT VACUUM}.',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpDock', {
    regex: /^(?:\?|help) (?:dock|docking)$/,
    script: function () {
      QuestJs._io.metamsg('{b:Docking:}');
      QuestJs._io.metamsg(
        'From the flight-deck, you can get closer to another ship, either to get a better look or to dock with it; {color:red:XSANSI, APPROACH SHUTTLE} or {color:red:AI, APPROACH SHIP}. Obviously there must be an vessel around.',
      );
      QuestJs._io.metamsg(
        'Once adjacent, you can scan it or dock with it; {color:red:XSANSI, DOCK WITH SHUTTLE} or {color:red:AI, SCAN SHIP}.',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpUniverse', {
    regex: /^(?:\?|help) universe$/,
    script: function () {
      QuestJs._io.metamsg('{b:The game world:}');
      QuestJs._io.metamsg(
        'I originally {i:tried} to go hard science fiction; these are real stars the ship visits! However, I have assumed artificial gravity, which is required to orientate the game (once you have down, you have port, up and starboard).',
      );
      QuestJs._io.metamsg(
        'I am also assuming people can be held in stasis, and presumably this is like freezing time (cf Niven\'s stasis field, in his "Known Space" series). I need that to preserve the food so the crew have something to eat 80 years after leaving Earth.',
      );
      QuestJs._io.metamsg(
        'Also, probes are {i:fast}! It just takes a few turns to travel from orbit to the planet surface, which has to be at least 100 miles, and likely considerably more. They work fast on the planet too. It is a game; we need stuff to happened quickly to keep players interested. So maybe not so hard science fiction afterall.',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpSystem', {
    regex: /^(?:\?|help) system?$/,
    script: function () {
      QuestJs._io.metamsg('{b:The Game System:}');
      QuestJs._io.metamsg(
        'This game was written for Quest 6, which means it is running entirely in JavaScript in your browser. Compared to Quest 5 (which I am also familiar with) this means that you do not need to download any software to run it, and there is no annoying lag while you wait for a server to respond. Compared to Inform... well, it allows authors to directly access a modern programming language (though the point of Inform 7, of course, is to keep the programming language at bay).',
      );
      QuestJs._io.metamsg(
        'Quest 6 is a complete system, implementing all the standards of a parser game, including the usual compass directions by default! Containers, surfaces, countables, wearables, openables, furniture, components and switchable are all built in, as well as NPCs, who hopefully are acting with some semblance of realism.',
      );
      QuestJs._io.metamsg(
        'For more information, including a tutorial on how to create your own game, see {link:here:https://github.com/ThePix/QuestJS/wiki}. As yet there is no editor, but I hope there will be one day.',
      );
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);

QuestJs._commands.push(
  new QuestJs._command.Cmd('HelpCredits', {
    regex: /^(?:\? |help )?(?:credits?|about)$/,
    script: function () {
      QuestJs._io.metamsg('{b:Credits:}');
      QuestJs._io.metamsg('This was written by The Pixie, on a game system created by The Pixie.');
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS;
    },
  }),
);
