//====================
// OBJECT LINKS LIB  |
//====================
// by KV             |
//====================
// for QuestJS v 0.3 |
//====================
// Version 1         |
//====================

/*
 * IMPORTANT!!!
 *  -= 1 -= 1 -= 1 -= 1 -= 1 -= 1
 *
 * Make sure you have modifed QuestJs._defaults.DEFAULT_ROOM.description and placed the code block in the
 * code so the changes are loaded BEFORE ANY ROOMS ARE CREATED during game load!!!
 *
 * Normally, this should go in data.js, above any code that creates any rooms.
 *
 * Here is the code:
 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1

// CODE BEGINS
*/
QuestJs._defaults.DEFAULT_ROOM.description = function () {
  if (QuestJs._game.dark) {
    QuestJs._tools.printOrRun(QuestJs._game.player, this, 'darkDesc');
    return true;
  }
  if (QuestJs._settings.linksEnabled) {
    disableExistingObjectLinks();
  }
  for (let line of QuestJs._settings.roomTemplate) {
    QuestJs._io.msg(line);
  }
  return true;
};

//============================================================================

//Capture clicks for the objects links
QuestJs._settings.clickEvents = [{ one0: `<span>_PLACEHOLDER_</span>` }];
window.onclick = function (event) {
  if (!event.target.matches('.droplink')) {
    $('.dropdown-content').hide();
  } else {
    QuestJs._settings.clickEvents.unshift(event.target);
    if (
      typeof QuestJs._settings.clickEvents[1].nextSibling !== 'undefined' &&
      QuestJs._settings.clickEvents[1].nextSibling !== null
    ) {
      if (
        QuestJs._settings.clickEvents[1] !== event.target &&
        QuestJs._settings.clickEvents[1].nextSibling.style.display === 'inline' &&
        event.target.matches('.droplink')
      ) {
        $('.dropdown-content').hide();
        event.target.nextSibling.style.display = 'inline';
      }
    }
  }
};

//===================================

// SETTINGS

QuestJs._settings.roomTemplate = [
  '{hereDesc}',
  '{objectsHere:You can see {objectsLinks} here.}',
  '{exitsHere:You can go {exits}.}',
];

QuestJs._settings.linksEnabled = true;

// Make it easy to find a command's opposite
QuestJs._settings.cmdOpps = {
  'Switch on': 'Switch off',
  'Switch off': 'Switch on',
  Take: 'Drop',
  Drop: 'Take',
  Wear: 'Remove',
  Remove: 'Wear',
  Open: 'Close',
  Close: 'Open',
};

// END OF SETTINGS

// TURNSCRIPT

QuestJs._create.createItem('updateDropdownVerblists_Turnscript', {
  eventPeriod: 1,
  eventActive: true,
  eventScript: () => {
    if (QuestJs._settings.linksEnabled) {
      updateDropdownVerblists();
    } else {
      QuestJs._w.updateDropdownVerblists_Turnscript.eventActive = false;
    }
  },
});

//===========================
// TEXT PROCESSOR ADDITIONS |
//===========================

QuestJs._tp.text_processors.objectsHereLinks = function (arr, params) {
  let listOfOjects = QuestJs._scope.scopeHereListed().map((o) => getObjectLink(o, true));
  return listOfOjects.length === 0 ? '' : arr.join(':');
};

QuestJs._tp.text_processors.objectsLinks = function (arr, params) {
  let objArr = QuestJs._scope.scopeHereListed().map((o) => getObjectLink(o, true));
  return QuestJs._tools.formatList(objArr, {
    article: QuestJs._consts.INDEFINITE,
    lastJoiner: QuestJs._lang.list_and,
    modified: true,
    nothing: QuestJs._lang.list_nothing,
    loc: QuestJs._game.player.loc,
  });
};

QuestJs._tp.text_processors.objectLink = function (obj, params) {
  return getObjectLink(QuestJs._w[obj[0]], false, false);
};

//=================================
// END OF TEXT PROCESSOR ADDITIONS |
//==================================

