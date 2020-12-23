QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'lounge',
  regex: /^(me|myself|player)$/,
  examine(isMultiple) {
    QuestJs._io.msg(
      `${QuestJs._tools.prefix(this, isMultiple)}A ${
        this.isFemale ? 'chick' : 'guy'
      } called ${this.alias}`,
    );
  },
});

QuestJs._create.createItem('knife', QuestJs._templates.TAKEABLE(), {
  loc: 'me',
  sharp: false,
  examine(isMultiple) {
    if (this.sharp) {
      QuestJs._io.msg(
        `${QuestJs._tools.prefix(this, isMultiple)}A really sharp knife.`,
      );
    } else {
      QuestJs._io.msg(
        `${QuestJs._tools.prefix(this, isMultiple)}A blunt knife.`,
      );
    }
  },
  chargeResponse(participant) {
    QuestJs._io.msg('There is a loud bang, and the knife is destroyed.');
    delete this.loc;
    return false;
  },
});

QuestJs._create.createRoom('lounge', {
  desc: 'A smelly room with an [old settee:couch:sofa] and a [tv:telly].',
  east: new QuestJs._create.Exit('kitchen'),
  west: new QuestJs._create.Exit('dining_room'),
  up: new QuestJs._create.Exit('bedroom'),
  hint:
    'There is a lot in this room! The bricks can be picked up by number (try GET 3 BRICKS). The book can be read. The coin is stuck to the floor. There are containers too. Kyle is an NPC; you can tell him to do nearly anything the player character can do (everything except looking and talking).',
});
