QuestJs._test.tests = function () {
  QuestJs._test.title('QuestJs._parser.scoreObjectMatch');
  QuestJs._test.assertEqual(55, QuestJs._parser.scoreObjectMatch('me', QuestJs._w.Buddy, ''));
  QuestJs._test.assertEqual(-1, QuestJs._parser.scoreObjectMatch('me fkh', QuestJs._w.Buddy, ''));
  QuestJs._test.assertEqual(-1, QuestJs._parser.scoreObjectMatch('xme', QuestJs._w.Buddy, ''));
  QuestJs._test.assertEqual(
    60,
    QuestJs._parser.scoreObjectMatch('flashlight', QuestJs._w.flashlight, ''),
  );
  QuestJs._test.assertEqual(16, QuestJs._parser.scoreObjectMatch('f', QuestJs._w.flashlight, ''));
  QuestJs._test.assertEqual(18, QuestJs._parser.scoreObjectMatch('fla', QuestJs._w.flashlight, ''));
  QuestJs._test.assertEqual(
    55,
    QuestJs._parser.scoreObjectMatch('torch', QuestJs._w.flashlight, ''),
  );
  QuestJs._test.assertEqual(
    60,
    QuestJs._parser.scoreObjectMatch('glass cabinet', QuestJs._w.glass_cabinet, ''),
  );
  QuestJs._test.assertEqual(
    50,
    QuestJs._parser.scoreObjectMatch('glass', QuestJs._w.glass_cabinet, ''),
  );
  QuestJs._test.assertEqual(
    50,
    QuestJs._parser.scoreObjectMatch('cabinet', QuestJs._w.glass_cabinet, ''),
  );
  QuestJs._test.assertEqual(
    3,
    QuestJs._parser.scoreObjectMatch('cab', QuestJs._w.glass_cabinet, ''),
  );

  QuestJs._test.title('QuestJs._tools.sentenceCase');
  QuestJs._test.assertEqual('Simple text', QuestJs._tools.sentenceCase('simple text'));

  QuestJs._test.title('getName');
  QuestJs._test.assertEqual('book', QuestJs._lang.getName(QuestJs._w.book));
  QuestJs._test.assertEqual(
    'the book',
    QuestJs._lang.getName(QuestJs._w.book, { article: QuestJs._consts.DEFINITE }),
  );
  QuestJs._test.assertEqual(
    'A book',
    QuestJs._lang.getName(QuestJs._w.book, { article: QuestJs._consts.INDEFINITE, capital: true }),
  );
  QuestJs._test.assertEqual('you', QuestJs._lang.getName(QuestJs._w.Buddy));
  QuestJs._test.assertEqual(
    'You',
    QuestJs._lang.getName(QuestJs._w.Buddy, { article: QuestJs._consts.INDEFINITE, capital: true }),
  );

  QuestJs._test.title('QuestJs._random.fromArray');
  const ary = ['one', 'two', 'three'];
  const ary2 = [];
  for (let i = 0; i < 3; i += 1) {
    const res = QuestJs._random.fromArray(ary, true);
    if (ary2.includes(res)) QuestJs._test.fail('ary2 already has that value');
    ary2.push(res);
  }
  QuestJs._test.assertEqual(0, ary.length);

  QuestJs._test.title('QuestJs._random.int');
  for (let i = 0; i < 100; i += 1) {
    const res = QuestJs._random.int(10);
    QuestJs._test.assertEqual(true, res >= 0 && res <= 10);
  }

  QuestJs._test.title('QuestJs._random.chance');
  for (let i = 0; i < 100; i += 1) {
    QuestJs._test.assertEqual(true, QuestJs._random.chance(100));
    QuestJs._test.assertEqual(false, QuestJs._random.chance(0));
  }

  QuestJs._test.title('Random primed');
  QuestJs._random.prime(4);
  QuestJs._random.prime(19);
  QuestJs._test.assertEqual(4, QuestJs._random.int());
  QuestJs._test.assertEqual(19, QuestJs._random.int());
  QuestJs._random.prime([3, 8]);
  QuestJs._test.assertEqual(11, QuestJs._random.dice('2d6'));

  QuestJs._test.title('QuestJs._array.compare');
  QuestJs._test.assertEqual(false, QuestJs._array.compare([1, 2, 4, 6, 7], [1, 2, 3]));
  QuestJs._test.assertEqual(true, QuestJs._array.compare([1, 2, 4], [1, 2, 4]));
  QuestJs._test.assertEqual(
    false,
    QuestJs._array.compare(
      [QuestJs._w.coin, QuestJs._w.boots, QuestJs._w.ring],
      [QuestJs._w.boots, QuestJs._w.ring],
    ),
  );
  QuestJs._test.assertEqual(
    true,
    QuestJs._array.compare(
      [QuestJs._w.boots, QuestJs._w.ring],
      [QuestJs._w.boots, QuestJs._w.ring],
    ),
  );

  QuestJs._test.title('QuestJs._array.compareUnordered');
  QuestJs._test.assertEqual(false, QuestJs._array.compareUnordered([1, 2, 4, 6, 7], [1, 2, 3]));
  QuestJs._test.assertEqual(true, QuestJs._array.compareUnordered([1, 2, 4], [1, 2, 4]));
  QuestJs._test.assertEqual(true, QuestJs._array.compareUnordered([4, 1, 2], [1, 2, 4]));
  QuestJs._test.assertEqual(false, QuestJs._array.compareUnordered([4, 1, 2, 4], [1, 2, 4]));
  QuestJs._test.assertEqual(
    false,
    QuestJs._array.compareUnordered(
      [QuestJs._w.coin, QuestJs._w.boots, QuestJs._w.ring],
      [QuestJs._w.boots, QuestJs._w.ring],
    ),
  );
  QuestJs._test.assertEqual(
    true,
    QuestJs._array.compareUnordered(
      [QuestJs._w.boots, QuestJs._w.ring],
      [QuestJs._w.boots, QuestJs._w.ring],
    ),
  );
  QuestJs._test.assertEqual(
    true,
    QuestJs._array.compareUnordered(
      [QuestJs._w.ring, QuestJs._w.boots],
      [QuestJs._w.boots, QuestJs._w.ring],
    ),
  );

  QuestJs._test.title('QuestJs._array.subtract');
  QuestJs._test.assertEqual([4, 6, 7], QuestJs._array.subtract([1, 2, 4, 6, 7], [1, 2, 3]));
  QuestJs._test.assertEqual(
    ['4', '6', '7'],
    QuestJs._array.subtract(['1', '2', '4', '6', '7'], ['1', '2', '3']),
  );
  QuestJs._test.assertEqual(
    [QuestJs._w.coin, QuestJs._w.boots],
    QuestJs._array.subtract(
      [QuestJs._w.coin, QuestJs._w.boots, QuestJs._w.ring],
      [QuestJs._w.ring],
    ),
  );

  const testAry = [QuestJs._w.boots, QuestJs._w.book, QuestJs._w.cardboard_box];

  QuestJs._test.title('QuestJs._array.next');
  QuestJs._test.assertEqual(
    QuestJs._w.cardboard_box,
    QuestJs._array.next(testAry, QuestJs._w.book),
  );
  QuestJs._test.assertEqual(false, QuestJs._array.next(testAry, QuestJs._w.cardboard_box));
  QuestJs._test.assertEqual(
    QuestJs._w.boots,
    QuestJs._array.next(testAry, QuestJs._w.cardboard_box, true),
  );

  QuestJs._test.title('QuestJs._array.nextFlagged');
  QuestJs._test.assertEqual(
    QuestJs._w.cardboard_box,
    QuestJs._array.nextFlagged(testAry, QuestJs._w.book, 'container'),
  );
  QuestJs._test.assertEqual(
    false,
    QuestJs._array.nextFlagged(testAry, QuestJs._w.book, 'notcontainer'),
  );
  QuestJs._test.assertEqual(
    false,
    QuestJs._array.nextFlagged(testAry, QuestJs._w.book, 'wearable'),
  );
  QuestJs._test.assertEqual(
    QuestJs._w.boots,
    QuestJs._array.nextFlagged(testAry, QuestJs._w.book, 'wearable', true),
  );
  QuestJs._test.assertEqual(
    false,
    QuestJs._array.nextFlagged(testAry, QuestJs._w.book, 'notwearable', true),
  );

  QuestJs._test.title('QuestJs._array.clone');
  const testAry2 = ['boots', 'book', 'cardboard_box', 'boots'];
  QuestJs._test.assertEqual(
    ['boots', 'book', 'cardboard_box', 'boots'],
    QuestJs._array.clone(testAry2),
  );
  QuestJs._test.assertEqual(
    ['boots', 'cardboard_box', 'book', 'boots'],
    QuestJs._array.clone(testAry2, { reverse: true }),
  );
  QuestJs._test.assertEqual(
    ['boots', 'book', 'cardboard_box'],
    QuestJs._array.clone(testAry2, { compress: true }),
  );

  QuestJs._test.title('QuestJs._util.getByInterval');
  const intervals = [2, 14, 4];
  QuestJs._test.assertEqual(0, QuestJs._util.getByInterval(intervals, 0));
  QuestJs._test.assertEqual(0, QuestJs._util.getByInterval(intervals, 1));
  QuestJs._test.assertEqual(1, QuestJs._util.getByInterval(intervals, 2));
  QuestJs._test.assertEqual(1, QuestJs._util.getByInterval(intervals, 15));
  QuestJs._test.assertEqual(2, QuestJs._util.getByInterval(intervals, 16));
  QuestJs._test.assertEqual(2, QuestJs._util.getByInterval(intervals, 19));
  QuestJs._test.assertEqual(false, QuestJs._util.getByInterval(intervals, 20));

  QuestJs._test.title('QuestJs._util.reverseDirection');
  QuestJs._test.assertEqual('north', QuestJs._util.reverseDirection('south'));
  QuestJs._test.assertEqual('up', QuestJs._util.reverseDirection('down'));
  QuestJs._test.assertEqual('north', QuestJs._util.reverseDirectionObj('south').name);

  QuestJs._test.title('formatList');
  QuestJs._test.assertEqual('', QuestJs._tools.formatList([]));
  QuestJs._test.assertEqual('nothing', QuestJs._tools.formatList([], { nothing: 'nothing' }));
  QuestJs._test.assertEqual('one', QuestJs._tools.formatList(['one']));
  QuestJs._test.assertEqual('one, two', QuestJs._tools.formatList(['one', 'two']));
  QuestJs._test.assertEqual(
    'one and two',
    QuestJs._tools.formatList(['one', 'two'], { lastJoiner: 'and' }),
  );
  QuestJs._test.assertEqual('one, three, two', QuestJs._tools.formatList(['one', 'two', 'three']));
  QuestJs._test.assertEqual(
    'one, three and two',
    QuestJs._tools.formatList(['one', 'two', 'three'], { lastJoiner: 'and' }),
  );
  QuestJs._settings.oxfordComma = true;
  QuestJs._test.assertEqual('one', QuestJs._tools.formatList(['one']));
  QuestJs._test.assertEqual(
    'one and two',
    QuestJs._tools.formatList(['one', 'two'], { lastJoiner: 'and' }),
  );
  QuestJs._test.assertEqual(
    'one, three, and two',
    QuestJs._tools.formatList(['one', 'two', 'three'], { lastJoiner: 'and' }),
  );
  QuestJs._settings.oxfordComma = false;

  QuestJs._test.title('Text processor 1');
  QuestJs._test.assertEqual('Simple text', QuestJs._text.processText('Simple text'));
  QuestJs._test.assertEqual('Simple <i>text</i>', QuestJs._text.processText('Simple {i:text}'));
  QuestJs._test.assertEqual(
    'Simple <span style="color:red">text</span>.',
    QuestJs._text.processText('Simple {colour:red:text}.'),
  );
  QuestJs._test.assertEqual(
    'Simple <span style="color:red">text with <i>nesting</i></span>.',
    QuestJs._text.processText('Simple {colour:red:text with {i:nesting}}.'),
  );
  QuestJs._test.assertEqual('Simple text', QuestJs._text.processText('Simple {random:text}'));
  QuestJs._test.assertEqual(
    'Simple text: no',
    QuestJs._text.processText('Simple text: {if:player:someOddAtt:yes:no}'),
  );
  QuestJs._game.player.someOddAtt = 67;
  QuestJs._test.assertEqual(
    'Simple text: 67',
    QuestJs._text.processText('Simple text: {show:player:someOddAtt}'),
  );

  QuestJs._test.title('Text processor 2');
  QuestJs._test.assertEqual(
    'Simple text: no',
    QuestJs._text.processText('Simple text: {if:player:someOddAtt:50:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: yes',
    QuestJs._text.processText('Simple text: {if:player:someOddAtt:67:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: ',
    QuestJs._text.processText('Simple text: {if:player:someOddAtt:50:yes}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: yes',
    QuestJs._text.processText('Simple text: {if:player:someOddAtt:67:yes}'),
  );

  QuestJs._test.assertEqual(
    'Simple text: yes',
    QuestJs._text.processText('Simple text: {ifMoreThan:player:someOddAtt:66:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: no',
    QuestJs._text.processText('Simple text: {ifMoreThan:player:someOddAtt:67:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: yes',
    QuestJs._text.processText('Simple text: {ifMoreThanOrEqual:player:someOddAtt:67:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: no',
    QuestJs._text.processText('Simple text: {ifMoreThanOrEqual:player:someOddAtt:68:yes:no}'),
  );

  QuestJs._test.assertEqual(
    'Simple text: no',
    QuestJs._text.processText('Simple text: {ifLessThan:player:someOddAtt:67:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: yes',
    QuestJs._text.processText('Simple text: {ifLessThan:player:someOddAtt:68:yes}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: no',
    QuestJs._text.processText('Simple text: {ifLessThanOrEqual:player:someOddAtt:66:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: yes',
    QuestJs._text.processText('Simple text: {ifLessThanOrEqual:player:someOddAtt:67:yes}'),
  );

  QuestJs._test.title('Text processor 3');
  QuestJs._game.player.someOddAtt = true;
  QuestJs._test.assertEqual(
    'Simple text: true',
    QuestJs._text.processText('Simple text: {show:player:someOddAtt}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: yes',
    QuestJs._text.processText('Simple text: {if:player:someOddAtt:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: no',
    QuestJs._text.processText('Simple text: {ifNot:player:someOddAtt:yes:no}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: seen first time only',
    QuestJs._text.processText('Simple text: {once:seen first time only}{notOnce:other times}'),
  );

  QuestJs._test.title('Text processor 4');
  QuestJs._test.assertEqual(
    'Simple text: other times',
    QuestJs._text.processText('Simple text: {once:seen first time only}{notOnce:other times}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: other times',
    QuestJs._text.processText('Simple text: {once:seen first time only}{notOnce:other times}'),
  );
  QuestJs._test.assertEqual(
    'Simple text: p2=red',
    QuestJs._text.processText('Simple text: p2={param:p2}', { p1: 'yellow', p2: 'red' }),
  );
  QuestJs._w.book.func1 = function () {
    return 'test1';
  };
  QuestJs._w.book.func2 = function (a, b) {
    return `test2(${a}, ${b})`;
  };
  QuestJs._w.book.func3 = function (a) {
    return `It is ${QuestJs._w[a].alias} reading the book.`;
  };
  QuestJs._test.assertEqual(
    'Simple text: p2=test1',
    QuestJs._text.processText('Simple text: p2={param:item:func1}', { item: 'book' }),
  );
  QuestJs._test.assertEqual(
    'Simple text: p2=test2(one, two)',
    QuestJs._text.processText('Simple text: p2={param:item:func2:one:two}', { item: 'book' }),
  );
  QuestJs._test.assertEqual(
    'Simple text: p2=It is Kyle reading the book.',
    QuestJs._text.processText('Simple text: p2={param:item:func3:char}', {
      item: 'book',
      char: 'Kyle',
    }),
  );

  QuestJs._test.title('Text processor 5');
  QuestJs._test.assertEqual(
    'Kyle is a bear.',
    QuestJs._text.processText('{nv:chr:be} a bear.', { chr: 'Kyle' }),
  );
  QuestJs._test.assertEqual(
    'Kyle is a bear.',
    QuestJs._text.processText('{nv:chr:be} a bear.', { chr: QuestJs._w.Kyle }),
  );
  QuestJs._test.assertEqual(
    'Kyle is your bear.',
    QuestJs._text.processText('{nv:Kyle:be} {pa:Buddy} bear.'),
  );
  QuestJs._test.assertEqual(
    'Kyle is her bear.',
    QuestJs._text.processText('{nv:Kyle:be} {pa:Lara} bear.'),
  );
  QuestJs._test.assertEqual(
    'There is Kyle.',
    QuestJs._text.processText('There is {nm:chr:a}.', { chr: QuestJs._w.Kyle }),
  );
  QuestJs._test.assertEqual(
    'There is a book.',
    QuestJs._text.processText('There is {nm:chr:a}.', { chr: QuestJs._w.book }),
  );
  QuestJs._test.assertEqual(
    'Kyle is here.',
    QuestJs._text.processText('{nm:chr:the:true} is here.', { chr: QuestJs._w.Kyle }),
  );
  QuestJs._test.assertEqual(
    'The book is here.',
    QuestJs._text.processText('{nm:chr:the:true} is here.', { chr: QuestJs._w.book }),
  );
  QuestJs._test.assertEqual(
    'It is your book.',
    QuestJs._text.processText('It is {nms:chr:the} book.', { chr: QuestJs._game.player }),
  );
  QuestJs._test.assertEqual(
    "It is Kyle's book.",
    QuestJs._text.processText('It is {nms:chr:the} book.', { chr: QuestJs._w.Kyle }),
  );

  QuestJs._test.title('Text processor 6');
  QuestJs._test.assertEqual(
    'Kyle is a bear.',
    QuestJs._text.processText('{Kyle.alias} is a bear.'),
  );
  QuestJs._test.assertEqual(
    'Kyle is a bear.',
    QuestJs._text.processText('{show:Kyle:alias} is a bear.'),
  );
  QuestJs._test.assertEqual(
    'Kyle is a bear.',
    QuestJs._text.processText('{Kyle:alias} is a bear.'),
  );
  QuestJs._test.assertEqual(
    'You have $10.',
    QuestJs._text.processText('You have ${show:Buddy:money}.'),
  );
  QuestJs._test.assertEqual(
    'You have $10.',
    QuestJs._text.processText('You have ${player.money}.'),
  );
  QuestJs._test.assertEqual('You have $10.', QuestJs._text.processText('You have ${Buddy.money}.'));
  QuestJs._test.assertEqual(
    'You have $10.',
    QuestJs._text.processText('You have ${player.money}.'),
  );

  QuestJs._test.title('Text processor 6');
  QuestJs._w.Kyle.colours = ['red', 'green', 'blue'];
  QuestJs._w.Kyle.colour = 1;
  QuestJs._test.assertEqual(
    'Kyle is green.',
    QuestJs._text.processText('Kyle is {select:Kyle:colours:colour}.'),
  );
  QuestJs._w.Kyle.colour = 0;
  QuestJs._test.assertEqual(
    'Kyle is red.',
    QuestJs._text.processText('Kyle is {select:Kyle:colours:colour}.'),
  );

  QuestJs._test.title('Numbers');
  QuestJs._test.assertEqual('fourteen', QuestJs._lang.toWords(14));
  QuestJs._test.assertEqual('minus four hundred and three', QuestJs._lang.toWords(-403));
  QuestJs._test.assertEqual('ninetyseven', QuestJs._lang.toWords(97));
  QuestJs._test.assertEqual('fourteenth', QuestJs._lang.toOrdinal(14));
  QuestJs._test.assertEqual('four hundred and third', QuestJs._lang.toOrdinal(403));
  QuestJs._test.assertEqual('ninetyfirst', QuestJs._lang.toOrdinal(91));
  QuestJs._test.assertEqual('get 4 sticks', QuestJs._lang.convertNumbers('get four sticks'));
  QuestJs._test.assertEqual('get 14 sticks', QuestJs._lang.convertNumbers('get fourteen sticks'));
  QuestJs._test.assertEqual('get no sticks', QuestJs._lang.convertNumbers('get no sticks'));
  QuestJs._test.assertEqual('ninetieth', QuestJs._lang.toOrdinal(90));

  QuestJs._test.title('Numbers 2');
  QuestJs._test.assertEqual('(012,34)', QuestJs._tools.displayNumber(1234, '(3,2)'));
  QuestJs._test.assertEqual('$1234', QuestJs._tools.displayMoney(1234));
  QuestJs._test.assertEqual('$-1234', QuestJs._tools.displayMoney(-1234));
  QuestJs._settings.moneyFormat = '!3.2! credits';
  QuestJs._test.assertEqual('012.34 credits', QuestJs._tools.displayMoney(1234));
  QuestJs._test.assertEqual('-012.34 credits', QuestJs._tools.displayMoney(-1234));
  QuestJs._settings.moneyFormat = '!+3.2! credits';
  QuestJs._test.assertEqual('+012.34 credits', QuestJs._tools.displayMoney(1234));
  QuestJs._test.assertEqual('-012.34 credits', QuestJs._tools.displayMoney(-1234));
  QuestJs._settings.moneyFormat = QuestJs._game.moneyformat = '!$1,2!($1,2)!';
  QuestJs._test.assertEqual('$12,34', QuestJs._tools.displayMoney(1234));
  QuestJs._test.assertEqual('($12,34)', QuestJs._tools.displayMoney(-1234));

  QuestJs._test.title('getDir');
  QuestJs._test.assertEqual('out', QuestJs._tools.getDir('o'));
  QuestJs._test.assertEqual('down', QuestJs._tools.getDir('dn'));
  QuestJs._test.assertEqual('out', QuestJs._tools.getDir('exit'));
  QuestJs._test.assertEqual(false, QuestJs._tools.getDir('bo'));

  QuestJs._test.title('date time');
  QuestJs._test.assertEqual('14 Feb 2019, 09:43', QuestJs._util.getDateTime());
  const dateTimeDict = QuestJs._util.getDateTimeDict();
  QuestJs._test.assertEqual('February', dateTimeDict.month);
  QuestJs._test.assertEqual(9, dateTimeDict.hour);
  QuestJs._test.assertEqual(
    'It is 14 Feb 2019, 09:43',
    QuestJs._text.processText('It is {dateTime}'),
  );
  QuestJs._test.assertEqual(
    '-Two-Three-',
    QuestJs._text.processText('{hour:3:8:One}-{hour:5:10:Two}-{hour:9:10:Three}-{hour:10:99:Four}'),
  );
  QuestJs._test.assertEqual(9, QuestJs._util.seconds(9));
  QuestJs._test.assertEqual(127, QuestJs._util.seconds(7, 2));
  QuestJs._test.assertEqual(127 + 3 * 3600, QuestJs._util.seconds(7, 2, 3));
  QuestJs._test.assertEqual(127 + 3 * 3600 + 2 * 24 * 3600, QuestJs._util.seconds(7, 2, 3, 2));

  QuestJs._test.assertEqual(true, QuestJs._util.isAfter('February 14, 2019 09:42:00'));
  QuestJs._test.assertEqual(false, QuestJs._util.isAfter('February 14, 2019 09:43:00'));
  QuestJs._test.assertEqual(false, QuestJs._util.isAfter('0943'));
  QuestJs._test.assertEqual(true, QuestJs._util.isAfter('0942'));

  QuestJs._test.title('errors');
  QuestJs._test.assertCmd('get sdjfghfg', "You can't see anything you might call 'sdjfghfg' here.");
  QuestJs._test.assertCmd('map', 'Sorry, no map available.');

  QuestJs._test.title('Look inside');
  QuestJs._test.assertCmd(
    'look inside cabinet',
    'Inside the glass cabinet you can see a jewellery box and an ornate doll.',
  );
  QuestJs._w.jewellery_box.closed = false;
  QuestJs._test.assertCmd(
    'look inside cabinet',
    'Inside the glass cabinet you can see a jewellery box (containing a ring) and an ornate doll.',
  );

  QuestJs._test.assertCmd('look inside box', 'Inside the cardboard box you can see nothing.');
  QuestJs._test.assertCmd('look inside boots', "There's nothing to see inside.");
  QuestJs._test.assertCmd(
    'look inside book',
    'The book has pages and pages of text, but you do not even recongise the text.',
  );

  QuestJs._test.assertCmd('smell', "You can't smell anything here.");
  QuestJs._test.assertCmd('listen', "You can't hear anything of note here.");
  QuestJs._test.assertCmd('smell knife', 'The knife has no smell.');
  QuestJs._test.assertCmd('listen to knife', 'The knife is not making any noise.');
  QuestJs._test.assertCmd('read knife', 'Nothing worth reading there.');
  QuestJs._test.assertCmd('smash knife', "The knife's not something you can break.");
  QuestJs._test.assertCmd('look out knife', 'Not something you can look out of.');
  QuestJs._test.assertCmd('switch on knife', "You can't turn it on.");
  QuestJs._test.assertCmd('switch off knife', "You can't turn it off.");
  QuestJs._test.assertCmd('exits', 'You think you can go east, south, up or west.');

  QuestJs._test.title('Drop all');
  QuestJs._test.assertCmd('drop all', 'Knife: You drop the knife.');
  QuestJs._test.assertCmd('drop all', 'Nothing there to do that with.');
  QuestJs._test.assertCmd('get knife', 'You take the knife.');

  const knifeDrop = QuestJs._w.knife.drop;
  delete QuestJs._w.knife.drop;
  QuestJs._test.assertCmd('drop knife', "You can't drop it.");
  QuestJs._w.knife.drop = knifeDrop;

  QuestJs._test.title('Simple object commands');
  QuestJs._test.assertCmd('i', 'You are carrying a knife.');
  QuestJs._test.assertCmd('get coin', 'You try to pick up the coin, but it just will not budge.');
  QuestJs._test.assertCmd('get straw boater', 'Kyle has it.');
  QuestJs._test.assertCmd('get cabinet', "You can't take it.");
  QuestJs._test.assertCmd('get the cabinet', "You can't take it.");
  QuestJs._test.assertCmd('get a cabinet', "You can't take it.");
  QuestJs._test.assertCmd('get knife', "You've got it already.");
  QuestJs._test.assertCmd('x tv', "It's just scenery.");
  QuestJs._test.assertCmd('get tv', "You can't take it.");
  QuestJs._test.assertCmd(
    'give knife to boots',
    'Realistically, the boots are not interested in anything you might give them.',
  );

  QuestJs._test.title('Simple object commands (eat)');
  QuestJs._test.assertCmd('eat knife', "The knife's not something you can eat.");
  QuestJs._test.assertEqual(['Examine', 'Take'], QuestJs._w.sandwich.getVerbs());
  QuestJs._test.assertCmd('get sandwich', 'You take the sandwich.');
  QuestJs._test.assertCmd('x sandwich', "It's just your typical, every day sandwich.");
  QuestJs._test.assertEqual(['Examine', 'Drop', 'Eat'], QuestJs._w.sandwich.getVerbs());
  QuestJs._test.assertCmd('drink sandwich', "The sandwich's not something you can drink.");
  QuestJs._test.assertCmd('ingest sandwich', ['You eat the sandwich.', 'That was great!']);

  QuestJs._test.title('Simple object commands (drink the sandwich?)');
  QuestJs._w.sandwich.loc = QuestJs._game.player.name;
  QuestJs._w.sandwich.isLiquid = true;
  QuestJs._test.assertEqual(['Examine', 'Drop', 'Drink'], QuestJs._w.sandwich.getVerbs());
  QuestJs._test.assertCmd('drink sandwich', ['You drink the sandwich.', 'That was great!']);

  QuestJs._test.title('Simple object commands (boots)');
  QuestJs._test.assertEqual(['Examine', 'Take'], QuestJs._w.boots.getVerbs());
  QuestJs._test.assertCmd('wear boots', "You don't have them.");
  QuestJs._test.assertCmd('remove boots', "You don't have them.");
  QuestJs._test.assertCmd('get boots', 'You take the boots.');
  QuestJs._test.assertEqual(['Examine', 'Drop', 'Wear'], QuestJs._w.boots.getVerbs());
  QuestJs._test.assertCmd('inv', 'You are carrying some boots and a knife.');
  QuestJs._test.assertCmd('get boots', "You've got them already.");
  QuestJs._test.assertCmd('wear boots', 'You put on the boots.');
  QuestJs._test.assertEqual(['Examine', 'Remove'], QuestJs._w.boots.getVerbs());
  QuestJs._test.assertCmd('inventory', 'You are carrying some boots (worn) and a knife.');
  QuestJs._test.assertCmd('wear boots', "You're already wearing them.");
  QuestJs._test.assertCmd('remove boots', 'You take the boots off.');
  QuestJs._test.assertEqual(['Examine', 'Drop', 'Wear'], QuestJs._w.boots.getVerbs());
  QuestJs._test.assertCmd('drop boots', 'You drop the boots.');
  QuestJs._test.assertEqual(['Examine', 'Take'], QuestJs._w.boots.getVerbs());

  QuestJs._test.title('Simple object commands (book)');
  QuestJs._test.assertEqual(['Examine', 'Take'], QuestJs._w.book.getVerbs());
  QuestJs._test.assertCmd('get the book', 'You take the book.');
  QuestJs._test.assertEqual(['Examine', 'Drop', 'Read'], QuestJs._w.book.getVerbs());
  QuestJs._test.assertCmd('wear book', "You can't wear it.");
  QuestJs._test.assertCmd('remove book', "You're not wearing it.");
  QuestJs._test.assertCmd('read the book', 'It is not in a language you understand.');
  QuestJs._test.assertCmd('give it to kyle', 'Done.');
  QuestJs._test.assertCmd('kyle, read the book', 'It is not in a language he understands.');
  QuestJs._test.assertCmd('kyle, drop book', 'Kyle drops the book.');
  QuestJs._test.assertEqual(['Examine', 'Take'], QuestJs._w.book.getVerbs());

  QuestJs._test.title('Simple object commands (container)');
  QuestJs._test.assertEqual(['Examine', 'Open'], QuestJs._w.glass_cabinet.getVerbs());
  QuestJs._test.assertEqual(['Examine', 'Take', 'Close'], QuestJs._w.cardboard_box.getVerbs());
  QuestJs._test.assertCmd('open box', 'It already is.');
  QuestJs._test.assertCmd('close box', 'You close the cardboard box.');
  QuestJs._test.assertEqual(['Examine', 'Take', 'Open'], QuestJs._w.cardboard_box.getVerbs());
  QuestJs._test.assertCmd('close box', 'It already is.');
  QuestJs._test.assertCmd('open box', 'You open the cardboard box. It is empty.');
  QuestJs._test.assertEqual(['Examine', 'Take', 'Close'], QuestJs._w.cardboard_box.getVerbs());

  QuestJs._test.title('Simple object commands (bricks)');
  QuestJs._test.assertCmd('get the bricks', 'You take seven bricks.');
  QuestJs._test.assertCmd('inv', 'You are carrying seven bricks and a knife.');
  QuestJs._test.assertCmd('drop 3 bricks', 'You drop three bricks.');
  QuestJs._test.assertCmd('inv', 'You are carrying four bricks and a knife.');
  QuestJs._test.assertCmd('drop 4 bricks', 'You drop four bricks.');
  QuestJs._test.assertCmd('inv', 'You are carrying a knife.');
  QuestJs._test.assertCmd('get 10 bricks', 'You take seven bricks.');
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The kitchen',
    'A clean room, a clock hanging on the wall. There is a sink in the corner.',
    'You can see a big kitchen table (with a jug on it), a camera and a trapdoor here.',
    'You can go north or west.',
    'A fresh smell here!',
  ]);
  QuestJs._test.assertCmd('put 2 bricks on to the table', 'Done.');
  QuestJs._test.assertCmd('inv', 'You are carrying five bricks and a knife.');
  QuestJs._test.assertCmd('look', [
    'The kitchen',
    'A clean room, a clock hanging on the wall. There is a sink in the corner.',
    'You can see a big kitchen table (with two bricks and a jug on it), a camera and a trapdoor here.',
    'You can go north or west.',
  ]);

  QuestJs._test.assertCmd('get the bricks', 'You take two bricks.');
  QuestJs._test.assertCmd('get clock', 'You take the clock.');
  QuestJs._test.assertCmd('look', [
    'The kitchen',
    'A clean room. There is a sink in the corner.',
    'You can see a big kitchen table (with a jug on it), a camera and a trapdoor here.',
    'You can go north or west.',
  ]);
  QuestJs._test.assertCmd('drop clock', 'You drop the clock.');
  QuestJs._test.assertCmd('look', [
    'The kitchen',
    'A clean room. There is a sink in the corner.',
    'You can see a big kitchen table (with a jug on it), a camera, a clock and a trapdoor here.',
    'You can go north or west.',
  ]);
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    'You can see a book, some boots, a cardboard box, a coin, a flashlight, a garage key, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll), Kyle (wearing a straw boater), a small key and a waterskin here.',
    'You can go east, south, up or west.',
  ]);

  QuestJs._test.title('Simple object commands (bricks and a box)');
  QuestJs._test.assertEqual(false, QuestJs._parser.isContained(QuestJs._w.brick));
  QuestJs._test.assertCmd('drop bricks in box', 'Done.');
  QuestJs._test.assertEqual(true, QuestJs._parser.isContained(QuestJs._w.brick));
  QuestJs._test.assertCmd('get bricks', 'You take seven bricks.');
  QuestJs._test.assertEqual(false, QuestJs._parser.isContained(QuestJs._w.brick));
  QuestJs._test.assertCmd('drop three bricks in box', 'Done.');
  QuestJs._test.assertEqual(true, QuestJs._parser.isContained(QuestJs._w.brick));
  QuestJs._test.assertCmd('drop bricks', 'You drop four bricks.');
  QuestJs._test.assertEqual(true, QuestJs._parser.isContained(QuestJs._w.brick));
  QuestJs._test.assertCmd('get bricks', 'You take four bricks.');
  QuestJs._test.assertEqual(true, QuestJs._parser.isContained(QuestJs._w.brick));
  QuestJs._test.assertCmd('get bricks', 'You take three bricks.');
  QuestJs._test.assertEqual(false, QuestJs._parser.isContained(QuestJs._w.brick));

  QuestJs._test.title('Simple object commands (bricks and a held box)');
  QuestJs._test.assertCmd('get box', 'You take the cardboard box.');
  QuestJs._test.assertCmd('drop bricks in box', 'Done.');
  QuestJs._test.assertCmd('get bricks from box', 'Done.');
  QuestJs._test.assertCmd('drop three bricks in box', 'Done.');
  QuestJs._test.assertCmd('drop bricks', 'You drop four bricks.');

  QuestJs._test.assertCmd('get bricks', 'You take four bricks.');

  QuestJs._test.assertCmd('get bricks', 'You take three bricks.');
  QuestJs._test.assertCmd('drop box', 'You drop the cardboard box.');

  QuestJs._test.title('Simple object commands (cabinet and key)');
  QuestJs._test.assertCmd('open small key', "The small key can't be opened.");
  QuestJs._test.assertCmd('close small key', "The small key can't be closed.");
  QuestJs._test.assertCmd('unlock small key', "You can't unlock it.");
  QuestJs._test.assertCmd('lock small key', "You can't lock it.");

  QuestJs._test.assertCmd('open cabinet', 'The glass cabinet is locked.');
  QuestJs._test.assertCmd('unlock cabinet', 'You do have the right key.');
  QuestJs._test.assertCmd('get small key', 'You take the small key.');
  QuestJs._test.assertEqual(true, QuestJs._w.glass_cabinet.locked);
  QuestJs._test.assertEqual(true, QuestJs._w.glass_cabinet.closed);
  QuestJs._test.assertCmd('open cabinet', [
    'You unlock the glass cabinet.',
    'You open the glass cabinet. Inside the glass cabinet you can see a jewellery box (containing a ring) and an ornate doll.',
  ]);
  QuestJs._test.assertEqual(false, QuestJs._w.glass_cabinet.locked);
  QuestJs._test.assertEqual(false, QuestJs._w.glass_cabinet.closed);
  QuestJs._test.assertCmd('open cabinet', 'It already is.');
  QuestJs._test.assertCmd('unlock cabinet', 'It already is.');
  QuestJs._test.assertCmd('lock cabinet', ['You close the glass cabinet and lock it.']);
  QuestJs._test.assertCmd('unlock cabinet', 'You unlock the glass cabinet.');
  QuestJs._test.assertCmd('put cabinet in small key', 'The small key is not a container.');

  QuestJs._test.title('Simple object commands (cabinet and box)');
  QuestJs._test.assertCmd('open cabinet', [
    'You open the glass cabinet. Inside the glass cabinet you can see a jewellery box (containing a ring) and an ornate doll.',
  ]);

  QuestJs._test.assertCmd('pick up cardboard box', 'You take the cardboard box.');
  QuestJs._test.assertCmd('pick up jewellery box', 'You take the jewellery box.');

  QuestJs._test.assertCmd('put cardboard box in jewellery box', 'Done.');
  QuestJs._test.assertCmd(
    'put jewellery box in cardboard box',
    "What? You want to put the jewellery box in the cardboard box when the cardboard box is already in the jewellery box? That's just too freaky for me.",
  );
  QuestJs._test.assertCmd('take cardboard box box from jewellery box', 'Done.');

  QuestJs._test.assertCmd('put jewellery box in cabinet', 'Done.');
  QuestJs._test.assertCmd('close cabinet', 'You close the glass cabinet.');
  QuestJs._test.assertCmd('lock cabinet', 'You lock the glass cabinet.');
  QuestJs._test.assertCmd('drop small key', 'You drop the small key.');
  QuestJs._test.assertCmd('drop box', 'You drop the cardboard box.');

  QuestJs._test.title('Restricting');
  QuestJs._test.assertEqual(['Look at', 'Talk to'], QuestJs._w.Kyle.getVerbs());
  QuestJs._game.player.canTalk = function () {
    QuestJs._io.msg('You are gagged.');
    return false;
  };
  QuestJs._test.assertCmd('talk to kyle', 'You are gagged.');
  QuestJs._game.player.canTalk = function () {
    return true;
  };
  QuestJs._game.player.canManipulate = function () {
    QuestJs._io.msg('You are handcuffed.');
    return false;
  };
  QuestJs._test.assertCmd('drop bricks', 'You are handcuffed.');
  QuestJs._game.player.canManipulate = function () {
    return true;
  };
  QuestJs._test.assertCmd('drop bricks', 'You drop seven bricks.');

  QuestJs._test.title('Wear/remove');
  QuestJs._test.assertCmd('u', [
    'You head up.',
    'The bedroom',
    'A large room, with a big bed and a wardrobe.',
    'You can see a coat, some jeans, a jumpsuit, a shirt, underwear and a wardrobe here.',
    'You can go down, in or west.',
  ]);
  QuestJs._test.assertCmd('get all', [
    "Wardrobe: You can't take it.",
    'Underwear: You take the underwear.',
    'Jeans: You take the jeans.',
    'Shirt: You take the shirt.',
    'Coat: You take the coat.',
    'Jumpsuit: You take the jumpsuit.',
  ]);
  QuestJs._test.assertCmd('wear underwear', 'You put on the underwear.');
  QuestJs._test.assertCmd('wear jeans', 'You put on the jeans.');
  QuestJs._test.assertCmd('wear shirt', 'You put on the shirt.');
  QuestJs._test.assertCmd(
    'remove underwear',
    "You can't take off your underwear whilst wearing your jeans.",
  );
  QuestJs._test.assertCmd('remove jeans', 'You take the jeans off.');
  QuestJs._test.assertCmd('remove underwear', 'You take the underwear off.');
  QuestJs._test.assertCmd('wear jumpsuit', "You can't put the jumpsuit on over your shirt.");
  QuestJs._test.assertCmd('remove shirt', 'You take the shirt off.');
  QuestJs._test.assertCmd('wear jumpsuit', 'You put on the jumpsuit.');
  QuestJs._test.assertCmd('wear coat', 'You put on the coat.');
  QuestJs._test.assertCmd('wear underwear', "You can't put the underwear on over your jumpsuit.");
  QuestJs._test.assertCmd('remove coat', 'You take the coat off.');
  QuestJs._test.assertCmd('drop all', [
    'Knife: You drop the knife.',
    'Underwear: You drop the underwear.',
    'Jeans: You drop the jeans.',
    'Shirt: You drop the shirt.',
    'Coat: You drop the coat.',
    "Jumpsuit: You're already wearing it.",
  ]);
  QuestJs._test.assertCmd('remove jumpsuit', 'You take the jumpsuit off.');
  QuestJs._test.assertCmd('get knife', 'You take the knife.');

  QuestJs._test.title('Postures');
  QuestJs._test.assertCmd('lie on bed', 'You lie down on the bed.');
  QuestJs._test.assertCmd('get off bed', 'You get off the bed.');
  QuestJs._test.assertCmd('sit on bed', 'You sit on the bed.');
  QuestJs._test.assertCmd('get off bed', 'You get off the bed.');
  QuestJs._test.assertCmd('stand on bed', "The bed's not something you can stand on.");
  QuestJs._test.assertCmd('lie on wardrobe', "The wardrobe's not something you can lie on.");
  QuestJs._test.assertCmd('sit on wardrobe', "The wardrobe's not something you can sit on.");

  QuestJs._test.title('use');
  QuestJs._test.assertCmd('use jumpsuit', 'You put on the jumpsuit.');
  QuestJs._test.assertCmd('use knife', 'No obvious way to use it.');
  QuestJs._test.assertCmd('remove jumpsuit', 'You take the jumpsuit off.');
  QuestJs._test.assertCmd('drop jumpsuit', 'You drop the jumpsuit.');

  QuestJs._test.assertEqual(['Examine', 'Sit on', 'Lie on'], QuestJs._w.bed.getVerbs());
  QuestJs._test.assertCmd('use bed', 'You lie down on the bed.');
  QuestJs._test.assertEqual(['Examine', 'Get off'], QuestJs._w.bed.getVerbs());
  QuestJs._test.assertCmd('use bed', 'You already are.');
  QuestJs._test.assertCmd('stand', 'You get off the bed.');
  QuestJs._test.assertEqual(['Examine', 'Sit on', 'Lie on'], QuestJs._w.bed.getVerbs());
  QuestJs._test.assertCmd('use bed', 'You lie down on the bed.');
  QuestJs._test.assertCmd('d', [
    'You get off the bed.',
    'You head down.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    'You can see a book, some boots, seven bricks, a cardboard box, a coin, a flashlight, a garage key, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll), Kyle (wearing a straw boater), a small key and a waterskin here.',
    'You can go east, south, up or west.',
  ]);

  QuestJs._test.title('say');
  QuestJs._test.assertCmd('say hello', [
    "You say, 'Hello.'",
    'No one seemed interested in what you say.',
  ]);
  QuestJs._w.Kyle.loc = 'dining_room';
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The dining room',
    'An old-fashioned room.',
    'You can see a brick, a chair, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll), Kyle (wearing a straw boater) and Lara here.',
    'You can go east, up or west.',
  ]);
  QuestJs._test.assertCmd('say hello', [
    "You say, 'Hello.'",
    "'Oh, hello there,' replies Lara.",
    "'Have you two met before?' asks Kyle.",
  ]);
  QuestJs._test.assertCmd('say nothing', [
    "You say, 'Nothing.'",
    "'I don't know what that means,' says Kyle. 'It's a simple yes-no question.'",
  ]);
  QuestJs._test.assertCmd('say nothing', [
    "You say, 'Nothing.'",
    "'I don't know what that means,' says Kyle. 'It's a simple yes-no question.'",
  ]);
  QuestJs._test.assertCmd('say nothing', [
    "You say, 'Nothing.'",
    "'I don't know what that means,' says Kyle. 'It's a simple yes-no question.'",
  ]);
  QuestJs._test.assertCmd('say yes', ["You say, 'Yes.'", "'Oh, cool,' says Kyle."]);
  QuestJs._test.assertCmd('say hello', [
    "You say, 'Hello.'",
    'No one seemed interested in what you say.',
  ]);

  QuestJs._test.title('ask');
  QuestJs._test.assertCmd('ask kyle about hats', [
    'You ask Kyle about hats.',
    'Kyle has no interest in that subject.',
  ]);
  QuestJs._test.assertCmd('ask kyle about garden', [
    'You ask Kyle about garden.',
    "'Needs some work,' Kyle says with a sign.",
  ]);
  QuestJs._test.assertCmd('ask kyle about garden', [
    'You ask Kyle about garden.',
    "'I'm giving up hope of it ever getting sorted,' Kyle says.",
  ]);
  QuestJs._test.assertCmd('ask kyle about garden', [
    'You ask Kyle about garden.',
    "'I'm giving up hope of it ever getting sorted,' Kyle says.",
  ]);
  QuestJs._w.garden.fixed = true;
  QuestJs._test.assertCmd('ask kyle about garden', [
    'You ask Kyle about garden.',
    "'Looks much better now,' Kyle says with a grin.",
  ]);
  QuestJs._test.assertCmd('topics', [/^Use TOPICS FOR/]);
  QuestJs._test.assertCmd('topics kyle', [
    'Some suggestions for what to ask Kyle about: Garden; House; Park.',
  ]);
  QuestJs._w.Kyle.specialFlag = true;
  QuestJs._test.assertCmd('topics kyle', [
    'Some suggestions for what to ask Kyle about: Fountain; Garden; House; Park.',
  ]);
  QuestJs._test.assertCmd('ask kyle about park', [
    'You ask Kyle about park.',
    "'Going to the park sounds like fun,' Kyle says with a grin. 'We can go on the swings!'",
  ]);
  QuestJs._test.assertCmd('topics kyle', [
    'Some suggestions for what to ask Kyle about: Fountain; Garden; House; Park; Swings.',
  ]);

  QuestJs._test.assertCmd(
    'ask chair about hats',
    "You can ask it about hats all you like, but it's not about to reply.",
  );
  QuestJs._test.assertCmd(
    'talk to chair',
    "You chat to the chair for a few moments, before releasing that it's not about to reply.",
  );

  QuestJs._w.Kyle.loc = 'lounge';

  QuestJs._test.title('NPC commands 1');
  QuestJs._test.assertCmd(
    'lara,get brick',
    "'I'm not picking up any bricks,' says Lara indignantly.",
  );
  QuestJs._test.assertCmd(
    'lara,e',
    "'I'm not going east,' says Lara indignantly. 'I don't like that room.'",
  );
  QuestJs._test.menuResponseNumber = 1;
  QuestJs._test.assertEqual(3, QuestJs._w.Lara.getTopics().length);
  QuestJs._test.assertCmd(
    'speak to lara',
    "You tell Lara she looks very attractive. 'Why thank you!' she replies, smiling at last.",
  );
  QuestJs._test.assertEqual(2, QuestJs._w.Lara.getTopics().length);
  QuestJs._test.assertCmd('lara,sit on chair', [
    'Lara sits on the chair.',
    'The chair makes a strange noise when Lara sits on it.',
  ]);
  QuestJs._test.assertCmd('lara,stand up', 'Lara gets off the chair.');
  QuestJs._test.assertCmd('lara,sit on chair', [
    'Lara sits on the chair.',
    'The chair makes a strange noise when Lara sits on it.',
  ]);

  QuestJs._test.assertCmd('l', [
    'The dining room',
    'An old-fashioned room.',
    'You can see a brick, a chair, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll) and Lara (sitting on the chair) here.',
    'You can go east, up or west.',
  ]);

  QuestJs._w.Lara.canPosture = function () {
    QuestJs._io.msg('She is turned to stone.');
    return false;
  };
  QuestJs._test.assertCmd('lara, get off chair', 'She is turned to stone.');
  QuestJs._w.Lara.canPosture = function () {
    return true;
  };
  QuestJs._test.assertCmd('lara, get off chair', 'Lara gets off the chair.');
  QuestJs._test.assertCmd('lara,sit on chair', [
    'Lara sits on the chair.',
    'The chair makes a strange noise when Lara sits on it.',
  ]);
  QuestJs._test.assertCmd('lara,e', ['Lara gets off the chair.', 'Lara heads east.']);
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    'You can see a book, some boots, seven bricks, a cardboard box, a coin, a flashlight, a garage key, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll), Kyle (wearing a straw boater), Lara, a small key and a waterskin here.',
    'You can go east, south, up or west.',
  ]);
  QuestJs._test.assertCmd('lara,get boots', 'Lara takes the boots.');
  QuestJs._test.assertCmd('lara,wear boots', "'I'm not doing that!' says Lara indignantly.");
  QuestJs._test.assertCmd('lara,drop boots', 'Lara drops the boots.');
  QuestJs._test.assertCmd('lara,QuestJs._w', 'Lara heads west.');

  QuestJs._test.title('NPC commands 2');
  QuestJs._test.assertCmd(
    'boots,get coin',
    "You can tell the boots to do what you like, but there is no way they'll do it.",
  );
  QuestJs._test.assertCmd(
    'kyle,get coin',
    'He tries to pick up the coin, but it just will not budge.',
  );
  QuestJs._test.assertCmd('kyle,get knife', "You've got it already.");
  QuestJs._test.assertCmd('kyle,get cabinet', "He can't take it.");
  QuestJs._test.assertCmd('kyle,get cover', "He can't take it; it's part of the book.");

  QuestJs._test.title('NPC commands (boots)');
  QuestJs._test.assertCmd('kyle, wear boots', "He doesn't have them.");
  QuestJs._test.assertCmd('kyle, remove boots', "He doesn't have them.");
  QuestJs._test.assertCmd('kyle, get boots', 'Kyle takes the boots.');
  QuestJs._test.assertCmd('kyle, get boots', 'Kyle has them.');
  QuestJs._test.assertCmd(
    'kyle,give boots to box',
    'Realistically, the cardboard box is not interested in anything he might give it.',
  );
  QuestJs._test.assertCmd('kyle, get boots', 'Kyle has them.');
  QuestJs._test.assertCmd('kyle, wear boots', 'Kyle puts on the boots.');
  QuestJs._test.assertCmd('kyle, wear boots', "Kyle's already wearing them.");
  QuestJs._test.assertCmd('kyle, remove boots', 'Kyle takes the boots off.');
  QuestJs._test.assertCmd('kyle, put boots in box', 'Done.');

  QuestJs._test.title('NPC commands (book)');
  QuestJs._test.assertCmd('tell kyle to get the book', 'Kyle takes the book.');
  QuestJs._test.assertCmd('tell kyle to read the book', 'It is not in a language he understands.');
  QuestJs._test.assertCmd('tell kyle to drop the book', 'Kyle drops the book.');

  QuestJs._test.title('NPC commands (torch)');
  QuestJs._test.assertCmd('kyle, get torch', 'Kyle takes the flashlight.');
  QuestJs._test.assertEqual(false, QuestJs._w.flashlight.switchedon);
  QuestJs._test.assertCmd('kyle, turn on the torch', 'Kyle switches the flashlight on.');
  QuestJs._test.assertEqual(true, QuestJs._w.flashlight.switchedon);
  QuestJs._test.assertCmd('kyle, turn the torch off', 'Kyle switches the flashlight off.');
  QuestJs._test.assertEqual(false, QuestJs._w.flashlight.switchedon);
  QuestJs._test.assertCmd('kyle, drop torch', 'Kyle drops the flashlight.');

  QuestJs._test.title('NPC commands (go)');
  QuestJs._test.assertCmd('kyle, go ne', "Kyle can't go northeast.");
  QuestJs._test.assertCmd('kyle, go e', 'Kyle heads east.');
  QuestJs._test.assertCmd('kyle, get torch', "You can't see anything you might call 'kyle' here.");
  QuestJs._test.assertCmd('get torch', 'You take the flashlight.');
  QuestJs._test.assertCmd('get garage', 'You take the garage key.');
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The kitchen',
    'A clean room. There is a sink in the corner.',
    'You can see a big kitchen table (with a jug on it), a camera, a clock, Kyle (wearing a straw boater) and a trapdoor here.',
    'You can go north or west.',
  ]);
  QuestJs._test.assertCmd('kyle,n', 'Kyle tries the door to the garage, but it is locked.');
  QuestJs._test.assertCmd('kyle,get all', [
    'Clock: Kyle takes the clock.',
    "Trapdoor: He can't take it.",
    'Camera: Kyle takes the camera.',
    "Big kitchen table: He can't take it.",
    'Jug: Kyle takes the jug.',
  ]);
  QuestJs._test.assertCmd('kyle, drop picture box', 'Kyle drops the camera.');
  QuestJs._test.assertCmd('kyle, open trapdoor', 'Kyle opens the trapdoor.');
  QuestJs._test.assertCmd('kyle, down', 'You watch Kyle disappear through the trapdoor.');

  QuestJs._test.title('The charger');
  QuestJs._test.assertCmd('open garage', [
    'You unlock the garage door.',
    'You open the garage door.',
  ]);
  QuestJs._test.assertCmd('n', [
    'The garage',
    'An empty garage.',
    /You can see/,
    'You can go south.',
  ]);
  QuestJs._test.assertCmd(
    'x charger',
    'A device bigger than a washing machine to charge a torch? It has a compartment and a button. The compartment is closed.',
  );
  QuestJs._test.assertCmd('push button', 'You push the button, but nothing happens.');
  QuestJs._test.assertCmd('put torch in compartment', 'The compartment is closed.');

  QuestJs._test.assertCmd(
    'x compartment',
    'The compartment is just the right size for the torch. It is closed.',
  );
  QuestJs._test.assertCmd('open compartment', 'You open the compartment. It is empty.');
  QuestJs._test.assertCmd(
    'x charger',
    'A device bigger than a washing machine to charge a torch? It has a compartment and a button. The compartment is empty.',
  );
  QuestJs._test.assertCmd(
    'x compartment',
    'The compartment is just the right size for the torch. It is open.',
  );
  QuestJs._test.assertCmd('put torch in compartment', 'Done.');
  QuestJs._test.assertCmd('put key in compartment', 'The compartment is full.');
  QuestJs._test.assertCmd(
    'x charger',
    'A device bigger than a washing machine to charge a torch? It has a compartment and a button. The compartment contains a flashlight.',
  );
  QuestJs._test.assertCmd('push button', 'You push the button, but nothing happens.');
  QuestJs._test.assertCmd('close compartment', 'You close the compartment.');
  QuestJs._test.assertCmd(
    'push button',
    'You push the button. There is a brief hum of power, and a flash.',
  );
  QuestJs._test.assertCmd('get torch', "You can't see anything you might call 'torch' here.");
  QuestJs._test.assertCmd(
    'open compartment',
    'You open the compartment. Inside the compartment you can see a flashlight.',
  );
  QuestJs._test.assertCmd('get torch', 'You take the flashlight.');
  QuestJs._test.assertCmd('open compartment', 'It already is.');
  QuestJs._test.assertCmd('put knife in compartment', 'Done.');
  QuestJs._test.assertCmd('close compartment', 'You close the compartment.');
  QuestJs._test.assertCmd('push button', 'There is a loud bang, and the knife is destroyed.');
  QuestJs._test.assertCmd('open compartment', 'You open the compartment. It is empty.');
  QuestJs._test.assertCmd(
    'x charger',
    'A device bigger than a washing machine to charge a torch? It has a compartment and a button. The compartment is empty.',
  );

  QuestJs._test.title('Clone');
  const count = Object.keys(QuestJs._w).length;
  const clone = QuestJs._create.cloneObject(QuestJs._w.book);
  QuestJs._test.assertEqual(count + 1, Object.keys(QuestJs._w).length);
  QuestJs._test.assertEqual(QuestJs._w.book, clone.clonePrototype);
  QuestJs._test.assertEqual(QuestJs._w.book.examine, clone.examine);
  QuestJs._test.assertEqual(['Examine', 'Take'], clone.getVerbs());
  clone.loc = QuestJs._game.player.name;
  QuestJs._test.assertEqual(['Examine', 'Drop', 'Read'], clone.getVerbs());
  clone.loc = 'lounge';
  const clone2 = QuestJs._create.cloneObject(clone);
  QuestJs._test.assertEqual(count + 2, Object.keys(QuestJs._w).length);
  QuestJs._test.assertEqual(QuestJs._w.book, clone2.clonePrototype);
  QuestJs._test.assertEqual(QuestJs._w.book.examine, clone2.examine);

  QuestJs._test.title('Save/Load 1');

  const sl1 = 'Some long string, with ~ all | sorts {} of! = stuff. In it^&*"';
  QuestJs._test.assertEqual(
    sl1,
    QuestJs._saveLoad.decodeString(QuestJs._saveLoad.encodeString(sl1)),
  );
  const sl2 = ['Some long string, ', 'with ~ all | sorts {} of! = stuff.', ' In it^&*"'];
  const sl3 = QuestJs._saveLoad.decodeArray(QuestJs._saveLoad.encodeArray(sl2));
  QuestJs._test.assertEqual(sl2[0], sl3[0]);
  QuestJs._test.assertEqual(sl2[1], sl3[1]);
  QuestJs._test.assertEqual(sl2[2], sl3[2]);

  QuestJs._test.assertEqual('tst:number:14;', QuestJs._saveLoad.encode('tst', 14));
  QuestJs._test.assertEqual('', QuestJs._saveLoad.encode('tst', false));
  QuestJs._test.assertEqual('tst:boolean:true;', QuestJs._saveLoad.encode('tst', true));
  QuestJs._test.assertEqual('tst:string:14;', QuestJs._saveLoad.encode('tst', '14'));
  QuestJs._test.assertEqual('tst:qobject:book;', QuestJs._saveLoad.encode('tst', QuestJs._w.book));
  QuestJs._test.assertEqual('tst:array:14~12;', QuestJs._saveLoad.encode('tst', ['14', '12']));
  QuestJs._test.assertEqual('tst:numberarray:14~12;', QuestJs._saveLoad.encode('tst', [14, 12]));

  QuestJs._saveLoad.decode(QuestJs._w.far_away, 'one:number:14');
  QuestJs._test.assertEqual(14, QuestJs._w.far_away.one);
  QuestJs._saveLoad.decode(QuestJs._w.far_away, 'two:string:14');
  QuestJs._test.assertEqual('14', QuestJs._w.far_away.two);
  QuestJs._saveLoad.decode(QuestJs._w.far_away, 'three:boolean:true');
  QuestJs._test.assertEqual(true, QuestJs._w.far_away.three);
  QuestJs._saveLoad.decode(QuestJs._w.far_away, 'four:qobject:book');
  QuestJs._test.assertEqual(QuestJs._w.book, QuestJs._w.far_away.four);
  QuestJs._saveLoad.decode(QuestJs._w.far_away, 'five:array:14~12');
  QuestJs._test.assertEqual('14', QuestJs._w.far_away.five[0]);
  // QuestJs._log.info(QuestJs._w.far_away.north)
  QuestJs._saveLoad.decode(QuestJs._w.far_away, 'north:exit:lounge:l:h');
  QuestJs._test.assertEqual(true, QuestJs._w.far_away.north.hidden);
  QuestJs._saveLoad.decode(QuestJs._w.far_away, 'six:numberarray:4~67~9');
  QuestJs._test.assertEqual([4, 67, 9], QuestJs._w.far_away.six);

  QuestJs._test.title('Save/Load 2');
  // Set up some changes to be saved
  QuestJs._w.boots.counter = 17;
  QuestJs._w.boots.unusualString = 'Some interesting text';
  QuestJs._w.boots.notableFlag = true;
  QuestJs._w.boots.examine = 'This will get saved';
  QuestJs._w.boots.sizes = [4, 5, 8];
  clone.cloneCounter = 29;
  QuestJs._w.far_away.north.hidden = false;
  QuestJs._w.far_away.north.locked = false;
  const agendaCount = QuestJs._w.Arthur.agenda.length;
  QuestJs._test.assertEqual(0, QuestJs._w.Arthur.followers.length);
  const s = QuestJs._saveLoad.saveTheWorld('Comment!!!');
  // Now change them again, these changes should get over-written
  QuestJs._w.boots.counter = 42;
  QuestJs._w.boots.unusualString = 'Some boring text';
  QuestJs._w.boots.notableFlag = false;
  QuestJs._w.boots.examine = 'This will not remain';
  const clone3 = QuestJs._create.cloneObject(clone); // should not be there later
  QuestJs._w.far_away.north.locked = true;
  QuestJs._saveLoad.loadTheWorld(s, 4);
  QuestJs._test.assertEqual(count + 2, Object.keys(QuestJs._w).length);
  QuestJs._test.assertEqual(17, QuestJs._w.boots.counter);
  QuestJs._test.assertEqual([4, 5, 8], QuestJs._w.boots.sizes);
  QuestJs._test.assertEqual('Some interesting text', QuestJs._w.boots.unusualString);
  QuestJs._test.assertEqual(true, QuestJs._w.boots.notableFlag);
  QuestJs._test.assertEqual('This will get saved', QuestJs._w.boots.examine);
  QuestJs._test.assertEqual(agendaCount, QuestJs._w.Arthur.agenda.length);
  QuestJs._test.assertEqual(0, QuestJs._w.Arthur.followers.length);
  QuestJs._test.assertEqual(29, QuestJs._w[clone.name].cloneCounter);
  QuestJs._test.assertEqual(false, QuestJs._w.far_away.north.locked);
  QuestJs._test.assertEqual(false, QuestJs._w.far_away.north.hidden);

  QuestJs._test.title('Path finding');
  QuestJs._test.assertEqual(
    'lounge',
    QuestJs._tools.formatList(
      QuestJs._npc.agenda.findPath(QuestJs._w.dining_room, QuestJs._w.lounge),
    ),
  );
  QuestJs._test.assertEqual(
    '',
    QuestJs._tools.formatList(
      QuestJs._npc.agenda.findPath(QuestJs._w.dining_room, QuestJs._w.dining_room),
    ),
  );
  QuestJs._test.assertEqual(
    false,
    QuestJs._npc.agenda.findPath(QuestJs._w.dining_room, QuestJs._w.far_away),
  );
  QuestJs._test.assertEqual(
    'conservatory, dining room, lounge',
    QuestJs._tools.formatList(
      QuestJs._npc.agenda.findPath(QuestJs._w.garden, QuestJs._w.dining_room),
    ),
  );
  QuestJs._test.assertEqual(null, QuestJs._w.dining_room.findExit(QuestJs._w.far_away));
  QuestJs._test.assertEqual('east', QuestJs._w.dining_room.findExit(QuestJs._w.lounge).dir);
  QuestJs._test.assertCmd('s', [
    'The kitchen',
    'A clean room. There is a sink in the corner.',
    /You can see/,
    'You can go down, north or west.',
  ]);
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    /^You can see/,
    'You can go east, south, up or west.',
  ]);
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The conservatory',
    'A light airy room.',
    /You can see/,
    'You can go north or west.',
  ]);
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The garden',
    'Very overgrown. The garden opens onto a road to the west, whilst the conservatory is east. There is a hook on the wall.',
    'You can see Arthur here.',
    'You can go east or west.',
  ]);

  QuestJs._test.title('Agendas');
  QuestJs._test.assertCmd('talk to arthur', [
    "'Hey, wake up,' you say to Arthur.",
    "'What?' he says, opening his eyes. 'Oh, it's you.'",
  ]);
  QuestJs._test.assertCmd('talk to arthur', [
    "'Hey, wake up,' you say to Arthur.",
    "'I am awake!'",
  ]);
  QuestJs._test.assertCmd('talk to arthur', ["'Hey, wake up,' you say to Arthur."]);
  QuestJs._test.assertCmd('talk to arthur', ["'Hey, wake up,' you say to Arthur.", "'Stop it!'"]);
  QuestJs._test.assertCmd('talk to arthur', ["'Hey, wake up,' you say to Arthur.", "'Stop it!'"]);
  QuestJs._test.assertEqual(0, QuestJs._w.Arthur.followers.length);
  QuestJs._test.assertCmd('z', ['You wait one turn.', 'Arthur stands up and stretches.']);
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The conservatory',
    'A light airy room.',
    /You can see/,
    'You can go north or west.',
  ]);
  QuestJs._test.assertEqual(0, QuestJs._w.Arthur.followers.length);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    'Arthur enters the conservatory from the west.',
  ]);
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    /^You can see/,
    'You can go east, south, up or west.',
    'Arthur enters the lounge from the south.',
  ]);
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The dining room',
    'An old-fashioned room.',
    /^You can see/,
    'You can go east, up or west.',
    'Arthur enters the dining room from the east.',
    "'Hi, Lara,' says Arthur. 'Come look at the garden.'",
  ]);
  QuestJs._test.assertEqual(0, QuestJs._w.Arthur.followers.length);
  QuestJs._test.assertCmd('z', ['You wait one turn.', "'Sure,' says Lara."]);
  QuestJs._test.assertEqual(1, QuestJs._w.Arthur.followers.length);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    'Arthur and Lara leave the dining room, heading east.',
  ]);
  QuestJs._test.assertCmd('z', ['You wait one turn.']);
  QuestJs._test.assertCmd('z', [
    'You wait one turn.',
    'Through the window you can see Arthur and Lara enter the garden from the east.',
    'Through the window you see Arthur say something to Lara.',
  ]);

  QuestJs._test.title('Transit');
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The lift',
    'A curious lift.',
    'You can go east.',
  ]);
  QuestJs._test.assertCmd('push button: g', ["You're already there mate!"]);
  QuestJs._test.assertCmd('push 1', [
    'You press the button; the door closes and the lift heads to the first floor. The door opens again.',
  ]);
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The bedroom',
    'A large room, with a big bed and a wardrobe.',
    'You can see a coat, some jeans, a jumpsuit, a shirt, underwear and a wardrobe here.',
    'You can go down, in or west.',
  ]);
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The lift',
    'A curious lift.',
    'You can go east.',
  ]);
  QuestJs._w.lift.onTransitMove = function (toLoc, fromLoc) {
    QuestJs._io.msg(`MOVING to ${toLoc} from ${fromLoc}`);
  };
  QuestJs._test.assertCmd('push 1', ['You press the button; nothing happens.']);
  QuestJs._test.assertCmd('push 2', ['That does nothing, the button does not work.']);
  QuestJs._test.assertCmd('push g', [
    'The old man presses the button....',
    'MOVING to dining_room from bedroom',
  ]);
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The dining room',
    'An old-fashioned room.',
    /^You can see/,
    'You can go east, up or west.',
  ]);
  QuestJs._w.lift.transitCheck = function () {
    QuestJs._io.msg('The lift is out of order');
    return false;
  };
  QuestJs._w.lift.transitAutoMove = true;
  QuestJs._w.lift.afterEnter = QuestJs._w.lift.transitOfferMenu;
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The lift',
    'A curious lift.',
    'You can go east.',
    'The lift is out of order',
    'The dining room',
    'An old-fashioned room.',
    'You can see a brick, a chair and a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll) here.',
    'You can go east, up or west.',
  ]);

  QuestJs._test.title('Push');
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    'You can see a book, a book, a book, seven bricks, a cardboard box (containing some boots), a coin, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll), a small key and a waterskin here.',
    'You can go east, south, up or west.',
  ]);
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The conservatory',
    'A light airy room.',
    'You can see a broken chair, a crate and a rope here.',
    'You can go north or west.',
  ]);
  QuestJs._test.assertCmd('push crate', "That's not going to do anything useful.");
  QuestJs._test.assertCmd('push chair s', "It's not something you can move around like that.");
  QuestJs._w.broken_chair.shift = function () {
    QuestJs._io.msg('You try to push chair, but it just breaks even more.');
    return false;
  };
  QuestJs._w.broken_chair.shiftable = true;
  QuestJs._test.assertCmd(
    'push chair QuestJs._w',
    'You try to push chair, but it just breaks even more.',
  );
  QuestJs._test.assertCmd('push crate s', "You can't go south.");
  QuestJs._test.assertCmd('push crate QuestJs._w', 'You push the crate west.');

  QuestJs._test.title('ensemble');
  QuestJs._world.setRoom(QuestJs._game.player, 'wardrobe', 'suppress');
  QuestJs._test.assertCmd('l', [
    'The wardrobe',
    'Oddly empty of fantasy worlds.',
    'You can see a suit here.',
    'You can go out.',
  ]);
  QuestJs._test.assertCmd('get trousers', ['You take the suit trousers.']);
  QuestJs._test.assertCmd('l', [
    'The wardrobe',
    'Oddly empty of fantasy worlds.',
    'You can see a jacket and a waistcoat here.',
    'You can go out.',
  ]);
  QuestJs._test.assertCmd('i', [
    'You are carrying a flashlight, a garage key and some suit trousers.',
  ]);
  QuestJs._test.assertCmd('get jacket, waistcoat', [
    'Jacket: You take the jacket.',
    'Waistcoat: You take the waistcoat.',
  ]);
  QuestJs._test.assertCmd('i', ['You are carrying a flashlight, a garage key and a suit.']);
  QuestJs._test.assertCmd('drop suit', ['You drop the suit.']);
  QuestJs._test.assertCmd('get suit', ['You take the suit.']);
  QuestJs._test.assertCmd('wear xyz', [
    'Individual parts of an ensemble must be worn and removed separately.',
  ]);
  QuestJs._test.assertCmd('wear trousers', ['You put on the suit trousers.']);
  QuestJs._test.assertCmd('i', [
    'You are carrying a flashlight, a garage key, a jacket, some suit trousers (worn) and a waistcoat.',
  ]);
  QuestJs._test.assertCmd('wear jacket', ['You put on the jacket.']);
  QuestJs._test.assertCmd('wear waistcoat', ["You can't put the waistcoat on over your jacket."]);
  QuestJs._test.assertCmd('doff jacket', ['You take the jacket off.']);
  QuestJs._test.assertCmd('wear waistcoat', ['You put on the waistcoat.']);
  QuestJs._test.assertCmd('wear jacket', ['You put on the jacket.']);
  QuestJs._test.assertCmd('i', ['You are carrying a flashlight, a garage key and a suit (worn).']);

  QuestJs._test.title('pre-rope');
  QuestJs._test.assertCmd('o', [
    'You head out.',
    'The bedroom',
    'A large room, with a big bed and a wardrobe.',
    'You can see a coat, some jeans, a jumpsuit, a shirt, underwear and a wardrobe here.',
    'You can go down, in or west.',
  ]);
  QuestJs._test.assertCmd('d', [
    'You head down.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    'You can see a book, a book, a book, seven bricks, a cardboard box (containing some boots), a coin, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll), a small key and a waterskin here.',
    'You can go east, south, up or west.',
  ]);
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The conservatory',
    'A light airy room.',
    'You can see a broken chair and a rope here.',
    'You can go north or west.',
  ]);

  QuestJs._test.title('rope - room one');
  QuestJs._test.assertEqual(['conservatory'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd('get rope', ['You take the rope.']);
  QuestJs._test.assertEqual(['Buddy'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd('x rope', ["The rope is about 40' long."]);
  QuestJs._test.assertCmd('tie rope to chair', ['You tie the rope to the broken chair.']);
  QuestJs._test.assertEqual(['conservatory', 'Buddy'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd('x rope', [
    "The rope is about 40' long. One end is tied to the broken chair. The other end is held by you.",
  ]);

  QuestJs._test.assertCmd('tie rope to chair', ['It already is.']);
  QuestJs._test.assertCmd('untie rope from chair', ['You untie the rope from the broken chair.']);
  QuestJs._test.assertCmd('untie rope from chair', ['The rope is not tied to the broken chair.']);
  QuestJs._test.assertEqual(['Buddy'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd('tie rope to chair', ['You tie the rope to the broken chair.']);
  QuestJs._test.assertEqual(['conservatory', 'Buddy'], QuestJs._w.rope.locs);

  QuestJs._test.title('rope - room two');
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The garden',
    'Very overgrown. The garden opens onto a road to the west, whilst the conservatory is east. There is a hook on the wall.',
    'You can see Arthur, a crate and Lara here.',
    'You can go east or west.',
  ]);
  QuestJs._test.assertEqual(['conservatory', 'garden', 'Buddy'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd('tie rope to crate', ['That is not something you can tie the rope to.']);
  QuestJs._test.assertCmd('untie rope from crate', ['The rope is not tied to the crate.']);

  QuestJs._test.assertCmd('tie rope to hook', ['You tie the rope to the hook.']);
  QuestJs._test.assertEqual(['conservatory', 'garden'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd(
    'x rope',
    [
      "The rope is about 40' long. One end heads into the conservatory. The other end is tied to the hook.",
    ],
    true,
  );
  QuestJs._test.assertCmd('get rope', ['It is tied up at both ends.']);

  QuestJs._test.title('rope - room one again');
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The conservatory',
    'A light airy room.',
    'You can see a broken chair and a rope here.',
    'You can go north or west.',
  ]);
  QuestJs._test.assertEqual(['conservatory', 'garden'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd('x rope', [
    "The rope is about 40' long. One end is tied to the broken chair. The other end heads into the garden.",
  ]);

  QuestJs._test.assertCmd('untie rope from chair', ['You untie the rope from the broken chair.']);
  QuestJs._test.assertCmd('x rope', [
    "The rope is about 40' long. One end is held by you. The other end heads into the garden.",
  ]);
  QuestJs._test.assertEqual(['Buddy', 'conservatory', 'garden'], QuestJs._w.rope.locs);

  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The lounge',
    'A smelly room with an old settee and a tv.',
    'You can see a book, a book, a book, seven bricks, a cardboard box (containing some boots), a coin, a glass cabinet (containing a jewellery box (containing a ring) and an ornate doll), a small key and a waterskin here.',
    'You can go east, south, up or west.',
  ]);

  QuestJs._test.assertCmd('e', ['The rope is not long enough, you cannot go any further.']);

  QuestJs._test.assertCmd('i', [
    'You are carrying a flashlight, a garage key, a rope and a suit (worn).',
  ]);
  QuestJs._test.assertCmd('x rope', [
    "The rope is about 40' long. One end is held by you. The other end heads into the conservatory.",
  ]);
  QuestJs._test.assertEqual(['Buddy', 'lounge', 'conservatory', 'garden'], QuestJs._w.rope.locs);

  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The conservatory',
    'A light airy room.',
    'You can see a broken chair and a rope here.',
    'You can go north or west.',
  ]);
  QuestJs._test.assertCmd('x rope', [
    "The rope is about 40' long. One end is held by you. The other end heads into the garden.",
  ]);
  QuestJs._test.assertEqual(['Buddy', 'conservatory', 'garden'], QuestJs._w.rope.locs);

  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The garden',
    'Very overgrown. The garden opens onto a road to the west, whilst the conservatory is east. There is a hook on the wall.',
    'You can see Arthur, a crate, Lara and a rope here.',
    'You can go east or west.',
  ]);
  QuestJs._test.assertEqual(['Buddy', 'garden'], QuestJs._w.rope.locs);
  QuestJs._test.assertCmd('untie rope', ['You untie the rope from the hook.']);
  QuestJs._test.assertEqual(['Buddy'], QuestJs._w.rope.locs);

  QuestJs._test.assertCmd('drop rope', ['You drop the rope.']);

  QuestJs._test.title('Get all (nothing)');
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The road',
    'A road heading west over a bridge. You can see a shop to the north.',
    'You can go east, north or west.',
  ]);
  QuestJs._test.assertCmd('get all', 'Nothing there to do that with.');

  QuestJs._w.Buddy.money = 20;

  QuestJs._test.title('shop - text processor');
  QuestJs._test.assertCmd('buy', ['Nothing for sale here.']);

  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The shop',
    'A funny little shop.',
    'You can go south.',
  ]);
  QuestJs._test.assertEqual(
    'The carrot is $0,02',
    QuestJs._text.processText('The carrot is {money:carrot}'),
  );
  QuestJs._test.assertEqual(
    'The carrot is $0,02',
    QuestJs._text.processText('The carrot is {$:carrot}'),
  );
  QuestJs._test.assertEqual('You see $0,12', QuestJs._text.processText('You see {$:12}'));
  QuestJs._test.assertEqual(
    'The carrot is $0,02',
    QuestJs._text.processText('{nm:item:the:true} is {$:carrot}', { item: QuestJs._w.carrot }),
  );
  QuestJs._test.assertEqual(
    'The carrot is $0,02',
    QuestJs._text.processText('{nm:item:the:true} is {$:carrot}', { item: 'carrot' }),
  );

  QuestJs._test.title('shop - buy');
  QuestJs._test.assertEqual(true, QuestJs._parser.isForSale(QuestJs._w.carrot));
  QuestJs._test.assertEqual(true, QuestJs._parser.isForSale(QuestJs._w.trophy));
  QuestJs._test.assertEqual(undefined, QuestJs._parser.isForSale(QuestJs._w.flashlight));
  QuestJs._test.assertCmd('buy carrot', ['You buy the carrot for $0,02.']);

  QuestJs._test.assertEqual(false, QuestJs._parser.isForSale(QuestJs._w.carrot0));
  QuestJs._test.assertEqual(false, QuestJs._w.carrot0.isForSale(QuestJs._game.player.loc));
  QuestJs._test.assertCmd('buy carrot', ['You buy the carrot for $0,02.']);
  QuestJs._test.assertEqual(16, QuestJs._w.Buddy.money);
  QuestJs._test.assertCmd('buy flashlight', ["You can't buy the flashlight here."]);
  QuestJs._test.assertCmd('buy trophy', ['You buy the trophy for $0,15.']);
  QuestJs._test.assertEqual(1, QuestJs._w.Buddy.money);
  QuestJs._test.assertEqual(true, QuestJs._parser.isForSale(QuestJs._w.carrot));
  // QuestJs._log.info(" -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1");
  QuestJs._test.assertEqual(false, QuestJs._parser.isForSale(QuestJs._w.trophy));
  QuestJs._test.assertCmd('buy trophy', [
    "You can't buy the trophy here - probably because you are already holding it.",
  ]);
  QuestJs._test.assertCmd('buy carrot', ["You can't afford the carrot (need $0,02)."]);
  QuestJs._test.assertEqual(1, QuestJs._w.Buddy.money);

  delete QuestJs._w.carrot0.loc;

  QuestJs._test.title('shop - sell');
  QuestJs._test.assertCmd('sell carrot', ["You can't sell the carrot here."]);
  QuestJs._test.assertEqual(1, QuestJs._w.Buddy.money);
  QuestJs._test.assertCmd('sell trophy', ['You sell the trophy for $0,08.']);
  QuestJs._test.assertEqual(9, QuestJs._w.Buddy.money);

  QuestJs._test.assertCmd('sell trophy', ["You don't have it."]);
  QuestJs._test.assertEqual(9, QuestJs._w.Buddy.money);
  QuestJs._w.Buddy.money = 20;
  QuestJs._w.shop.sellingDiscount = 20;
  QuestJs._test.assertEqual(12, QuestJs._w.trophy.getBuyingPrice(QuestJs._w.Buddy));

  QuestJs._test.assertCmd('buy trophy', ['You buy the trophy for $0,12.']);
  QuestJs._test.assertEqual(8, QuestJs._w.Buddy.money);
  QuestJs._w.shop.buyingValue = 80;
  QuestJs._test.assertCmd('sell trophy', ['You sell the trophy for $0,12.']);
  QuestJs._test.assertEqual(20, QuestJs._w.Buddy.money);

  QuestJs._test.title('the zone - visible barrier and simple exit');
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The road',
    'A road heading west over a bridge. You can see a shop to the north.',
    'You can go east, north or west.',
  ]);
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The bridge',
    'From the bridge you can just how deep the canyon is.',
    'You can see a Piggy-suu here.',
    'You can go east or west.',
  ]);
  // Takes us to 5,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road heading west through a desert, and east over a bridge. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can go east, north, northeast, northwest, southwest or west.',
  ]);
  // Takes us to 4,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road running east to west through a desert. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can go east, north, northeast, northwest, south, southwest or west.',
  ]);

  QuestJs._test.assertCmd('drop carrot', ['You drop the carrot.']);
  QuestJs._test.assertCmd('look', [
    'The desert',
    'You are stood on a road running east to west through a desert. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can see a carrot here.',
    'You can go east, north, northeast, northwest, south, southwest or west.',
  ]);

  // Takes us to 4,-1
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The desert',
    'You are stood in the desert, south of the road. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can go north, northeast, northwest, southwest or west.',
  ]);
  QuestJs._test.assertCmd('s', ["You can't go south."]);
  // Takes us to 4,0
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood on a road running east to west through a desert. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can see a carrot here.',
    'You can go east, north, northeast, northwest, south, southwest or west.',
  ]);
  // Takes us to 5,0
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The desert',
    'You are stood on a road heading west through a desert, and east over a bridge. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can go east, north, northeast, northwest, southwest or west.',
  ]);
  QuestJs._test.assertCmd('e', [
    'You start across the bridge.',
    'The bridge',
    'From the bridge you can just how deep the canyon is.',
    'You can see a Piggy-suu here.',
    'You can go east or west.',
  ]);
  // Takes us to 5,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road heading west through a desert, and east over a bridge. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can go east, north, northeast, northwest, southwest or west.',
  ]);

  QuestJs._test.title('the zone - features');
  // 1. Takes us to 4,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road running east to west through a desert. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can see a carrot here.',
    'You can go east, north, northeast, northwest, south, southwest or west.',
  ]);
  // 2. Takes us to 3,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road running east to west through a desert. There is a big cactus to the southwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 3. Takes us to 1,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road running east to west through a desert. There is a big cactus to the southwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 4. Takes us to 1,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road running east to west through a desert. There is a big cactus to the south. There is a tower to the northwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 5. Takes us to 1,1
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood in the desert, north of the road. There is a big cactus to the south. There is a tower to the northwest.',
    'You can see a silver coin here.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 6. Takes us to 1,2
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the northwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 7. Takes us to 1,3
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the west.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 8. Takes us to 1,4
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the southwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 9. Takes us to 1,5
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the southwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  // 10. Takes us to 1,6
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the southwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);

  QuestJs._test.title('the zone - invisible border');
  QuestJs._test.assertCmd('x barrier', ["You can't see anything you might call 'barrier' here."]);
  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The desert',
    'You are stood in the desert, north of the road. The air seems to kind of shimmer.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  QuestJs._test.assertCmd('n', ['You try to head north, but hit an invisible barrier.']);
  QuestJs._test.assertCmd('x barrier', ['It is invisible!']);

  QuestJs._test.title('the zone - exits again');
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood in the desert, north of the road. The air seems to kind of shimmer.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the south.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the southwest.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  QuestJs._test.assertCmd('sw', [
    'You head southwest.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tower to the south.',
    'You can go east, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The desert',
    'You are stood in the desert, north of the road. There is a tall stone tower here.',
    'You can go east, in, north, northeast, northwest, south, southeast, southwest or west.',
  ]);
  QuestJs._test.assertCmd('in', [
    'You step inside the tower, and climb the step, spiral staircase to the top.',
    'Inside the tower',
    'A tower, looking out over the desert. To the south is the road, heading east back to your house. To the north is a magic portal, going who knows where.',
    'You can go down or north.',
  ]);

  QuestJs._test.assertCmd('n', [
    'You head north.',
    'The shop',
    'A funny little shop.',
    'You can go south.',
  ]);
  QuestJs._test.assertCmd('s', [
    'You head south.',
    'The road',
    'A road heading west over a bridge. You can see a shop to the north.',
    'You can go east, north or west.',
  ]);
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The bridge',
    'From the bridge you can just how deep the canyon is.',
    'You can see a Piggy-suu here.',
    'You can go east or west.',
  ]);
  // Takes us to 5,0
  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road heading west through a desert, and east over a bridge. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can go east, north, northeast, northwest, southwest or west.',
  ]);

  QuestJs._test.assertCmd('QuestJs._w', [
    'You head west.',
    'The desert',
    'You are stood on a road running east to west through a desert. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can see a carrot here.',
    'You can go east, north, northeast, northwest, south, southwest or west.',
  ]);

  QuestJs._test.assertCmd('get carrot', ['You take the carrot.']);

  QuestJs._test.title('changing POV prep');
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The desert',
    'You are stood on a road heading west through a desert, and east over a bridge. There is a deep canyon southeast of you, running from the southwest to the northeast.',
    'You can go east, north, northeast, northwest, southwest or west.',
  ]);
  QuestJs._test.assertCmd('e', [
    'You start across the bridge.',
    'The bridge',
    'From the bridge you can just how deep the canyon is.',
    'You can see a Piggy-suu here.',
    'You can go east or west.',
  ]);
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The road',
    'A road heading west over a bridge. You can see a shop to the north.',
    'You can go east, north or west.',
  ]);
  QuestJs._test.assertCmd('drop carrot', ['You drop the carrot.']);

  QuestJs._test.title('changing POV');
  QuestJs._util.changePOV(QuestJs._w.piggy_suu);
  QuestJs._test.assertCmd('l', [
    'The bridge',
    'From the bridge you can just how deep the canyon is.',
    'You can go east or west.',
  ]);
  QuestJs._test.assertCmd('e', [
    'You head east.',
    'The road',
    'A road heading west over a bridge. You can see a shop to the north.',
    'You can see Buddy (holding a flashlight and a garage key; wearing a suit) and a carrot here.',
    'You can go east, north or west.',
  ]);

  QuestJs._test.title('agenda follower');
  QuestJs._w.timetable.setAgenda([
    'wait',
    'run:script',
    'wait:2',
    'run:script:2',
    'waitFor:check',
    'run:script:3',
    'waitFor:check:script:5',
  ]);
  QuestJs._test.assertEqual(0, QuestJs._w.timetable.counter);
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(0, QuestJs._w.timetable.counter);
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(1, QuestJs._w.timetable.counter);

  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(1, QuestJs._w.timetable.counter);
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(3, QuestJs._w.timetable.counter);

  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(3, QuestJs._w.timetable.counter);
  QuestJs._w.timetable.flag = true;
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._w.timetable.flag = false;
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(6, QuestJs._w.timetable.counter);

  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(6, QuestJs._w.timetable.counter);
  QuestJs._w.timetable.flag = true;
  QuestJs._test.assertCmd('wait', 'You wait one turn.');
  QuestJs._test.assertEqual(11, QuestJs._w.timetable.counter);

  /*
  QuestJs._test.title("quests")
  QuestJs._test.assertCmd("talk to buddy", ["'Hey, Buddy,' you say.", "'Hey yourself! Say, could you get me a carrot?'","Quest started: <i>A carrot for Buddy</i>", "Go find a carrot."])
  let res = quest.getState('A carrot for Buddy', QuestJs._w.Buddy)
  QuestJs._test.assertEqual(0, res.progress)
  QuestJs._test.assertEqual(quest.ACTIVE, res.state)






  /*

  QuestJs._test.title("vessels and liquids");
  QuestJs._game.player.loc = "kitchen"
  QuestJs._w.jug.loc = "big_kitchen_table"
  QuestJs._game.update();
  QuestJs._test.assertCmd("get jug", ["You take the jug."]);
  QuestJs._test.assertCmd("fill jug with tears", ["You can't see anything you might call 'tears' here."]);
  QuestJs._test.assertCmd("fill jug with honey", ["There's no honey here."]);
  QuestJs._test.assertCmd("fill jug with water", ["You fill the jug."]);
  QuestJs._test.assertCmd("fill jug with water", ["It already is."]);
  QuestJs._test.assertCmd("fill jug with lemonade", ["It's not something you can mix liquids in."]);





  /* */
  this.check_lang = true;
  if (this.check_lang) {
    const langSkips = [
      /regex/,
      /prefix/i,
      /script/i,
      /rope_/, // rope ones are combined so this system does not find them anyway
      /sl_dir_headings/,
      /sl_dir_msg/,
      /sl_no_filename/,
      /spoken_on/,
      /spoken_off/,
      /mode_brief/,
      /mode_terse/,
      /mode_verbose/,
      /mode_silent_on/,
      /mode_silent_off/,
      /undo_disabled/,
      /undo_not_available/,
      /undo_done/,
      /again_not_available/,
      /scores_not_implemented/,
      /restart_no/,
      /restart_are_you_sure/,
      /betaTestIntro/,
      /game_over_html/,
      /list_and/,
      /list_nothing/,
      /list_or/,
      /list_nowhere/,
      /never_mind/,
      /click_to_continue/,
      /buy/,
      /buy_headings/,
      /current_money/,
      /yesNo/,
      /pronouns/,
      /verbs/,
      /invModifiers/,
      /exit_list/,
      /numberUnits/,
      /numberTens/,
      /ordinalReplacements/,
      /conjugations/,
      /contentsForData/,
      /addDefiniteArticle/,
      /addIndefiniteArticle/,
      /getName/,
      /toWords/,
      /toOrdinal/,
      /convertNumbers/,
      /conjugate/,
      /pronounVerb/,
      /pronounVerbForGroup/,
      /verbPronoun/,
      /nounVerb/,
      /verbNoun/,
    ];
    let countOutstanding = 0;
    let countDone = 0;
    QuestJs._log.info(QuestJs._tp.usedStrings.length);
    for (const el in QuestJs._lang) {
      if (typeof el !== 'string') continue;
      if (langSkips.find((e) => el.match(e))) continue;
      if (QuestJs._tp.usedStrings.includes(QuestJs._lang[el])) {
        countDone += 1;
        continue;
      }
      QuestJs._log.info(el);
      countOutstanding += 1;
    }
    QuestJs._log.info(`${countOutstanding}/${countOutstanding + countDone}`);
  }
};
