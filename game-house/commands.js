"use strict";




comands.unshift(new QuestJs._command.Cmd('knock_on_door', {
  regex:/^knock$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
          s = "Mandy knocked cautiously on the door,"
          if (door.isopen) {
            s + " even though it was already open - it seemed more polite -"
          }
          s = s + " then listened for a moment. She knocked again, rather more boldly. Quiet as the grave, she thought, then wished she had not."
          exit_to_house.knocked = true
          Print (s)
        }))

comands.unshift(new QuestJs._command.Cmd('post_letter', {
  regex:/^^(post|push) (letter|envelope)$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
          Print ("There was no letter box, so just posting the letter was not an option.")
        }))

comands.unshift(new QuestJs._command.Cmd('climb_telescope', {
  regex:/^climb$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
          do (telescope, "climb")
        }))

comands.unshift(new QuestJs._command.Cmd('climb_out', {
  regex:/^climb$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
          do (exit_up_to_roof, "script")
        }))

comands.unshift(new QuestJs._command.Cmd('fix_wire', {
  regex:/^fix #object#;attach #object#;tie #object#$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
          if (not object = reel) {
            QuestJs._io.msg ("How are you going to do that?")
          }
          else if (spike.wireattached) {
            QuestJs._io.msg ("It already is.")
          }
          else {
            do (spike, "tieonwire")
          }
        }))

comands.unshift(new QuestJs._command.Cmd('fix_wire_to_spike', {
  regex:/^^(fix|attach|tie) (?<object1>.*) to (?<object2>.*)$$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
          if (not object2 = spike) {
            QuestJs._io.msg ("How are you going to attach anything to that?")
          }
          if (not object1 = reel) {
            QuestJs._io.msg ("How are you going to do that?")
          }
          else if (spike.wireattached) {
            QuestJs._io.msg ("It already is.")
          }
          else {
            do (spike, "tieonwire")
          }
        }))

comands.unshift(new QuestJs._command.Cmd('bootcheat', {
  regex:/^bootcheat$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
      if (EndsWith(game.version, "beta")) {
        boots.parent = player
        player.parent = upper_steam_hall
      }
      else {
        QuestJs._io.msg ("No cheating!")
      }
    }))

comands.unshift(new QuestJs._command.Cmd('bootshrink', {
  regex:/^bootshrink$/,
  objects:[
    {ignore:true},
    {scope:parser.isHere},
  ],
  script:
      if (EndsWith(game.version, "beta")) {
        boots.size = -1
      }
      else {
        QuestJs._io.msg ("No cheating!")
      }
    }))