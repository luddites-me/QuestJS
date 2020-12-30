export const Known = {
  INDEFINITE: 1,
  DEFINITE: 2,
  INFINITY: 9999,
  NOOP: (...params) => {
    return {};
  },
  NOOP_FALSE: (...params) => true,
  NOOP_TRUE: (...params) => true,
  NOOP_VOID: (...params) => {
    return;
  }
};
export const WorldStates = {
  VISIBLE: 1,
  REACHABLE: 2,
  LIGHT_NONE: 0,
  LIGHT_SELF: 1,
  LIGHT_MEAGRE: 2,
  LIGHT_FULL: 3,
  LIGHT_EXTREME: 4,
  BRIEF: 1,
  TERSE: 2,
  VERBOSE: 3,
  ALL: 0,
  LOOK: 1,
  PARSER: 2,
  INVENTORY: 3,
  SIDE_PANE: 4,
  SCOPING: 5,
  SUCCESS: 1,
  SUCCESS_NO_TURNSCRIPTS: 2,
  FAILED: -1,
  PARSER_FAILURE: -2,
  BACK_REGEX: /\[.+?\]/,
  Money: Known.NOOP
};
