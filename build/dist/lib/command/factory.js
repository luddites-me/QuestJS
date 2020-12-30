import {Base} from "../base.js";
import {Cmd} from "./cmd.js";
import {NpcCmd} from "./npcCmd.js";
import {ExitCmd} from "./exitCmd.js";
import {NpcExitCmd} from "./npcExitCmd.js";
import {Rules} from "./rules.js";
import {loadCommands as loadCommands2} from "../../scripts/loadCommands.js";
export class CommandFactory extends Base {
  constructor() {
    super(...arguments);
    this._commands = {
      cmds: {},
      npcCmds: {},
      exitCmds: {},
      npcExitCmds: {},
      all: []
    };
  }
  makeCmd(name, hash) {
    if (!this._commands.cmds[name]) {
      this._commands.cmds[name] = new Cmd(this._quest, name, hash);
      this._commands.all.push(this._commands.cmds[name]);
    }
    return this._commands.cmds[name];
  }
  makeNpcCmd(name, hash) {
    if (!this._commands.npcCmds[name]) {
      this._commands.npcCmds[name] = new NpcCmd(this._quest, name, hash);
      this._commands.all.push(this._commands.npcCmds[name]);
    }
    return this._commands.npcCmds[name];
  }
  makeExitCmd(name, hash, dir) {
    if (!this._commands.exitCmds[name]) {
      this._commands.exitCmds[name] = new ExitCmd(this._quest, name, hash, dir);
      this._commands.all.push(this._commands.exitCmds[name]);
    }
    return this._commands.exitCmds[name];
  }
  makeNpcExitCmd(name, hash, dir) {
    if (!this._commands.npcExitCmds[name]) {
      this._commands.npcExitCmds[name] = new NpcExitCmd(this._quest, name, hash, dir);
      this._commands.all.push(this._commands.npcExitCmds[name]);
    }
    return this._commands.npcExitCmds[name];
  }
  findCmd(name) {
    return this._commands.cmds[name] || this._commands.npcCmds[name] || this._commands.exitCmds[name] || this._commands.npcExitCmds[name];
  }
  filter(fn) {
    return this._commands.all.filter(fn);
  }
  get rules() {
    return this._rules = this._rules || new Rules(this._quest);
  }
  init() {
    loadCommands2(this._quest);
  }
}
