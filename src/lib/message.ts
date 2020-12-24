
const _msg = (s: string, params: any, options: any) => {
  if (options.tag === undefined)
      options.tag = 'p';
  if (options.cssClass === undefined)
      options.cssClass = 'default-' + options.tag.toLowerCase();
  const processed = params ? processText(s, params).trim() : s.trim();
  if (processed === "" && !options.printBlank) {
      return;
  }
  // if (test.testing) {
  //     test.testOutput.push(processed);
  //     return;
  const lines = processed.split('|');
  lines.forEach(line => {
      // can add effects
      const data = options;
      data.text = line;
      if (!data.action)
          data.action = 'output';
      addToOutputQueue(data);
  });
}

const addToOutputQueue = (data: any) => {
  data.id = nextid;
  outputQueue.push(data);
  nextid++;
  outputFromQueue();
};

//@DOC
// Output a standard message, as an HTML paragraph element (P).
// The string will first be passed through the text processor.
// Additional data can be put in the optional params dictionary.
// You can specify a CSS class to use.
// During unit testing, messages will be saved and tested
export const msg = (s: string, params: any, cssClass: string): void => {
  //if (!params) params = {}
  const lines = s.split('|');
  lines.forEach(l => {
    const tag = (/^#/.test(l) ? 'h4' : 'p');
    const line = l.replace(/^#/, '');
    _msg(line, params || {}, { cssClass: cssClass, tag: tag });
  });
};
