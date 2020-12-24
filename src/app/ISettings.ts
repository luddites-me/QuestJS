export interface ISettings {
  additionalAbout:          string;
  additionalHelp:           string;
  author:                   string;
  cmdEcho:                  boolean;
  compassPane:              boolean;
  convertNumbersInParser:   boolean;
  cssFolder:                string;
  cursor:                   string;
  customExits:              boolean;
  customLibraries:          any[];
  darkModeActive:           boolean;
  dateTime:                 DateTime;
  delayStart:               boolean;
  dropdownForConv:          boolean;
  failCountsAsTurn:         boolean;
  files:                    string[];
  folder:                   string;
  givePlayerAskTellMsg:     boolean;
  givePlayerSayMsg:         boolean;
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
  mapStyle:                 MapStyle;
  maxUndo:                  number;
  moneyFormat:              string;
  noAskTell:                string;
  noTalkTo:                 string;
  npcReactionsAlways:       boolean;
  panes:                    'left' | 'right' | 'none';
  panesCollapseAt:          number;
  questVersion:             string;
  roomTemplate:             string[];
  saveDisabled:             boolean;
  silent:                   boolean;
  soundsFileExt:            string;
  soundsFolder:             string;
  startingDialogEnabled:    boolean;
  status:                   (() => string)[];
  statusPane:               string;
  statusWidthLeft:          number;
  statusWidthRight:         number;
  styleFile:                string;
  symbolsForCompass:        boolean;
  tests:                    boolean;
  textEffectDelay:          number;
  textInput:                boolean;
  thanks:                   any[];
  themes:                   any[];
  title:                    string;
  turnsQuestionsLast:       number;
  version:                  string;
  videosFolder:             string;
  walkthroughMenuResponses: any[];
  warnings:                 string[];
  writeScript:              (folder?: string) => void;
}

export interface DateTime {
  day:            string;
  hour:           string;
  locale:         string;
  minute:         string;
  month:          string;
  secondsPerTurn: number;
  start:          Date;
  year:           string;
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
