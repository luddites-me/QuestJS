import { ILexicon } from "./lexicon";

export interface IProcessor {
  aboutScript(): any;
  addDefiniteArticle(item): string;
  addIndefiniteArticle(item): string;
  ask_about_intro(char, text1, text2): string;
  betaTestIntro(): void;
  conjugate(item, verb): any;
  convertNumbers(str): any;
  getName(item, options): any;
  helpScript(): any;
  hintScript(): any;
  lexicon: ILexicon;
  locked_exit(char, exit): any;
  not_container(...params): any;
  not_inside(...params): any;
  nounVerb(item, verb, capitalise): any;
  npc_entering_msg(npc, origin): void;
  npc_leaving_msg(npc, dest): void;
  object_unknown_msg(name): string;
  pronounVerb(item, verb, capitalise): any;
  pronounVerbForGroup(item, verb, capitalise): any;
  saveLoadScript(): any;
  say_no_one_here(char, verb, text): string;
  say_no_response_full(char, verb, text): string;
  say_no_response(char, verb, text): string;
  speak_to_menu_title(char): string;
  stop_posture(char): any;
  tell_about_intro(char, text1, text2): string;
  toOrdinal(number): any;
  topicsScript(): any;
  toWords(n): any;
  transcriptScript(): any;
  verbNoun(item, verb, capitalise): any;
  verbPronoun(item, verb, capitalise): any;
  warningsScript(): any;
}

export class Foo {}
