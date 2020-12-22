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
