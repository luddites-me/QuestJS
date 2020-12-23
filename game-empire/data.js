QuestJs._create.createItem('me', QuestJs._templates.PLAYER(), {
  loc: 'throne_room',
  regex: /^(me|myself|player)$/,
  examine: 'Just a regular guy.',
  hitpoints: 100,
});

QuestJs._create.createRoom('throne_room', {
  desc: 'The throne room is nice. But could be better.',
  north: new QuestJs._create.Exit('royal_bedroom'),
  south: new QuestJs._create.Exit('great_hall'),
  east: new QuestJs._create.Exit('balcony'),
});

QuestJs._create.createRoom('royal_bedroom', {
  desc: 'The royal bedroom got rather damaged in the goblin raids. But the bed looks okay.',
  south: new QuestJs._create.Exit('royal_bedroom'),
});

QuestJs._create.createRoom('balcony', {
  desc: 'The royal bedroom got rather damaged in the goblin raids. But the bed looks okay.',
  west: new QuestJs._create.Exit('throne_room'),
});

QuestJs._create.createRoom('great_hall', {
  desc: 'The great hall saw a lot of fighting when the goblins attacked, and is in a sorry state.',
  north: new QuestJs._create.Exit('throne_room'),
  south: new QuestJs._create.Exit('chapel'),
  west: new QuestJs._create.Exit('laboratory'),
  // east:new QuestJs._create.Exit('gallery'),
});

QuestJs._create.createRoom('chapel', {
  desc: 'The royal bedroom got rather damaged in the goblin raids. But the bed looks okay.',
  north: new QuestJs._create.Exit('great_hall'),
});

QuestJs._create.createRoom('laboratory', {
  desc: 'The royal bedroom got rather damaged in the goblin raids. But the bed looks okay.',
  east: new QuestJs._create.Exit('great_hall'),
});
