import { FnPrmAny, FnPrmBool, FnPrmVoid } from "../../@types/fn";

type _known = {
  INDEFINITE: number,
  DEFINITE: number,
  INFINITY: number,
  NOOP: FnPrmAny,
  NOOP_FALSE: FnPrmBool,
  NOOP_TRUE: FnPrmBool,
  NOOP_VOID: FnPrmVoid,
}

export const Known: _known = {
  INDEFINITE: 1,
  DEFINITE: 2,
  INFINITY: 9999,
  NOOP: (...params) => { return {}; },
  NOOP_FALSE: (...params): boolean => true,
  NOOP_TRUE: (...params): boolean => true,
  NOOP_VOID: (...params): void => { return; },
};

export const WorldStates = {
  VISIBLE: 1,
  REACHABLE: 2,
  // constants for lighting levels
  LIGHT_NONE: 0,
  LIGHT_SELF: 1,
  LIGHT_MEAGRE: 2,
  LIGHT_FULL: 3,
  LIGHT_EXTREME: 4,
  // constants for verbosity of room descriptions
  BRIEF: 1,
  TERSE: 2,
  VERBOSE: 3,
  // constants for isAtLoc situations
  ALL: 0,
  LOOK: 1,
  PARSER: 2,
  INVENTORY: 3,
  SIDE_PANE: 4,
  SCOPING: 5,
  // constants for command responses
  // (but a verb will return true or false, so the command that uses it
  // can in turn return one of these - a verb is an attribute of an object)
  SUCCESS: 1,
  SUCCESS_NO_TURNSCRIPTS: 2,
  FAILED: -1,
  PARSER_FAILURE: -2,

  BACK_REGEX: /\[.+?\]/,

  // TODO: what is this?
  Money: Known.NOOP,
}
