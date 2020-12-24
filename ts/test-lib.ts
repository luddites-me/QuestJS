"use strict";
// This is not language neutral, but should not be shipping with the game, so tough
// Note that the test object was defined in util.js
(test as any).runTests = function () {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    const time = parseInt(Date.now());
    (test as any).tests();
    (test as any).results(time);
};
(test as any).testOutput = [];
(test as any).totalCount = 0;
(test as any).failCount = 0;
(test as any).subCount = 0;
(test as any).currentTitle = "Not specified";
(test as any).title = function (title: any) {
    (test as any).subCount = 0;
    (test as any).currentTitle = title;
};
(test as any).printTitle = function () {
    debugmsg((test as any).currentTitle + ": Error (test " + (test as any).subCount + ")");
    (test as any).failCount++;
};
(test as any).assertCmd = function (cmdStr: any, expected: any, extraOutput: any) {
    (test as any).totalCount++;
    (test as any).subCount++;
    if (expected.constructor !== Array) {
        expected = [expected];
    }
    (test as any).testing = true;
    (test as any).testOutput = [];
    (parser as any).parse(cmdStr);
    //world.endTurn();
    (test as any).testing = false;
    if ((test as any).testOutput.length === expected.length && (test as any).testOutput.every(function (value: any, index: any) {
        if (typeof expected[index] === "string") {
            return value === expected[index];
        }
        else {
            return expected[index].test(value);
        }
    })) {
        //debugmsg(".");
    }
    else {
        (test as any).printTitle();
        for (let i = 0; i < Math.max((test as any).testOutput.length, expected.length); i++) {
            if (typeof expected[i] === "string") {
                if (expected[i] !== (test as any).testOutput[i]) {
                    debugmsg("Expected (A): " + expected[i]);
                    debugmsg("...Found (A): " + (test as any).testOutput[i]);
                    if (extraOutput) {
                        if (typeof expected[i] === "string" && typeof (test as any).testOutput[i] === "string") {
                            for (let j = 0; j < expected[i].length; j++) {
                                if (expected[i][j] !== (test as any).testOutput[i][j]) {
                                    console.log("Mismatch at position: " + j);
                                    console.log("Expected: " + expected[i].charCodeAt(j));
                                    console.log("Found: " + (test as any).testOutput[i].charCodeAt(j));
                                }
                            }
                        }
                        else {
                            console.log("Found: type mismatch");
                            console.log(typeof expected[i]);
                            console.log(typeof (test as any).testOutput[i]);
                        }
                    }
                }
            }
            else if (expected[i] instanceof RegExp) {
                if ((test as any).testOutput[i] === undefined || !expected[i].test((test as any).testOutput[i])) {
                    debugmsg("Expected: " + expected[i]);
                    debugmsg("...Found: " + (test as any).testOutput[i]);
                }
            }
            else if (expected[i] === undefined) {
                debugmsg("Expected nothing");
                debugmsg("...Found: " + (test as any).testOutput[i]);
            }
            else {
                debugmsg("Found an unrecognised type for expected (should be string or regex): " + (typeof expected[i]));
            }
        }
    }
};
(test as any).assertEqual = function (expected: any, found: any, extraOutput: any) {
    (test as any).totalCount++;
    (test as any).subCount++;
    if (Array.isArray(expected)) {
        if (!(array as any).compare(expected, found)) {
            (test as any).printTitle();
            debugmsg("Expected (A): " + expected);
            debugmsg("...Found (A): " + found);
        }
    }
    else if (expected === found) {
        //debugmsg(".");
    }
    else {
        (test as any).printTitle();
        debugmsg("Expected: " + expected);
        debugmsg("...Found: " + found);
        if (extraOutput) {
            if (typeof expected === "string" && typeof found === "string") {
                for (let i = 0; i < expected.length; i++) {
                    if (expected[i] !== found[i]) {
                        console.log("Mismatch at position: " + i);
                        console.log("Expected: " + expected.charCodeAt(i));
                        console.log("Found: " + found.charCodeAt(i));
                    }
                }
            }
        }
    }
};
// Use only for numbers; expected must not be zero, as long as the found is within 0.1% of the expected, this is pass
(test as any).assertAlmostEqual = function (expected: any, found: any) {
    (test as any).totalCount++;
    (test as any).subCount++;
    if (Math.abs((found - expected) / expected) < 0.001) {
        //debugmsg(".");
    }
    else {
        (test as any).printTitle();
        debugmsg("Expected: " + expected);
        debugmsg("...Found: " + found);
    }
};
(test as any).assertMatch = function (expected: any, found: any) {
    (test as any).totalCount++;
    (test as any).subCount++;
    if (expected.test(found)) {
        //debugmsg(".");
    }
    else {
        (test as any).printTitle();
        debugmsg("Expected: " + expected);
        debugmsg("...Found: " + found);
    }
};
(test as any).fail = function (msg: any) {
    (test as any).printTitle();
    debugmsg("Failure: " + msg);
};
(test as any).results = function (time: any) {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    const elapsed = parseInt(Date.now()) - time;
    debugmsg("Number of tests: " + (test as any).totalCount);
    debugmsg("Number of fails: " + (test as any).failCount);
    debugmsg("Elapsed time: " + elapsed + " ms (" + (Math.round(elapsed / (test as any).totalCount * 10) / 10) + " ms/test)");
};
(test as any).padArray = function (arr: any, n: any) {
    for (let i = 0; i < n; i++)
        arr.push(/./);
    return arr;
};
// You can use this in a test to move the player silently
(test as any).movePlayer = function (roomName: any) {
    (game as any).player.loc = roomName;
    (game as any).update();
    world.setBackground();
};
