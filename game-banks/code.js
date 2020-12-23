/*
The ship is on a long mission to visit various stars to survey them. It takes years between each one, so the crew are in stasis. The shop has an AI that controls the ship between stars, and on arrival does the initial scans, looking for anything interesting. The ship does not have the capability to land (it has two escape pods that can be used to land, but not get off the planet again).

There are:
Six stasis pods
Five? crew
Six seeder pods, to be deployed in batches of three
Six satellites
Sixteen probes with crawler-bots
Six probes with marine-bots
Two escape pods

Probes:
Geology (MS, also analyse atmosphere)
Biology (slice and dice, microscope)


Keep a score in the way of a bonus, related to how much data for useful planets

Each awakening gets steadily worse, by the fourth you are throwing up.








*/

const CREW = function (isFemale) {
  const res = QuestJs._npc.NPC(isFemale);
  res.status = 'okay';
  res.properName = true;
  res.crewman = true;
  res.relationship = 0;
  res.clothing = 2;
  res.reactionToUndress = 0;
  res.oxygenUseModifier = 1;
  res.oxygenUse = function () {
    if (typeof this.status !== 'number') return 0;
    return this.baseOxygeUse * this.oxygenUseModifier;
  };
  res.revive = function (isMultiple, char) {
    const tpParams = { actor: this, char };
    if (char === QuestJs._game.player) {
      QuestJs._io.msg(
        'You wonder how to revive {nm:actor} - probably best to leave that to Xsansi.',
        tpParams,
      );
      return false;
    }
    if (char !== QuestJs._w.Xsansi) {
      QuestJs._io.msg("'{nm:char}, can you revive {nm:actor}?' you ask.", tpParams);
      QuestJs._io.msg("'Probably best to leave that to Xsansi.'");
      return false;
    }
    if (!this.inPod) {
      QuestJs._io.msg("'Xsansi, please revive {nm:actor},' you say.", tpParams);
      QuestJs._io.msg("'Crew member {nm:actor} is not currently in stasis.'", tpParams);
      return false;
    }
    // check number revived TODO!!!
  };
  // Description
  res.examine = function (isMultiple) {
    const tpParams = { actor: this };
    let s;
    switch (this.clothing) {
      case 0:
        s = ' {pv:actor:be:true} naked.';
        break;
      case 1:
        s = ' {pv:actor:be:true} in his underwear.';
        break;
      case 2:
        s = ' {pv:actor:be:true} wearing a dark grey jumpsuit.';
        break;
    }
    if (this.posture === 'reclining' && this.loc === 'stasis_bay') {
      s += ' {pv:actor:be:true} lying in his stasis pod.';
    } else if (this.posture) {
      s += ` {pv:actor:be:true} ${this.posture}.`;
    }
    QuestJs._io.msg(QuestJs._tools.prefix(this, isMultiple) + this.desc + s, tpParams);
  };
  res.stasis = function () {
    const tpParams = { actor: this };
    QuestJs._io.msg(
      "'{nm:actor}, you're work here is done; you can go get in your stasis pod.'",
      tpParams,
    );
    if (this.deployProbeTotal === 0) {
      QuestJs._io.msg("'You don't think I should deploy a probe first?'", tpParams);
      QuestJs._io.msg("'I'm the captain,' you remind {ob:actor}.", tpParams);
    }
    QuestJs._io.msg(this.okay);
    this.agenda.push('walkTo:stasis_bay');
    this.agenda.push('text:stasisPod');
    this.stasisPodCount = 0;
  };
  res.stasisPod = function () {
    const tpParams = { actor: this };
    if (this.clothing === 2) {
      QuestJs._io.msg(
        '{nv:actor:pull:true} off {pa:actor} jumpsuit, and puts it in the drawer under {pa:actor} stasis pod.',
        tpParams,
      );
      this.clothing = 1;
      return false;
    }
    if (this.posture !== 'reclining') {
      QuestJs._io.msg(
        'Just in {pa:actor} underwear, {nv:actor:climb} into {pa:actor} stasis pod.',
        tpParams,
      );
      this.posture = 'reclining';
      return false;
    }
    QuestJs._io.msg(
      "'Close the pod, Xsansi,' {nv:actor:say}. The stasis pod lid smoothly lowers, and Xsansi operates the stasis field.",
      tpParams,
    );
    this.status = 'stasis';
    this.loc = 'nowhere';
    return true;
  };

  // Probe deployment
  res.deployProbeAction = 0;
  res.deployProbeCount = 0; // number deployed in one batch
  res.deployProbeTotal = 0; // number deployed in this system
  res.deployProbeOverallTotal = 0; // total
  res.deployProbe = function (arr) {
    // This is an agenda item; it will continue until it returns true and is set other parameters from the agenda (just the count in this case).
    // It will run every turn until done. It should only start once the character is at the correct location.
    // Progress is tracked with deployProbeAction.
    // 0 is sitting down at the console
    // 1 is preparing the probe
    // 2 is launching the probe, and we can return to 1 if there are more to do
    // 3 is noting the job is done
    // Once a probe is launched this system forgets it
    const count = parseInt(arr[0]);
    const tpParams = { actor: this, count: this.deployProbeCount + 1 };
    switch (this.deployProbeAction) {
      case 0:
        this.probeAction0(count);
        this.deployProbeAction += 1;
        break;
      case 1:
        QuestJs._io.msg(
          '{nv:actor:prepare:true} the {ordinal:count} {param:actor:probeType}.',
          tpParams,
        );
        this.deployProbeAction += 1;
        break;
      case 2:
        QuestJs._io.msg(
          '{nv:actor:launch:true} the {ordinal:count} {param:actor:probeType}.',
          tpParams,
        );
        this.actuallyDeployProbe(count);
        break;
      case 3:
        this.probeAction3(count);
        this.deployProbeAction += 1;
        break;
    }
    return this.deployProbeAction === 4;
  };

  res.actuallyDeployProbe = function (count) {
    // the details of leaunching a probe are done here
    // housekeeping
    this.probesRemaining -= 1;
    this.deployProbeCount += 1;
    this.deployProbeTotal += 1;
    this.deployProbeOverallTotal += 1;
    if (this.deployProbeCount === count) {
      // last of the batch
      this.deployProbeAction += 1;
    } else {
      // some left to deploy
      this.deployProbeAction -= 1;
    }

    QuestJs._w.probe_prototype.cloneMe(this);
  };

  return res;
};

