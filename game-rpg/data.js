QuestJs._create.createItem('me', RPG_PLAYER(), {
  loc: 'practice_room',
  regex: /^(me|myself|player)$/,
  health: 100,
  maxHealth: 100,
  pp: 40,
  maxPP: 40,
  maxArmour: 20,
  armour: 3,
  spellCasting: 5,
  offensiveBonus: 3,
  examine(isMultiple) {
    QuestJs._io.msg(
      `${QuestJs._tools.prefix(this, isMultiple)}A ${this.isFemale ? 'chick' : 'guy'} called ${
        this.alias
      }`,
    );
  },
});

QuestJs._create.createItem('knife', WEAPON('d4+2'), {
  loc: 'me',
  image: 'knife',
  offensiveBonus: -2,
});

QuestJs._create.createItem('flail', WEAPON('2d10+4'), {
  loc: 'me',
  image: 'flail',
});

QuestJs._create.createItem('flaming_sword', WEAPON('3d6+2'), {
  loc: 'me',
  image: 'sword',
  activeEffects: ['Flaming weapon'],
});

QuestJs._create.createItem('ice_amulet', QuestJs._templates.WEARABLE(4, ['neck']), {
  loc: 'me',
  modifyIncomingAttack(attack) {
    if (this.worn && attack.element === 'frost') {
      attack.damageMultiplier = 0;
      attack.primarySuccess = attack.primarySuccess.replace(
        /[.!]/,
        ', but the ice amulet protects {sb:target}, and {pv:target:take} no damage.',
      );
    }
  },
});

QuestJs._create.createRoom('practice_room', {
  desc: 'A large room with straw scattered across the floor. The only exit is west',
  west: new QuestJs._create.Exit('great_hall'),
  south: new QuestJs._create.Exit('cupboard', {
    locked: true,
    lockedmsg: 'It seems to be locked.',
  }),
});

QuestJs._create.createRoom('great_hall', {
  desc:
    'An imposing - and rather cold - room with a high, vaulted roof, and tapestries hanging from the walls.',
  east: new QuestJs._create.Exit('practice_room'),
});

QuestJs._create.createItem(
  'practice_room_door',
  QuestJs._templates.LOCKED_DOOR('small_key', 'great_hall', 'practice_room'),
  {
    examine: 'A very solid, wooden door.',
  },
);

QuestJs._create.createRoom('cupboard', {
  desc: 'A small cupboard.',
  north: new QuestJs._create.Exit('practice_room'),
});

QuestJs._create.createItem('small_key', QuestJs._templates.KEY(), {
  examine: 'A small key.',
  loc: 'practice_room',
});

QuestJs._create.createItem('goblin', RPG_NPC(false), {
  loc: 'practice_room',
  damage: 'd8',
  health: 40,
});

QuestJs._create.createItem('orc', RPG_NPC(false), {
  loc: 'practice_room',
  damage: '2d10+4',
  health: 60,
});

QuestJs._create.createItem('huge_shield', SHIELD(10), {
  loc: 'orc',
});

QuestJs._create.createItem('snotling', RPG_NPC(false), {
  loc: 'practice_room',
  damage: '2d4',
  health: 20,
});

QuestJs._create.createItem('rabbit', RPG_NPC(false), {
  loc: 'practice_room',
  damage: '2d4',
  health: 20,
  canTalkFlag: false,
  isHostile() {
    return false;
  },
  talkto() {
    if (!this.canTalk()) {
      QuestJs._io.msg(
        'You spend a few minutes telling the rabbit about your life, but it does not seem interested. Possibly because it is rabbit.',
      );
      return;
    }
    switch (this.talktoCount) {
      case 0:
        QuestJs._io.msg("You say 'Hello,' to the rabbit, 'how is it going?'");
        QuestJs._io.msg(
          "The rabbit looks at you. 'Need carrots.' It looks plaintively at it round tummy. 'Fading away bunny!",
        );
        break;
      default:
        QuestJs._io.msg('You wonder what you can talk to the rabbit about.');
        break;
    }
  },
});

