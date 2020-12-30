import { DateTime, InventoryPane, ISettings, MapStyle, Sliders, Toolbar } from './ISettings';
import { WorldStates } from './constants';
import { Base } from './base';
import { Quest } from '../Quest';
import { FnPrmAny } from '../@types/fn';

const defaultSettings: Partial<Settings> = {
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
  testing: false,
  hideMap: true,
  hideImagePane: true,
}

export class Settings extends Base implements ISettings {
  additionalAbout: string;
  additionalHelp: string;
  afterLoad: FnPrmAny;
  afterSave: FnPrmAny;
  author: string;
  clearScreenOnRoomEnter: boolean;
  cmdEcho: boolean;
  compassPane: boolean;
  convertNumbersInParser: boolean;
  cssFolder: string;
  cursor: string;
  customExits: boolean;
  customLibraries: any[];
  customUI: FnPrmAny;
  darkModeActive: boolean;
  dateTime: DateTime;
  delayStart: boolean;
  dropdownForConv: boolean;
  failCountsAsTurn: boolean;
  files: string[];
  folder: string;
  givePlayerAskTellMsg: boolean;
  givePlayerSayMsg: boolean;
  hideImagePane: boolean;
  hideMap: boolean;
  iconsFolder: string;
  ifdb: string;
  imagesFolder: string;
  intro: string | Object;
  inventoryPane: InventoryPane[];
  lang: string;
  libraries: string[];
  lookCountsAsTurn: boolean;
  mapAndImageCollapseAt: number;
  mapImageSide: 'left' | 'right';
  imageWidth: string;
  mapStyle: MapStyle;
  maxUndo: number;
  moneyFormat: string;
  noAskTell: string;
  noTalkTo: string;
  npcReactionsAlways: boolean;
  onFinish: FnPrmAny;
  onDarkToggle: FnPrmAny;
  oxfordComma: boolean;
  panes: 'left' | 'right' | 'none';
  panesCollapseAt: number;
  playMode: 'dev' | 'meta' | 'play' | 'beta';
  questVersion: string;
  reportAllSvg: boolean;
  roomTemplate: string[];
  saveDisabled: boolean;
  setup: FnPrmAny;
  sliders: Sliders;
  silent: boolean;
  soundsFileExt: string;
  soundsFolder: string;
  soundsFiles: string[];
  startingDialogEnabled: boolean;
  status: (() => string)[];
  statusPane: string;
  statusWidthLeft: number;
  statusWidthRight: number;
  styleFile: string;
  subtitle: string;
  symbolsForCompass: boolean;
  tests: boolean;
  testing: boolean;
  textEffectDelay: number;
  textInput: boolean;
  thanks: any[];
  themes: any[];
  title: string;
  toolbar: Toolbar;
  turnsQuestionsLast: number;
  updateCustomUI: FnPrmAny;
  version: string;
  videosFolder: string;
  walkthroughMenuResponses: any[];
  warnings: string[];

  constructor(quest: Quest, config: Partial<ISettings> = defaultSettings) {
    super(quest);
    Object.assign(this, config)
    this.dateTime.start = this.dateTime.start || new Date();
    this.inventoryPane = this.inventoryPane || [
      { name: 'Items Held', alt: 'itemsHeld', test: this.isHeldNotWorn, getLoc: () => this.game.player.name },
      { name: 'Items Here', alt: 'itemsHere', test: this.isHere, getLoc: () => this.game.player.loc },
      { name: 'Items Worn', alt: 'itemsWorn', test: this.isWorn, getLoc: () => this.game.player.name },
    ];
  }

  // Functions for the side panes lists
  isHeldNotWorn(item: any): boolean {
    return item.isAtLoc(this.game.player.name, WorldStates.SIDE_PANE) && this.world.ifNotDark(item) && !item.getWorn();
  }
  isHere(item: any): boolean {
    return item.isAtLoc(this.game.player.loc, WorldStates.SIDE_PANE) && this.world.ifNotDark(item);
  }
  isWorn(item: any): boolean {
    return item.isAtLoc(this.game.player.name, WorldStates.SIDE_PANE) && this.world.ifNotDark(item) && item.getWorn();
  }

  writeScript(folder?: string) {
    this.folder = this.folder ? folder + '/' : '';
    document.writeln(`<link rel="shortcut icon" type="image/png" href="${this.iconsFolder}favicon.png"/>`);
    document.writeln(`<link rel="stylesheet" href="${this.cssFolder}default.css"/>`);
    this.themes?.forEach(file => {
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

  forEach(prop: string, fn: (key: string, val: any) => void) {
    if (this[prop]) {
      Object.keys(this[prop]).forEach(key => fn(key, this[prop][key]));
    }
  }
}
