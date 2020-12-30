import {CommandFactory} from "./lib/command/factory.js";
import {Game} from "./app/game.js";
import {I18N} from "./lang/i18n.js";
import {IO} from "./lib/index.js";
import {Logger} from "./lib/logger.js";
import {Rndm} from "./lib/tools/rndm.js";
import {SaveLoad} from "./lib/save.js";
import {Scope} from "./lib/tools/scope.js";
import {Settings} from "./lib/settings.js";
import {State} from "./app/state.js";
import {Test} from "./lib/test.js";
import {Text} from "./lib/text.js";
import {Utils} from "./lib/utils.js";
import {Player} from "./node/actors/player.js";
export class Quest {
  get i18n() {
    return this._i18n = this._i18n || new I18N(this, "en-US");
  }
  get settings() {
    return this._settings = this._settings || new Settings(this);
  }
  get game() {
    return this._game = this._game || new Game(this);
  }
  get world() {
    return this._world = this._world || this.game.world;
  }
  get state() {
    return this._state = this._state || new State(this);
  }
  get parser() {
    return this._parser = this._parser || new State(this);
  }
  get logger() {
    return this._logger = this._logger || new Logger();
  }
  get test() {
    return this._test = this._test || new Test();
  }
  get random() {
    return this._random = this._random || new Rndm(this);
  }
  get io() {
    return this._io = this._io || new IO(this);
  }
  get utils() {
    return this._utils = this._utils || new Utils(this);
  }
  get scope() {
    return this._scope = this._scope || new Scope(this);
  }
  get saveLoad() {
    return this._saveLoad = this._saveLoad || new SaveLoad(this);
  }
  get commandFactory() {
    return this._commandFactory = this._commandFactory || new CommandFactory(this);
  }
  get text() {
    return this._text = this._text || new Text(this);
  }
  constructor() {
    this.created = new Date();
  }
  init(options) {
    Object.keys(options.lexicon).forEach((key) => this.i18n.lexicon[key] = options.lexicon[key]);
    Object.keys(options.textProcessor).forEach((key) => this.text.addDirective(key, options.textProcessor[key]));
    Object.keys(options.commands).forEach((key) => {
      const newCmd = options.commands[key];
      const oldCmd = this.commandFactory.findCmd(key);
      Object.keys(newCmd).forEach((key2) => oldCmd[key2] = newCmd[key2]);
    });
    Object.keys(options.player).forEach((key) => {
      const data = options.player[key];
      const player2 = new Player(this, key, data);
      this.game.update(player2);
    });
    Object.keys(options.items).forEach((key) => {
      const data = options.player[key];
      const player2 = new Player(this, key, data);
      this.game.update(player2);
    });
    this.commandFactory.init();
    this.io.init();
  }
}
