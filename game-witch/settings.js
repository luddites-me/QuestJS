"use strict";

QuestJs._settings.title = "Blood Witch"
QuestJs._settings.author = "The Pixie"
QuestJs._settings.version = "1.2"
QuestJs._settings.thanks = ["Kyle", "Lara"]
QuestJs._settings.dscription = ["The Great Citadel holds a terrible secret. Unbeknownst to anyone, one of the king's concubines is a Blood Witch!", "And it is you!"]

QuestJs._settings.noTalkTo = false
QuestJs._settings.noAskTell = false

//QuestJs._settings.tests = true

QuestJs._settings.textEffectDelay = 100

QuestJs._settings.imagesFolder = 'images/'

QuestJs._settings.status = [
  "hitpoints",
  function() { return "<td>Spell points:</td><td>3</td>"; },
  function() { return "<td>Health points:</td><td>" + game.player.hitpoints + "</td>"; },
  function() { return '<td colspan="2">' + game.player.status + "</td>"; },
]

QuestJs._settings.intro = "."



// This function will be called at the start of the game, so can be used
// to introduce your game.
QuestJs._settings.setup = function() {
  game.player.hitpoints = 20;
  game.player.status = "You are feeling fine";
  QuestJs._IO.updateStatus()
}


//QuestJs._settings.panes = 'none'

QuestJs._settings.roomTemplate = [
  "#{cap:{hereName}}",
  "{hereDesc}",
  "{objectsHere:You can see {objects} here.}",
]