const walkthroughs = {
  a: [
    'o',
    'get jumpsuit',
    'wear jumpsuit',
    'a',
    'u',
    'f',
    'ask ostap about probes',
    's',
    'x chair',
    'x table',
    'ask ostap about bio-probes',
    'ask ostap about his health',
    'ostap, launch 19 probes',
    'ostap, launch 2 bio-probe',
    'z',
    'p',
    'd',
    'd',
    'a',
    'z',
    'ask ostap about lost probes',
    'ask ostap about planet',
    'ask ostap about lost probes',
    'topics for ostap',
    'z',
    'z',
    'z',
    'z',
    'z',
    'z',
    'ask ostap about lost probes',
    'ask ostap about planet',
    'topics ostap',
    'ask ostap about himself',
    'ask ostap about himself',
    'ostap, go in stasis pod',
    'f',
    'u',
    's',
    'ostap, stop',
    'ostap, stop',
    'z',
    'z',
    'l',
    'ostap, go in stasis pod',
    'z',
    'x ostap',
    'l',
    'ask ai about crew',
    'p',
    'u',
    'a',
    'a',
    'tell aada to deploy probe',
    'z',
    'f',
    'f',
    'd',
    'd',
    'a',
    'z',
    'z',
    'z',
    'z',
    'ask aada about planet',
    'topics aada',
    'ask aada about himself',
    'ask aada about herself',
    'aada, go in stasis pod',
    /**/
  ],
  c: [
    'o',
    'get jumpsuit',
    'wear jumpsuit',
    'p',
    'f',
    'kyle, launch 19 probes',
    'kyle, launch 1 satellite',
    'z',
    'a',
    'd',
  ],
};

