QuestJs._test.tests = function () {
  QuestJs._test.title('custom date time');
  QuestJs._test.assertEqual('11 Marisi, 1374, 1:46 am', QuestJs._util.getDateTime());
  const dateTimeDict = QuestJs._util.getDateTimeDict();
  QuestJs._test.assertEqual(46, dateTimeDict.minute);
  QuestJs._test.assertEqual(1, dateTimeDict.hour);
  QuestJs._test.assertEqual(
    'It is 11 Marisi, 1374, 1:46 am',
    QuestJs._text.processText('It is {dateTime}'),
  );
  QuestJs._game.elapsedTime += 8 * 60 * 60;
  QuestJs._test.assertEqual(
    'It is 11 Marisi, 1374, 9:46 am',
    QuestJs._text.processText('It is {dateTime}'),
  );

  QuestJs._test.assertEqual(
    '-Two-Three-',
    QuestJs._text.processText('{hour:3:8:One}-{hour:5:10:Two}-{hour:9:10:Three}-{hour:10:99:Four}'),
  );
  QuestJs._test.assertEqual(false, QuestJs._util.isAfter('1003'));
  QuestJs._test.assertEqual(false, QuestJs._util.isAfter('0946'));
  QuestJs._test.assertEqual(true, QuestJs._util.isAfter('0945'));
  QuestJs._test.assertEqual(true, QuestJs._util.isAfter('0859'));

  /* */
};
