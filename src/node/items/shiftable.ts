import { Quest } from "../../Quest";
import { allowable, Item } from "./item";

export class Shiftable extends Item {

  constructor(quest: Quest, name: string, hash: Partial<Shiftable> = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.take;
  }
}
