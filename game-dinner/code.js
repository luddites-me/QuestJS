"use strict"




QuestJs._create.createItem("dinner_timetable", QuestJs._npc.AGENDA_FOLLOWER(), {
  //suspended:true,
  agenda:[
    'wait',
    'run:stepped:starter',
    'run:stepped:main',
    'run:stepped:desert',
  ],
  stepped:function(arr) { return !QuestJs._util.respond({course:arr[0], actor:QuestJs._w.Kyle}, this.steps) },
  steps:[
    {
      test:function(p) { return p.course === 'starter' },
      responses:[
        {
          test:function() { return !QuestJs._w.soup_can.opened },
          script:function() {
            QuestJs._w.soup_can.opened = true
            QuestJs._io.msg("Kyle opens the soup can.")
          },
        },
        {
          test:function() { return QuestJs._w.bowls.state === 0 },
          script:function() {
            QuestJs._w.bowls.state = 1
            QuestJs._io.msg("Kyle pours soup into the two bowls.")
          },
        },
        {
          test:function() { return QuestJs._w.bowls.state === 1 },
          script:function() {
            QuestJs._w.bowls.state = 2
            QuestJs._io.msg("Kyle microwaves the two bowls.")
          },
        },
        {
          test:function() { return QuestJs._w.bowls.state === 2 },
          script:function() {
            QuestJs._w.bowls.state = 3
            QuestJs._io.msg("Kyle serves the two bowls of delicious soup.")
          },
        },
        {
          QuestJs._io.msg:"Kyle eats the soup.",
          failed:true,
        },
      ],
    },
    {
      test:function(p) { return p.course === 'main' },
      responses:[
        {
          QuestJs._io.msg:"Kyle produces the main course.",
          failed:true,
        },
      ],
    },
    {
      failed:true,
    }      
  ],
})




  
QuestJs._commands.unshift(  new QuestJs._command.Cmd('Audio', {
  regex:/^q$/,
  script:function() {
    QuestJs._io.showMenuWithNumbers('What is your favourite color?', ['Blue', 'Red', 'Yellow', 'Pink'], function(result) {
      QuestJs._io.msg("You picked " + result + ".");
    });
  },
}));