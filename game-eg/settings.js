"use strict";

QuestJs._settings.title = "A First Step..."
QuestJs._settings.author = "The Pixie"
QuestJs._settings.version = "1.2"
QuestJs._settings.thanks = ["Kyle", "Lara"]

QuestJs._settings.noTalkTo = false
QuestJs._settings.noAskTell = false

QuestJs._settings.tests = true
QuestJs._settings.playMode = 'dev'
QuestJs._settings.reportAllSvg = true

QuestJs._settings.textEffectDelay = 100

QuestJs._settings.imagesFolder = 'images/'
QuestJs._settings.libraries.push('zone')
QuestJs._settings.libraries.push('quest')
QuestJs._settings.styleFile = 'style'

QuestJs._settings.textEffectDelay = 100

QuestJs._settings.symbolsForCompass = true

QuestJs._settings.status = [
  "hitpoints",
  function() { return "<td>Spell points:</td><td>3</td>"; },
  function() { return "<td>Health points:</td><td>" + QuestJs._game.player.hitpoints + "</td>"; },
  function() { return '<td colspan="2">' + QuestJs._game.player.status + "</td>"; },
]

QuestJs._settings.intro = "This is a quick example of what can be done in Quest 6.|Your objective is to turn on the light in the basement, but there are, of course, numerous hoops to jump through.|If you are successful, see if you can do it again, but getting Kyle to do everything. It is {dateTime}. You should find that you can tell an NPC to do pretty much anything (except look at things for you and talk to people for you).|There is now a sizeable desert to the west you can explore too.|Learn more about Quest 6 {link:here:https://github.com/ThePix/QuestJS/wiki}."

QuestJs._settings.mapDrawLabels=true

// This function will be called at the start of the game, so can be used
// to introduce your QuestJs._game.
QuestJs._settings.setup = function() {
  QuestJs._game.player.hitpoints = 20;
  QuestJs._game.player.status = "You are feeling fine";
  QuestJs._IO.updateStatus()
  QuestJs._io.createPaneBox(2, "Extra options", '<button onclick="alert(\'Here!\')">Alert</button>')
  
}



QuestJs._settings.mapStyle = {right:'0', top:'200px', width:'300px', height:'300px', 'background-color':'yellow' }
QuestJs._settings.mapLabelStyle = {'font-size':'8pt', 'font-weight':'bold', color:'blue'}