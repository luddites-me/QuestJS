import { IProcessor } from "./IProcessor";
import { Processor } from './en/Processor';
import { Locale } from "./Locale";
import { Settings } from "../app/settings";
import { ILexicon } from "./ILexicon";

export class I18N {
  public readonly locale: Locale;

  constructor(locale: Locale = 'en-US') {
    this.locale = locale;
  }

  private _processor;

  public get processor(): IProcessor {
    // In the future, we can expand this with additional languages
    switch(this.locale) {
      default:
        return this._processor = this._processor || new Processor({}, {}, {} as Settings);
    }
  }

  public get lexicon(): ILexicon {
    return this.processor.lexicon;
  }
}

export const languageProcessor = new I18N();
