export const Grammar = {
  all_exclude_regex: /^((all|everything) (but|bar|except)\b)/,
  all_regex: /^(all|everything)$/,
  article_filter_regex: /^(?:the |an |a )?(.+)$/,
  buy: "Buy",
  buy_headings: ["Item", "Cost", ""],
  click_to_continue: "Click to continue...",
  conjugations: {
    i: [
      {
        name: "be",
        value: "am"
      },
      {
        name: "'be",
        value: "'m"
      }
    ],
    it: [
      {
        name: "be",
        value: "is"
      },
      {
        name: "have",
        value: "has"
      },
      {
        name: "can",
        value: "can"
      },
      {
        name: "mould",
        value: "moulds"
      },
      {
        name: "*ould",
        value: "ould"
      },
      {
        name: "must",
        value: "must"
      },
      {
        name: "don't",
        value: "doesn't"
      },
      {
        name: "can't",
        value: "can't"
      },
      {
        name: "won't",
        value: "won't"
      },
      {
        name: "cannot",
        value: "cannot"
      },
      {
        name: "@n't",
        value: "n't"
      },
      {
        name: "'ve",
        value: "'s"
      },
      {
        name: "'be",
        value: "'s"
      },
      {
        name: "*ay",
        value: "ays"
      },
      {
        name: "*uy",
        value: "uys"
      },
      {
        name: "*oy",
        value: "oys"
      },
      {
        name: "*ey",
        value: "eys"
      },
      {
        name: "*y",
        value: "ies"
      },
      {
        name: "*ss",
        value: "sses"
      },
      {
        name: "*s",
        value: "sses"
      },
      {
        name: "*sh",
        value: "shes"
      },
      {
        name: "*ch",
        value: "ches"
      },
      {
        name: "*o",
        value: "oes"
      },
      {
        name: "*x",
        value: "xes"
      },
      {
        name: "*z",
        value: "zes"
      },
      {
        name: "*",
        value: "s"
      }
    ],
    they: [
      {
        name: "be",
        value: "are"
      },
      {
        name: "'be",
        value: "'re"
      }
    ],
    we: [
      {
        name: "be",
        value: "are"
      },
      {
        name: "'be",
        value: "'re"
      }
    ],
    you: [
      {
        name: "be",
        value: "are"
      },
      {
        name: "'be",
        value: "'re"
      }
    ]
  },
  contentsForData: {
    container: {
      prefix: "containing ",
      suffix: ""
    },
    surface: {
      prefix: "with ",
      suffix: " on it"
    }
  },
  current_money: "Current money",
  default_description: "It's just scenery.",
  exit_list: [
    {
      abbrev: "NW",
      key: 103,
      name: "northwest",
      niceDir: "the northwest",
      opp: "southeast",
      rotate: 45,
      symbol: "fa-arrow-left",
      type: "compass",
      x: -1,
      y: 1,
      z: 0
    },
    {
      abbrev: "N",
      key: 104,
      name: "north",
      niceDir: "the north",
      opp: "south",
      symbol: "fa-arrow-up",
      type: "compass",
      x: 0,
      y: 1,
      z: 0
    },
    {
      abbrev: "NE",
      key: 105,
      name: "northeast",
      niceDir: "the northeast",
      opp: "southwest",
      rotate: 45,
      symbol: "fa-arrow-up",
      type: "compass",
      x: 1,
      y: 1,
      z: 0
    },
    {
      abbrev: "In",
      alt: "enter|i",
      key: 111,
      name: "in",
      niceDir: "inside",
      opp: "out",
      symbol: "fa-sign-in-alt",
      type: "inout"
    },
    {
      abbrev: "U",
      key: 109,
      name: "up",
      niceDir: "above",
      opp: "down",
      symbol: "fa-arrow-up",
      type: "vertical",
      x: 0,
      y: 0,
      z: 1
    },
    {
      abbrev: "W",
      key: 100,
      name: "west",
      niceDir: "the west",
      opp: "east",
      symbol: "fa-arrow-left",
      type: "compass",
      x: -1,
      y: 0,
      z: 0
    },
    {
      abbrev: "L",
      key: 101,
      name: "Look",
      symbol: "fa-eye",
      type: "nocmd"
    },
    {
      abbrev: "E",
      key: 102,
      name: "east",
      niceDir: "the east",
      opp: "west",
      symbol: "fa-arrow-right",
      type: "compass",
      x: 1,
      y: 0,
      z: 0
    },
    {
      abbrev: "Out",
      alt: "exit|o",
      key: 106,
      name: "out",
      niceDir: "outside",
      opp: "in",
      symbol: "fa-sign-out-alt",
      type: "inout"
    },
    {
      abbrev: "Dn",
      alt: "d",
      key: 107,
      name: "down",
      niceDir: "below",
      opp: "up",
      symbol: "fa-arrow-down",
      type: "vertical",
      x: 0,
      y: 0,
      z: -1
    },
    {
      abbrev: "SW",
      key: 97,
      name: "southwest",
      niceDir: "the southwest",
      opp: "northeast",
      rotate: 45,
      symbol: "fa-arrow-down",
      type: "compass",
      x: -1,
      y: -1,
      z: 0
    },
    {
      abbrev: "S",
      key: 98,
      name: "south",
      niceDir: "the south",
      opp: "north",
      symbol: "fa-arrow-down",
      type: "compass",
      x: 0,
      y: -1,
      z: 0
    },
    {
      abbrev: "SE",
      key: 99,
      name: "southeast",
      niceDir: "the southeast",
      opp: "northwest",
      rotate: 45,
      symbol: "fa-arrow-right",
      type: "compass",
      x: 1,
      y: -1,
      z: 0
    },
    {
      abbrev: "Z",
      key: 110,
      name: "Wait",
      symbol: "fa-pause",
      type: "nocmd"
    },
    {
      abbrev: "?",
      name: "Help",
      symbol: "fa-info",
      type: "nocmd"
    }
  ],
  go_pre_regex: "go to |goto |go |head |",
  invModifiers: {
    dead: "dead",
    equipped: "equipped",
    open: "open",
    worn: "worn"
  },
  joiner_regex: /\band\b|\, ?and\b|\, /,
  list_and: "and",
  list_nothing: "nothing",
  list_nowhere: "nowhere",
  list_or: "or",
  never_mind: "Never mind.",
  numberTens: ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"],
  numberUnits: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"],
  ordinalReplacements: [
    {
      regex: /one$/,
      replace: "first"
    },
    {
      regex: /two$/,
      replace: "second"
    },
    {
      regex: /three$/,
      replace: "third"
    },
    {
      regex: /five$/,
      replace: "fifth"
    },
    {
      regex: /eight$/,
      replace: "eighth"
    },
    {
      regex: /nine$/,
      replace: "ninth"
    },
    {
      regex: /twelve$/,
      replace: "twelfth"
    },
    {
      regex: /y$/,
      replace: "ieth"
    }
  ],
  pronouns: {
    female: {
      objective: "her",
      poss_adj: "her",
      possessive: "hers",
      reflexive: "herself",
      subjective: "she"
    },
    firstperson: {
      objective: "me",
      poss_adj: "my",
      possessive: "mine",
      possessive_name: "my",
      reflexive: "myself",
      subjective: "I"
    },
    male: {
      objective: "him",
      poss_adj: "his",
      possessive: "his",
      reflexive: "himself",
      subjective: "he"
    },
    massnoun: {
      objective: "it",
      poss_adj: "its",
      possessive: "its",
      reflexive: "itself",
      subjective: "it"
    },
    plural: {
      objective: "them",
      poss_adj: "their",
      possessive: "theirs",
      reflexive: "themselves",
      subjective: "they"
    },
    secondperson: {
      objective: "you",
      poss_adj: "your",
      possessive: "yours",
      possessive_name: "your",
      reflexive: "yourself",
      subjective: "you"
    },
    thirdperson: {
      objective: "it",
      poss_adj: "its",
      possessive: "its",
      reflexive: "itself",
      subjective: "it"
    }
  },
  verbs: {
    attack: "Attack",
    close: "Close",
    drink: "Drink",
    drop: "Drop",
    eat: "Eat",
    equip: "Equip",
    examine: "Examine",
    getOff: "Get off",
    lookat: "Look at",
    open: "Open",
    push: "Push",
    read: "Read",
    reclineOn: "Lie on",
    remove: "Remove",
    sitOn: "Sit on",
    standOn: "Stand on",
    switchoff: "Switch off",
    switchon: "Switch on",
    take: "Take",
    talkto: "Talk to",
    unequip: "Unequip",
    use: "Use",
    wear: "Wear"
  },
  yesNo: ["Yes", "No"],
  shipwise_exit_list: [
    {
      name: "forward-port",
      abbrev: "FP",
      niceDir: "forward-port",
      type: "compass",
      key: 103,
      x: -1,
      y: 1,
      z: 0,
      opp: "aft-starboard",
      symbol: "fa-arrow-left",
      rotate: 45
    },
    {
      name: "forward",
      abbrev: "F",
      niceDir: "forward",
      type: "compass",
      key: 104,
      x: 0,
      y: 1,
      z: 0,
      opp: "aft",
      symbol: "fa-arrow-up"
    },
    {
      name: "forward-starboard",
      abbrev: "FS",
      niceDir: "forward-starboard",
      type: "compass",
      key: 105,
      x: 1,
      y: 1,
      z: 0,
      opp: "aft-port",
      symbol: "fa-arrow-up",
      rotate: 45
    },
    {
      name: "in",
      abbrev: "In",
      alt: "enter|i",
      niceDir: "inside",
      type: "inout",
      opp: "out",
      symbol: "fa-sign-in-alt"
    },
    {
      name: "up",
      abbrev: "U",
      niceDir: "above",
      type: "vertical",
      key: 107,
      x: 0,
      y: 0,
      z: 1,
      opp: "down",
      symbol: "fa-arrow-up"
    },
    {
      name: "port",
      abbrev: "P",
      niceDir: "port",
      type: "compass",
      key: 100,
      x: -1,
      y: 0,
      z: 0,
      opp: "starboard",
      symbol: "fa-arrow-left"
    },
    {
      name: "Look",
      abbrev: "Lk",
      type: "nocmd",
      key: 101,
      symbol: "fa-eye"
    },
    {
      name: "starboard",
      abbrev: "S",
      niceDir: "starboard",
      type: "compass",
      key: 102,
      x: 1,
      y: 0,
      z: 0,
      opp: "port",
      symbol: "fa-arrow-right"
    },
    {
      name: "out",
      abbrev: "Out",
      alt: "exit|o",
      niceDir: "outside",
      type: "inout",
      opp: "in",
      symbol: "fa-sign-out-alt"
    },
    {
      name: "down",
      abbrev: "Dn",
      alt: "d",
      niceDir: "below",
      type: "vertical",
      key: 109,
      x: 0,
      y: 0,
      z: -1,
      opp: "up",
      symbol: "fa-arrow-down"
    },
    {
      name: "aft-port",
      abbrev: "AF",
      niceDir: "aft-port",
      type: "compass",
      key: 97,
      x: -1,
      y: -1,
      z: 0,
      opp: "forward-starboard",
      symbol: "fa-arrow-down",
      rotate: 45
    },
    {
      name: "aft",
      abbrev: "A",
      niceDir: "aft",
      type: "compass",
      key: 98,
      x: 0,
      y: -1,
      z: 0,
      opp: "forward",
      symbol: "fa-arrow-down"
    },
    {
      name: "after-starboard",
      abbrev: "AS",
      niceDir: "after-starboard",
      type: "compass",
      key: 99,
      x: 1,
      y: -1,
      z: 0,
      opp: "forward-port",
      symbol: "fa-arrow-right",
      rotate: 45
    },
    {
      name: "Wait",
      abbrev: "Z",
      type: "nocmd",
      key: 110,
      symbol: "&#9208;"
    },
    {
      name: "Help",
      abbrev: "?",
      type: "nocmd",
      symbol: "&#128712;"
    }
  ]
};
