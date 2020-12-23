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

  },
  _npc: {

  },
  _templates: {

  },
  _text: {

  },
  _tp: {

  },
  _tools: {

  },
  _utils: {

  },
  _consts: {

  },
  _log: {
    info: console.log,
    error: console.error,
    warn: console.warn,
  },
  _scope: {
    
  }
}


if (QuestJs._settings.playMode !== 'dev') {
  window.onbeforeunload = function(event) { 
    //event.returnValue = "Are you sure?"; 
  }
}