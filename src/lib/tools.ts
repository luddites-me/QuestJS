import { capitalize } from 'lodash';
import { languageProcessor } from '../lang/i18n';

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

export const sentenceCase = (str: string) => capitalize(str);
