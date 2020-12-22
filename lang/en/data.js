//----------------------------------------------------------------------------------------------
//  Language Data
export const data = {
  // Misc
  list_and: "and",
  list_nothing: "nothing",
  list_or: "or",
  list_nowhere: "nowhere",
  never_mind: "Never mind.",
  default_description: "It's just scenery.",
  click_to_continue: "Click to continue...",
  buy: "Buy", // used in the command link in the purchase table
  buy_headings: ["Item", "Cost", ""],
  current_money: "Current money",
  article_filter_regex: /^(?:the |an |a )?(.+)$/,
  joiner_regex: /\band\b|\, ?and\b|\,/,
  all_regex: /^(all|everything)$/,
  all_exclude_regex: /^((all|everything) (but|bar|except)\b)/,
  go_pre_regex: "go to |goto |go |head |",
  yesNo: ['Yes', 'No'],

  //----------------------------------------------------------------------------------------------
  // Language constructs
  pronouns: {
    thirdperson:{subjective:"it", objective:"it", possessive: "its", poss_adj: "its", reflexive:"itself"},
    massnoun:{subjective:"it", objective:"it", possessive: "its", poss_adj: "its", reflexive:"itself"},
    male:{subjective:"he", objective:"him", possessive: "his", poss_adj: "his", reflexive:"himself"},
    female:{subjective:"she", objective:"her", possessive: "hers", poss_adj: "her", reflexive:"herself"},
    plural:{subjective:"they", objective:"them", possessive: "theirs", poss_adj: "their", reflexive:"themselves"},
    firstperson:{subjective:"I", objective:"me", possessive: "mine", poss_adj: "my", reflexive:"myself", possessive_name:'my'},
    secondperson:{subjective:"you", objective:"you", possessive: "yours", poss_adj: "your", reflexive:"yourself", possessive_name:'your'},
  },

  // Display verbs used in the side panel
  verbs: {
    examine:"Examine",
    use:"Use",
    take:"Take",
    drop:"Drop",
    open:"Open",
    close:"Close",
    switchon:"Switch on",
    switchoff:"Switch off",
    wear:"Wear",
    remove:"Remove",
    lookat:"Look at",
    talkto:"Talk to",
    eat:"Eat",
    drink:"Drink",
    read:"Read",
    push:"Push",
    equip:"Equip",
    unequip:"Unequip",
    attack:"Attack",
    sitOn:"Sit on",
    standOn:"Stand on",
    reclineOn:"Lie on",
    getOff:"Get off",
  },
  
  // Flag the state of an item in a list
  invModifiers: {
    worn:"worn",
    open:"open",
    equipped:"equipped",
    dead:"dead",
  },

  // Change the abbrev values to suit your game (or language)
  // You may want to do that in settings, which is loaded first
  exit_list: [
    {name:'northwest', abbrev:'NW', niceDir:"the northwest", type:'compass', key:103, x:-1 ,y:1, z:0, opp:'southeast', symbol:'fa-arrow-left', rotate:45}, 
    {name:'north', abbrev:'N', niceDir:"the north", type:'compass', key:104, x:0 ,y:1, z:0, opp:'south', symbol:'fa-arrow-up'}, 
    {name:'northeast', abbrev:'NE', niceDir:"the northeast", type:'compass', key:105, x:1 ,y:1, z:0, opp:'southwest', symbol:'fa-arrow-up', rotate:45}, 
    {name:'in', abbrev:'In', alt:'enter|i', niceDir:"inside", type:'inout', key:111, opp:'out', symbol:'fa-sign-in-alt'}, 
    {name:'up', abbrev:'U', niceDir:"above", type:'vertical', key:109, x:0 ,y:0, z:1, opp:'down', symbol:'fa-arrow-up'},
    
    {name:'west', abbrev:'W', niceDir:"the west", type:'compass', key:100, x:-1 ,y:0, z:0, opp:'east', symbol:'fa-arrow-left'}, 
    {name:'Look', abbrev:'L', type:'nocmd', key:101, symbol:'fa-eye'}, 
    {name:'east', abbrev:'E', niceDir:"the east", type:'compass', key:102, x:1 ,y:0, z:0, opp:'west', symbol:'fa-arrow-right'}, 
    {name:'out', abbrev:'Out', alt:'exit|o', niceDir:"outside", type:'inout', key:106,opp:'in', symbol:'fa-sign-out-alt'}, 
    {name:'down', abbrev:'Dn', alt:'d', niceDir:"below", type:'vertical', key:107, x:0 ,y:0, z:-1, opp:'up', symbol:'fa-arrow-down'}, 

    {name:'southwest', abbrev:'SW', niceDir:"the southwest", type:'compass', key:97, x:-1 ,y:-1, z:0, opp:'northeast', symbol:'fa-arrow-down', rotate:45}, 
    {name:'south', abbrev:'S', niceDir:"the south", type:'compass', key:98, x:0 ,y:-1, z:0, opp:'north', symbol:'fa-arrow-down'}, 
    {name:'southeast', abbrev:'SE', niceDir:"the southeast", type:'compass', key:99, x:1 ,y:-1, z:0, opp:'northwest', symbol:'fa-arrow-right', rotate:45}, 
    {name:'Wait', abbrev:'Z', type:'nocmd', key:110, symbol:'fa-pause'}, 
    {name:'Help', abbrev:'?', type:'nocmd', symbol:'fa-info'}, 
  ],

  numberUnits: "zero,one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve,thirteen,fourteen,fifteen,sixteen,seventeen,eighteen,nineteen,twenty".split(","),
  numberTens: "twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety".split(","),

  ordinalReplacements: [
    {regex:/one$/, replace:"first"},
    {regex:/two$/, replace:"second"},
    {regex:/three$/, replace:"third"},
    {regex:/five$/, replace:"fifth"},
    {regex:/eight$/, replace:"eighth"},
    {regex:/nine$/, replace:"ninth"},
    {regex:/twelve$/, replace:"twelfth"},
    {regex:/y$/, replace:"ieth"},
  ],

  conjugations: {
    i:[
      { name:"be", value:"am"},
      { name:"'be", value:"'m"},
    ],
    you:[
      { name:"be", value:"are"},
      { name:"'be", value:"'re"},
    ],
    we:[
      { name:"be", value:"are"},
      { name:"'be", value:"'re"},
    ],
    they:[
      { name:"be", value:"are"},
      { name:"'be", value:"'re"},
    ],
    it:[
      { name:"be", value:"is"},
      { name:"have", value:"has"},
      { name:"can", value:"can"},
      { name:"mould", value:"moulds"},
      { name:"*ould", value:"ould"},
      { name:"must", value:"must"},
      { name:"don't", value:"doesn't"},
      { name:"can't", value:"can't"},
      { name:"won't", value:"won't"},
      { name:"cannot", value:"cannot"},
      { name:"@n't", value:"n't"},
      { name:"'ve", value:"'s"},
      { name:"'be", value:"'s"},
      { name:"*ay", value:"ays"},
      { name:"*uy", value:"uys"},
      { name:"*oy", value:"oys"},
      { name:"*ey", value:"eys"},
      { name:"*y", value:"ies"},
      { name:"*ss", value:"sses"},
      { name:"*s", value:"sses"},
      { name:"*sh", value:"shes"},
      { name:"*ch", value:"ches"},
      { name:"*o", value:"oes"},
      { name:"*x", value:"xes"},
      { name:"*z", value:"zes"},
      { name:"*", value:"s"},
    ],
  },

  contentsForData: {
    surface:{prefix:'with ', suffix:' on it'},
    container:{prefix:'containing ', suffix:''},
  },
};