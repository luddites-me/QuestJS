import {Processor as Processor2} from "./en/Processor.js";
export class I18N {
  constructor(quest, locale2 = "en-US") {
    this._quest = quest;
    this.locale = locale2;
  }
  get processor() {
    switch (this.locale) {
      default:
        return this._processor = this._processor || new Processor2(this._quest);
    }
  }
  get lexicon() {
    return this.processor.lexicon;
  }
}
