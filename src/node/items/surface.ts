import { Quest } from "../..";
import { allowable, Item } from "./item";

export class Surface extends Item {
  container: boolean;
  contentsType: string;

  constructor(quest: Quest, name: string, hash: Partial<Surface> = {}) {
    super(quest, name, hash);
    this.allowed |= allowable.shift;
    this.container = true;
    this.contentsType = 'surface'
  }

  onCreation(o) {
    o.nameModifierFunctions.push(
      this.utils.nameModifierFunctionForContainer,
    );
  };

  canReachThrough() { return true; }

  canSeeThrough() { return true; }
}
