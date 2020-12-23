const QuestJs = {
  _lang: {

  },
  _command: {

  },
  _commands: [],
  _defaults: {

  },
  _io: {

  },
  _IO: {

  },
  _settings: {

  }
}


if (QuestJs._settings.playMode !== 'dev') {
  window.onbeforeunload = function(event) { 
    //event.returnValue = "Are you sure?"; 
  }
}