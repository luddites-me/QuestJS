'use strict';

QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'lounge',
  regex: /^(me|myself|player)$/,
  examine: 'Just a regular guy.',
  hitpoints: 100,
});

QuestJs._create.createRoom('lounge', {
  desc: 'The lounge is boring, the author really needs to put stuff in it.',
});

QuestJs._create.createItem('Kyle', QuestJs._npc.NPC(), {
  loc: 'lounge',
  examine: 'A slightly larger than normal sized bear in a Flash costume.',
});

QuestJs._create.createItem('soup_can', QuestJs._templates.TAKEABLE(), {
  loc: 'lounge',
  examine: 'A large can of tomato soup.{if:soup_can:opened: It has been opened.}',
  verbFunction: function (l) {
    if (!this.opened) l.push('Open');
  },
  open: function () {
    if (this.state) return QuestJs._io.falsemsg('It has already been opened.');
    QuestJs._io.msg('You grab the tin opener, and use it to open the can of soup.');
    this.opened = true;
  },
});

QuestJs._create.createItem('beer_can', QuestJs._templates.TAKEABLE(), {
  loc: 'lounge',
  examine: 'A large can of beer,',
});

QuestJs._create.createItem('bowls', QuestJs._templates.TAKEABLE(), {
  loc: 'lounge',
  state: 0,
  examine: 'A set of matching bowls.',
  verbFunction: function (l) {
    if (this.state) l.push('Empty');
    if (!this.state) l.push('Fill');
  },
  fill: function () {
    if (this.state === 10)
      return QuestJs._io.falsemsg('The bowls really need a wash before using them again.');
    if (this.state) return QuestJs._io.falsemsg('The bowls already have soup in them.');
    QuestJs._io.msg('You pour soup into the bowls.');
    this.state = 1;
  },
  empty: function () {
    if (this.state === 0 || this.state === 10)
      return QuestJs._io.falsemsg('The bowls are already empty.');
    QuestJs._io.msg('You empty the bowls into the sink.');
    this.state = 0;
  },
});
