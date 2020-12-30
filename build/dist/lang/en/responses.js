const standard = {
  already_have: "{pv:char:'ve:true} got {ob:item} already.",
  cannot_drop: "{pv:char:can't:true} drop {ob:item}.",
  cannot_take: "{pv:char:can't:true} take {ob:item}.",
  cannot_take_component: "{pv:char:can't:true} take {ob:item}; {pv:item:'be} part of {nm:whole:the}.",
  drop_successful: "{nv:char:drop:true} {nm:item:the}.",
  drop_successful_counted: "{nv:char:drop:true} {number:count} {nm:item}.",
  not_carrying: "{pv:char:don't:true} have {ob:item}.",
  take_successful: "{nv:char:take:true} {nm:item:the}.",
  take_successful_counted: "{nv:char:take:true} {number:count} {nm:item}.",
  take_successful_counted_plural: "{nv:char:take:true} {number:count} {nm:item}."
};
const tell_to_prefixes = {
  1: "(?:tell|ask) (.+) to ",
  2: "(.+), ?"
};
const edible = {
  cannot_drink: "{nv:item:'be:true} not something you can drink.",
  cannot_eat: "{nv:item:'be:true} not something you can eat.",
  cannot_ingest: "{nv:item:'be:true} not something you can ingest.",
  drink_successful: "{nv:char:drink:true} {nm:item:the}.",
  eat_successful: "{nv:char:eat:true} {nm:item:the}."
};
const wearable = {
  already_wearing: "{nv:char:'be:true} already wearing {ob:garment}.",
  cannot_remove_under: "{nv:char:can't:true} take off {pa:char} {nm:garment} whilst wearing {pa:char} {nm:outer}.",
  cannot_wear: "{nv:char:can't:true} wear {ob:item}.",
  cannot_wear_ensemble: "Individual parts of an ensemble must be worn and removed separately.",
  cannot_wear_over: "{nv:char:can't:true} put {nm:garment:the} on over {pa:char} {nm:outer}.",
  invHoldingPrefix: "holding",
  invWearingPrefix: "wearing",
  not_wearing: "{nv:char:'be:true} not wearing {ob:item}.",
  remove_successful: "{nv:char:take:true} {nm:garment:the} off.",
  wear_successful: "{nv:char:put:true} on {nm:garment:the}.",
  wearing: "{nv:char:'be:true} wearing {ob:garment}."
};
const container = {
  cannot_close: "{nv:item:can't:true} be closed.",
  cannot_lock: "{nv:char:can't:true} lock {ob:item}.",
  cannot_open: "{nv:item:can't:true} be opened.",
  cannot_unlock: "{nv:char:can't:true} unlock {ob:item}.",
  close_and_lock_successful: "{nv:char:close:true} {nm:container:the} and {cj:char:lock} {sb:container}.",
  close_successful: "{nv:char:close:true} {nm:container:the}.",
  container_closed: "{nv:container:be:true} closed.",
  container_recursion: "What? You want to put {nm:item:the} in {nm:container:the} when {nm:container:the} is already in {nm:item:the}? That's just too freaky for me.",
  inside_container: "{nv:item:be:true} inside {nm:container:the}.",
  lock_successful: "{nv:char:lock:true} {nm:container:the}.",
  locked: "{nv:container:be:true} locked.",
  locked_exit: "That way is locked.",
  look_inside: "Inside {nm:container:the} {nv:char:can} see {param:list}.",
  no_key: "{nv:char:do:true} have the right key.",
  not_container: "{nv:container:be:true} not a container.",
  not_inside: "{nv:item:'be:true} not inside that.",
  open_and_enter: "{nv:char:open:true} the {param:doorName} and walk through.",
  open_successful: "{nv:char:open:true} {nm:container:the}.",
  try_but_locked: "{nv:char:try:true} the {param:doorName}, but it is locked.",
  unlock_and_enter: "{nv:char:unlock:true} the {param:doorName}, open it and walk through.",
  unlock_successful: "{nv:char:unlock:true} {nm:container:the}."
};
const merchandise = {
  cannot_afford: "{nv:char:can't:true} afford {nm:item:the} (need {money:money}).",
  cannot_purchase_again: "{nv:char:can't:true} buy {nm:item:the} here - probably because {pv:char:be} already holding {ob:item}.",
  cannot_purchase_here: "{nv:char:can't:true} buy {nm:item:the} here.",
  cannot_sell_here: "{nv:char:can't:true} sell {nm:item:the} here.",
  purchase_successful: "{nv:char:buy:true} {nm:item:the} for {money:money}.",
  sell_successful: "{nv:char:sell:true} {nm:item:the} for {money:money}."
};
const furniture = {
  cannot_recline_on: "{nv:item:'be:true} not something you can lie on.",
  cannot_sit_on: "{nv:item:'be:true} not something you can sit on.",
  cannot_stand_on: "{nv:item:'be:true} not something you can stand on.",
  recline_on_successful: "{nv:char:lie:true} down on {nm:item:the}.",
  sit_on_successful: "{nv:char:sit:true} on {nm:item:the}.",
  stand_on_successful: "{nv:char:stand:true} on {nm:item:the}."
};
const switchable = {
  cannot_switch_off: "{nv:char:can't:true} turn {ob:item} off.",
  cannot_switch_on: "{nv:char:can't:true} turn {ob:item} on.",
  turn_off_successful: "{nv:char:switch:true} {nm:item:the} off.",
  turn_on_successful: "{nv:char:switch:true} {nm:item:the} on."
};
const vessel = {
  cannot_empty: "{nv:container:'be:true} not something you can empty.",
  cannot_fill: "{nv:container:'be:true} not something you can fill.",
  cannot_mix: "{nv:container:'be:true} not something you can mix liquids in.",
  empty_successful: "{nv:char:empty:true} {nm:container:the}.",
  fill_successful: "{nv:char:fill:true} {nm:container:the}.",
  not_vessel: "{pv:container:be:true} is not a vessel."
};
const npc = {
  cannot_ask_about: "You can ask {ob:item} about {param:text} all you like, but {pv:item:'be} not about to reply.",
  cannot_talk_to: "You chat to {nm:item:the} for a few moments, before releasing that {pv:item:'be} not about to reply.",
  cannot_tell_about: "You can tell {ob:item} about {param:text} all you like, but {pv:item:'be} not interested.",
  no_topics: "{nv:char:have:true} nothing to talk to {nm:item:the} about.",
  not_able_to_hear: "Doubtful {nv:item:will} be interested in anything {sb:char} has to say.",
  not_npc: "{nv:char:can:true} tell {nm:item:the} to do what you like, but there is no way {pv:item:'ll} do it.",
  not_npc_for_give: "Realistically, {nv:item:be} not interested in anything {sb:char} might give {ob:item}.",
  npc_no_interest_in: "{nv:actor:have:true} no interest in that subject.",
  topics_ask_list: "Some suggestions for what to ask {nm:item:the} about: {param:list}.",
  topics_no_ask_tell: "This character has no ASK/ABOUT or TELL/ABOUT options set up.",
  topics_none_found: "No suggestions for what to ask or tell {nm:item:the} available.",
  topics_tell_list: "Some suggestions for what to tell {nm:item:the} about: {param:list}."
};
const shiftable = {
  cannot_push: "{pv:item:'be:true} not something you can move around like that.",
  cannot_push_up: "{pv:char:'be:true} not getting {nm:item:the} up there!",
  push_exit_successful: "{nv:char:push:true} {nm:item:the} {param:dir}.",
  take_not_push: "Just pick the thing up already!"
};
const rope = {
  rope_attach_verb: "tie",
  rope_attached_verb: "tied",
  rope_detach_verb: "untie",
  rope_examine_attached_both_ends: " It is {rope.attachedVerb} to both {nm:obj1:the} and {nm:obj2:the}.",
  rope_examine_attached_one_end: " It is {rope.attachedVerb} to {nm:obj1:the}.",
  rope_examine_end_attached: "is {rope.attachedVerb} to {nm:obj:the}.",
  rope_examine_end_headed: "heads into {nm:loc:the}.",
  rope_examine_end_held: "is held by {nm:holder:the}.",
  rope_one_end: "One end",
  rope_other_end: "The other end"
};
const movement = {
  can_go: "You think you can go {exits}.",
  go_successful: "{nv:char:head:true} {param:dir}.",
  not_that_way: "{nv:char:can't:true} go {param:dir}."
};
const cannot = {
  cannot_listen: "{nv:item:be:true} not making any noise.",
  cannot_look_out: "Not something you can look out of.",
  cannot_read: "Nothing worth reading there.",
  cannot_smash: "{nv:item:'be:true} not something you can break.",
  cannot_smell: "{nv:item:have:true} no smell.",
  cannot_use: "No obvious way to use {ob:item}."
};
const command = {
  disambig_msg: "Which do you mean?",
  done_msg: "Done.",
  general_obj_error: "So I kind of get what you want to do, but not what you want to do it with.",
  inventory_prefix: "You are carrying",
  no_map: "Sorry, no map available.",
  no_multiples_msg: "You cannot use multiple objects with that command.",
  not_known_msg: "I don't even know where to begin with that.",
  nothing_for_sale: "Nothing for sale here.",
  nothing_msg: "Nothing there to do that with.",
  wait_msg: "You wait one turn."
};
const fails = {
  already: "{sb:item:true} already {cj:item:be}.",
  char_has_it: "{nv:holder:have:true} {ob:item}.",
  default_examine: "{pv:item:'be:true} just your typical, every day {nm:item}.",
  error: "Oh dear, I seem to have hit an error trying to handle that (F12 for more details).",
  it_is_empty: "{pv:container:be:true} empty.",
  no_listen: "{pv:char:can't:true} hear anything of note here.",
  no_smell: "{pv:char:can't:true} smell anything here.",
  none_held: "{nv:char:have:true} no {nm:item}.",
  none_here: "There's no {nm:item} here.",
  not_here: "{pv:item:'be:true} not here.",
  nothing_inside: "There's nothing to see inside.",
  nothing_there: "{nv:char:be:true} sure there's nothing there.",
  nothing_useful: "That's not going to do anything useful."
};
export const Responses = {
  ...cannot,
  ...command,
  ...container,
  ...edible,
  ...fails,
  ...furniture,
  ...merchandise,
  ...movement,
  ...npc,
  ...rope,
  ...shiftable,
  ...standard,
  ...switchable,
  ...vessel,
  ...wearable,
  push_button_successful: "{nv:char:push:true} {nm:item:the}.",
  tell_to_prefixes
};
