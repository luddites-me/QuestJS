QuestJs._create.createItem('dinner_timetable', QuestJs._npc.AGENDA_FOLLOWER(), {
  // suspended:true,
  agenda: ['wait', 'run:stepped:starter', 'run:stepped:main', 'run:stepped:desert'],
  stepped(arr) {
    return !QuestJs._util.respond({ course: arr[0], actor: QuestJs._w.Kyle }, this.steps);
  },
  steps: [
    {
      test(p) {
        return p.course === 'starter';
      },
      responses: [
        {
          test() {
            return !QuestJs._w.soup_can.opened;
          },
          script() {
            QuestJs._w.soup_can.opened = true;
            QuestJs._io.msg('Kyle opens the soup can.');
          },
        },
        {
          test() {
            return QuestJs._w.bowls.state === 0;
          },
          script() {
            QuestJs._w.bowls.state = 1;
            QuestJs._io.msg('Kyle pours soup into the two bowls.');
          },
        },
        {
          test() {
            return QuestJs._w.bowls.state === 1;
          },
          script() {
            QuestJs._w.bowls.state = 2;
            QuestJs._io.msg('Kyle microwaves the two bowls.');
          },
        },
        {
          test() {
            return QuestJs._w.bowls.state === 2;
          },
          script() {
            QuestJs._w.bowls.state = 3;
            QuestJs._io.msg('Kyle serves the two bowls of delicious soup.');
          },
        },
        {
          msg: 'Kyle eats the soup.',
          failed: true,
        },
      ],
    },
    {
      test(p) {
        return p.course === 'main';
      },
      responses: [
        {
          msg: 'Kyle produces the main course.',
          failed: true,
        },
      ],
    },
    {
      failed: true,
    },
  ],
});

QuestJs._commands.unshift(
  new QuestJs._command.Cmd('Audio', {
    regex: /^q$/,
    script() {
      QuestJs._io.showMenuWithNumbers(
        'What is your favourite color?',
        ['Blue', 'Red', 'Yellow', 'Pink'],
        (result) => {
          QuestJs._io.msg(`You picked ${result}.`);
        },
      );
    },
  }),
);
