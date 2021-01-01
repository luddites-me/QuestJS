import { IProcessor } from "./processor";
import { Processor } from './en/Processor';
import { Locale } from "./locale";
import { ILexicon } from "./lexicon";
import { Quest } from "../Quest";

export class I18N {
  private readonly _quest: Quest;
  public readonly locale: Locale;

  constructor(quest: Quest, locale: Locale = 'en-US') {
    this._quest = quest;
    this.locale = locale;
  }

  private _processor;

  public get processor(): IProcessor {
    // In the future, we can expand this with additional languages
    switch(this.locale) {
      default:
        return this._processor = this._processor || new Processor(this._quest);
    }
  }

  public get lexicon(): ILexicon {
    return this.processor.lexicon;
  }
}