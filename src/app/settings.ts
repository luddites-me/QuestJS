import { DateTime, ISettings, MapStyle } from './ISettings';
import { WorldStates } from '../lib/constants';
import { World } from '../lib/world';

const defaultSettings: Partial<ISettings> = {
  // Also title, author, thanks (option; array)
  // Files
  lang: "lang-en",
  customExits: false,
  files: ["code", "data"],
  libraries: ["_saveload", "_text", "_io", "_command", "_defaults", "_templates", "_world", "_npc", "_parser", "_commands"],
  customLibraries: [],
  imagesFolder: 'assets/images/',
  iconsFolder: 'assets/icons/',
  soundsFolder: 'assets/audio/',
  videosFolder: 'assets/video/',
  cssFolder: 'assets/css/',
  soundsFileExt: '.mp3',
  // The side panes
  panes: 'left',
  panesCollapseAt: 700,
  compassPane: true,
  statusPane: "Status",
  statusWidthLeft: 120,
  statusWidthRight: 40,
  // Other UI settings
  textInput: true,
  cursor: ">",
  cmdEcho: true,
  textEffectDelay: 25,
  roomTemplate: [
      "#{cap:{hereName}}",
      "{terse:{hereDesc}}",
      "{objectsHere:You can see {objects} here.}",
      "{exitsHere:You can go {exits}.}",
  ],
  silent: false,
  walkthroughMenuResponses: [],
  startingDialogEnabled: false,
  darkModeActive: false,
  mapAndImageCollapseAt: 1200,
  // Conversations settings
  dropdownForConv: true,
  noTalkTo: "TALK TO is not a feature in this game.",
  noAskTell: "ASK/TELL ABOUT is not a feature in this game.",
  npcReactionsAlways: false,
  turnsQuestionsLast: 5,
  givePlayerSayMsg: true,
  givePlayerAskTellMsg: true,
  // Other game play settings
  failCountsAsTurn: false,
  lookCountsAsTurn: false,
  // When save is disabled, objects can be created during game play
  saveDisabled: false,
  // Date and time settings
  dateTime: {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      secondsPerTurn: 60,
      locale: 'en-GB',
      start: new Date('February 14, 2019 09:43:00'),
  },
  // Other settings
  // The parser will convert "two" to 2" in player input (can slow down the game)
  convertNumbersInParser: true,
  tests: false,
  maxUndo: 10,
  moneyFormat: "$!",
  version: '1.0',
  questVersion: '0.3',
  author: 'Anonymous',
  title: 'My New Game Needs A Title',
  mapStyle: { right: '0', top: '200px', width: '300px', height: '300px', 'background-color': 'beige' },
  symbolsForCompass: false,
}

export class Settings implements ISettings {

  folder: string;
  game: any;
  world: World;

  additionalAbout: string;
  additionalHelp: string;
  author: string;
  cmdEcho: boolean;
  compassPane: boolean;
  convertNumbersInParser: boolean;
  cssFolder: string;
  cursor: string;
  customExits: boolean;
  customLibraries: any[];
  darkModeActive: boolean;
  dateTime: DateTime;
  delayStart: boolean;
  dropdownForConv: boolean;
  failCountsAsTurn: boolean;
  files: string[];
  givePlayerAskTellMsg: boolean;
  givePlayerSayMsg: boolean;
  iconsFolder: string;
  ifdb: string;
  imagesFolder: string;
  inventoryPane = [
    { name: 'Items Held', alt: 'itemsHeld', test: this.isHeldNotWorn, getLoc: () => this.game.player.name },
    { name: 'Items Here', alt: 'itemsHere', test: this.isHere, getLoc: () => this.game.player.loc },
    { name: 'Items Worn', alt: 'itemsWorn', test: this.isWorn, getLoc: () => this.game.player.name },
  ];
  lang: string;
  libraries: string[];
  lookCountsAsTurn: boolean;
  mapAndImageCollapseAt: number;
  mapStyle: MapStyle;
  maxUndo: number;
  moneyFormat: string;
  noAskTell: string;
  noTalkTo: string;
  npcReactionsAlways: boolean;
  panes;
  panesCollapseAt: number;
  questVersion: string;
  roomTemplate: string[];
  saveDisabled: boolean;
  silent: boolean;
  soundsFileExt: string;
  soundsFolder: string;
  startingDialogEnabled: boolean;
  status = [() => `<td>Health points:</td><td>${this.game.player.hitpoints}</td>`];
  statusPane: string;
  statusWidthLeft: number;
  statusWidthRight: number;
  styleFile: string;
  symbolsForCompass: boolean;
  tests: boolean;
  textEffectDelay: number;
  textInput: boolean;
  thanks: any[];
  themes: any[];
  title: string;
  turnsQuestionsLast: number;
  version: string;
  videosFolder: string;
  walkthroughMenuResponses: any[];
  warnings: string[];
  
  constructor(config: Partial<ISettings>, game: any, world: World) {
    Object.assign(this, config)
    this.game = game;
    this.world = world;
  }

  // Functions for the side panes lists
  isHeldNotWorn(item: any): any {
    return item.isAtLoc(this.game.player.name, WorldStates.SIDE_PANE) && this.world.ifNotDark(item) && !item.getWorn();
  }
  isHere(item: any) {
    return item.isAtLoc(this.game.player.loc, WorldStates.SIDE_PANE) && this.world.ifNotDark(item);
  }
  isWorn(item: any) {
    return item.isAtLoc(this.game.player.name, WorldStates.SIDE_PANE) && this.world.ifNotDark(item) && item.getWorn();
  }

  writeScript(folder?: string) {
    this.folder = this.folder ? folder + '/' : '';
    document.writeln(`<link rel="shortcut icon" type="image/png" href="${this.iconsFolder}favicon.png"/>`);
    document.writeln(`<link rel="stylesheet" href="${this.cssFolder}default.css"/>`);
    this.themes?.forEach( file => {
      document.writeln(`<link rel="stylesheet" href="${this.cssFolder}${file}.css"/>`);
    })
    if (this.styleFile) {
        document.writeln(`<link rel="stylesheet" href="${this.folder}${this.styleFile}.css"/>`);
    }
    if (this.tests) {
        document.writeln(`<script src="lib/test-lib.js"></script>`);
        document.writeln(`<script src="${this.folder}tests.js"></script>`);
    }
    document.writeln(`<script src="${(this.folder ? 'lang/' : '')}${this.lang}.js"></script>`);
    if (this.customExits) {
        document.writeln(`<script src="${this.folder}${this.customExits}.js"></script>`);
    }
    this.libraries.forEach(file => document.writeln(`<script src="${(this.folder ? 'lib/' : '')}${file}.js"></script>`));
    this.customLibraries.forEach(lib => lib.files.forEach(file => document.writeln(`<script src="${(this.folder ? lib.folder + '/' : '')}${file}.js"></script>`)));
    this.files.forEach(file => document.writeln(`<script src="${this.folder}${file}.js"></script>`));
  }
}

export const settings = new Settings(defaultSettings, {}, new World({}));
