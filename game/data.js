"use strict"


import { lang } from '../lang/lang-en';
import { tp } from '../lib/_text';
import { w, createItem, createObject, createRoom, Exit } from '../lib/_world';
import { PLAYER, WEARABLE, SURFACE } from '../lib/_templates';
import { Cmd, findCmd } from '../lib/_command';
import { msg, metamsg } from '../lib/_io';
import * as io from '../lib/_io';

createItem("me", PLAYER(), {
  loc:"lounge",
  regex:/^(me|myself|player)$/,
  examine: "Just a regular guy.",
  hitpoints:100,
})

createRoom("lounge", {
  desc:"The lounge is boring, the author really needs to put stuff in it.",
})
