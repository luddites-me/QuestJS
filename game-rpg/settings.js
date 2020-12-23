"use strict";

QuestJs._settings.title = "A First RPG...";
QuestJs._settings.author = "The Pixie"
QuestJs._settings.version = "1.1";
QuestJs._settings.thanks = ["Kyle", "Lara"];

QuestJs._settings.libraries.push('rpg')

QuestJs._settings.statusPane = false;
QuestJs._settings.tests = true
QuestJs._settings.playMode = 'dev'
QuestJs._settings.attackOutputLevel = 10
QuestJs._settings.armourScaling = 10
QuestJs._settings.noTalkTo = false
QuestJs._settings.output = function(report) {
  for (let el of report) {
    if (el.level <= QuestJs._settings.attackOutputLevel) {
      if (el.level === 1) {
        QuestJs._io.msg(el.t)
      }
      else {
        QuestJs._io.metamsg(el.t)
      }
    }
  }
}




QuestJs._settings.dateTime = {
  startTime:1000000000,
  data:[
    { name:'second', number:60 },
    { name:'minute', number:60 },
    { name:'hour', number:24 },
    { name:'day', number:365 },
    { name:'year', number:999999 },
  ],
  months:[
    { name:'January', n:31},
    { name:'February', n:28},
    { name:'March', n:31},
    { name:'April', n:30},
    { name:'May', n:31},
    { name:'June', n:30},
    { name:'July', n:31},
    { name:'August', n:31},
    { name:'September', n:30},
    { name:'October', n:31},
    { name:'November', n:30},
    { name:'December', n:31},
  ],
  days:['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  formats:{
    def:'%dayOfWeek% %dayOfYear%, %year%, %hour%:%minute% %ampm%',
    time:'%hour%:%minute% %ampm%',
  },
  functions:{
    dayOfWeek:function(dict) { 
      return QuestJs._settings.dateTime.days[(dict.day + 365 * dict.year) % QuestJs._settings.dateTime.days.length] 
    },
    dayOfYear:function(dict) {
      let day = dict.day
      for (let el of QuestJs._settings.dateTime.months) {
        if (el.n > day) return (day + 1) + ' ' + el.name
        day -= el.n
      }
      return 'failed'
    },
    year:function(dict) { return 'AD ' + (dict.year + 1000) },
    hour:function(dict) { return dict.hour < 13 ? dict.hour : (dict.hour - 12) },
    minute:function(dict) { return dict.minute < 10 ? '0' + dict.minute : dict.minute },
    ampm:function(dict) {
      if (dict.minute === 0 && dict.hour === 0) return 'midnight'
      if (dict.minute === 0 && dict.hour === 12) return 'noon'
      return dict.hour < 12 ? 'am' : 'pm'
    },
  },
}



// This function will be called at the start of the game, so can be used
// to introduce your QuestJs._game.
QuestJs._settings.setup = function() {
  QuestJs._game.player.hitpoints = 20;
  QuestJs._game.player.status = "You are feeling fine";
  QuestJs._game.player.skillsLearnt = ["Double attack", "Fireball"]

  QuestJs._settings.updateCustomUI()
  
  QuestJs._log.info(skills.findName("Flaming weapon"))
  QuestJs._log.info(skills.findName("Fireball"))
  QuestJs._w.rabbit.setLeader(QuestJs._game.player)
  
}







QuestJs._settings.customUI = function() {
  document.writeln('<div id="rightpanel" class="side-panes side-panes-right">');
  document.writeln('<div id="rightstatus">');
  document.writeln('<table align="center">');
  document.writeln('<tr><td width="120"><b>Current weapon</b></td></tr>');
  document.writeln('<tr><td id="weapon-td"><img id="weaponImage" onclick="skillUI.chooseWeapon();"/></td></tr>');
  document.writeln('<tr><td><b>Health</b></td></tr>');
  document.writeln('<tr><td style="border: thin solid black;background:white;text-align:left;\" title="Your current hits" id="hits-td"><span id="hits-indicator" style="background-color:green;padding-right:100px;"></span></td></tr>');
  document.writeln('<tr><td><b>Spell points</b></td></tr>');
  document.writeln('<tr><td style="border: thin solid black;background:white;text-align:left;\" title="Your current PP" id="pp-td"><span id="pp-indicator" style="background-color:blue;padding-right:100px;"></span></td></tr>');
  document.writeln('<tr><td><b>Armour</b></td></tr>');
  document.writeln('<tr><td style="border: thin solid black;background:white;text-align:left;\" title="Your current armour" id="armour-td"><span id="armour-indicator" style="background-color:red;padding-right:100px;"></span></td></tr>');
  document.writeln('</table>');
  document.writeln('</div>');

  document.writeln('<div style="text-align:center"><input type="button" id="castButton" text="Cast" value="Cast" onclick="skillUI.castButtonClick()" style="width: 80px" disabled="yes"/></div>');

  document.writeln('<table align="center">');
  for (let row = 0; row < 8; row++) {
    document.writeln('  <tr>');
    for (let col = 0; col < 3; col++) {
      document.write(`    <td id="cell${row * 3 + col}" width="40"></td>`);
    }
    document.writeln('  </tr>');
  }
  document.writeln('</table>');
  document.writeln('</div>');
  
  document.writeln('<div id="choose-weapon-div" title="Select a weapon">');
  document.writeln('<select id="weapon-select"></select>');
  document.writeln('</div>');
  $(function() {
    $( "#choose-weapon-div" ).dialog({
      autoOpen: false,  
      buttons: {
        OK: function() { skillUI.chosenWeapon() }
      },
    });
  });
};  


