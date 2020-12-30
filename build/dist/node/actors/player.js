import {Character} from "./character.js";
export class Player extends Character {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    this.pronouns = this.lexicon.pronouns.secondperson;
    this.player = true;
  }
}
