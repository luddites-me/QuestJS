import { Quest } from '../Quest';
import { Node } from './node';

export class Exit extends Node {

  constructor(quest: Quest, name: string, hash: Partial<Exit> = {}) {
    super(quest, name, hash);
    this.use = this.utils.defaultExitUse;
  }
}