function createTopics(npc) {
  npc.askOptions.push({
    name: 'health',
    regex: /(his |her )?(health|well\-?being)/,
    test(p) {
      return p.text.match(this.regex);
    },
    script: howAreYouFeeling,
  });
  npc.askOptions.push({
    name: 'planet',
    regex: /(this |the |)?planet/,
    test(p) {
      return p.text.match(this.regex);
    },
    script(response) {
      const tpParams = { actor: response.actor };
      QuestJs._io.msg("'What's your report on {planet}?' you ask {nm:actor:the}.", tpParams);
      QuestJs._io.msg(planetAnalysis(response), tpParams);
    },
  });
  npc.askOptions.push({
    name: 'probes',
    regex: /probes?/,
    test(p) {
      return p.text.match(this.regex);
    },
    script(response) {
      response.actor.probesAskResponse();
    },
  });
  npc.askOptions.push({
    name: 'expertise',
    regex: /(your |his |her )?(area|special.*|expert.*|job|role)/,
    test(p) {
      return p.text.match(this.regex);
    },
    script(response) {
      QuestJs._io.msg(
        `'What is your area of expertise?' you ask ${QuestJs._lang.getName(response.actor, {
          article: QuestJs._consts.DEFINITE,
        })}.`,
      );
      response.actor.areaAskResponse();
    },
  });
  npc.askOptions.push({
    name: 'background',
    regex: /^((his |her )?(background))|((him|her)self)$/,
    test(p) {
      return p.text.match(this.regex);
    },
    script(response) {
      QuestJs._io.msg(
        `'Tell me about yourself,' you say to ${QuestJs._lang.getName(response.actor, {
          article: QuestJs._consts.DEFINITE,
        })}.`,
      );
      response.actor.backgroundAskResponse();
      trackRelationship(response.actor, 1, 'background');
    },
  });
  npc.askOptions.push({
    msg: '{nv:actor:have:true} no interest in that.',
    failed: true,
  });
}

function howAreYouFeeling(response) {
  QuestJs._io.msg(
    `'How are you feeling?' you ask ${QuestJs._lang.getName(response.actor, {
      article: QuestJs._consts.DEFINITE,
    })}.`,
  );
  QuestJs._io.msg(PLANETS[QuestJs._w.Xsansi.currentPlanet][`${response.actor.name}_how_are_you`]);
}

function planetAnalysis(response) {
  const arr = response.actor.data[QuestJs._w.Xsansi.currentPlanet];
  if (Object.keys(arr).length === 0)
    return QuestJs._io.falsemsg('You should talk to Aada or Ostap about that stuff.');

  let rank = response.actor[`rank${QuestJs._w.Xsansi.currentPlanet}`];
  if (rank === undefined)
    return QuestJs._io.falsemsg('You should talk to Aada or Ostap about that stuff.');
  rank >>= 1;
  if (rank >= arr.length) rank = arr.length - 1;
  return arr[rank];
}

function createPlanets() {
  for (let i = 0; i < PLANETS.length; i += 1) {
    QuestJs._create.createItem(`planet${i}`, {
      starName: PLANETS[i].starName,
      alias: `${PLANETS[i].starName} ${PLANETS[i].planet}`,
      geology: 0,
      marine: 0,
      biology: 0,
      coms: 0,
      satellite: false,
      probeLandingSuccess: PLANETS[i].probeLandingSuccess,
      eventIsActive() {
        return this.satellite;
      },
      eventPeriod: 5,
      eventScript() {
        this.coms += 1;
      },
    });
  }
}

createPlanets();

function arrival() {
  QuestJs._w.Xsansi.currentPlanet += 1;
  PLANETS[QuestJs._w.Xsansi.currentPlanet].onArrival();
  QuestJs._game.elapsedTime = 0;
  QuestJs._game.startTime = PLANETS[QuestJs._w.Xsansi.currentPlanet].arrivalTime;
  QuestJs._w.Aada.deployProbeTotal = 0;
  QuestJs._w.Ostap.deployProbeTotal = 0;
  updateTopics(QuestJs._w.Xsansi, QuestJs._w.Xsansi.currentPlanet);
  for (const npc of NPCS) {
    npc.state = QuestJs._w.Xsansi.currentPlanet * 100;
  }
  QuestJs._w.Kyle.setAgenda(['walkTo:probes_forward', 'text:deployProbe:1']);
  QuestJs._IO.updateStatus();
}

