import { Quest } from "../..";
import { Loc } from "./loc";

export class Room extends Loc {
  constructor(quest: Quest, name: string, hash: Partial<Room> = {}) {
    super(quest, name, hash);
    this.room = true;
  }
}
