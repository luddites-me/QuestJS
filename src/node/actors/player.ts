import { Quest } from "../..";
import { Character } from "./character";

export class Player extends Character {

  constructor(quest: Quest, name: string, hash: Partial<Player> = {}) {
    super(quest, name, hash);
    this.pronouns = this.lexicon.pronouns.secondperson;
    this.player = true;
  }

  init() {
    this.game.update(this);
  }
}
