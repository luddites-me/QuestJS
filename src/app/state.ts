import { Base } from "../lib/base";
import { INode } from "../node/INode";
import { Item } from "../node/items/item";
import { Loc } from "../node/locations/loc";
import { Clone } from "../node/clone";
import { Room } from "../node/locations/room";
import { Quest } from "src/Quest";

interface IStore {
  [key: string]: any;
}

export class State extends Base {
  store: IStore;

  constructor(quest: Quest, store: IStore = {}) {
    super(quest);
    this.store = store;
  }
  // get(name: string): INode {
  //   return this.store[name];
  // }

  get<T extends INode>(name: string): T {
    return this.store[name] as T;
  }

  set(name: string, value: INode): void {
    this.store[name] = value;
  }

  forEach(callback: (key: string, value: INode, ...params) => any, ...params): void {
    Object.keys(this.store).forEach(key => {
      callback(key, this.store[key], ...params);
    });
  }

  exists(name: string) {
    return Object.keys(this.store).filter(key => key === name).length > 0 && this.get(name);
  }

  // @DOC
  // ## World Functions
  //
  // These are functions for creating objects in the game world
  // @UNDOC

  // @DOC
  // Use this to create a new item (as opposed to a room).
  // It adds various defaults that apply only to items.
  // The first argument should be a string - a unique name for this object, composed only of letters, numbers and underscores.
  // It will than take any number of dictionaries that will be combined to set the properties.
  // Generally objects should not be created during play as they will not be saved properly.
  // Either keep the object hodden until required or clone existing objects.
  createItem(name: string, ...params) {
    return this.createObject(name, new Item(this._quest, name, ...params));
  }

  // @DOC
  // Use this to create a new room (as opposed to an item).
  // It adds various defaults that apply only to items
  // The first argument should be a string - a unique name for this object, composed only of letters, numbers and underscores.
  // It will than take any number of dictionaries that will be combined to set the properties.
  // Generally objects should not be created during play as they will not be saved properly.
  // Either keep the object hodden until required or clone existing objects.
  createRoom(name: string, ...params) {
    return this.createObject(name, new Room(this._quest, name, ...params));
  }

  // @DOC
  // Use this to create new items during play. The given item will be cloned at the given location.
  // The `newName` isoptional, one will be generated if not supplied. If you do supply one bear inmid that
  // every clone must have a unique name.
  cloneObject(item: INode, loc?: Loc, newName?: string): Clone {
    if (item === undefined) {
      this.log.info('Item is not defined.');
    }
    if (typeof item === 'string') {
      const o = this.store[item];
      if (o === undefined) {
        this.log.info(`No item called '${item}' found in cloneObject.`);
      }
      item = o;
    }
    const name = newName === undefined ? this.world.findUniqueName(item.name) : newName;
    if (loc !== undefined) {
      item.loc = loc;
    }
    const clone = new Clone(this._quest, name, item);
    if (!clone.clonePrototype) {
      clone.clonePrototype = item;
    }

    // clone.getSaveString = () => {
    //   clone.templatePreSave();
    //   let s = `Clone:${clone.clonePrototype.name}=`;
    //   for (const key in this) {
    //     if (typeof this[key] !== 'function' && typeof this[key] !== 'object') {
    //       if (key !== 'desc' && key !== 'examine' && key !== 'name') {
    //         s += clone.saveLoad.encode(key, this[key]);
    //       }
    //       if (key === 'desc' && this.mutableDesc) {
    //         s += QuestJs._saveLoad.encode(key, this[key]);
    //       }
    //       if (key === 'examine' && this.mutableExamine) {
    //         s += QuestJs._saveLoad.encode(key, this[key]);
    //       }
    //     }
    //   }
    //   return s;
    // };
    this.store.set(clone.name, clone);
    return clone;
  }

  // @DOC
  // Creates a basic object. Generally it is better to use CreateItem or CreateRoom.
  createObject(name, node: Partial<INode>) {
    if (this.world.isCreated && !this.settings.saveDisabled) {
      this.log.info(
        `Attempting to use createObject with \`${name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`,
      );
      this.io.errormsg(
        `Attempting to use createObject with \`${name}\` after set up. To ensure games save properly you should use cloneObject to create ites during play.`,
      );
      return null;
    }

    if (/\W/.test(name)) {
      this.log.info(
        `Attempting to use the disallowed name \`${name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`,
      );
      this.io.errormsg(
        `Attempting to use the disallowed name \`${name}\`; a name can only include letters and digits - no spaces or accented characters. Use the 'alias' attribute to give an item a name with other characters.`,
      );
      return null;
    }
    if (false && this.store.exists(name)) {
      this.log.info(
        `Attempting to use the name \`${name}\` when there is already an item with that name in the world.`,
      );
      this.io.errormsg(
        `Attempting to use the name \`${name}\` when there is already an item with that name in the world.`,
      );
      return null;
    }
    if (typeof node.unshift !== 'function') {
      this.log.info(
        `The list of hashes for \`${name}\` is not what I was expecting. Found:`,
      );
      this.log.info(node);
      this.log.info('Maybe you meant to use createItem?');
      this.io.errormsg(
        `The list of hashes for \`${name}\` is not what I was expecting. Look at the console for more.`,
      );
      return null;
    }
    return new Clone(this._quest, name, node);
  }
}
