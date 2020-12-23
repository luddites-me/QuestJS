"use strict";







// This function will be called at the start of the game, so can be used
// to introduce your game.
settings.setup = function() {


  game.player.hitpoints = 20;
  game.player.status = "You are feeling fine";
  QuestJs._IO.updateStatus()
}



function firstTimeTesting() {
  firsttime(232646, function() {
    QuestJs._io.msg(spaces(5)+ "{font:trade winds:Te first time 10{sup:2} CH{sub:4} Er {smallcaps:This is small caps}.}")
  }, function() {
    QuestJs._io.msg("Every {huge:other} {big:time} betweeb {small:is} {tiny:very small} notmasl.")
  });
  const a = ["one", "two", "three"]
  console.log(a)
  array.remove(a, "two")
  console.log(a)
  array.remove(a, "three")
  console.log(a)
  array.remove(a, "three")
  console.log(a)
  array.remove(a, "one")
  console.log(a)
}




QuestJs._commands.unshift(new QuestJs._command.Cmd('Test input', {
  npcCmd:true,
  rules:[QuestJs.cmdRules.isHere],
  regex:/^inp/,
  script:function() {
    QuestJs._io.msg("First some preamble...")
    QuestJs._io.showMenu("What colour?", [w.book, w.coin, w.Kyle, 'None of them'], function(result) {
      if (typeof result === 'string') {
        QuestJs._io.msg("You picked " + result + ".");
      }
      else {
        QuestJs._io.msg("You picked " + QuestJs._lang.getName(result, {article:DEFINITE}) + ".");
      }
    })
/*    QuestJs._io.askQuestion("What colour?", function(result) {
      QuestJs._io.msg("You picked " + result + ".");
      QuestJs._io.showYesNoMenu("Are you sure?", function(result) {
        QuestJs._io.msg("You said " + result + ".")
      })
    })*/
  }
}));



QuestJs._commands.unshift(  new QuestJs._command.Cmd('TextReveal', {
  regex:/^reveal$/,
  script:function() {
    QuestJs._io.msg("Some text")
    QuestJs._io.msg("More")
    QuestJs._io._msg("The real message is revealed!!", {}, {action:'effect', tag:'pre', effect:QuestJs._IO.unscrambleEffect, randomPlacing:true, incSpaces:true, pick:function(i) {return 'At first this message is shown'.charAt(i) }})
    QuestJs._io.wait()
    QuestJs._io._msg("Or appears as though typed.", {}, {action:'effect', tag:'p', effect:QuestJs._IO.typewriterEffect})
    QuestJs._io._msg("The characters will appear randomly from dots.", {}, {action:'effect', tag:'p', effect:QuestJs._IO.unscrambleEffect, randomPlacing:true, pick:function() {return '.' }})
    QuestJs._io.wait()
    QuestJs._io.clearScreen()
    QuestJs._io.msg("Some more text.")
    QuestJs._io.wait(3, "Wait three seconds...")
    QuestJs._io.msg("... and done!")
  },
}));
  
QuestJs._commands.unshift(  new QuestJs._command.Cmd('Image', {
  regex:/^img$/,
  script:function() {
    QuestJs._io.msg("Some more text.")
    QuestJs._io.picture('favicon.png')
  },
}));
  
QuestJs._commands.unshift(  new QuestJs._command.Cmd('Audio', {
  regex:/^beep$/,
  script:function() {
    QuestJs._io.msg("Can you hear this?")
    QuestJs._io.sound('hrn06.wav')
  },
}));
  



QuestJs._commands.unshift(  new QuestJs._command.Cmd('Alpha', {
  regex:/^alpha$/,
  script:function() {
    QuestJs._io.msg("Some text in Greek: {encode:391:3AC:The quick brown fox jumped over the lazy dog}.")
    QuestJs._io.msg("Some text in Cyrillic: {encode:402:431:The quick brown fox jumped over the lazy dog}.")
    QuestJs._io.msg("Some text in Armenian {encode:531:561:The quick brown fox jumped over the lazy dog}.")

    QuestJs._io.msg("Some text in Devanagari: {encode:904:904:The quick brown fox jumped over the lazy dog}.")
    QuestJs._io.msg("Some text in Thai {encode:E01:E01:The quick brown fox jumped over the lazy dog}.")
    QuestJs._io.msg("Some text in Tibetan {encode:F20:F20:The quick brown fox jumped over the lazy dog}.")
    QuestJs._io.msg("Some text in Khmer {encode:1780:1780:The quick brown fox jumped over the lazy dog}.")
    QuestJs._io.msg("Some text in Javan {encode:A985:A985:The quick brown fox jumped over the lazy dog}.")
    QuestJs._io.msg("Some text in Nko {encode:7C1:7C1:The quick brown fox jumped over the lazy dog}.")
  },
}));
  





QuestJs._commands.unshift(new QuestJs._command.Cmd('EgKick', {
  npcCmd:true,
  rules:[QuestJs.cmdRules.isHere],
  regex:/^(kick) (.+)$/,
  objects:[
    {ignore:true},
    {scope:QuestJs._parser.isPresent}
  ],
  default:function(item, isMultiple, char) {
    return QuestJs._io.failedmsg(prefix(this, isMultiple) + QuestJs._lang.pronounVerb(char, "kick", true) + " " + this.pronouns.objective + ", but nothing happens.");
  },
}));



QuestJs._commands.unshift(new QuestJs._command.Cmd('EgCharge', {
  npcCmd:true,
  rules:[QuestJs.cmdRules.isHeld],
  regex:/^(charge) (.+)$/,
  objects:[
    {ignore:true},
    {scope:QuestJs._parser.isHeld}
  ],
  default:function(item, isMultiple, char) {
    return QuestJs._io.failedmsg(prefix(item, isMultiple) + QuestJs._lang.pronounVerb(item, "'be", true) + " not something you can charge.");
  },
}));


QuestJs._commands.unshift(new QuestJs._command.Cmd('EgMove', {
  npcCmd:true,
  rules:[QuestJs.cmdRules.isHere],
  regex:/^(move) (.+)$/,
  objects:[
    {ignore:true},
    {scope:QuestJs._parser.isHere}
  ],
  default:function(item, isMultiple, char) {
    return QuestJs._io.failedmsg(prefix(item, isMultiple) + QuestJs._lang.pronounVerb(item, "'be", true) + " not something you can move.");
  },
}));


QuestJs._commands.unshift(  new QuestJs._command.Cmd('EgHint', {
    regex:/^hint$|^hints$/,
    script:function() {
      if (w[game.player.loc].hint) {
        QuestJs._io.metamsg(w[game.player.loc].hint);
      }
      else {
        QuestJs._io.metamsg("Sorry, no hints here.");
      }
    },
  }));
  




QuestJs._commands.unshift(new QuestJs._command.Cmd('Test', {
  regex:/^t$/,
  script:function() {
    console.log(w.Emily)
  },
}));




