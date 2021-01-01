import { WorldStates } from '../lib/constants';
import { Quest } from '../Quest';
import { Node } from './node';

export class Background extends Node {

  scenery = true;
  examine = this.lexicon.default_description;
  background = true;
  _lightSource = WorldStates.LIGHT_NONE;
  isAtLoc(loc, situation) {
    if (!loc) this.io.errormsg(`Unknown location: ${loc}`);
    return loc.room && situation === WorldStates.PARSER;
  }

  constructor(quest: Quest, name: string, hash: Partial<Background> = {}) {
    super(quest, name, hash);
  }
}
