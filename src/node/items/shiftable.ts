import { Quest } from "../../Quest";
import { Item } from "./item";

export class Shiftable extends Item {

  constructor(quest: Quest, name: string, hash: Partial<Shiftable> = {}) {
    super(quest, name, hash);
    this.shiftable = true;
  }
}
