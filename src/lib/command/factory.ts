import { Base } from "../base";
import { Cmd } from "./cmd";
import { NpcCmd } from "./npcCmd";
import { ExitCmd } from "./exitCmd";
import { Dictionary } from "./command";
import { NpcExitCmd } from "./npcExitCmd";
import { Rules } from "./rules";
import { loadCommands } from '../../scripts/loadCommands';

type CommandDictionary = {
  [key: string]: Cmd;
}

type NpcCommandDictionary = {
  [key: string]: NpcCmd;
}

type ExitCommandDictionary = {
  [key: string]: ExitCmd;
}

type NpcExitCommandDictionary = {
  [key: string]: NpcExitCmd;
}

type AllCommands = {
  cmds: CommandDictionary;
  npcCmds: NpcCommandDictionary;
  exitCmds: ExitCommandDictionary;
  npcExitCmds: NpcExitCommandDictionary;
}

export class CommandFactory extends Base {

  private _commands: AllCommands = {
    cmds: {},
    npcCmds: {},
    exitCmds: {},
    npcExitCmds: {},
  }

  makeCmd(name: string, hash: Partial<Cmd>): Cmd {
    if(!this._commands.cmds[name]) {
      this._commands.cmds[name] = new Cmd(this._quest, name, hash);
    }
    return this._commands.cmds[name];
  }

  makeNpcCmd(name: string, hash: Partial<NpcCmd>): NpcCmd {
    if(!this._commands.npcCmds[name]) {
      this._commands.npcCmds[name] = new NpcCmd(this._quest, name, hash);
    }
    return this._commands.npcCmds[name];
  }

  makeExitCmd(name: string, hash: Partial<ExitCmd>, dir: string): ExitCmd {
    if(!this._commands.exitCmds[name]) {
      this._commands.exitCmds[name] = new ExitCmd(this._quest, name, hash, dir);
    }
    return this._commands.exitCmds[name];
  }

  makeNpcExitCmd(name: string, hash: Partial<NpcExitCmd>, dir: string): NpcExitCmd {
    if(!this._commands.npcExitCmds[name]) {
      this._commands.npcExitCmds[name] = new NpcExitCmd(this._quest, name, hash, dir);
    }
    return this._commands.npcExitCmds[name];
  }

  findCmd(name: string) {
    return (
      this._commands.cmds[name] ||
      this._commands.npcCmds[name] ||
      this._commands.exitCmds[name] ||
      this._commands.npcExitCmds[name]
    );

  }

  private _rules;
  get rules(): Rules {
    return this._rules = this._rules || new Rules(this._quest);
  }

  init() {
    loadCommands(this._quest);
  }
}