QuestJs._create.createItem('chest', QuestJs._templates.CONTAINER(true), {
  loc: 'practice_room',
});

QuestJs._create.createItem(
  'spellbook',
  SPELLBOOK(['Fireball', 'Stoneskin', 'Steelskin', 'Lightning bolt', 'Ice shard']),
  {
    loc: 'practice_room',
  },
);

QuestJs._create.createItem('helmet', QuestJs._templates.WEARABLE(2, ['head']), {
  loc: 'practice_room',
  armour: 10,
});

QuestJs._create.createItem('chestplate', QuestJs._templates.WEARABLE(2, ['chest']), {
  loc: 'practice_room',
  armour: 20,
});

QuestJs._create.createItem('boots', QuestJs._templates.WEARABLE(2, ['feet']), {
  loc: 'practice_room',
  pronouns: QuestJs._lang.pronouns.plural,
});

QuestJs._create.createItem('shotgun', LIMITED_USE_WEAPON('2d10+4', 1), {
  loc: 'practice_room',
  image: 'flail',
});

skills.add(
  new Skill('Double attack', {
    icon: 'sword2',
    tooltip: 'Attack one foe twice, but at -2 to the attack roll',
    modifyOutgoingAttack(attack) {
      attack.offensiveBonus -= 2;
      attack.attackNumber = 2;
    },
  }),
);

skills.add(
  new Effect('Flaming weapon', {
    modifyOutgoingAttack(attack) {
      attack.element = 'fire';
    },
  }),
);

skills.add(
  new Effect('Frost vulnerability', {
    modifyIncomingAttack(attack) {
      if (attack.element) attack.damageMultiplier *= 2;
    },
  }),
);

skills.add(
  new Skill('Sweeping attack', {
    icon: 'sword3',
    tooltip:
      'Attack one foe for normal damage, and any other for 4 damage; at -3 to the attack roll for reach',
    getPrimaryTargets: rpg.getFoes,
    modifyOutgoingAttack(attack) {
      if (options.secondary) {
        attack.damageNumber = 0;
        attack.damageBonus = 4;
      }
      attack.offensiveBonus -= 3;
    },
  }),
);

skills.add(
  new Skill('Sword of Fire', {
    icon: 'sword-fire',
    tooltip: 'Attack with a flaming sword',
    modifyOutgoingAttack(attack) {
      attack.element = 'fire';
    },
  }),
);

skills.add(
  new Skill('Ice Sword', {
    icon: 'sword-ice',
    tooltip: 'Attack with a freezing blade',
    modifyOutgoingAttack(attack) {
      attack.element = 'ice';
    },
  }),
);

skills.add(
  new Spell('Fireball', {
    noTarget: true,
    damage: '2d6',
    tooltip: 'A fireball that fills the room (but does not affect you!)',
    primarySuccess: '{nv:target:reel:true} from the explosion.',
    primaryFailure: '{nv:target:ignore:true} it.',
    getPrimaryTargets: rpg.getAll,
    modifyOutgoingAttack(attack) {
      attack.element = 'fire';
      attack.msg('The room is momentarily filled with fire.', 1);
    },
  }),
);

skills.add(
  new Spell('Ice shard', {
    damage: '3d6',
    icon: 'ice-shard',
    tooltip: 'A shard of ice pierces your foe!',
    primarySuccess: 'A shard of ice jumps from {nms:attacker:the} finger to {nm:target:the}!',
    modifyOutgoingAttack(attack) {
      attack.element = 'frost';
    },
  }),
);

skills.add(
  new Spell('Psi-blast', {
    damage: '3d6',
    icon: 'psi-blast',
    tooltip: 'A blast of mental energy (ignores armour)',
    primarySuccess: 'A blast of raw psi-energy sends {nm:target:the} reeling.',
    primaryFailure: 'A blast of raw psi-energy... is barely noticed by {nm:target:the}.',
    modifyOutgoingAttack(attack) {
      attack.armourMultiplier = 0;
    },
  }),
);

