import { capitalize } from 'lodash';
import { languageProcessor } from '../../lang/i18n';


export const getNameModifiers = (item: any, options: any): string => {
  if (!options.modified)
      return '';
  const list: any = [];
  item.nameModifierFunctions?.forEach(f => f(item, list));
  if (item.nameModifierFunction) {
    item.nameModifierFunction(list);
  }
  if (list.length === 0)
      return '';
  if (options.noBrackets)
      return ' ' + list.join('; ');
  return ' (' + list.join('; ') + ')';
};

export const niceDirection = (dir: string): string => {
  const dirObj = languageProcessor.lexicon.exit_list.find(el => el.name === dir);
  return dirObj?.niceDir || dirObj?.name;
};

// @DOC
// Returns a string with the given number of hard spaces. Browsers collapse multiple white spaces to just show
// one, so you need to use hard spaces (NBSPs) if you want several together.
export const spaces = (n) => {
  return '&nbsp;'.repeat(n);
}


// @DOC
// Returns the string with the first letter capitalised
export const sentenceCase = (str: string) => capitalize(str);

// @DOC
// If isMultiple is true, returns the item name, otherwise nothing. This is useful in commands that handle
// multiple objects, as you can have this at the start of the response string. For example, if the player does GET BALL,
// the response might be "Done". If she does GET ALL, then the response for the ball needs to be "Ball: Done".
// In the command, you can have `io.msg(prefix(item, isMultiple) + "Done"), and it is sorted.
export const prefix = (item: { alias: string }, isMultiple = false) => {
  if (!isMultiple) {
    return '';
  }
  return `${sentenceCase(item.alias)}: `;
}

export const toInt = (str: string, radix = 10) => parseInt(str, radix);
