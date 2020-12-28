import { Quest } from "../Quest";

export abstract class Base {
  protected readonly _quest: Quest;
  private get i18n() { return this._quest.i18n; }

  protected get commandFactory() { return this._quest.commandFactory; }
  protected get game() { return this._quest.game; }
  protected get io() { return this._quest.io; }
  protected get lexicon() { return this.i18n.lexicon; }
  protected get log() { return this._quest.logger; }
  protected get parser() { return this._quest.parser; }
  protected get processor() { return this.i18n.processor; }
  protected get random() { return this._quest.random; }
  protected get saveLoad() { return this._quest.saveLoad; }
  protected get settings() { return this._quest.settings; }
  protected get state() { return this._quest.state; }
  protected get test() { return this._quest.test; }
  protected get text() { return this._quest.text; }
  protected get utils() { return this._quest.utils; }
  protected get world() { return this._quest.world; }

  protected map;
  protected imagePane;

  constructor(quest: Quest) {
    this._quest = quest;
  }
}