// FUNCTIONS
//  -= 1 -= 1 -= 1 -= 1-

function getDisplayAlias(obj, art = QuestJs._consts.INDEFINITE) {
  return QuestJs._lang.getName(obj, { article: art });
}

function enterButtonPress(cmd) {
  //Calling this function with no arg will cause s to default to the text in the textbox.
  if (cmd) $('#textbox').val(cmd);
  const s = $('#textbox').val();
  QuestJs._IO.msgInputText(s); //This emulates printing the echo of the player's command
  if (s) {
    if (QuestJs._IO.savedCommands[QuestJs._IO.savedCommands.length - 1] !== s) {
      QuestJs._IO.savedCommands.push(s);
    }
    QuestJs._IO.savedCommandsPos = QuestJs._IO.savedCommands.length;
    QuestJs._parser.parse(s);
    $('#textbox').val('');
  }
}

function clickedCmdLink(s) {
  if (s) {
    if (QuestJs._IO.savedCommands[QuestJs._IO.savedCommands.length - 1] !== s) {
      QuestJs._IO.savedCommands.push(s);
    }
    QuestJs._IO.savedCommandsPos = QuestJs._IO.savedCommands.length;
  }
}

function getObjectLink(obj, isScopeHere = false, addArticle = true) {
  //if isScopeHere is sent true, this is for a room description!
  if (QuestJs._settings.linksEnabled) {
    var roomClass = isScopeHere ? 'room-desc' : '';
    var oName = obj.name;
    var id = obj.alias || obj.name;
    var prefix = '';
    if (obj.prefix) {
      prefix = obj.prefix + ' ';
    }
    var dispAlias = getDisplayAlias(obj);
    if (addArticle) {
      prefix = dispAlias.replace(obj.alias, '');
    }
    disableObjectLink($(`[obj="${oName}"]`));
    var s = prefix + `<span class="object-link dropdown ${roomClass}">`;
    s += `<span onclick="toggleDropdown($(this).attr('obj'))" obj="${oName}" class="droplink ${roomClass}" name="${oName}-link">${id}</span>`;
    s += `<span id="${oName}" class="dropdown-content ${roomClass}">`;
    let verbArr = obj.getVerbs();
    if (verbArr.length > 0) {
      verbArr.forEach((o) => {
        o = QuestJs._tools.sentenceCase(o);
        s += `<span class="${roomClass}" onclick="$(this).parent().toggle();handleObjLnkClick('${o} '+$(this).attr('obj-alias'),this,'${o}','${id}');" link-verb="${o}" obj-alias="${id}" obj="${oName}">${o}</span>`;
      });
    }
    s += '</span></span>';
    return s;
  } else {
    var s = obj.alias || obj.name;
    return s;
  }
}

function toggleDropdown(element) {
  $('#' + element + '').toggle();
}

function handleObjLnkClick(cmd, el, verb, objAlias) {
  QuestJs._parser.msg('handleObjLnkClick:  Handling object link click . . .');
  QuestJs._parser.msg('cmd: ' + cmd);
  QuestJs._parser.msg('verb: ' + verb);
  QuestJs._parser.msg('objAlias: ' + objAlias);
  QuestJs._parser.msg('Sending to enterButtonPress . . .');
  enterButtonPress(cmd);
}

