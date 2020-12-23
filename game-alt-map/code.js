"use strict"


//quest.next(char, questname)
//quest.set(char, questname, const or stepname)


quest.create('Charm for Tary', [
{text:'Tary has asked me to find her a petro-charm; I should try Madame Rel\'s Little Shop of Wonders on the Wheat Road.'},
{text:'Tary has asked me to find her a petro-charm; I have found one, I need to give it to her.'},
])



util.openingTimes = function () {
  if (util.isAfter('1700')) return QuestJs._io.falsemsg('The business is now closed.')
  if (!util.isAfter('0800')) return QuestJs._io.falsemsg('The business closed until eight.')
  return true
}
    



QuestJs._tp.addDirective("timeOfDayComment", function(arr, params) {
  const time = util.getCustomDateTimeDict({})
  const location = w[game.player.loc]
  if (!location.timeStatus) return ''
  let hour = time.hour
  for (let i = 0; i < location.timeStatus.length; i++) {
    if (hour < location.timeStatus[i].to) return location.timeStatus[i].t
    hour -= location.timeStatus[i].to
  }
  return "NONE"
})
  
QuestJs._tp.addDirective("npcStatus", function(arr, params) {
  const result = []
  for (let el of scopeAllNpcHere()) {
    console.log(el.name)
    if (el.locationStatus) {
      const s = el.locationStatus()
      if (s) result.push(s)
    }
  }
  return result.join('|')
})
  
