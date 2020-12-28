import { Dictionary } from "./command/command";

export interface ISettings {
  additionalAbout:          string;
  additionalHelp:           string;
  afterLoad:                (...params) => any;
  afterSave:                (...params) => any;
  author:                   string;
  clearScreenOnRoomEnter:   boolean;
  cmdEcho:                  boolean;
  compassPane:              boolean;
  convertNumbersInParser:   boolean;
  cssFolder:                string;
  cursor:                   string;
  customExits:              boolean;
  customLibraries:          any[];
  customUI:                 () => any;
  darkModeActive:           boolean;
  dateTime:                 DateTime;
  delayStart:               boolean;
  dropdownForConv:          boolean;
  failCountsAsTurn:         boolean;
  files:                    string[];
  folder:                   string;
  givePlayerAskTellMsg:     boolean;
  givePlayerSayMsg:         boolean;
  hideImagePane:            boolean;
  hideMap:                  boolean;
  iconsFolder:              string;
  ifdb:                     string;
  imagesFolder:             string;
  inventoryPane:            InventoryPane[];
  isHeldNotWorn:            (item: any) => any;
  isHere:                   (item: any) => any;
  isWorn:                   (item: any) => any;
  lang:                     string;
  libraries:                string[];
  lookCountsAsTurn:         boolean;
  mapAndImageCollapseAt:    number;
  mapImageSide:             'left' | 'right';
  imageWidth:               string;
  mapStyle:                 MapStyle;
  maxUndo:                  number;
  moneyFormat:              string;
  noAskTell:                string;
  noTalkTo:                 string;
  npcReactionsAlways:       boolean;
  onFinish:                 () => any;
  onDarkToggle:             () => any;
  oxfordComma:              boolean;
  panes:                    'left' | 'right' | 'none';
  panesCollapseAt:          number;
  playMode:                 'dev' | 'meta' | 'play' | 'beta';
  questVersion:             string;
  reportAllSvg:             boolean;
  roomTemplate:             string[];
  saveDisabled:             boolean;
  setup:                    (...params) => any;
  silent:                   boolean;
  sliders:                  Sliders;
  soundsFileExt:            string;
  soundsFolder:             string;
  soundsFiles:              string[];
  startingDialogEnabled:    boolean;
  status:                   (() => string)[];
  statusPane:               string;
  statusWidthLeft:          number;
  statusWidthRight:         number;
  styleFile:                string;
  subtitle:                 string;
  symbolsForCompass:        boolean;
  tests:                    boolean;
  testing:                  boolean;
  textEffectDelay:          number;
  textInput:                boolean;
  thanks:                   any[];
  themes:                   any[];
  title:                    string;
  toolbar:                  Toolbar;
  turnsQuestionsLast:       number;
  updateCustomUI:           () => any;
  version:                  string;
  videosFolder:             string;
  walkthroughMenuResponses: any[];
  warnings:                 string[];
  writeScript:              (folder?: string) => void;
}

export interface Sliders {
  [key: string]: {
    name: string;
    max: number;
    func: () => any;
    values: number;
  };
}

export interface DateTime {
  convertSeconds?: (...params) => number;
  day?:            string;
  data?:           Dictionary;
  date?:           number;
  format?:         string;
  formats?:        Dictionary;
  functions?:      Dictionary;
  hour?:           string;
  locale?:         string;
  minute?:         string;
  month?:          string;
  second?:         string;
  secondsPerTurn?: number;
  start?:          Date;
  weekday?:        string;
  year?:           string;
}

export interface InventoryPane {
  alt:  string;
  name: string;
}

export interface MapStyle {
  "background-color": string;
  height:             string;
  right:              string;
  top:                string;
  width:              string;
}

export interface Toolbar {
  content:     () => any;
  roomdisplay: boolean;
  buttons:     Button[];
}

export interface Button {
  cmd: string;
  onclick: () => any;
  icon: string;
  title: string;
}