QuestJs._settings.updateCustomUI = function() {
  $('#weaponImage').attr('src', QuestJs._settings.imagesFolder + 'icon-' + QuestJs._game.player.getEquippedWeapon().image + '.png');
  $('#weapon-td').prop('title', "Weapon: " + QuestJs._game.player.getEquippedWeapon().alias);
  
  $('#hits-indicator').css('padding-right', 120 * QuestJs._game.player.health / QuestJs._game.player.maxHealth);
  $('#hits-td').prop('title', "Hits: " + QuestJs._game.player.health + "/" + QuestJs._game.player.maxHealth);

  $('#pp-indicator').css('padding-right', 120 * QuestJs._game.player.pp / QuestJs._game.player.maxPP);
  $('#pp-td').prop('title', "Power points: " + QuestJs._game.player.pp + "/" + QuestJs._game.player.maxPP);

  $('#armour-indicator').css('padding-right', 120 * QuestJs._game.player.armour / QuestJs._game.player.maxArmour);
  $('#armour-td').prop('title', "Armour: " + QuestJs._game.player.armour + "/" + QuestJs._game.player.maxArmour);

  //QuestJs._log.info($('#hits-td').prop('title'));


  //QuestJs._log.info(QuestJs._game.player.skillsLearnt)
  skillUI.removeAllButtons()
  for (let skill of skills.list) {
    //QuestJs._log.info(skill.name)
    if (QuestJs._game.player.skillsLearnt.includes(skill.name)) {
      skillUI.setButton(skill)
    }
  }
  for (let key in QuestJs._w) {
    if (QuestJs._w[key].health !== undefined && QuestJs._w[key].maxHealth === undefined) {
      QuestJs._w[key].maxHealth = QuestJs._w[key].health;
    }
  }
};






const skillUI = {
  skills:[],
  selected:false,
  
  setButton:function(skill) {
    if (!skill.icon) skill.icon = skill.name.toLowerCase()
    const cell = $('#cell' + skillUI.skills.length)
    let s = '<div class="skill-container" title="' + skill.tooltip + '" >'
    s += '<img class="skill-image" src="' + QuestJs._settings.imagesFolder + 'icon-' + skill.icon + '.png"/>'
    if (skill.spell) s += '<img class="skill-image" src="' + QuestJs._settings.imagesFolder + 'flag-spell.png"/>'
    s += '</div>'
    cell.html(s)
    cell.click(skillUI.buttonClickHandler)
    cell.css("background-color", "black")
    cell.css("padding", "2px")
    cell.attr("name", skill.name)
    skillUI.skills.push(skill)
  },

  resetButtons:function() {
    //QuestJs._log.info('reset')
    for (let i = 0; i < skillUI.skills.length; i++) {
      $('#cell' + i).css("background-color", "black");
    }
    $('#castButton').prop('disabled', true)
    skillUI.selected = false
  },


  removeAllButtons:function() {
    for (let i = 0; i < skillUI.skills.length; i++) {
      $('#cell' + i).html("")
    }
    skillUI.skills = []
    $('#castButton').prop('disabled', true)
    skillUI.selected = false
  },

  buttonClickHandler:function(event) {
    QuestJs._log.info(event)
    skillUI.resetButtons()
    
    const n = parseInt(event.currentTarget.id.replace('cell', ''))
    QuestJs._log.info(n)
    skillUI.selected = n
    const cell = $("#cell" + n)
    cell.css("background-color", "yellow")
    const skill = skillUI.skills[n]
    if (skill.noTarget) $('#castButton').prop('disabled', false)
  },

  getSkillFromButtons:function() {
    return skillUI.selected ? skillUI.skills[skillUI.selected] : null
  },
  
  castButtonClick:function() {
    QuestJs._log.info("CKLOICK!!!")
    QuestJs._log.info("CKLOICK!!! " + skillUI.selected)
    QuestJs._log.info("CKLOICK!!! " + skillUI.skills)
    QuestJs._log.info("CKLOICK!!! " + skillUI.skills[skillUI.selected].name)
  },


  chooseWeapon:function() {
    QuestJs._log.info("in chooseWeapon");
    const weapons = [];
    for (let o in QuestJs._w) {
      if (QuestJs._w[o].isAtLoc(QuestJs._game.player, QuestJs._world.SCOPING) && QuestJs._w[o].weapon) {
        QuestJs._log.info(o);
        weapons.push('<option value="'+ o +'">' + QuestJs._w[o].listalias + '</option>');
      }
    }
    const s = weapons.join('');
    QuestJs._log.info(s);

    $('#weapon-select').html(s);  
    
    $("#choose-weapon-div").dialog("open");
  },

  chosenWeapon:function() {
    $("#choose-weapon-div").dialog("close");
    const selected = $("#weapon-select").val();
    QuestJs._log.info("in chosenWeapon: " + selected);
    QuestJs._w[selected].equip(false, QuestJs._game.player);
    QuestJs._world.endTurn(QuestJs._world.SUCCESS);
  },

}








