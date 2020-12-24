"use strict";
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
 * ------------
 *
 * Make sure you have modifed DEFAULT_ROOM.description and placed the code block in the
 * code so the changes are loaded BEFORE ANY ROOMS ARE CREATED during game load!!!
 *
 * Normally, this should go in data.js, above any code that creates any rooms.
 *
 * Here is the code:
------------------------------------------------------------------

// CODE BEGINS
*/
DEFAULT_ROOM.description = function () {
    if ((game as any).dark) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        printOrRun((game as any).player, this, "darkDesc");
        return true;
    }
    if ((settings as any).linksEnabled) {
        disableExistingObjectLinks();
    }
    for (let line of settings.roomTemplate) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(line);
    }
    return true;
};
//============================================================================
//Capture clicks for the objects links
(settings as any).clickEvents = [{ one0: `<span>_PLACEHOLDER_</span>` }];
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
window.onclick = function (event) {
    if (!event.target.matches('.droplink')) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".dropdown-content").hide();
    }
    else {
        (settings as any).clickEvents.unshift(event.target);
        if (typeof ((settings as any).clickEvents[1].nextSibling) !== 'undefined' && (settings as any).clickEvents[1].nextSibling !== null) {
            if ((settings as any).clickEvents[1] !== event.target && (settings as any).clickEvents[1].nextSibling.style.display === "inline" && event.target.matches('.droplink')) {
                // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
                $(".dropdown-content").hide();
                event.target.nextSibling.style.display = "inline";
            }
        }
    }
};
//===================================
// SETTINGS
settings.roomTemplate = [
    "{hereDesc}",
    "{objectsHere:You can see {objectsLinks} here.}",
    "{exitsHere:You can go {exits}.}",
];
(settings as any).linksEnabled = true;
// Make it easy to find a command's opposite
(settings as any).cmdOpps = {
    "Switch on": "Switch off",
    "Switch off": "Switch on",
    "Take": "Drop",
    "Drop": "Take",
    "Wear": "Remove",
    "Remove": "Wear",
    "Open": "Close",
    "Close": "Open",
};
// END OF SETTINGS
// TURNSCRIPT
// @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
createItem("updateDropdownVerblists_Turnscript", {
    eventPeriod: 1,
    eventActive: true,
    eventScript: () => {
        if ((settings as any).linksEnabled) {
            updateDropdownVerblists();
        }
        else {
            (w as any).updateDropdownVerblists_Turnscript.eventActive = false;
        }
    },
});
//===========================
// TEXT PROCESSOR ADDITIONS |
//===========================
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'arr' implicitly has an 'any' type.
(tp.text_processors as any).objectsHereLinks = function (arr, params) {
    let listOfOjects = scopeHereListed().map(o => getObjectLink(o, true));
    return listOfOjects.length === 0 ? "" : arr.join(":");
};
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'arr' implicitly has an 'any' type.
(tp.text_processors as any).objectsLinks = function (arr, params) {
    let objArr = scopeHereListed().map(o => getObjectLink(o, true));
    return formatList(objArr, { article: INDEFINITE, lastJoiner: lang.list_and, modified: true, nothing: lang.list_nothing, loc: (game as any).player.loc });
};
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'obj' implicitly has an 'any' type.
(tp.text_processors as any).objectLink = function (obj, params) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return getObjectLink(w[obj[0]], false, false);
};
//=================================
// END OF TEXT PROCESSOR ADDITIONS |
//==================================
// FUNCTIONS
// ---------
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'obj' implicitly has an 'any' type.
function getDisplayAlias(obj, art = INDEFINITE) {
    return lang.getName(obj, { article: art });
}
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'cmd' implicitly has an 'any' type.
function enterButtonPress(cmd) {
    //Calling this function with no arg will cause s to default to the text in the textbox.
    if (cmd)
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#textbox').val(cmd);
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const s = $('#textbox').val();
    (io as any).msgInputText(s); //This emulates printing the echo of the player's command
    if (s) {
        if ((io as any).savedCommands[(io as any).savedCommands.length - 1] !== s) {
            (io as any).savedCommands.push(s);
        }
        (io as any).savedCommandsPos = (io as any).savedCommands.length;
        (parser as any).parse(s);
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $('#textbox').val('');
    }
}
;
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 's' implicitly has an 'any' type.
function clickedCmdLink(s) {
    if (s) {
        if ((io as any).savedCommands[(io as any).savedCommands.length - 1] !== s) {
            (io as any).savedCommands.push(s);
        }
        (io as any).savedCommandsPos = (io as any).savedCommands.length;
    }
}
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'obj' implicitly has an 'any' type.
function getObjectLink(obj, isScopeHere = false, addArticle = true) {
    //if isScopeHere is sent true, this is for a room description!
    if ((settings as any).linksEnabled) {
        var roomClass = isScopeHere ? "room-desc" : "";
        var oName = obj.name;
        var id = obj.alias || obj.name;
        var prefix = "";
        if (obj.prefix) {
            prefix = obj.prefix + " ";
        }
        var dispAlias = getDisplayAlias(obj);
        if (addArticle) {
            prefix = dispAlias.replace(obj.alias, '');
        }
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        disableObjectLink($(`[obj="${oName}"]`));
        var s = prefix + `<span class="object-link dropdown ${roomClass}">`;
        s += `<span onclick="toggleDropdown($(this).attr('obj'))" obj="${oName}" class="droplink ${roomClass}" name="${oName}-link">${id}</span>`;
        s += `<span id="${oName}" class="dropdown-content ${roomClass}">`;
        let verbArr = obj.getVerbs();
        if (verbArr.length > 0) {
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'o' implicitly has an 'any' type.
            verbArr.forEach(o => {
                o = sentenceCase(o);
                s += `<span class="${roomClass}" onclick="$(this).parent().toggle();handleObjLnkClick('${o} '+$(this).attr('obj-alias'),this,'${o}','${id}');" link-verb="${o}" obj-alias="${id}" obj="${oName}">${o}</span>`;
            });
        }
        s += "</span></span>";
        return s;
    }
    else {
        // @ts-expect-error ts-migrate(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
        var s = obj.alias || obj.name;
        return s;
    }
}
;
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'element' implicitly has an 'any' type.
function toggleDropdown(element) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $("#" + element + "").toggle();
}
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'cmd' implicitly has an 'any' type.
function handleObjLnkClick(cmd, el, verb, objAlias) {
    (parser as any).msg("handleObjLnkClick:  Handling object link click . . .");
    (parser as any).msg("cmd: " + cmd);
    (parser as any).msg("verb: " + verb);
    (parser as any).msg("objAlias: " + objAlias);
    (parser as any).msg("Sending to enterButtonPress . . .");
    enterButtonPress(cmd);
}
function updateDropdownVerblists() {
    //parser.debug = true
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    let verbEls = $("[link-verb]");
    Object.keys(verbEls).forEach(i => {
        let el = verbEls[i];
        //if(parser.debug) {
        //console.log("verbEls"); 
        //console.log(typeof(verbEls));
        //console.log(verbEls);
        //console.log("verbEls[i]");
        //console.log(verbEls[i])
        //console.log("el");
        //console.log(typeof(el));
        //console.log(el);
        //console.log(el[0]);
        //console.log(typeof(el[0]));
        //}
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        let verb = $(el).attr("link-verb");
        if (!verb)
            return;
        let verbOpp = (settings as any).cmdOpps[verb] || null;
        if (!verbOpp) {
            //if(parser.debug) {console.log("NO opposite for " + verb)}
            return;
        }
        //if(parser.debug) {console.log("i:");console.log(i);console.log("el:");console.log(el);console.log("verb:");console.log(verb);console.log("verbOpp");}
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        let objName = $(el).attr("obj");
        //if(parser.debug) {console.log("objName:");console.log(objName);console.log("obj:");}
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        let obj = w[objName];
        //if(parser.debug) {console.log(obj);var hr = "=======================================";console.log(hr);console.log("Do the verbs match the getVerbs? . . .");console.log(hr);}
        if (!obj.getVerbs)
            return;
        var objGetVerbs = obj.getVerbs();
        //if(parser.debug) {console.log("objGetVerbs:");console.log(objGetVerbs);}
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'newVerb' implicitly has an 'any' type.
        objGetVerbs.forEach(newVerb => {
            //if(parser.debug) {console.log("Checking getVerbs() for " + objName + " . . .");console.log(newVerb);}
            if (verbOpp != newVerb)
                return;
            //if(parser.debug) {console.log("Found one!");console.log(objName + " needs " + verb  + " changed to " + newVerb + "!");}
            if (!el.parentElement) {
                //if(parser.debug){ console.log("No element parent element.  QUITTING!");} 
                return;
            }
            //Change the verb to its opposite!
            switchDropdownVerb(el, newVerb, objName);
            //if(parser.debug) {console.log("DONE!")}
            return true;
        });
    });
}
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'el' implicitly has an 'any' type.
function switchDropdownVerb(el, newVerb, objName) {
    if (!objName) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        let objName = $(el).attr("obj");
    }
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    let oldVerb = $(el).attr("link-verb");
    if (!newVerb) {
        let newVerb = (settings as any).cmdOpps[oldVerb];
    }
    let str = el.parentElement.innerHTML;
    let regexp = new RegExp(oldVerb, 'g');
    let repl = str.replace(regexp, newVerb);
    el.parentElement.innerHTML = repl;
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $(el).attr("link-verb", newVerb);
    //parser.msg(`Replaced '${oldVerb}' on ${objName} with '${newVerb}'.`)
}
function disableExistingObjectLinks(bool = false) {
    //if bool is false, this only disables existing object links printed using the room description function
    //if bool is true, this disables ALL existing object links
    //parser.msg("running disableExistingObjectLinks!")
    //Checks that this doesn't remove "good" links.
    if (bool) {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".droplink").removeClass("droplink").css("cursor", "default").attr("name", "dead-droplink");
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".object-link").removeClass("dropdown");
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".dropdown").removeClass("dropdown");
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".dropdown-content").remove();
    }
    else {
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".room-desc.droplink").removeClass("droplink").css("cursor", "default").attr("name", "dead-droplink");
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".room-desc.object-link").removeClass("dropdown");
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".room-desc.dropdown").removeClass("dropdown");
        // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $(".room-desc.dropdown-content").remove();
    }
}
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'el' implicitly has an 'any' type.
function disableObjectLink(el) {
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    let objName = $(el).attr("obj");
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $(el).removeClass("droplink").css("cursor", "default").attr("name", "dead-droplink");
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $(el).removeClass("dropdown");
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $(el).removeClass("dropdown");
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $(`#${objName}`).remove();
}
