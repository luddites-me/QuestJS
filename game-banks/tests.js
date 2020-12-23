'use strict';

QuestJs._test.tests = function () {
  QuestJs._test.title('Planet Analysis');
  QuestJs._w.Xsansi.currentPlanet = 2;
  const response = { actor: QuestJs._w.Ostap };
  QuestJs._test.assertEqual(
    "'Not as interesting as the last one, I think.'",
    planetAnalysis(response),
  );
  QuestJs._w.Ostap.rank2 = 4;
  QuestJs._test.assertEqual(
    "'There are things a live here, but buried. There's bacteria in the soil. But it is not primitive bacteria. I cannot say for sure - I know only Earth bacteria - but I think this is highly evolved. I think some disaster, an extinction event, has wiped out virtually all life. This is all that survives.'",
    planetAnalysis(response),
  );
  QuestJs._w.Ostap.rank2 = 8;
  QuestJs._test.assertEqual(
    "'It is sad; a whole planet dead - or virtually dead. Sad that we missed them, sad they all died. This is why this mission is so important, so mankind can spread to the stars before something like this happens on Earth.'",
    planetAnalysis(response),
  );
  QuestJs._w.Ostap.rank2 = 0;

  QuestJs._test.title('Probe events 1');
  QuestJs._test.testing = true;
  QuestJs._test.testOutput = [];

  QuestJs._w.Xsansi.currentPlanet = 2;
  QuestJs._w.Ostap.deployProbeOverallTotal = 1;
  QuestJs._w.Ostap.deployProbeTotal = 1;
  const probe = QuestJs._w.probe_prototype.cloneMe(QuestJs._w.Ostap);
  QuestJs._test.assertEqual('Ostap', probe.owner);
  QuestJs._test.assertEqual('Bio-probe I', probe.alias);
  QuestJs._test.assertEqual('In flight', probe.status);
  QuestJs._test.assertEqual(0, probe.launchCounter);
  probe.eventScript();
  QuestJs._test.assertEqual('In flight', probe.status);
  QuestJs._test.assertEqual(1, probe.launchCounter);
  for (let i = 0; i < TURNS_TO_LANDING - 1; i += 1) probe.eventScript();
  QuestJs._test.assertEqual(0, QuestJs._w.Ostap.rank2);
  QuestJs._test.assertEqual(0, QuestJs._w.me.bonus);
  QuestJs._test.assertEqual('Landing', probe.status);
  QuestJs._test.assertEqual(TURNS_TO_LANDING, probe.launchCounter);
  probe.eventScript();
  QuestJs._test.assertEqual('Exploring', probe.status);
  QuestJs._test.assertEqual(1 + TURNS_TO_LANDING, probe.launchCounter);

  QuestJs._test.title('Probe events 2');
  for (let i = 0; i < 4; i += 1) probe.eventScript();
  QuestJs._test.assertEqual(1, QuestJs._w.Ostap.rank2);
  QuestJs._test.assertEqual(2, QuestJs._w.me.bonus);
  for (let i = 0; i < 4; i += 1) probe.eventScript();
  QuestJs._test.assertEqual(2, QuestJs._w.Ostap.rank2);
  QuestJs._test.assertEqual(4, QuestJs._w.me.bonus);
  for (let i = 0; i < 8; i += 1) probe.eventScript();
  QuestJs._test.assertEqual(3, QuestJs._w.Ostap.rank2);
  QuestJs._test.assertEqual(6, QuestJs._w.me.bonus);
  for (let i = 0; i < 4; i += 1) probe.eventScript();
  QuestJs._test.assertEqual(3, QuestJs._w.Ostap.rank2);
  QuestJs._test.assertEqual(6, QuestJs._w.me.bonus);
  QuestJs._w.Ostap.rank2 = 0;
  QuestJs._w.Ostap.deployProbeOverallTotal = 0;
  QuestJs._w.Xsansi.currentPlanet = 0;
  QuestJs._test.testing = false;
  QuestJs._test.assertEqual(
    "'Bio-probe I has successfully landed on the planet.' announces Xsansi.",
    QuestJs._test.testOutput[0],
  );

  QuestJs._test.title('Planet one');
  QuestJs._test.assertCmd(
    'ask ai about crew',
    QuestJs._test.padArray(["'Tell me about the crew, Xsansi,' you say."], 4),
  );
  QuestJs._test.assertCmd('o', [
    'You climb out of the stasis pod.',
    /^There are six/,
    'A drawer under the pod slides open to reveal your jumpsuit.',
  ]);
  QuestJs._test.assertCmd('get jumpsuit', [
    'You take your jumpsuit.',
    'The stasis pod drawer slides shut.',
  ]);
  QuestJs._test.assertCmd('wear jumpsuit', ['You put on your jumpsuit.']);

  QuestJs._test.title('Go to Ostap');
  QuestJs._test.assertCmd('a', ['You head aft.', /^The cargo bay is/]);
  QuestJs._test.assertCmd('u', [
    'You walk up the narrow stair way to the top deck.',
    /^The top deck is where the living quarters/,
  ]);
  QuestJs._test.assertCmd('f', [
    'You head forward.',
    /^You are stood at the forward end /,
    "'Satellite I has successfully entered orbit around the planet.' announces Xsansi.",
  ]);
  QuestJs._test.assertCmd(
    'ask ostap about probes',
    "You can't see anything you might call 'ostap' here.",
  );
  QuestJs._test.assertCmd('s', ['You head starboard.', /^The canteen/, 'You can see Ostap here.']);
  QuestJs._test.assertCmd('x chair', ["It's just scenery."]);
  QuestJs._test.assertCmd(
    'x table',
    'The table is plastic, attached to the wall at one end, and held up by a single leg at the other end. The table is bare.',
  );
  QuestJs._test.assertCmd(
    'ask ostap about bio-probes',
    QuestJs._test.padArray(["'How does a bio-probe work?' you ask Ostap."], 2),
  );
  QuestJs._test.assertCmd('ask ostap about his health', [
    "'How are you feeling?' you ask Ostap.",
    "'I am feeling good.'",
  ]);

  QuestJs._test.title('Order launch');
  QuestJs._test.assertCmd('ostap, launch 19 probes', [
    "'Launch 19 bio-probes,' you say to Ostap.",
    "'We only have 16 and we should save some for the other planets on our itinerary.'",
  ]);
  QuestJs._test.assertCmd('ostap, launch 2 bio-probe', [
    "'Launch 2 bio-probes,' you say to Ostap.",
    "'Okay captain.'",
  ]);
  QuestJs._test.assertCmd('z', ['You wait one turn.', 'Ostap leaves the canteen, heading port.']);
  QuestJs._test.assertCmd('p', [
    'You head port.',
    'You are stood at the forward end of a narrow corridor, with your cabin to port, and the canteen to starboard. Ahead, is the lounge.',
    'You can see Ostap here.',
    'Ostap leaves the top deck forward, heading down.',
  ]);
  QuestJs._test.assertCmd('d', [
    'You head down.',
    /^This is, in a sense, the central nexus of the ship./,
    'You can see Ostap here.',
    'Ostap leaves the hallway, heading down.',
  ]);
  QuestJs._test.assertCmd('d', [
    'You head down.',
    /^The forward probe hanger is where the satellites/,
    'You can see Kyle and Ostap here.',
    'Ostap leaves the Forward probe hanger, heading aft.',
  ]);
  QuestJs._test.assertCmd('a', [
    'You head aft.',
    /^The aft probe hanger has/,
    'You can see Ostap here.',
    "'Okay, two probes to deploy...' mutters Ostap as he types at the console.",
  ]);

  QuestJs._test.title('Launching');
  QuestJs._test.assertCmd('z', ['You wait one turn.', 'Ostap prepares the first bio-probe.']);
  QuestJs._test.assertCmd('ask ostap about lost probes', [
    "'Do we ever lose probes?' you ask Ostap.",
    /^'We are exploring the unknown, we have to expect /,
  ]);
  QuestJs._test.assertCmd('ask ostap about planet', [
    "'What's your report on HD 154088D?' you ask Ostap.",
    "'So, this one does not look so interesting,' he replies. 'I think we see nothing more than bacteria here - maybe not even that.'",
  ]);
  QuestJs._test.assertCmd('ask ostap about lost probes', [
    "'Do we ever lose probes?' you ask Ostap.",
    /^'We are exploring the unknown/,
  ]);
  QuestJs._test.assertCmd('topics for ostap', [
    'Some suggestions for what to ask Ostap about: background; expertise; health; planet; probes.',
  ]);
  QuestJs._test.assertCmd('z', ['You wait one turn.', 'Ostap launches the first bio-probe.']);
  QuestJs._test.assertCmd('z', ['You wait one turn.', 'Ostap prepares the second bio-probe.']);
  QuestJs._test.assertCmd('z', ['You wait one turn.', 'Ostap launches the second bio-probe.']);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    "'Okay, two probes launched,' says Ostap as he stands up.",
    "'Bio-probe I has successfully landed on the planet.' announces Xsansi.",
  ]);

  QuestJs._test.title('Waiting');
  QuestJs._test.assertCmd('z', ['You wait one turn.']);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    "'Contact with Bio-probe II has been lost as it attempted to land on the planet.' announces Xsansi.",
  ]);
  QuestJs._test.assertCmd('ask ostap about lost probes', [
    '\'What does Xsansi mean by "contact lost" with that probe?\' you ask Ostap.',
    /^'We are exploring the unknown/,
  ]);
  QuestJs._test.assertCmd('ask ostap about planet', [
    "'What's your report on HD 154088D?' you ask Ostap.",
    "'So, this one does not look so interesting,' he replies. 'I think we see nothing more than bacteria here - maybe not even that.'",
  ]);
  QuestJs._test.assertCmd('topics ostap', [
    'Some suggestions for what to ask Ostap about: background; expertise; health; lost probe; planet; probes.',
  ]);
  QuestJs._test.assertEqual(0, QuestJs._w.Ostap.relationship);
  QuestJs._test.assertCmd('ask ostap about himself', [
    "'Tell me about yourself,' you say to Ostap.",
    /^'I'm from Nastasiv, near Ternopil.'/,
  ]);
  QuestJs._test.assertEqual(1, QuestJs._w.Ostap.relationship);
  QuestJs._test.assertCmd('ask ostap about himself', [
    "'Tell me about yourself,' you say to Ostap.",
    /^'I'm from Nastasiv, near Ternopil.'/,
  ]);
  QuestJs._test.assertEqual(1, QuestJs._w.Ostap.relationship);
  QuestJs._test.assertCmd('ask ostap about planet', [
    "'What's your report on HD 154088D?' you ask Ostap.",
    "'So far, we see nothing. No life, no green. Perhaps bacteria living below the surface?'",
  ]);
  QuestJs._test.assertCmd('ask ostap about jjjj', ['Ostap has no interest in that.']);

  QuestJs._test.title('Ostap to stasis');
  QuestJs._test.assertCmd('ostap, go in stasis pod', [
    "'Ostap, you're work here is done; you can go get in your stasis pod.'",
    "'Right, okay then.'",
  ]);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    'Ostap leaves the Aft probe hanger, heading forward.',
  ]);
  QuestJs._test.assertCmd('f', QuestJs._test.padArray([], 4));
  QuestJs._test.assertCmd('u', QuestJs._test.padArray([], 4));
  QuestJs._test.assertCmd('s', QuestJs._test.padArray([], 4));
  QuestJs._test.assertCmd('ostap, stop', [
    "'Ostap, forget what I said; don't get in your stasis pod yet.'",
    "'Oh, okay.'",
  ]);
  QuestJs._test.assertCmd('ostap, stop', [
    "'Ostap, stop what you're doing.'",
    "'Not really doing anything.'",
  ]);

  QuestJs._test.title('Waiting 2');
  QuestJs._test.assertCmd('z', 'You wait one turn.');
  QuestJs._test.assertCmd('z', 'You wait one turn.');
  QuestJs._test.assertCmd('l', [/All pods are currently open/, 'You can see Ostap here.']);
  QuestJs._test.assertCmd('ostap, go in stasis pod', [
    "'Ostap, you're work here is done; you can go get in your stasis pod.'",
    "'Right, okay then.'",
  ]);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    'Just in his underwear, Ostap climbs into his stasis pod.',
  ]);
  QuestJs._test.assertCmd('x ostap', [
    'Ostap is a big guy; not fat, but broad and tall. He keeps his dark hair in a short ponytail. He is in his underwear. He is lying in his stasis pod.',
    "'Close the pod, Xsansi,' Ostap says. The stasis pod lid smoothly lowers, and Xsansi operates the stasis field.",
  ]);
  QuestJs._test.assertCmd('l', /Ostap's stasis pod is closed/);
  QuestJs._test.assertCmd('ask ai about crew', [
    "'Tell me about the crew, Xsansi,' you say.",
    "'Crew member Ostap's designation is: biology. His current status is: In stasis.'",
    "'Crew member Aada's designation is: geology. Her current status is: perfect. Her current location is: the girls' cabin.'",
    "'Crew member Kyle's designation is: coms. His current status is: good. His current location is: the Forward probe hanger.'",
    "'Crew member Ha-yoon's designation is: engineering. Her current status is: good. Her current location is: Engineering (starboard).'",
  ]);

  QuestJs._test.assertCmd('z', 'You wait one turn.');

  /* */
};
