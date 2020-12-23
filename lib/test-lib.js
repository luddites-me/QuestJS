// This is not language neutral, but should not be shipping with the game, so tough

// Note that the test object was defined in QuestJs._util.js

QuestJs._test.runTests = function () {
  const time = parseInt(Date.now());
  QuestJs._test.tests();
  QuestJs._test.results(time);
};

QuestJs._test.testOutput = [];
QuestJs._test.totalCount = 0;
QuestJs._test.failCount = 0;
QuestJs._test.subCount = 0;
QuestJs._test.currentTitle = 'Not specified';

QuestJs._test.title = function (title) {
  QuestJs._test.subCount = 0;
  QuestJs._test.currentTitle = title;
};

QuestJs._test.printTitle = function () {
  QuestJs._io.debugmsg(
    QuestJs._test.currentTitle + ': Error (test ' + QuestJs._test.subCount + ')',
  );
  QuestJs._test.failCount += 1;
};

QuestJs._test.assertCmd = function (cmdStr, expected, extraOutput) {
  QuestJs._test.totalCount += 1;
  QuestJs._test.subCount += 1;
  if (expected.constructor !== Array) {
    expected = [expected];
  }
  QuestJs._test.testing = true;
  QuestJs._test.testOutput = [];
  QuestJs._parser.parse(cmdStr);
  //QuestJs._world.endTurn();
  QuestJs._test.testing = false;

  if (
    QuestJs._test.testOutput.length === expected.length &&
    QuestJs._test.testOutput.every(function (value, index) {
      if (typeof expected[index] === 'string') {
        return value === expected[index];
      } else {
        return expected[index].test(value);
      }
    })
  ) {
    //QuestJs._io.debugmsg(".");
  } else {
    QuestJs._test.printTitle();
    for (let i = 0; i < Math.max(QuestJs._test.testOutput.length, expected.length); i += 1) {
      if (typeof expected[i] === 'string') {
        if (expected[i] !== QuestJs._test.testOutput[i]) {
          QuestJs._io.debugmsg('Expected (A): ' + expected[i]);
          QuestJs._io.debugmsg('...Found (A): ' + QuestJs._test.testOutput[i]);
          if (extraOutput) {
            if (
              typeof expected[i] === 'string' &&
              typeof QuestJs._test.testOutput[i] === 'string'
            ) {
              for (let j = 0; j < expected[i].length; j += 1) {
                if (expected[i][j] !== QuestJs._test.testOutput[i][j]) {
                  QuestJs._log.info('Mismatch at position: ' + j);
                  QuestJs._log.info('Expected: ' + expected[i].charCodeAt(j));
                  QuestJs._log.info('Found: ' + QuestJs._test.testOutput[i].charCodeAt(j));
                }
              }
            } else {
              QuestJs._log.info('Found: type mismatch');
              QuestJs._log.info(typeof expected[i]);
              QuestJs._log.info(typeof QuestJs._test.testOutput[i]);
            }
          }
        }
      } else if (expected[i] instanceof RegExp) {
        if (
          QuestJs._test.testOutput[i] === undefined ||
          !expected[i].test(QuestJs._test.testOutput[i])
        ) {
          QuestJs._io.debugmsg('Expected: ' + expected[i]);
          QuestJs._io.debugmsg('...Found: ' + QuestJs._test.testOutput[i]);
        }
      } else if (expected[i] === undefined) {
        QuestJs._io.debugmsg('Expected nothing');
        QuestJs._io.debugmsg('...Found: ' + QuestJs._test.testOutput[i]);
      } else {
        QuestJs._io.debugmsg(
          'Found an unrecognised type for expected (should be string or regex): ' +
            typeof expected[i],
        );
      }
    }
  }
};

QuestJs._test.assertEqual = function (expected, found, extraOutput) {
  QuestJs._test.totalCount += 1;
  QuestJs._test.subCount += 1;

  if (Array.isArray(expected)) {
    if (!QuestJs._array.compare(expected, found)) {
      QuestJs._test.printTitle();
      QuestJs._io.debugmsg('Expected (A): ' + expected);
      QuestJs._io.debugmsg('...Found (A): ' + found);
    }
  } else if (expected === found) {
    //QuestJs._io.debugmsg(".");
  } else {
    QuestJs._test.printTitle();
    QuestJs._io.debugmsg('Expected: ' + expected);
    QuestJs._io.debugmsg('...Found: ' + found);
    if (extraOutput) {
      if (typeof expected === 'string' && typeof found === 'string') {
        for (let i = 0; i < expected.length; i += 1) {
          if (expected[i] !== found[i]) {
            QuestJs._log.info('Mismatch at position: ' + i);
            QuestJs._log.info('Expected: ' + expected.charCodeAt(i));
            QuestJs._log.info('Found: ' + found.charCodeAt(i));
          }
        }
      }
    }
  }
};

// Use only for numbers; expected must not be zero, as long as the found is within 0.1% of the expected, this is pass
QuestJs._test.assertAlmostEqual = function (expected, found) {
  QuestJs._test.totalCount += 1;
  QuestJs._test.subCount += 1;

  if (Math.abs((found - expected) / expected) < 0.001) {
    //QuestJs._io.debugmsg(".");
  } else {
    QuestJs._test.printTitle();
    QuestJs._io.debugmsg('Expected: ' + expected);
    QuestJs._io.debugmsg('...Found: ' + found);
  }
};

QuestJs._test.assertMatch = function (expected, found) {
  QuestJs._test.totalCount += 1;
  QuestJs._test.subCount += 1;
  if (expected.test(found)) {
    //QuestJs._io.debugmsg(".");
  } else {
    QuestJs._test.printTitle();
    QuestJs._io.debugmsg('Expected: ' + expected);
    QuestJs._io.debugmsg('...Found: ' + found);
  }
};

QuestJs._test.fail = function (msg) {
  QuestJs._test.printTitle();
  QuestJs._io.debugmsg('Failure: ' + msg);
};

QuestJs._test.results = function (time) {
  const elapsed = parseInt(Date.now()) - time;
  QuestJs._io.debugmsg('Number of tests: ' + QuestJs._test.totalCount);
  QuestJs._io.debugmsg('Number of fails: ' + QuestJs._test.failCount);
  QuestJs._io.debugmsg(
    'Elapsed time: ' +
      elapsed +
      ' ms (' +
      Math.round((elapsed / QuestJs._test.totalCount) * 10) / 10 +
      ' ms/test)',
  );
};

QuestJs._test.padArray = function (arr, n) {
  for (let i = 0; i < n; i += 1) arr.push(/./);
  return arr;
};

// You can use this in a test to move the player silently
QuestJs._test.movePlayer = function (roomName) {
  QuestJs._game.player.loc = roomName;
  QuestJs._game.update();
  QuestJs._world.setBackground();
};
