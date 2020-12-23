"use strict"

QuestJs._settings.title = "The City of Halmuth"
QuestJs._settings.author = "The Pixie"
QuestJs._settings.version = "0.1"
QuestJs._settings.thanks = []
QuestJs._settings.warnings = "No warnings have been set for this QuestJs._game."
QuestJs._settings.playMode = "dev"
//QuestJs._settings.reportAllSvg = true
QuestJs._settings.symbolsForCompass = true

QuestJs._settings.libraries.push('image-map')
QuestJs._settings.libraries.push('quest')
QuestJs._settings.tests = true

QuestJs._settings.status = [
  function() { return '<td>Health points:</td><td>' + QuestJs._game.player.hitpoints + '</td>' },
  function() { return '<td colspan="2">' + QuestJs._util.getDateTime() + '</td>' },
]

QuestJs._settings.roomTemplate = [
  "#{cap:{hereName}}",
  "{hereDesc}",
  "{npcStatus}",
  "{objectsHere:You can see {objects} here.}",
]

QuestJs._settings.mapAndImageCollapseAt = 1000

QuestJs._settings.mapImages = [
  {
    name:'Halmuth',
    file:'game-alt-map/map.png',
    width:1000,
    height:1000,
  },
  {
    name:'Small scale',
    file:'game-alt-map/small_scale.png',
    width:1000,
    height:1000,
  },
]

QuestJs._settings.mapScrollSpeed = 1
QuestJs._settings.mapStyle = {
  right:'0',
  top:'0',
  width:'400px',
  height:'400px',
  border:'3px black solid',
}
QuestJs._settings.mapMarker = function(loc) {
  return map.polygon(loc, [
    [0,0], [-5,-25], [-7, -20], [-18, -45], [-20, -40], [-25, -42], [-10, -18], [-15, -20]
  ], 'stroke:none;fill:black;pointer-events:none;opacity:0.5')
}


QuestJs._settings.mapPointsOfInterest = [
  {mapX:100, mapY:100, fill:'red', text:'Here is one thing'},
  {mapX:200, mapY:200, fill:'red', text:'Here is another thing'},
  {mapX:300, mapY:300, fill:'blue', text:'Here is something else', isActive:function() {return true }},
]




QuestJs._settings.dateTime = {
  startTime:1000000000,
  secondsPerTurn:60,
  data:[
    { name:'second', number:60 },
    { name:'minute', number:60 },
    { name:'hour', number:24 },
    { name:'day', number:235 },
    { name:'year', number:999999 },
  ],
  months:[
    { name:'Jansi', n:25},
    { name:'Febsi', n:24},
    { name:'Marisi', n:27},
    { name:'Apris', n:23},
    { name:'Mays', n:25},
    { name:'Junsi', n:24},
    { name:'Julesi', n:20},
    { name:'Augustes', n:23},
    { name:'Setvensi', n:24},
  ],
  days:['Day of the Moon', 'Day of the Song', 'Day of the Mother', 'Day of the Hearth', 'Day of the Fish', 'Day of the Father', 'Day of the Sun'],
  formats:{
    def:'%dayOfYear%, %year%, %hour%:%minute% %ampm%',
    time:'%hour%:%minute% %ampm%',
  },
  functions:{
    dayOfWeek:function(dict) { 
      return QuestJs._settings.dateTime.days[(dict.day + 365 * dict.year) % QuestJs._settings.dateTime.days.length] 
    },
    dayOfYear:function(dict) {
      let day = dict.day
      for (let el of QuestJs._settings.dateTime.months) {
        if (el.n > day) return (day + 1) + ' ' + el.name
        day -= el.n
      }
      return 'failed'
    },
    year:function(dict) { return dict.year + 1325 },
    hour:function(dict) { return dict.hour < 13 ? dict.hour : (dict.hour - 12) },
    minute:function(dict) { return dict.minute < 10 ? '0' + dict.minute : dict.minute },
    ampm:function(dict) {
      if (dict.minute === 0 && dict.hour === 0) return 'midnight'
      if (dict.minute === 0 && dict.hour === 12) return 'noon'
      return dict.hour < 12 ? 'am' : 'pm'
    },
  },
}
