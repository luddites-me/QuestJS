"use strict"


import { lang } from '../lang/lang-en';
import { tp } from '../lib/_text';
import { w } from '../lib/_world';
import { PLAYER, WEARABLE, SURFACE } from '../lib/_templates';
import { Cmd, findCmd } from '../lib/_command';
import { msg, metamsg } from '../lib/_io';
import * as io from '../lib/_io';
import { settings } from '../lib/_settings';

const FOLDER = "game";
settings.writeScript(FOLDER)
io.createPanes();