import {prefix, WorldStates} from "../../lib/index.js";
import {Item} from "./item.js";
export class Merch extends Item {
  constructor(quest, name, hash = {}) {
    super(quest, name, hash);
    if (!Array.isArray(this.locs)) {
      this.doNotClone = true;
      this.salesLocs = [this.loc];
    } else {
      this.salesLocs = this.locs;
    }
  }
  getPrice() {
    return this.price;
  }
  getSellingPrice(char) {
    if (this.state.get(char.loc).buyingValue) {
      return Math.round(this.getPrice() * this.state.get(char.loc).buyingValue / 100);
    }
    return Math.round(this.getPrice() / 2);
  }
  getBuyingPrice(char) {
    if (this.state.get(char.loc).sellingDiscount) {
      return Math.round(this.getPrice() * (100 - this.state.get(char.loc).sellingDiscount) / 100);
    }
    return this.getPrice();
  }
  isAtLoc(loc, situation) {
    if ((situation === WorldStates.PARSER || situation === WorldStates.SCOPING) && this.isForSale(loc))
      return true;
    if (typeof loc !== "string")
      loc = loc.name;
    if (!this.state.get(loc))
      this.io.errormsg(`The location name \`${loc}\`, does not match anything in the game.`);
    if (this.complexIsAtLoc) {
      if (!this.complexIsAtLoc(loc, situation))
        return false;
    } else if (this.loc !== loc)
      return false;
    if (situation === void 0)
      return true;
    if (situation === WorldStates.LOOK && this.scenery)
      return false;
    if (situation === WorldStates.SIDE_PANE && this.scenery)
      return false;
    return true;
  }
  isForSale(loc) {
    if (this.loc)
      return false;
    if (this.doNotClone)
      return this.salesLoc === loc;
    return this.salesLocs.includes(loc);
  }
  canBeSoldHere(loc) {
    return this.state.get(loc).willBuy && this.state.get(loc).willBuy(this);
  }
  purchase(isMultiple, char) {
    const tpParams = {char, item: this, money: 0};
    if (!this.isForSale(char.loc)) {
      if (this.doNotClone && this.isAtLoc(char.name)) {
        return this.io.failedmsg(this.lexicon.cannot_purchase_again, tpParams);
      }
      return this.io.failedmsg(this.lexicon.cannot_purchase_here, tpParams);
    }
    const cost = this.getBuyingPrice(char);
    tpParams.money = cost;
    if (char.money < cost)
      return this.io.failedmsg(prefix(this, isMultiple) + this.lexicon.cannot_afford, tpParams);
    this.purchaseScript(isMultiple, char, cost, tpParams);
  }
  purchaseScript(isMultiple, char, cost, tpParams) {
    char.money -= cost;
    this.io.msg(prefix(this, isMultiple) + this.lexicon.purchase_successful, tpParams);
    if (this.doNotClone) {
      this.moveToFrom(char.name, char.loc);
      delete this.salesLoc;
    } else {
      new Merch(this._quest, char.name, this);
    }
    return WorldStates.SUCCESS;
  }
  sell(isMultiple, char) {
    const tpParams = {char, item: this, money: 0};
    if (!this.canBeSoldHere(char.loc)) {
      return this.io.failedmsg(prefix(this, isMultiple) + this.lexicon.cannot_sell_here, tpParams);
    }
    const cost = this.getSellingPrice(char);
    tpParams.money = cost;
    char.money += cost;
    this.io.msg(prefix(this, isMultiple) + this.lexicon.sell_successful, tpParams);
    if (this.doNotClone) {
      this.moveToFrom(char.loc, char.name);
      this.salesLoc = char.loc;
    }
    delete this.loc;
    return WorldStates.SUCCESS;
  }
}
