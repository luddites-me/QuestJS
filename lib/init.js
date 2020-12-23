//QuestJs = QuestJs || {};
const { QuestJs } = window;
QuestJs._command = QuestJs._command || {};
QuestJs._commands = QuestJs._commands || [];
QuestJs._consts = QuestJs._consts || {};
QuestJs._defaults = QuestJs._defaults || {};
QuestJs._io = QuestJs._io || {};
QuestJs._IO = QuestJs._IO || {};
QuestJs._lang = QuestJs._lang || {};
QuestJs._npc = QuestJs._npc || {};
QuestJs._settings = QuestJs._settings || {};
QuestJs._templates = QuestJs._templates || {};
QuestJs._text = QuestJs._text || {};
QuestJs._tools = QuestJs._tools || {};
QuestJs._tp = QuestJs._tp || {};
QuestJs._utils = QuestJs._utils || {};
QuestJs._create = QuestJs._create || {};
QuestJs._scope = QuestJs._scope || {};
QuestJs._log = QuestJs._log || {
  info  : console.log,
  error : console.error,
  warn  : console.warn,
};

if (QuestJs._settings.playMode !== 'dev') {
  onbeforeunload = function (event) {
    // event.returnValue = "Are you sure?";
  };
}


export default QuestJs;
