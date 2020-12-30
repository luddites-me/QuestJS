import {capitalize} from "../../../web_modules/lodash.js";
import {Grammar} from "../../lang/en/grammar.js";
export const getNameModifiers = (item, options) => {
  if (!options.modified)
    return "";
  const list = [];
  item.nameModifierFunctions?.forEach((f) => f(item, list));
  if (item.nameModifierFunction) {
    item.nameModifierFunction(list);
  }
  if (list.length === 0)
    return "";
  if (options.noBrackets)
    return " " + list.join("; ");
  return " (" + list.join("; ") + ")";
};
export const niceDirection = (dir) => {
  const dirObj = Grammar.exit_list.find((el) => el.name === dir);
  return dirObj?.niceDir || dirObj?.name;
};
export const spaces = (n) => {
  return "&nbsp;".repeat(n);
};
export const sentenceCase = (str) => capitalize(str);
export const prefix = (item, isMultiple = false) => {
  if (!isMultiple) {
    return "";
  }
  return `${sentenceCase(item.alias)}: `;
};
export const toInt = (str, radix = 10) => parseInt(str, radix);
