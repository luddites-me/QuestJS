"use strict"


import { lang } from '../lang/lang-en';
import { tp } from '../lib/_text';
import { w, PLAYER, WEARABLE, createItem, createObject, createRoom, Exit, SURFACE } from '../lib/_world';
import { Cmd, findCmd } from '../lib/_command';
import { msg, metamsg } from '../lib/_io';
import * as settings from '../lib/_settings';

settings.title = "Your new game"
settings.author = "Your name here"
settings.version = "0.1"
settings.thanks = []
settings.warnings = "No warnings have been set for this game."
settings.playMode = "play"

settings.symbolsForCompass = true
settings.themes = ['sans-serif']