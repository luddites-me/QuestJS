import {Base} from "../lib/base.js";
import {Item} from "../node/items/item.js";
import {Clone} from "../node/clone.js";
import {Room} from "../node/locations/room.js";
export class State extends Base {
  get(name) {
    return this.store[name];
  }
  set(name, value) {
    this.store[name] = value;
  }
  forEach(callback, ...params) {
    Object.keys(this.store).forEach((key) => {
      callback(key, this.store[key], ...params);
    });
  }
  exists(name) {
    return Object.keys(this.store).filter((key) => key === name).length > 0 && this.get(name);
  }
  createItem(name, ...params) {
    return this.createObject(name, new Item(this._quest, name, ...params));
  }
  createRoom(name, ...params) {
    return this.createObject(name, new Room(this._quest, name, ...params));
  }
  cloneObject(item2, loc2, newName) {
    if (item2 === void 0) {
      this.log.info("Item is not defined.");
    }
    if (typeof item2 === "string") {
      const o = this.store[item2];
      if (o === void 0) {
        this.log.info(`No item called '${item2}' found in cloneObject.`);
      }
      item2 = o;
    }
    const name = newName === void 0 ? this.world.findUniqueName(item2.name) : newName;
    if (loc2 !== void 0) {
      item2.loc = loc2;
    }
    const clone2 = new Clone(this._quest, name, item2);
    if (!clone2.clonePrototype) {
      clone2.clonePrototype = item2;
    }
    this.store.set(clone2.name, clone2);
    return clone2;
  }
  createObject(name, node) {
    if (this.world.isCreated && !this.settings.saveDisabled) {
      this.log.info(`Attempting to use createObject with \`${name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`);
      this.io.errormsg(`Attempting to use createObject with \`${name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`);
      return null;
    }
    if (/\W/.test(name)) {
      this.log.info(`Attempting to use the disallowed name \`${name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`);
      this.io.errormsg(`Attempting to use the disallowed name \`${name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`);
      return null;
    }
    if (this.store.exists(name)) {
      this.log.info(`Attempting to use the name \`${name}\` when there is already an item with that name in the world.`);
      this.io.errormsg(`Attempting to use the name \`${name}\` when there is already an item with that name in the world.`);
      return null;
    }
    if (typeof node.unshift !== "function") {
      this.log.info(`The list of hashes for \`${name}\` is not what I was expecting. Found:`);
      this.log.info(node);
      this.log.info("Maybe you meant to use createItem?");
      this.io.errormsg(`The list of hashes for \`${name}\` is not what I was expecting. Look at the console for more.`);
      return null;
    }
    return new Clone(this._quest, name, node);
  }
}