function updateDropdownVerblists() {
  //QuestJs._parser.debug = true
  let verbEls = $('[link-verb]');
  Object.keys(verbEls).forEach((i) => {
    let el = verbEls[i];
    //if(QuestJs._parser.debug) {
    //QuestJs._log.info("verbEls");
    //QuestJs._log.info(typeof(verbEls));
    //QuestJs._log.info(verbEls);
    //QuestJs._log.info("verbEls[i]");
    //QuestJs._log.info(verbEls[i])
    //QuestJs._log.info("el");
    //QuestJs._log.info(typeof(el));
    //QuestJs._log.info(el);
    //QuestJs._log.info(el[0]);
    //QuestJs._log.info(typeof(el[0]));
    //}
    let verb = $(el).attr('link-verb');
    if (!verb) return;
    let verbOpp = QuestJs._settings.cmdOpps[verb] || null;
    if (!verbOpp) {
      //if(QuestJs._parser.debug) {QuestJs._log.info("NO opposite for " + verb)}
      return;
    }
    //if(QuestJs._parser.debug) {QuestJs._log.info("i:");QuestJs._log.info(i);QuestJs._log.info("el:");QuestJs._log.info(el);QuestJs._log.info("verb:");QuestJs._log.info(verb);QuestJs._log.info("verbOpp");}
    let objName = $(el).attr('obj');
    //if(QuestJs._parser.debug) {QuestJs._log.info("objName:");QuestJs._log.info(objName);QuestJs._log.info("obj:");}
    let obj = QuestJs._w[objName];
    //if(QuestJs._parser.debug) {QuestJs._log.info(obj);var hr = "=======================================";QuestJs._log.info(hr);QuestJs._log.info("Do the verbs match the getVerbs? . . .");QuestJs._log.info(hr);}
    if (!obj.getVerbs) return;
    var objGetVerbs = obj.getVerbs();
    //if(QuestJs._parser.debug) {QuestJs._log.info("objGetVerbs:");QuestJs._log.info(objGetVerbs);}
    objGetVerbs.forEach((newVerb) => {
      //if(QuestJs._parser.debug) {QuestJs._log.info("Checking getVerbs() for " + objName + " . . .");QuestJs._log.info(newVerb);}
      if (verbOpp != newVerb) return;
      //if(QuestJs._parser.debug) {QuestJs._log.info("Found one!");QuestJs._log.info(objName + " needs " + verb  + " changed to " + newVerb + "!");}
      if (!el.parentElement) {
        //if(QuestJs._parser.debug){ QuestJs._log.info("No element parent element.  QUITTING!");}
        return;
      }
      //Change the verb to its opposite!
      switchDropdownVerb(el, newVerb, objName);
      //if(QuestJs._parser.debug) {QuestJs._log.info("DONE!")}
      return true;
    });
  });
}

function switchDropdownVerb(el, newVerb, objName) {
  if (!objName) {
    let objName = $(el).attr('obj');
  }
  let oldVerb = $(el).attr('link-verb');
  if (!newVerb) {
    let newVerb = QuestJs._settings.cmdOpps[oldVerb];
  }
  let str = el.parentElement.innerHTML;
  let regexp = new RegExp(oldVerb, 'g');
  let repl = str.replace(regexp, newVerb);
  el.parentElement.innerHTML = repl;
  $(el).attr('link-verb', newVerb);
  //QuestJs._parser.msg(`Replaced '${oldVerb}' on ${objName} with '${newVerb}'.`)
}

function disableExistingObjectLinks(bool = false) {
  //if bool is false, this only disables existing object links printed using the room description function
  //if bool is true, this disables ALL existing object links
  //QuestJs._parser.msg("running disableExistingObjectLinks!")
  //Checks that this doesn't remove "good" links.
  if (bool) {
    $('.droplink').removeClass('droplink').css('cursor', 'default').attr('name', 'dead-droplink');
    $('.object-link').removeClass('dropdown');
    $('.dropdown').removeClass('dropdown');
    $('.dropdown-content').remove();
  } else {
    $('.room-desc.droplink')
      .removeClass('droplink')
      .css('cursor', 'default')
      .attr('name', 'dead-droplink');
    $('.room-desc.object-link').removeClass('dropdown');
    $('.room-desc.dropdown').removeClass('dropdown');
    $('.room-desc.dropdown-content').remove();
  }
}

function disableObjectLink(el) {
  let objName = $(el).attr('obj');
  $(el).removeClass('droplink').css('cursor', 'default').attr('name', 'dead-droplink');
  $(el).removeClass('dropdown');
  $(el).removeClass('dropdown');
  $(`#${objName}`).remove();
}
