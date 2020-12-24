"use strict";
const quest = {
    INITIAL: 0,
    ACTIVE: 1,
    MOOT: 2,
    FAILED: 3,
    SUCCESS: 4,
    data: [],
    progressNames: ['', 'Active', 'Moot', 'Failed', 'Success'],
};
(quest as any).create = function (name: any, stages: any, data: any) {
    if (!data)
        data = {};
    data.name = name;
    data.stages = stages;
    data.key = name.replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
    quest.data.push(data);
};
(quest as any).getState = function (name: any, char: any) {
    if (!char)
        char = (game as any).player;
    const result = {};
    (result as any).quest = typeof name === 'string' ? quest.data.find(el => (el as any).name === name) : name;
    if (!(result as any).quest) {
        console.error("Failed to find a quest called " + name);
        console.log('Giving up...');
    }
    (result as any).stateName = 'quest_state_' + (result as any).quest.key;
    (result as any).progressName = 'quest_progress_' + (result as any).quest.key;
    console.log(char);
    console.log((result as any).stateName);
    console.log(char[(result as any).stateName]);
    (result as any).state = char[(result as any).stateName];
    (result as any).progress = char[(result as any).progressName];
    console.log(result);
    return result;
};
(quest as any).comment = function (q: any, n: any, s: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    metamsg(s + ": {i:" + q.name + "}");
    if (n !== false)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg(q.stages[n].text);
};
(quest as any).start = function (name: any) {
    console.log(name);
    const result = (quest as any).getState(name, (game as any).player);
    if (result.progress !== undefined)
        return false; // quest already started
    (game as any).player[result.progressName] = quest.ACTIVE;
    (game as any).player[result.stateName] = 0;
    (quest as any).comment(result.quest, 0, "Quest started");
    return true;
};
(quest as any).restart = function (name: any, n: any) {
    const data = (quest as any).getState(name, (game as any).player);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress === quest.ACTIVE)
        return false; // quest already started
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (game as any).player[result.progressName] = quest.ACTIVE;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (game as any).player[result.stateName] = n ? n : 0;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (quest as any).comment(result.quest, 0, "Quest started");
    return true;
};
(quest as any).next = function (name: any) {
    const data = (quest as any).getState(name, (game as any).player);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress !== quest.ACTIVE)
        return false;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (game as any).player[result.stateName]++;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if ((quest as any).stages.length >= (game as any).player[result.stateName])
        return (quest as any).complete(data.quest);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (quest as any).comment(result.quest, result.stateName, "Quest progress");
    return true;
};
(quest as any).complete = function (name: any) {
    const data = (quest as any).getState(name, (game as any).player);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress !== quest.ACTIVE)
        return false;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (game as any).player[result.progressName] = quest.SUCCESS;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    delete (game as any).player[result.stateName];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (quest as any).comment(result.quest, false, "Quest completed");
    return true;
};
(quest as any).fail = function (name: any) {
    const data = (quest as any).getState(name, (game as any).player);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress !== quest.ACTIVE)
        return false;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (game as any).player[result.progressName] = quest.FAILED;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    delete (game as any).player[result.stateName];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (quest as any).comment(result.quest, false, "Quest failed");
    return true;
};
// @ts-expect-error ts-migrate(2551) FIXME: Property 'moot' does not exist on type '{ INITIAL:... Remove this comment to see the full error message
quest.moot = function (name: any) {
    const data = (quest as any).getState(name, (game as any).player);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress !== quest.ACTIVE)
        return false;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (game as any).player[result.progressName] = quest.MOOT;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    delete (game as any).player[result.stateName];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (quest as any).comment(result.quest, false, "Quest moot");
    return true;
};
(quest as any).set = function (name: any, n: any) {
    const data = (quest as any).getState(name, (game as any).player);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress !== quest.ACTIVE)
        return false;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.state <= n)
        return false;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (game as any).player[result.stateName] = n;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    (quest as any).comment(result.quest, result.stateName, "Quest progress");
    return true;
};
(quest as any).progress = function (name: any, all: any) {
    const data = (quest as any).getState(name, (game as any).player);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress === undefined)
        return false;
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress !== quest.ACTIVE && all)
        return false;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    metamsg(data.name + ', {i:' + quest.progressNames[result.progress] + '}');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
    if (result.progress === quest.ACTIVE)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg(data.quest.stages[result.stateName].text);
    return true;
};
(quest as any).list = function (all: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    metamsg(all ? 'Active Quests' : 'All Quests');
    let flag = false;
    for (let q of quest.data) {
        flag = flag || (quest as any).getStatus(q, all);
    }
    if (!flag)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg("None");
    if (!all)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        metamsg("[Do QUESTS ALL to include completed and failed quests]");
};
// @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
commands.unshift(new Cmd('MetaQuests', {
    rules: [(cmdRules as any).isHere],
    regex: /^(?:quest|quests|q)$/,
    objects: [],
    script: function (item: any) {
        (quest as any).list(false);
    },
}));
// @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
commands.unshift(new Cmd('MetaQuestsAll', {
    rules: [(cmdRules as any).isHere],
    regex: /^(?:quest|quests|q) all$/,
    objects: [],
    script: function (item: any) {
        (quest as any).list(true);
    },
}));
