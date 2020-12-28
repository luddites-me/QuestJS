import { DictionaryAny } from "../../@types/dictionary";
import { FnPrmAny, FnPrmBool, FnPrmString, FnPrmVoid } from "../../@types/fn";

export interface ISettings {
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
  inventoryPane: InventoryPane[];
  isHeldNotWorn: FnPrmBool;
  isHere: FnPrmBool;
  isWorn: FnPrmBool;
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
  silent: boolean;
  sliders: Sliders;
  soundsFileExt: string;
  soundsFolder: string;
  soundsFiles: string[];
  startingDialogEnabled: boolean;
  status: FnPrmString[];
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
  writeScript: FnPrmVoid
}

export interface Sliders {
  [key: string]: {
    name: string;
    max: number;
    func: FnPrmAny;
    values: number;
  };
}

export interface DateTime {
  convertSeconds?: (...params) => number;
  day?: string;
  data?: DictionaryAny;
  date?: number;
  format?: string;
  formats?: DictionaryAny;
  functions?: DictionaryAny;
  hour?: string;
  locale?: string;
  minute?: string;
  month?: string;
  second?: string;
  secondsPerTurn?: number;
  start?: Date;
  weekday?: string;
  year?: string;
}

export interface InventoryPane {
  alt: string;
  name: string;
  test: FnPrmAny;
  getLoc: FnPrmAny;
}

export interface MapStyle {
  "background-color": string;
  height: string;
  right: string;
  top: string;
  width: string;
}

export interface Toolbar {
  content: FnPrmAny;
  roomdisplay: boolean;
  buttons: Button[];
}

export interface Button {
  cmd: string;
  onclick: FnPrmAny;
  icon: string;
  title: string;
}
