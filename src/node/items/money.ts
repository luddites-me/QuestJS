import { Quest } from "../..";
import { Item } from "./item";

export class Money extends Item {
  currency: string;
  quantity: number;
  
  constructor(quest: Quest, name: string, hash: Partial<Money> = {}) {
    super(quest, name, hash);
  }
}
