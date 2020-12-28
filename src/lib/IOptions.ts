export type MessageOptions = {
  action?: string;
  alias?: string;
  autoplay?: boolean;
  background?: string;
  cssClass?: string;
  delay?: number;
  destination?: string;
  effect?: (...params) => any;
  height?: string;
  id?: number;
  name?: string;
  onclick?: (...params) => any;
  printBlank?: boolean;
  src?: string;
  tag?: 'p' | 'span' | 'div' | 'h4' | 'ol' | 'ul' | 'table' | 'h1' | 'h2' | 'h3' | 'h5' | 'h6' | 'img' | 'video';
  text?: string;
  volume?: number;
  width?: string;
  x?: number;
  y?: number;
}
