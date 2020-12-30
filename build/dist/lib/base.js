export class Base {
  get i18n() {
    return this._quest.i18n;
  }
  get commandFactory() {
    return this._quest.commandFactory;
  }
  get game() {
    return this._quest.game;
  }
  get io() {
    return this._quest.io;
  }
  get lexicon() {
    return this.i18n.lexicon;
  }
  get log() {
    return this._quest.logger;
  }
  get parser() {
    return this._quest.parser;
  }
  get processor() {
    return this.i18n.processor;
  }
  get random() {
    return this._quest.random;
  }
  get saveLoad() {
    return this._quest.saveLoad;
  }
  get settings() {
    return this._quest.settings;
  }
  get state() {
    return this._quest.state;
  }
  get test() {
    return this._quest.test;
  }
  get text() {
    return this._quest.text;
  }
  get utils() {
    return this._quest.utils;
  }
  get world() {
    return this._quest.world;
  }
  constructor(quest) {
    this._quest = quest;
  }
}
