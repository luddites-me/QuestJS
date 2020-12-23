"use strict";




comands.unshift(new QuestJs._command.Cmd('wait3', {
  regex:/^^wait$|^z$$/,
  objects:[
    {ignore:true},
    {scope:QuestJs._parser.isHere},
  ],
  script:
          if (QuestJs._game.invaded) {
            QuestJs._io.msg ("'Well, get going, Jenina,' says the painting. 'You're not going to sort this out just standing their like a bewildered sheep.'")
          }
          else {
            QuestJs._io.msg ("'Shape yourself, Jenina,' says the painting. 'You've lots to do.'")
          }
        }))

comands.unshift(new QuestJs._command.Cmd('wait2', {
  regex:/^^wait$|^z$$/,
  objects:[
    {ignore:true},
    {scope:QuestJs._parser.isHere},
  ],
  script:
      if (QuestJs._game.invaded) {
        QuestJs._io.msg ("No time for hanging around...")
      }
      else {
        QuestJs._io.msg ("Time passes...")
      }
    }))