QuestJs._settings.startingDialogDisabled = true;

QuestJs._settings.professions = [
  {name:"Farm hand", bonus:"strength"},
  {name:"Scribe", bonus:"intelligence"},
  {name:"Exotic dancer", bonus:"agility"},
  {name:"Merchant", bonus:"charisma"},
];

$(function() {
  if (QuestJs._settings.startingDialogDisabled) {
    const p = QuestJs._w.me;
    p.job = QuestJs._settings.professions[0];
    p.isFemale = true;
    p.fullname = "Shaala"
    QuestJs._settings.gui = true
    return; 
  }
  const diag = $("#dialog");
  diag.prop("title", "Who are you?");
  let s;
  s = '<p>Name: <input id="namefield" type="text" value="Zoxx" /></p>';
  s += '<p>Male: <input type="radio" id="male" name="sex" value="male">&nbsp;&nbsp;&nbsp;&nbsp;';
  s += 'Female<input type="radio" id="female" name="sex" value="female" checked></p>';
  s += '<p>Job:<select id="job">'
  for (let profession of QuestJs._settings.professions) {
    s += '<option value="' + profession.name + '">' + profession.name + '</option>';
  }
  s += '</select></p>'
  
  s += '<p>Classic interface: <input type="radio" id="classic" name="interface" value="classic" checked>&nbsp;&nbsp;&nbsp;&nbsp;'
  s += 'GUI<input type="radio" id="gui" name="interface" value="gui"></p>'
  
  diag.html(s);
  diag.dialog({
    modal:true,
    dialogClass: "no-close",
    width: 400,
    height: 340,
    buttons: [
      {
        text: "OK",
        click: function() {
          $(this).dialog("close");
          const p = QuestJs._game.player;
          const job = $("#job").val();
          p.job = QuestJs._settings.professions.find(function(el) { return el.name === job; });
          p.isFemale = $("#female").is(':checked');
          QuestJs._settings.gui = $("#gui").is(':checked');
          p.fullname = $("#namefield").val();
          if (QuestJs._settings.textInput) { $('#textbox').focus(); }
          QuestJs._log.info(p)
        }
      }
    ]
  });
});


