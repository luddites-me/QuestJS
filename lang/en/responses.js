//----------------------------------------------------------------------------------------------
// Standard Responses
export const responses = {
  // This will be added to the start of the regex of a command to make an NPC command
  // The saved capture group is the NPC's name
  tell_to_prefixes: {
    1:'(?:tell|ask) (.+) to ',   // TELL KYLE TO GET SPOON
    2:'(.+), ?',                 // KYLE, GET SPOON
  },
  
  // TAKEABLE
  take_successful: "{nv:char:take:true} {nm:item:the}.",
  //take_successful_counted: "{nv:char:take:true} {number:count} {nm:item}.",
  //take_successful_counted_plural: "{nv:char:take:true} {number:count} {nm:item}.",
  drop_successful: "{nv:char:drop:true} {nm:item:the}.",
  //drop_successful_counted: "{nv:char:drop:true} {number:count} {nm:item}.",
  cannot_take: "{pv:char:can't:true} take {ob:item}.",
  cannot_drop: "{pv:char:can't:true} drop {ob:item}.",
  not_carrying: "{pv:char:don't:true} have {ob:item}.",
  already_have: "{pv:char:'ve:true} got {ob:item} already.",
  cannot_take_component: "{pv:char:can't:true} take {ob:item}, {pv:item:'be} part of {nm:whole:the}.",


  // EDIBLE
  eat_successful: "{nv:char:eat:true} {nm:item:the}.",
  drink_successful: "{nv:char:drink:true} {nm:item:the}.",
  cannot_eat: "{nv:item:'be:true} not something you can eat.",
  cannot_drink: "{nv:item:'be:true} not something you can drink.",
  //cannot_ingest: "{nv:item:'be:true} not something you can ingest.",


  // WEARABLE
  wear_successful: "{nv:char:put:true} on {nm:garment:the}.",
  remove_successful: "{nv:char:take:true} {nm:garment:the} off.",
  cannot_wear: "{nv:char:can't:true} wear {ob:item}.",
  cannot_wear_ensemble: "Individual parts of an ensemble must be worn and removed separately.",
  //wearing: "{nv:char:'be:true} wearing {ob:garment}.",  // I do not think this is used at all
  not_wearing: "{nv:char:'be:true} not wearing {ob:item}.",
  cannot_wear_over: "{nv:char:can't:true} put {nm:garment:the} on over {pa:char} {nm:outer}.",
  cannot_remove_under: "{nv:char:can't:true} take off {pa:char} {nm:garment} whilst wearing {pa:char} {nm:outer}.",
  already_wearing: "{nv:char:'be:true} already wearing {ob:garment}.",
  invWearingPrefix: "wearing",
  invHoldingPrefix: "holding",


  // CONTAINER, etc.
  open_successful: "{nv:char:open:true} {nm:container:the}.",
  close_successful: "{nv:char:close:true} {nm:container:the}.",
  lock_successful: "{nv:char:lock:true} {nm:container:the}.",
  unlock_successful: "{nv:char:unlock:true} {nm:container:the}.",
  close_and_lock_successful: "{nv:char:close:true} {nm:container:the} and {cj:char:lock} {sb:container}.",
  cannot_open: "{nv:item:can't:true} be opened.",
  cannot_close: "{nv:item:can't:true} be closed.",
  cannot_lock: "{nv:char:can't:true} lock {ob:item}.",
  cannot_unlock: "{nv:char:can't:true} unlock {ob:item}.",
  not_container: "{nv:container:be:true} not a container.",
  container_recursion: "What? You want to put {nm:item:the} in {nm:container:the} when {nm:container:the} is already in {nm:item:the}? That's just too freaky for me.",
  not_inside: "{nv:item:'be:true} not inside that.",
  locked: "{nv:container:be:true} locked.",
  no_key: "{nv:char:do:true} have the right key.",
  locked_exit: "That way is locked.",
  open_and_enter: "{nv:char:open:true} the {param:doorName} and walk through.",
  unlock_and_enter: "{nv:char:unlock:true} the {param:doorName}, open it and walk through.",
  try_but_locked: "{nv:char:try:true} the {param:doorName}, but it is locked.",
  container_closed: "{nv:container:be:true} closed.",
  inside_container: "{nv:item:be:true} inside {nm:container:the}.",
  look_inside: "Inside {nm:container:the} {nv:char:can} see {param:list}.",
  
  
  // MECHANDISE
  purchase_successful: "{nv:char:buy:true} {nm:item:the} for {money:money}.",
  sell_successful: "{nv:char:sell:true} {nm:item:the} for {money:money}.",
  cannot_purchase_again: "{nv:char:can't:true} buy {nm:item:the} here - probably because {pv:char:be} already holding {ob:item}.",
  cannot_purchase_here: "{nv:char:can't:true} buy {nm:item:the} here.",
  cannot_afford: "{nv:char:can't:true} afford {nm:item:the} (need {money:money}).",
  cannot_sell_here: "{nv:char:can't:true} sell {nm:item:the} here.",


  // FURNITURE
  sit_on_successful: "{nv:char:sit:true} on {nm:item:the}.",
  stand_on_successful: "{nv:char:stand:true} on {nm:item:the}.",
  recline_on_successful: "{nv:char:lie:true} down on {nm:item:the}.",
  cannot_stand_on: "{nv:item:'be:true} not something you can stand on.",
  cannot_sit_on: "{nv:item:'be:true} not something you can sit on.",
  cannot_recline_on: "{nv:item:'be:true} not something you can lie on.",


  // SWITCHABLE
  turn_on_successful: "{nv:char:switch:true} {nm:item:the} on.",
  turn_off_successful: "{nv:char:switch:true} {nm:item:the} off.",
  cannot_switch_on: "{nv:char:can't:true} turn {ob:item} on.",
  cannot_switch_off: "{nv:char:can't:true} turn {ob:item} off.",

  // VESSEL
  fill_successful: "{nv:char:fill:true} {nm:container:the}.",
  empty_successful: "{nv:char:empty:true} {nm:container:the}.",
  cannot_fill: "{nv:container:'be:true} not something you can fill.",
  cannot_mix: "{nv:container:'be:true} not something you can mix liquids in.",
  cannot_empty: "{nv:container:'be:true} not something you can empty.",
  not_vessel: "{pv:container:be:true} is not a vessel.",

  // NPC
  not_npc: "{nv:char:can:true} tell {nm:item:the} to do what you like, but there is no way {pv:item:'ll} do it.",
  not_npc_for_give: "Realistically, {nv:item:be} not interested in anything {sb:char} might give {ob:item}.",

  cannot_ask_about: "You can ask {ob:item} about {param:text} all you like, but {pv:item:'be} not about to reply.",
  cannot_tell_about: "You can tell {ob:item} about {param:text} all you like, but {pv:item:'be} not interested.",
  topics_no_ask_tell: "This character has no ASK/ABOUT or TELL/ABOUT options set up.",
  topics_none_found: "No suggestions for what to ask or tell {nm:item:the} available.",
  topics_ask_list: "Some suggestions for what to ask {nm:item:the} about: {param:list}.",
  topics_tell_list: "Some suggestions for what to tell {nm:item:the} about: {param:list}.",
  cannot_talk_to: "You chat to {nm:item:the} for a few moments, before releasing that {pv:item:'be} not about to reply.",
  no_topics: "{nv:char:have:true} nothing to talk to {nm:item:the} about.",
  not_able_to_hear: "Doubtful {nv:item:will} be interested in anything {sb:char} has to say.",
  npc_no_interest_in: "{nv:actor:have:true} no interest in that subject.",


  // BUTTON
  push_button_successful: "{nv:char:push:true} {nm:item:the}.",

  // SHIFTABLE
  push_exit_successful: "{nv:char:push:true} {nm:item:the} {param:dir}.",
  cannot_push: "{pv:item:'be:true} not something you can move around like that.",
  cannot_push_up: "{pv:char:'be:true} not getting {nm:item:the} up there!",
  take_not_push: "Just pick the thing up already!",


  // ROPE
  rope_examine_attached_both_ends: " It is {rope.attachedVerb} to both {nm:obj1:the} and {nm:obj2:the}.",
  rope_examine_attached_one_end: " It is {rope.attachedVerb} to {nm:obj1:the}.",
  rope_attach_verb: 'tie',
  rope_attached_verb: 'tied',
  rope_detach_verb: 'untie',
  rope_one_end: 'One end',
  rope_other_end: 'The other end',
  rope_examine_end_attached: 'is {rope.attachedVerb} to {nm:obj:the}.',
  rope_examine_end_held: 'is held by {nm:holder:the}.',
  rope_examine_end_headed: 'heads into {nm:loc:the}.',
    


  // Movement
  go_successful: "{nv:char:head:true} {param:dir}.",
  not_that_way: "{nv:char:can't:true} go {param:dir}.",
  can_go: "You think you can go {exits}.",


  // General cannot Messages
  cannot_read: "Nothing worth reading there.",
  cannot_use: "No obvious way to use {ob:item}.",
  cannot_smash: "{nv:item:'be:true} not something you can break.",
  cannot_look_out: "Not something you can look out of.",
  cannot_smell: "{nv:item:have:true} no smell.",
  cannot_listen: "{nv:item:be:true} not making any noise.",


  // General command messages
  not_known_msg: "I don't even know where to begin with that.",
  disambig_msg: "Which do you mean?",
  no_multiples_msg: "You cannot use multiple objects with that command.",
  nothing_msg: "Nothing there to do that with.",
  general_obj_error: "So I kind of get what you want to do, but not what you want to do it with.",
  done_msg: "Done.",
  nothing_for_sale: "Nothing for sale here.",
  wait_msg: "You wait one turn.",
  no_map: "Sorry, no map available.",
  inventory_prefix: "You are carrying",


  // General command fails
  no_smell: "{pv:char:can't:true} smell anything here.",
  no_listen: "{pv:char:can't:true} hear anything of note here.",
  nothing_there: "{nv:char:be:true} sure there's nothing there.",
  nothing_inside: "There's nothing to see inside.",
  it_is_empty: "{pv:container:be:true} empty.",
  not_here: "{pv:item:'be:true} not here.",
  char_has_it: "{nv:holder:have:true} {ob:item}.",
  none_here: "There's no {nm:item} here.",
  none_held: "{nv:char:have:true} no {nm:item}.",
  nothing_useful: "That's not going to do anything useful.",
  already: "{sb:item:true} already {cj:item:be}.",
  default_examine: "{pv:item:'be:true} just your typical, every day {nm:item}.",
  
  error: "Oh dear, I seem to have hit an error trying to handle that (F12 for more details).",
};