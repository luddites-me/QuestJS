import { ILexicon } from "./ILexicon";

export interface IProcessor {
    object_unknown_msg(name): string;
    stop_posture(char): any;
    say_no_one_here(char, verb, text): string;
    say_no_response(char, verb, text): string;
    say_no_response_full(char, verb, text): string;
    speak_to_menu_title(char): string;
    tell_about_intro(char, text1, text2): string;
    ask_about_intro(char, text1, text2): string;
    npc_leaving_msg(npc, dest): void;
    npc_entering_msg(npc, origin): void;
    helpScript(): any;
    hintScript(): any;
    aboutScript(): any;
    warningsScript(): any;
    saveLoadScript(): any;
    transcriptScript(): any;
    topicsScript(): any;
    betaTestIntro(): void;
    addDefiniteArticle(item): string;
    addIndefiniteArticle(item): string;
    getName(item, options): any;
    toWords(n): any;
    toOrdinal(number): any;
    convertNumbers(str): any;
    conjugate(item, verb): any;
    pronounVerb(item, verb, capitalise): any;
    pronounVerbForGroup(item, verb, capitalise): any;
    verbPronoun(item, verb, capitalise): any;
    nounVerb(item, verb, capitalise): any;
    verbNoun(item, verb, capitalise): any;
    lexicon: ILexicon;
}
