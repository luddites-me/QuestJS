const imagePane = {
  toggle: true,
  defaults: {
    imageStyle: {
      right: '0',
      top: '200px',
      width: '400px',
      height: '400px',
      'background-color': '#ddd',
      border: '3px black solid',
    },
  },
};

imagePane.defaultStyle = { position: 'fixed', display: 'block' };
QuestJs._IO.modulesToInit.push(imagePane);

imagePane.init = function () {
  // First set up the HTMP page
  $('#quest-image').css(imagePane.defaultStyle);
  $('#quest-image').css(QuestJs._settings.imageStyle);
  QuestJs._settings.imageHeight = parseInt(QuestJs._settings.imageStyle.height);
  QuestJs._settings.imageWidth = parseInt(QuestJs._settings.imageStyle.width);

  // Set the default values for settings
  for (let key in imagePane.defaults) {
    if (!settings[key]) settings[key] = imagePane.defaults[key];
  }
};

imagePane.hide = function () {
  $('#quest-image').hide();
};
imagePane.show = function () {
  $('#quest-image').show();
};

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('MetaImages', {
    script: function () {
      if (QuestJs._settings.hideImagePane) {
        $('#quest-images').show();
        delete QuestJs._settings.hideImagePane;
      } else {
        $('#quest-images').hide();
        QuestJs._settings.hideImagePane = true;
      }
      QuestJs._IO.calcMargins();
      QuestJs._io.msg(QuestJs._lang.done_msg);
    },
  }),
);