// If a topic has an attribute "name2", then using code=2,
// "name" will be changed to "name2". This means new topics get added to the QuestJs._npc.TOPIC command
// tested
function updateTopics(npc, code) {
  for (const opt of npc.askOptions) {
    if (opt[`name${code}`] !== undefined) {
      opt.name = opt[`name${code}`];
    }
  }
}

// Use this to increase the player's relationship with the NPC to ensure it only happens once
// tested
function trackRelationship(npc, inc, code) {
  if (npc.relationshipTracker === undefined) npc.relationshipTracker = '~';
  const regex = new RegExp(`~${code}~`);
  if (!regex.test(npc.relationshipTracker)) {
    npc.relationship += inc;
    npc.relationshipTracker += `${code}~`;
  }
}

function reviveNpc(npc, object) {}

function getProbes() {
  const arr = [];
  for (const key in QuestJs._w) {
    if (QuestJs._w[key].clonePrototype === QuestJs._w.probe_prototype) arr.push(QuestJs._w[key]);
  }
  return arr;
}

function shipAlert(s) {
  if (isOnShip()) {
    QuestJs._io.msg(`'${s}' announces Xsansi.`);
  }
}

function isOnShip() {
  return QuestJs._w[QuestJs._game.player.loc].notOnShip === undefined;
}

function currentPlanet() {
  return QuestJs._w[`planet${QuestJs._w.Xsansi.currentPlanet}`];
}

function probeLandsOkay() {
  const planet = currentPlanet();
  const flag = planet.probeLandingSuccess[0] === 'y';
  planet.probeLandingSuccess = planet.probeLandingSuccess.substring(1);
  if (!flag) {
    QuestJs._w.Aada.lostProbe = true;
    QuestJs._w.Ostap.lostProbe = true;
    updateTopics(QuestJs._w.Ostap, 'Lost');
  }
  return flag;
}

QuestJs._settings.deckNames = { layer1: 'Deck 2', layer3: 'Deck 1', layer4: 'Deck 3' };

function updateMap() {
  $('#layer1').hide();
  $('#layer3').hide();
  $('#layer4').hide();
  const currentDeck = QuestJs._w[QuestJs._game.player.loc].deckName;
  $('#map').attr('title', `The Joseph Banks, ${QuestJs._settings.deckNames[currentDeck]}`);
  if (!currentDeck) return QuestJs._io.errormsg(`No deckName for ${QuestJs._game.player.loc}`);
  $(`#${currentDeck}`).show();
  for (const key in QuestJs._w) {
    if (QuestJs._w[key].svgId)
      $(`#${QuestJs._w[key].svgId}`).css(
        'fill',
        isRoomPressured(QuestJs._w[key]) ? '#777' : '#222',
      );
  }
  const mySvgId = QuestJs._w[QuestJs._game.player.loc].svgId;
  let otherSvgId;
  if (QuestJs._w.Xsansi.locate)
    otherSvgId = QuestJs._w[QuestJs._w[QuestJs._w.Xsansi.locate].loc].svgId;

  if (!mySvgId && !otherSvgId) return;
  if (mySvgId === otherSvgId) {
    $(`#${mySvgId}`).css('fill', 'green');
    delete QuestJs._w.Xsansi.locate;
  } else {
    if (mySvgId) $(`#${mySvgId}`).css('fill', 'yellow');
    if (otherSvgId) $(`#${otherSvgId}`).css('fill', 'blue');
  }
  $('#rect10').css('fill', QuestJs._settings.darkModeActive ? '#333' : '#bbb');
  for (const id of [3334, 2800, 2788, 3330]) {
    $(`#text${id}`).css('fill', QuestJs._settings.darkModeActive ? 'white' : 'black');
    $(`#text${id}`).css('font-family', 'Orbitron, sans-serif');
  }
}

function isRoomPressured(room) {
  if (typeof room.vacuum === 'string') room = QuestJs._w[room.vacuum];
  return !room.vaccum;
}
