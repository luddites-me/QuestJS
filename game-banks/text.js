"use strict"

QuestJs._tp.addDirective("stasis_pod_status", function(arr, params) {
  return w.stasis_bay.tpStatus()
})

QuestJs._tp.addDirective("status", function(arr, params) {
  if (typeof params.actor.status === "string") {
    return params.actor.status === 'stasis' ? 'In stasis' : 'Deceased'
  }
  else {
    return QuestJs._settings.intervalDescs[util.getByInterval(QuestJs._settings.intervals, params.actor.status)]
  }
})

QuestJs._tp.addDirective("table_desc", function(arr, params) {
  return w.canteen_table.tpDesc()
})


QuestJs._tp.addDirective("planet", function(arr, params) {
  return PLANETS[w.Xsansi.currentPlanet].starName + PLANETS[w.Xsansi.currentPlanet].planet
})

QuestJs._tp.addDirective("star", function(arr, params) {
  return PLANETS[w.Xsansi.currentPlanet].starName
})