skills.add(
  new Spell('Lightning bolt', {
    damage: '3d6',
    secondaryDamage: '2d6',
    icon: 'lightning',
    tooltip: 'A lightning bolt jumps from your out-reached hand to you foe!',
    primarySuccess:
      'A lightning bolt jumps from {nms:attacker:the} out-reached hand to {nm:target:the}!',
    secondarySuccess: 'A smaller bolt jumps {nms:attacker:the} target to {nm:target:the}!',
    primaryFailure:
      'A lightning bolt jumps from {nms:attacker:the} out-reached hand to {nm:target:the}, fizzling out before it can actually do anything.',
    secondaryFailure:
      'A smaller bolt jumps {nms:attacker:the} target, but entirely misses {nm:target:the}!',
    getSecondaryTargets: rpg.getFoesBut,
    modifyOutgoingAttack(attack) {
      attack.element = 'storm';
    },
    onPrimaryFailure(attack) {
      attack.secondaryTargets = [];
    },
  }),
);

skills.add(
  new Spell('Cursed armour', {
    targetEffect(attack) {
      attack.msg('{nms:target:the:true} armour is reduced.', 1);
    },
    icon: 'unarmour',
    tooltip: 'A lightning bolt jumps from your out-reached hand to you foe!',
    modifyOutgoingAttack(attack) {
      attack.armourModifier = attack.armourModifier > 2 ? attack.armourModifier - 2 : 0;
    },
  }),
);

skills.add(
  new SpellSelf('Stoneskin', {
    targetEffect(attack) {
      attack.msg('Your skin becomes as hard as stone - and yet still just as flexible.', 1);
    },
    ongoing: true,
    incompatible: [/skin$/],
    modifyIncomingAttack(attack) {
      attack.armourModifier += 2;
    },
  }),
);

skills.add(
  new SpellSelf('Steelskin', {
    targetEffect(attack) {
      attack.msg('Your skin becomes as hard as steel - and yet still just as flexible.', 1);
    },
    ongoing: true,
    duration: 3,
    incompatible: [/skin$/],
    modifyIncomingAttack(attack) {
      attack.armourModifier += 4;
    },
  }),
);

skills.add(
  new SpellSelf('Unlock', {
    targetEffect(attack) {
      const room = QuestJs._w[attack.attacker.loc];
      let flag = false;
      for (const el of QuestJs._util.exitList(attack.attacker)) {
        if (room[el].locked) {
          attack.msg(`The door to ${QuestJs._util.niceDirection(el)} unlocks.`, 1);
          room[el].locked = false;
          flag = true;
        }
      }
      if (!flag) attack.msg('There are no locked doors.', 1);
    },
  }),
);

skills.add(
  new Spell('Commune with animal', {
    icon: 'commune',
    targetEffect(attack) {
      if (attack.target.canTalkFlag) {
        attack.msg(
          '{nv:attacker:can:true} talk to {nm:target:the} for a short time (like before the spell...).',
          1,
        );
      } else {
        attack.target.canTalkFlag = true;
        attack.target.canTalkFlagIsTemporary = true;
        attack.msg('{nv:attacker:can:true} now talk to {nm:target:the} for a short time.', 1);
      }
    },
    regex: /commune/,
    ongoing: true,
    duration: 5,
    automaticSuccess: true,
    terminatingScript(target) {
      if (target.canTalkFlagIsTemporary) {
        target.canTalkFlag = false;
        delete target.canTalkFlagIsTemporary;
        return `The {i:Commune with animal} spell on ${QuestJs._lang.getName(target, {
          article: QuestJs._consts.DEFINITE,
        })} expires.`;
      }
      return '';
    },
  }),
);
