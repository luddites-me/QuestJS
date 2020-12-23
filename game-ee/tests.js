QuestJs._test.tests = function () {
  QuestJs._test.title('Equip');
  QuestJs._test.assertCmd('equip knife', 'You draw the knife.');
  QuestJs._test.assertCmd('equip knife', 'It already is.');
  QuestJs._test.assertCmd('drop knife', 'You drop the knife.');
  QuestJs._test.assertCmd('take knife', 'You take the knife.');
  QuestJs._test.assertCmd('unequip knife', 'It already is.');
  QuestJs._test.assertCmd('equip knife', 'You draw the knife.');
  QuestJs._test.assertCmd('unequip knife', 'You put away the knife.');
};
