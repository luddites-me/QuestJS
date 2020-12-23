QuestJs._test.tests = function () {
  // QuestJs._game.player.skillsLearnt = ["Double attack", "Fireball",  "Commune with animal", "Unlock", "Stoneskin", "Steelskin", "Lightning bolt", "Ice shard", "Psi-blast"]
  // ioUpdateCustom()

  QuestJs._test.title('Elements');
  QuestJs._test.assertEqual('fire', elements.opposed('frost'));
  QuestJs._test.assertEqual('frost', elements.opposed('fire'));

  QuestJs._test.title('Equip');
  QuestJs._test.assertEqual(
    'unarmed',
    QuestJs._game.player.getEquippedWeapon().alias,
  );
  QuestJs._test.assertCmd(
    'i',
    'You are carrying a flail, an ice amulet and a knife.'
  );
  QuestJs._test.assertCmd('equip knife', 'You draw the knife.');
  QuestJs._test.assertCmd(
    'i',
    'You are carrying a flail, an ice amulet and a knife (equipped).'
  );
  QuestJs._test.assertEqual(
    'knife',
    QuestJs._game.player.getEquippedWeapon().alias,
  );
  QuestJs._test.assertCmd('equip knife', 'It already is.');
  QuestJs._test.assertCmd('drop knife', 'You drop the knife.');
  QuestJs._test.assertEqual(
    'unarmed',
    QuestJs._game.player.getEquippedWeapon().alias,
  );
  QuestJs._test.assertEqual(undefined, QuestJs._game.player.equipped);
  QuestJs._test.assertCmd('take knife', 'You take the knife.');
  QuestJs._test.assertCmd('unequip knife', 'It already is.');
  QuestJs._test.assertCmd('equip knife', 'You draw the knife.');
  QuestJs._test.assertCmd('unequip knife', 'You put away the knife.');

  QuestJs._test.title('Armour');
  QuestJs._settings.armourScaling = 1;
  QuestJs._test.assertEqual(0, QuestJs._game.player.getArmour());
  QuestJs._test.assertCmd('get helmet', 'You take the helmet.');
  QuestJs._test.assertEqual(0, QuestJs._game.player.getArmour());
  QuestJs._test.assertCmd('wear helmet', 'You put on the helmet.');
  QuestJs._test.assertEqual(10, QuestJs._game.player.getArmour());
  QuestJs._test.assertCmd('get chestplate', 'You take the chestplate.');
  QuestJs._test.assertEqual(10, QuestJs._game.player.getArmour());
  QuestJs._test.assertCmd('wear chestplate', 'You put on the chestplate.');
  QuestJs._test.assertEqual(30, QuestJs._game.player.getArmour());
  QuestJs._settings.armourScaling = 10;

  // TODO
  // Monster descriptions that include an injury note and optionally hits
  // Also lore and truesight, search
  // behavior - hostile, following, guarding, etc.

  // non-corporeal
  // death, onDeath, corpseDescription

  // pickpocket

  QuestJs._test.title('Attack.createAttack  (unarmed) misses');
  const attack0 = Attack.createAttack(QuestJs._game.player, QuestJs._w.goblin);
  QuestJs._test.assertEqual('me', attack0.attacker.name);
  QuestJs._test.assertEqual([QuestJs._w.goblin], attack0.primaryTargets);
  QuestJs._test.assertEqual('d4', attack0.damage);
  QuestJs._test.assertEqual(1, attack0.offensiveBonus);

  QuestJs._random.prime(3);
  // QuestJs._w.goblin.applyAttack(attack0, true, 0)
  attack0.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(40, QuestJs._w.goblin.health);

  QuestJs._test.title('Attack.createAttack  (unarmed)');
  const attack1 = Attack.createAttack(QuestJs._game.player, QuestJs._w.goblin);
  QuestJs._test.assertEqual('me', attack1.attacker.name);
  QuestJs._test.assertEqual([QuestJs._w.goblin], attack1.primaryTargets);
  QuestJs._test.assertEqual('d4', attack1.damage);
  QuestJs._test.assertEqual(1, attack1.offensiveBonus);

  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  attack1.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(36, QuestJs._w.goblin.health);

  QuestJs._w.goblin.armour = 2;
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  attack1.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(34, QuestJs._w.goblin.health);
  QuestJs._w.goblin.armour = 0;
  QuestJs._w.goblin.health = 40;

  QuestJs._test.title('Attack.createAttack  (flail)');
  const oldProcessAttack = QuestJs._game.player.modifyOutgoingAttack;
  QuestJs._game.player.modifyOutgoingAttack = function (attack) {
    attack.offensiveBonus += 2;
  };
  QuestJs._w.flail.equipped = true;

  const attack2 = Attack.createAttack(QuestJs._game.player, QuestJs._w.orc);
  QuestJs._test.assertEqual('me', attack2.attacker.name);
  QuestJs._test.assertEqual('2d10+4', attack2.damage);
  QuestJs._test.assertEqual(2, attack2.offensiveBonus);

  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(7);
  attack2.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(25, QuestJs._w.goblin.health);

  QuestJs._w.goblin.armour = 2;
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(7);
  attack2.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(14, QuestJs._w.goblin.health);
  QuestJs._w.goblin.armour = 0;
  QuestJs._w.goblin.health = 40;

  QuestJs._game.player.modifyOutgoingAttack = oldProcessAttack;
  delete QuestJs._w.flail.equipped;

  QuestJs._test.title('Attack.createAttack  (goblin)');
  const attack2a = Attack.createAttack(QuestJs._w.goblin, QuestJs._game.player);
  QuestJs._test.assertEqual('goblin', attack2a.attacker.name);
  QuestJs._test.assertEqual([QuestJs._w.me], attack2a.primaryTargets);
  QuestJs._test.assertEqual('d8', attack2a.damage);
  QuestJs._test.assertEqual(0, attack2a.offensiveBonus);
  QuestJs._random.prime(19);
  QuestJs._random.prime(5);
  attack2a.resolve(QuestJs._w.me, true, 0);
  QuestJs._test.assertEqual(98, QuestJs._w.me.health);
  QuestJs._w.me.health = 100;

  QuestJs._test.assertCmd('get shotgun', 'You take the shotgun.');
  QuestJs._test.assertCmd('equip shotgun', 'You draw the shotgun.');
  QuestJs._random.prime(2);
  QuestJs._test.assertCmd('attack goblin', [
    'You attack the goblin.',
    'A miss!',
  ]);
  QuestJs._test.assertCmd('attack goblin', [
    'You attack the goblin.',
    'Out of ammo!',
  ]);
  QuestJs._test.assertCmd('drop shotgun', 'You drop the shotgun.');

  QuestJs._test.title('Attack.createAttack  (fireball)');
  const oldgetSkillFromButtons = skillUI.getSkillFromButtons;
  skillUI.getSkillFromButtons = function () {
    return skills.findName('Fireball');
  };

  const attack3 = Attack.createAttack(QuestJs._game.player, QuestJs._w.goblin);

  QuestJs._test.assertEqual(
    'spellCasting',
    attack3.skill.statForOffensiveBonus,
  );
  QuestJs._test.assertEqual(5, QuestJs._w.me.spellCasting);

  QuestJs._test.assertEqual('me', attack3.attacker.name);
  QuestJs._test.assertEqual(undefined, attack3.weapon);
  QuestJs._test.assertEqual(
    [QuestJs._w.goblin, QuestJs._w.orc, QuestJs._w.snotling, QuestJs._w.rabbit],
    attack3.primaryTargets,
  );
  QuestJs._test.assertEqual('2d6', attack3.damage);
  QuestJs._test.assertEqual(5, attack3.offensiveBonus);
  QuestJs._test.assertEqual('fire', attack3.element);

  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(3);
  attack3.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(33, QuestJs._w.goblin.health);

  attack3.report = [];
  QuestJs._random.prime(2);
  attack3.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(33, QuestJs._w.goblin.health);

  QuestJs._w.goblin.element = 'frost';
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(3);
  attack3.resolve(QuestJs._w.goblin, true, 0);
  QuestJs._test.assertEqual(19, QuestJs._w.goblin.health);
  // attack3.output(40)

  delete QuestJs._w.goblin.fireModifier;
  QuestJs._w.goblin.health = 40;
  skillUI.getSkillFromButtons = oldgetSkillFromButtons;

  QuestJs._test.title('attack command, success');
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(7);
  QuestJs._w.flail.equipped = true;

  QuestJs._test.assertCmd('attack goblin', [
    'You attack the goblin.',
    /A hit/,
    'Damage: 15',
    'Health now: 25',
  ]);
  QuestJs._test.assertEqual(25, QuestJs._w.goblin.health);

  QuestJs._w.goblin.health = 40;
  delete QuestJs._w.flail.equipped;

  QuestJs._test.title('attack command, fails');
  QuestJs._random.prime(4);
  QuestJs._w.flail.equipped = true;

  QuestJs._test.assertCmd('attack goblin', [
    'You attack the goblin.',
    /A miss/,
  ]);
  QuestJs._test.assertEqual(40, QuestJs._w.goblin.health);

  delete QuestJs._w.flail.equipped;

  QuestJs._test.title('learn fireball');
  QuestJs._game.player.skillsLearnt = ['Double attack'];
  QuestJs._test.assertCmd('cast nonsense', [
    'There is no spell called nonsense.',
  ]);
  QuestJs._test.assertCmd('cast fireball', [
    'You do not know the spell <i>Fireball</i>.',
  ]);
  QuestJs._test.assertCmd('learn nonsense', [
    'There is no spell called nonsense.',
  ]);
  QuestJs._test.assertCmd('learn fireball', [
    'You do not have anything you can learn <i>Fireball</i> from.',
  ]);
  QuestJs._test.assertCmd('get spellbook', ['You take the spellbook.']);
  QuestJs._test.assertCmd('learn fireball', [
    'You learn <i>Fireball</i> from the spellbook.',
  ]);
  QuestJs._test.assertEqual(
    ['Double attack', 'Fireball'],
    QuestJs._game.player.skillsLearnt,
  );
  // goblin, orc, snotling, rabbit

  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(4);

  QuestJs._random.prime(19);
  QuestJs._random.prime(2);
  QuestJs._random.prime(2);

  QuestJs._random.prime(4);

  QuestJs._random.prime(4);
  QuestJs._test.assertCmd('cast fireball', [
    'You cast <i>Fireball</i>.',
    'The room is momentarily filled with fire.',
    'The goblin reels from the explosion.',
    'Damage: 16',
    'Health now: 24',
    'The orc reels from the explosion.',
    'Damage: 4',
    'Health now: 56',
    'The snotling ignores it.',
    'The rabbit ignores it.',
  ]);
  QuestJs._w.goblin.health = 40;
  QuestJs._w.orc.health = 60;

  QuestJs._test.title('learn Ice shard');
  QuestJs._test.assertCmd('learn ice shard', [
    'You learn <i>Ice shard</i> from the spellbook.',
  ]);
  QuestJs._game.player.skillsLearnt = [
    'Double attack',
    'Fireball',
    'Ice shard',
  ];
  QuestJs._test.assertCmd('cast ice shard', [
    'You need a target for the spell <i>Ice shard</i>.',
  ]);
  QuestJs._test.assertCmd('drop spellbook', ['You drop the spellbook.']);
  skillUI.getSkillFromButtons = function () {
    return skills.findName('Ice shard');
  };
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(7);
  QuestJs._random.prime(9);
  QuestJs._test.assertCmd('attack goblin', [
    'You cast <i>Ice shard</i>.',
    'A shard of ice jumps from your finger to the goblin!',
    'Damage: 10',
    'Health now: 30',
  ]);
  QuestJs._w.goblin.health = 40;
  skillUI.getSkillFromButtons = oldgetSkillFromButtons;
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(7);
  QuestJs._random.prime(9);
  QuestJs._test.assertCmd('cast Ice shard at goblin', [
    'You cast <i>Ice shard</i>.',
    'A shard of ice jumps from your finger to the goblin!',
    'Damage: 10',
    'Health now: 30',
  ]);
  QuestJs._w.goblin.health = 40;
  skillUI.getSkillFromButtons = oldgetSkillFromButtons;

  QuestJs._test.title('Lightning bolt');
  QuestJs._game.player.skillsLearnt = [
    'Double attack',
    'Fireball',
    'Lightning bolt',
  ];
  QuestJs._test.assertCmd('cast lightning bolt', [
    'You need a target for the spell <i>Lightning bolt</i>.',
  ]);
  skillUI.getSkillFromButtons = function () {
    return skills.findName('Lightning bolt');
  };
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(7);
  QuestJs._random.prime(9);

  // For the orc
  QuestJs._random.prime(2);

  // For the snotling
  QuestJs._random.prime(19);
  QuestJs._random.prime(4);
  QuestJs._random.prime(7);
  QuestJs._test.assertCmd('attack goblin', [
    'You cast <i>Lightning bolt</i>.',
    'A lightning bolt jumps from your out-reached hand to the goblin!',
    'Damage: 20',
    'Health now: 20',
    'A smaller bolt jumps your target, but entirely misses the orc!',
    'A smaller bolt jumps your target to the snotling!',
    'Damage: 11',
    'Health now: 9',
  ]);
  QuestJs._w.goblin.health = 40;
  QuestJs._w.snotling.health = 20;

  QuestJs._random.prime(4);
  QuestJs._test.assertCmd('attack goblin', [
    'You cast <i>Lightning bolt</i>.',
    'A lightning bolt jumps from your out-reached hand to the goblin, fizzling out before it can actually do anything.',
  ]);

  skillUI.getSkillFromButtons = oldgetSkillFromButtons;

  QuestJs._test.title('Attack.createAttack  (goblin, spells)');
  QuestJs._w.goblin.spellCasting = 3;

  const attack2b = Attack.createAttack(
    QuestJs._w.goblin,
    QuestJs._game.player,
    skills.findName('Ice shard'),
  );
  QuestJs._test.assertEqual('goblin', attack2b.attacker.name);
  QuestJs._test.assertEqual([QuestJs._w.me], attack2b.primaryTargets);
  QuestJs._test.assertEqual('3d6', attack2b.damage);
  QuestJs._test.assertEqual(3, attack2b.offensiveBonus);
  QuestJs._random.prime(19);
  QuestJs._random.prime(5);
  QuestJs._random.prime(5);
  QuestJs._random.prime(5);
  attack2b.resolve(QuestJs._w.me, true, 0);
  QuestJs._test.assertEqual(94, QuestJs._w.me.health);

  const attack2c = Attack.createAttack(
    QuestJs._w.goblin,
    QuestJs._game.player,
    skills.findName('Psi-blast'),
  );
  QuestJs._test.assertEqual('goblin', attack2c.attacker.name);
  QuestJs._random.prime(19);
  QuestJs._random.prime(5);
  QuestJs._random.prime(5);
  QuestJs._random.prime(5);
  attack2c.resolve(QuestJs._w.me, true, 0);
  QuestJs._test.assertEqual(79, QuestJs._w.me.health);

  QuestJs._w.ice_amulet.worn = true;
  const attack2d = Attack.createAttack(
    QuestJs._w.goblin,
    QuestJs._game.player,
    skills.findName('Ice shard'),
  );
  QuestJs._random.prime(19);
  attack2d.resolve(QuestJs._w.me, true, 0);
  QuestJs._test.assertEqual(79, QuestJs._w.me.health);
  QuestJs._test.assertEqual(
    "A shard of ice jumps from the goblin's finger to you, but the ice amulet protects you, and you take no damage.",
    attack2d.report[5].t,
  );

  QuestJs._w.me.health = 100;
  delete QuestJs._w.goblin.spellCasting;

  QuestJs._test.title('learn ongoing spells');
  QuestJs._test.assertCmd('get spellbook', ['You take the spellbook.']);
  QuestJs._test.assertCmd('learn steelskin', [
    'You learn <i>Steelskin</i> from the spellbook.',
  ]);
  QuestJs._test.assertCmd('learn stoneskin', [
    'You learn <i>Stoneskin</i> from the spellbook.',
  ]);
  QuestJs._test.assertCmd('drop spellbook', ['You drop the spellbook.']);
  QuestJs._test.assertEqual([], QuestJs._game.player.activeEffects);
  QuestJs._test.assertCmd('cast stoneskin', [
    'You cast the <i>Stoneskin</i> spell.',
    'Your skin becomes as hard as stone - and yet still just as flexible.',
  ]);

  QuestJs._test.assertEqual(['Stoneskin'], QuestJs._game.player.activeEffects);
  QuestJs._test.assertCmd('cast steelskin', [
    'You cast the <i>Steelskin</i> spell.',
    'Your skin becomes as hard as steel - and yet still just as flexible.',
    'The <i>Stoneskin</i> spell terminates.',
  ]);
  QuestJs._test.assertEqual(['Steelskin'], QuestJs._game.player.activeEffects);

  QuestJs._test.title('ongoing spells expire');
  QuestJs._game.player.countdown_Steelskin = 3;
  QuestJs._w.spell_handler.eventScript();
  QuestJs._test.assertEqual(2, QuestJs._game.player.countdown_Steelskin);
  QuestJs._test.assertCmd('z', ['You wait one turn.']);
  QuestJs._test.assertEqual(1, QuestJs._game.player.countdown_Steelskin);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    'The <i>Steelskin</i> spell terminates.',
  ]);
  QuestJs._test.assertEqual(
    undefined,
    QuestJs._game.player.countdown_Steelskin,
  );
  QuestJs._test.assertEqual([], QuestJs._game.player.activeEffects);
  QuestJs._test.assertCmd('z', ['You wait one turn.']);

  QuestJs._test.title('cast unlock');
  QuestJs._game.player.skillsLearnt = ['Double attack', 'Fireball', 'Unlock'];
  QuestJs._test.assertCmd('cast unlock', [
    'You cast the <i>Unlock</i> spell.',
    'The door to the south unlocks.',
  ]);
  QuestJs._test.assertCmd('cast unlock', [
    'You cast the <i>Unlock</i> spell.',
    'There are no locked doors.',
  ]);
  // should also open other door!!!

  QuestJs._test.title('cast Commune with animal');
  QuestJs._game.player.skillsLearnt = [
    'Double attack',
    'Fireball',
    'Commune with animal',
  ];
  QuestJs._test.assertCmd('talk to rabbit', [
    /You spend a few minutes telling the rabbit/,
  ]);
  QuestJs._test.assertCmd('cast commune on rabbit', [
    'You cast <i>Commune with animal</i>.',
    'You can now talk to the rabbit for a short time.',
  ]);
  QuestJs._test.assertCmd('talk to rabbit', [
    /You say \'Hello,\' to the rabbit/,
    /Fading away bunny/,
  ]);

  QuestJs._game.player.skillsLearnt = ['Double attack', 'Fireball'];

  /**/
};
