"use strict"

QuestJs._settings.title = "The Dinner Party"
QuestJs._settings.author = "The Pixie"
QuestJs._settings.version = "0.1"
QuestJs._settings.thanks = []
QuestJs._settings.warnings = "This is about eating dinner, so those with food issue might want to be careful, though it does not go into much detail about the food; it is really about the people."
QuestJs._settings.playMode = "dev"

QuestJs._settings.symbolsForCompass = true

QuestJs._settings.setup = function() {
  console.log(w.dinner_timetable.steps)
  console.log(w.dinner_timetable.steps.length)
  util.verifyResponses(w.dinner_timetable.steps)
}

QuestJs._settings.libraries.push('item_links')


QuestJs._settings.toolbar = {
  content:function() { return `Hitpoints : 100` },
  roomdisplay: true,
  buttons:[
    { id: "about", title: "About", icon: "fa-info", cmd: "about", href: "#" },
    { id: "save", title: "Save", icon: "fa-save", cmd: "save saved_game", href: "#" },
    { id: "print", title: "Print", icon: "fa-print", onclick: "#", href: "#" },
  ],
};

