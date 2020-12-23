QuestJs._tp.addDirective('stasis_pod_status', (arr, params) => QuestJs._w.stasis_bay.tpStatus());

QuestJs._tp.addDirective('status', (arr, params) => {
  if (typeof params.actor.status === 'string') {
    return params.actor.status === 'stasis' ? 'In stasis' : 'Deceased';
  }
  return QuestJs._settings.intervalDescs[
    QuestJs._util.getByInterval(QuestJs._settings.intervals, params.actor.status)
  ];
});

QuestJs._tp.addDirective('table_desc', (arr, params) => QuestJs._w.canteen_table.tpDesc());

QuestJs._tp.addDirective(
  'planet',
  (arr, params) =>
    PLANETS[QuestJs._w.Xsansi.currentPlanet].starName +
    PLANETS[QuestJs._w.Xsansi.currentPlanet].planet,
);

QuestJs._tp.addDirective(
  'star',
  (arr, params) => PLANETS[QuestJs._w.Xsansi.currentPlanet].starName,
);
