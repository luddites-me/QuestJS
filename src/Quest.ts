import {CommandFactory} from './lib/command/factory';
import { Game } from './app/game';
import { I18N } from './lang/i18n';
import { IO } from './lib';
import { Logger } from './lib/logger';
import { Parser } from './lib/parser';
import { Rndm } from './lib/tools/rndm';
import { SaveLoad } from './lib/save';
import { Scope } from './lib/tools/scope';
import { Settings } from './lib/settings';
import { State } from './app/state';
import { Test } from './lib/test';
import { Text } from './lib/text';
import { Utils } from './lib/utils';
import { World } from './app/world';

export class Quest {
  created: Date;

  private _i18n;
  get i18n(): I18N {
    return this._i18n = this._i18n || new I18N(this, 'en-US');
  }

  private _settings;
  get settings(): Settings {
    return this._settings = this._settings || new Settings(this);
  }

  private _game;
  get game(): Game {
    return this._game = this._game || new Game(this);
  }

  private _world;
  get world(): World {
    return this._world = this._world || this.game.world;
  }

  private _state;
  get state(): State {
    return this._state = this._state || new State(this);
  }

  private _parser;
  get parser(): Parser {
    return this._parser = this._parser || new State(this);
  }

  private _logger;
  get logger(): Logger {
    return this._logger = this._logger || new Logger();
  }

  private _test;
  get test(): Test {
    return this._test = this._test || new Test();
  }

  private _random;
  get random(): Rndm {
    return this._random = this._random || new Rndm(this);
  }

  private _io;
  get io(): IO {
    return this._io = this._io || new IO(this);
  }

  private _utils;
  get utils(): Utils {
    return this._utils = this._utils || new Utils(this);
  }

  private _scope;
  get scope(): Scope {
    return this._scope = this._scope || new Scope(this);
  }

  private _saveLoad;
  get saveLoad(): SaveLoad {
    return this._saveLoad = this._saveLoad || new SaveLoad(this);
  }

  private _commandFactory;
  get commandFactory(): CommandFactory {
    return this._commandFactory = this._commandFactory || new CommandFactory(this);
  }

  private _text;
  get text(): Text {
    return this._text = this._text || new Text(this);
  }

  walkthroughs: any;

  constructor() {
    this.created = new Date();
  }

  init() {
    this.commandFactory.init();
  }
}