/*



const dialogeOptions = {
  para0Opts:[
    "a tiny village",
    "a provincial town",
    "the slums",
    "the merchant's quarter"
  ],

  para1Opts:[
    "loving the outdoors",
    "appreciating the finer things in life",
    "always hungry",
    "isolated from children of your own age"
  ],

  para2Opts:[
    "introspective",
    "precocious",
    "attractive",
    "curious",
  ],

  para3Opts:[
    "boy",
    "girl"
  ],

  para4Opts:[
    "getting into trouble",
    "with your nose in a book",
    "stealing things",
    "getting into fights",
    "arguing with the local priest"
  ],

  para5Opts:[
    "potion brewing",
    "crystal magic",
    "shadow magic",
    "nature magic"
  ],

  para6Opts:[
    "raven black",
    "dark brown",
    "brunette",
    "dark blond",
    "blond",
    "platinum blond",
    "ginger",
    "electric blue",
    "shocking pink",
  ],

para7Opts:[
  "brown",
  "green",
  "hazel",
  "blue",
  "aquamarine"
],

para8Opts:[
  "blue",
  "green",
  "orange",
],
};



var paraOpts = [];

var paraPositions = [];


var wizardMale = true;

function scrollWizard() {
  wizardMale = !wizardMale;
  $('#wizardname').html(wizardMale ? 'Master Shalazin' :  'Mistress Shalazin');
  $('#wizardwitch').html(wizardMale ? 'wizard' :  'witch');
  $('#wizardhe').html(wizardMale ? 'he' :  'she');
}

function scrollPara(element) {
  var paraNumber = parseInt(element.id.replace('para', ''));
  if (isNaN(paraNumber)) { return; }
  var para = $('#para' + paraNumber);
  if (typeof paraPositions[paraNumber] !== 'number') {
    var list = dialogeOptions['para' + paraNumber + 'Opts'];
    paraOpts[paraNumber] = list;
    paraPositions[paraNumber] = QuestJs._random.int(list.length - 1);
  }
  paraPositions[paraNumber]++;
  if (paraPositions[paraNumber] >= paraOpts[paraNumber].length) {
    paraPositions[paraNumber] = 0;
  }
  para.html(paraOpts[paraNumber][paraPositions[paraNumber]]);
}    

function setValues() {
  QuestJs._game.player.alias = $('#name_input').val();
  QuestJs._game.player.isFemale = !wizardMale;
  QuestJs._game.player.background = $('#para4').html();
  QuestJs._game.player.magic = $('#para5').html();
  QuestJs._game.player.hairColour = $('#para6').html();
  QuestJs._game.player.eyeColour = $('#para7').html();
  QuestJs._game.player.spellColour = $('#para8').html();
  QuestJs._io.msg(QuestJs._game.player.alias);
  QuestJs._io.msg($("#diag-inner").text());
}


$(document).ready(function () {
      $('.scrolling').each(function() {
        scrollPara(this);
      });
      that = $("#dialog_window_1");
      $('#dialog_window_1').dialog({
         height: 400,
         width: 640,
         buttons: {
            "Done": function() { setValues();}
        }
      });
      $("button[title='Close']")[0].style.QuestJs._world. = 'none';
});

function scrollWizard() {
  wizardMale = !wizardMale;
  $('#wizardname').html(wizardMale ? 'Master Shalazin' :  'Mistress Shalazin');
  $('#wizardwitch').html(wizardMale ? 'wizard' :  'witch');
  $('#wizardhe').html(wizardMale ? 'he' :  'she');
}

function showStartDiag() {

  var diag = $("#dialog");
  diag.prop("title", "Who are you?");
  var s;
  s = 'Name: <input type="text" id="name_input" value="Skybird"/><br/><br/>';
  s += '<div id="diag-inner">Born in <span id="para0" class="scrolling" onclick="scrollPara(this)"></span>, you grew up <span id="para1" class="scrolling" onclick="scrollPara(this)"></span>. ';
  s += 'You were a <span id="para2" class="scrolling" onclick="scrollPara(this)"></span> <span id="para3" class="scrolling" onclick="scrollPara(this)"></span>, ';
  s += 'always <span id="para4" class="scrolling" onclick="scrollPara(this)"></span>.';
  s += 'At the age of seven, you caught the eye of <span id="wizardname" class="scrolling" onclick="scrollWizard();">Master Shalazin</span>, ';
  s += 'a <span id="wizardwitch">wizard</span> ';
  s += 'who specialises in <span id="para5" class="scrolling" onclick="scrollPara(this)"></span>. ';
  s += 'Perhaps <span id="wizardhe">he</span> recognised potential in you, or just a pair of hands willing to work for next to nothing; may be just liked your ';
  s += '<span id="para6" class="scrolling" onclick="scrollPara(this)"></span> hair and <span id="para7" class="scrolling" onclick="scrollPara(this)"></span> eyes. ';
  s += 'Either way, you slowly learnt the basics of magic, and have recently learnt how to turn yourself <span id="para8" class="scrolling" onclick="scrollPara(this)"></span>. ';
  s += 'Perhaps more importantly, you have also learnt how to turn yourself back.</div>';

  diag.html(s);
  $('.scrolling').each(function() {
    scrollPara(this);
  });
  diag.dialog({
    modal:true,
    dialogClass: "no-close",
    width: 600,
    height: 600,
    buttons: [
      {
        text: "OK",
        click: function() {
          $(this).dialog("close");
          setValues(this);
          if (QuestJs._settings.textInput) { $('#textbox').focus(); }
        }
      }
    ]
  });

}
*/