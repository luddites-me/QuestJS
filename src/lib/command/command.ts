export type Command = {
  all?: boolean;
  cmd?: Command;
  cmdString?: string;
  disambiguate1?: number;
  disambiguate2?: number;
  error?: string;
  matches?: any[];
  name?: string;
  noobjecterror?: (...params) => any;
  nothingForAll?: boolean;
  objects?: any[];
  objectTexts?: any[];
  regex?: RegExp;
  regexes?: RegExp[];
  score?: number;
  script?: (...params) => any;
  string?: string;
};

export type Dictionary = {
  [key: string]: any;
}
