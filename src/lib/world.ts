import { WorldStates } from './constants';

export class World {
  game: any;

  constructor(game: any) {
    this.game = game;
  }

  // Returns true if bad lighting is not obscuring the item
  ifNotDark(item) {
    return !this.game.dark || item.lightSource() > WorldStates.LIGHT_NONE;
  }
}
