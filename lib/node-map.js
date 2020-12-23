


const map = {
  toggle:true,
  defaults:{
    mapCellSize:20,
    mapScale:25,
    mapLocationColour:'yellow',
    mapBorderColour:'black',
    mapTextColour:'black',
    mapExitColour:'#444',
    mapExitWidth:3,
    mapLabelOffset:15,
    mapLabelColour:'black',
  }
}
map.defaultStyle = {position:'fixed', display:'block'}
QuestJs._IO.modulesToUpdate.push(map)
QuestJs._IO.modulesToInit.push(map)

// Authors can override this so there are several starting locations if there are isolated regions
map.getStartingLocations = function() {
  const starts = QuestJs._settings.mapAutomapFrom ? QuestJs._settings.mapAutomapFrom.map(el => QuestJs._w[el]) : [QuestJs._w[QuestJs._game.player.loc]]
  let count = 0
  for (let start of starts) {
    start.mapX = 0
    start.mapY = 0
    start.mapZ = 0
    start.mapRegion = count
    count++
  }
  return starts
}

map.init = function() {
  // First set up the HTMP page
  $('#quest-map').css(map.defaultStyle)
  $('#quest-map').css(QuestJs._settings.mapStyle)
  $("<style>")
      .prop("type", "text/css")
      .html(".map-text " + QuestJs._util.dictionaryToCss(QuestJs._settings.mapLabelStyle, true))
      .appendTo("head")
  $('.map-text').css('color', 'red')
  QuestJs._settings.mapHeight = parseInt(QuestJs._settings.mapStyle.height)
  QuestJs._settings.mapWidth = parseInt(QuestJs._settings.mapStyle.width)
  
  // Set the default values for settings
  for (let key in map.defaults) {
    if (!settings[key]) settings[key] = map.defaults[key]
  }  
  
  // rooms is a list of rooms to be mapped
  // set it up with some seed rooms
  const rooms = QuestJs._settings.mapGetStartingLocations ? QuestJs._settings.mapGetStartingLocations() : map.getStartingLocations()
  
  // go through each room in the list
  while (rooms.length > 0) {
    // get the next room
    const room = rooms.shift()
    
    
    // go through each exit
    for (let dir of QuestJs._lang.exit_list) {
      // we are only interested in compass and vertical, and if the exit exists
      if (dir.type !== 'compass' && dir.type !== 'vertical') continue
      if (!room.hasExit(dir.name)) continue
      
      // For this exit, skip if flagged to ignore or points to non-room
      const exit = room[dir.name]
      if (exit.mapIgnore) continue
      if (exit.name === '_') continue
      
      // For the exit destination, skip if flagged to ignore
      // otherwise map it
      const exitRoom = QuestJs._w[exit.name]
      if (!exitRoom) throw new Error("Mapping to unknown exit: " + exit.name)
      if (exitRoom.mapIgnore) {
        exit.mapIgnore = true
        continue
      }
      if (exitRoom.mapMoveableLoc || room.mapMoveableLoc) {
        exit.mapMoveableLoc = true
        map.mapMultiRoomFromExit(room, exitRoom, exit, dir)
      }
      else {
        map.mapRoomFromExit(room, exitRoom, exit, dir, rooms)
      }
      if (exitRoom.mapMoveableLoc && !exitRoom.mapDraw) {
        exitRoom.mapDraw = map.moveableLocDraw
      }
    }
  }

  map.layers = [
    // rooms on other levels
    {name:'otherLevels', attrs:'stroke="' + QuestJs._settings.mapBorderColour + '" stroke-width="1" fill="' + QuestJs._settings.mapLocationColour + '" opacity="0.2" pointer-events="none"'},
    // exits
    {name:'exits', attrs:'style="stroke:' + QuestJs._settings.mapExitColour + ';stroke-width:' + QuestJs._settings.mapExitWidth + 'px;fill:' + QuestJs._settings.mapExitColour + '"'},
    // rooms on this level
    {name:'base', attrs:'stroke="' + QuestJs._settings.mapBorderColour + '" stroke-width="1" fill="' + QuestJs._settings.mapLocationColour + '"'},
    // features (anything the author might want to add)
    {name:'features', attrs:''},
    // labels
    {name:'labels', attrs:'pointer-events="none" fill="' + QuestJs._settings.mapLabelColour + '" text-anchor="middle"'},
  ]

}

// Mapping from room to exitRoom, exit is the exit linking the two, dir is an object from QuestJs._lang.exit_list
map.mapRoomFromExit = function(room, exitRoom, exit, dir, rooms) {
  //QuestJs._log.info(exit)
  const offsetX = (exit.mapOffsetX ? exit.mapOffsetX : dir.x) * QuestJs._settings.mapScale
  const offsetY = (exit.mapOffsetY ? exit.mapOffsetY : dir.y) * QuestJs._settings.mapScale
  const offsetZ = (exit.mapOffsetZ ? exit.mapOffsetZ : dir.z)
  //QuestJs._log.info('' + offsetX + ', ' + offsetY + ', ' + offsetZ)
  if (exitRoom.mapX === undefined) {
    // if room not done, set coords, add to rooms
    if (!exitRoom.mapIgnore) {
      exitRoom.mapX = room.mapX + offsetX
      exitRoom.mapY = room.mapY - offsetY
      exitRoom.mapZ = room.mapZ + offsetZ
      exitRoom.mapRegion = room.mapRegion
      if (rooms) rooms.push(exitRoom)
      //QuestJs._log.info("Rooms: " + rooms.map(el => el.name).join(', '))
    }
    //QuestJs._log.info(exitRoom)
  }
  else {
    // if done, check coords and alert if dodgy
    if (exitRoom.mapX !== room.mapX + offsetX) {
      QuestJs._log.info("WARNING: Mapping exit from " + room.name + " to " + exit.name + " - funny X offset (" + exitRoom.mapX + " vs " + (room.mapX + offsetX) + ")")
      QuestJs._log.info(room)
      QuestJs._log.info(exitRoom)
      QuestJs._log.info(exit.mapOffsetX)
      QuestJs._log.info(dir.x)
      QuestJs._log.info('' + offsetX + ', ' + offsetY + ', ' + offsetZ)
    }
    if (exitRoom.mapY !== room.mapY - offsetY) QuestJs._log.info("WARNING: Mapping exit from " + room.name + " to " + exit.name + " - funny Y offset (" + exitRoom.mapY + " vs " + (room.mapY + offsetY) + ")")
    if (exitRoom.mapZ !== room.mapZ + offsetZ) QuestJs._log.info("WARNING: Mapping exit from " + room.name + " to " + exit.name + " - funny Z offset")
  }
}




// Mapping from room to exitRoom, exit is the exit linking the two, dir is an object from QuestJs._lang.exit_list
// Use when exitRoom is multi-location, so is not to be added to the room list, and needs to know each location
map.mapMultiRoomFromExit = function(room, exitRoom, exit, dir) {
  //QuestJs._log.info(exit)
  const offsetX = (exit.mapOffsetX ? exit.mapOffsetX : dir.x) * QuestJs._settings.mapScale
  const offsetY = (exit.mapOffsetY ? exit.mapOffsetY : dir.y) * QuestJs._settings.mapScale
  const offsetZ = (exit.mapOffsetZ ? exit.mapOffsetZ : dir.z)
  //QuestJs._log.info('' + offsetX + ', ' + offsetY + ', ' + offsetZ)
  if (exitRoom.locations === undefined) exitRoom.locations = []
  exitRoom.mapRegion = true
  const loc = {}
  if (!exitRoom.mapIgnore) {
    loc.mapX = room.mapX + offsetX
    loc.mapY = room.mapY - offsetY
    loc.mapZ = room.mapZ + offsetZ
    loc.mapRegion = room.mapRegion
    loc.connectedRoom = room
    //loc.connection = exit
    exitRoom.locations.push(loc)
  }
}



// Draw the map
// It collects all the SVG in five lists, which are effectively layers.
// This means all the exits appear in one layer, all the labels in another
// and so labels are always on top of exits
map.update = function() {
  // grab the current room region and level. If the room is missing either, give up now!
  const level = QuestJs._w[QuestJs._game.player.loc].mapZ
  const region = QuestJs._w[QuestJs._game.player.loc].mapRegion
  if (level === undefined || region === undefined) return
  if (QuestJs._w[QuestJs._game.player.loc].mapIgnore) return
  
  // Stuff gets put in any of several layers, which will be displayed in this order
  const lists = {}
  for (let el of map.layers) lists[el.name] = ['', '<g id="otherLevels-layer" ' + el.attrs + '>']

  // Loop through every room
  for (let key in QuestJs._w) {
    const room = QuestJs._w[key]
    // Do not map if in another region (if region is true, the room can handle it)
    // Only show if visited unless mapShowNotVisited
    if (room.mapRegion !== region && room.mapRegion !== true) continue
    if (!QuestJs._settings.mapShowNotVisited && !room.visited) continue
    // Call mapDraw on the room if it has that, otherwise the default version
    (room.mapDraw ? room : map).mapDraw(lists, region, level, room)
  }

  // Add it all together
  const result = QuestJs._settings.mapDefs ? QuestJs._settings.mapDefs() : []
  for (let key in lists) {
    for (let el of lists[key]) result.push(el)
    result.push('</g>')
  }
  //QuestJs._log.info(result)
  if (QuestJs._settings.mapExtras) result.push(...QuestJs._settings.mapExtras())
  result.push(QuestJs._settings.mapMarker ? QuestJs._settings.mapMarker(QuestJs._w[QuestJs._game.player.loc]) : map.marker(QuestJs._w[QuestJs._game.player.loc].mapX, QuestJs._w[QuestJs._game.player.loc].mapY))

  // Centre the view on the player, and draw it
  const x = QuestJs._w[QuestJs._game.player.loc].mapX - QuestJs._settings.mapWidth/2
  const y = -QuestJs._settings.mapHeight/2 + QuestJs._w[QuestJs._game.player.loc].mapY
  QuestJs._io.draw(QuestJs._settings.mapWidth, QuestJs._settings.mapHeight, result, {destination:'quest-map', x:x, y:y})
}
    

// The default draw function for a room
// Puts the various bits in the appropriate lists
map.mapDraw = function(lists, region, level, room) {

  // Location itself
  const destinationLayer = room.mapZ === level ? lists.base : lists.otherLevels
  if (room.mapDrawString) {
    destinationLayer.push(room.mapDrawString)
  }
  else if (room.mapDrawBase) {
    const s = room.mapDrawBase()
    if (!room.mapRedrawEveryTurn) room.mapDrawString = s
    destinationLayer.push(s)
  }
  else {
    destinationLayer.push(map.mapDrawDefault(room))
  }
  
  if (room.mapZ !== level) return

  // Exits
  for (let dir of QuestJs._lang.exit_list) {
    if (dir.type !== 'compass') continue
    if (!room.hasExit(dir.name)) continue
    const exit = room[dir.name]
    if (exit.mapIgnore) continue
    if (exit.name === '_') continue
    const exitRoom = QuestJs._w[exit.name]
    if (exit.mapDrawString) {
      lists.exits.push(exit.mapDrawString)
    }
    else if (exit.mapDrawBase) {
      lists.exits.push(exit.mapDrawBase(room, exitRoom, region, level))
    }
    else if (exit.mapMoveableLoc) {
      // For an exit going TO a mapMoveableLoc, 
      // assume a straight exit
      //QuestJs._log.info('here ' + room.name + ' ' + dir.name)
      let s = '<line x1="' + room.mapX + '" y1="' + room.mapY
      s += '" x2="' + (room.mapX + dir.x * QuestJs._settings.mapScale / 2) + '" y2="' + (room.mapY - dir.y * QuestJs._settings.mapScale / 2)
      s += '"/>'
      exit.mapDrawString = s
      //QuestJs._log.info(s)
      lists.exits.push(s)
    }
    else {
      let s = '<line x1="' + room.mapX + '" y1="' + room.mapY
      s += '" x2="' + (exitRoom.mapX + room.mapX) / 2 + '" y2="' + (exitRoom.mapY + room.mapY) / 2
      s += '"/>'
      if (!exit.mapRedrawEveryTurn) exit.mapDrawString = s
      lists.exits.push(s)
    }
  }
  
  // Features
  if (room.mapDrawFeatures) lists.features.push(room.mapDrawFeatures())
  
  // Labels
  if (!QuestJs._settings.mapDrawLabels) return 
  if (room.mapDrawLabelString) {
    lists.labels.push(room.mapDrawLabelString)
  }
  else if (room.mapDrawLabel) {
    const s = room.mapDrawLabel(region, level)
    if (!room.mapRedrawEveryTurn) room.mapDrawLabelString = s
    lists.labels.push(s)
  }
  else {
    lists.labels.push(map.mapDrawLabelDefault(room))
  }
}




// The default draw function for a multi-location room
// Puts the various bits in the appropriate lists
map.moveableLocDraw = function(lists, region, level, room) {
  for (let el of this.locations) {
    if (el.mapRegion !== region) continue
    // Location itself
    const destinationLayer = el.mapZ === level ? lists.base : lists.otherLevels
    // if a multi-location room, give it the special draw function
    destinationLayer.push(room.mapDrawBase ? room.mapDrawBase(level, el) : map.mapDrawDefault(room, el))

    // Exits
    for (let dir of QuestJs._lang.exit_list) {
      if (dir.type !== 'compass') continue
      if (!room.hasExit(dir.name)) continue
      const exit = room[dir.name]
      if (exit.mapIgnore) continue
      if (exit.name === '_') continue
      const exitRoom = QuestJs._w[exit.name]

      if (exit.mapDrawBase) {
        lists.exits.push(exit.mapDrawBase(room, exitRoom, region, level))
      }
      else if (dir.name === room.transitDoorDir) {
        // For an exit going FROM a mapMoveableLoc, 
        for (let el of room.locations) {
          if (el.mapZ !== level || el.mapRegion !== region) continue
        let s = '<line x1="' + el.mapX + '" y1="' + el.mapY
        s += '" x2="' + (el.mapX + dir.x * QuestJs._settings.mapScale / 2) + '" y2="' + (el.mapY - dir.y * QuestJs._settings.mapScale / 2)
        s += '"/>'
        lists.exits.push(s)
        }
      }
      else {
        let s = '<line x1="' + el.mapX + '" y1="' + room.mapY
        s += '" x2="' + (exitRoom.mapX + el.mapX) / 2 + '" y2="' + (exitRoom.mapY + el.mapY) / 2
        s += '"/>'
        lists.exits.push(s)
      }
    }
    
    // Features
    if (room.mapDrawFeatures) lists.features.push(room.mapDrawFeatures())
    
    // Labels
    if (!QuestJs._settings.mapDrawLabels || el.mapZ !== level) return 
    if (room.mapDrawLabelString) {
      lists.labels.push(room.mapDrawLabelString)
    }
    else if (room.mapDrawLabel) {
      const s = room.mapDrawLabel(region, level)
      if (!room.mapRedrawEveryTurn) room.mapDrawLabelString = s
      lists.labels.push(s)
    }
    else {
      lists.labels.push(map.mapDrawLabelDefault(room, el))
    }
  }
}





// loc has the coordinates, but defaults to o
// (used by moveableLocDraw)
map.mapDrawDefault = function(o, loc) {
  if (loc === undefined) loc = o
  const w = o.mapWidth ? o.mapWidth : QuestJs._settings.mapCellSize
  const h = o.mapHeight ? o.mapHeight : QuestJs._settings.mapCellSize
  let s = '<rect x="'
  s += loc.mapX - w/2
  s += '" y="'
  s += loc.mapY - h/2
  s += '" width="' + w + '" height="' + h
  if (o.mapColour) s += '" fill="' + o.mapColour
  s += '"' + map.getClickAttrs(o) + '/>'
  return s
}

map.getClickAttrs = function(o) {
  if (!QuestJs._settings.mapClick) return ''
  return ' onclick="QuestJs._settings.mapClick(\'' + o.name + '\')" cursor="pointer" role="button"'
}

map.mapDrawLabelDefault = function(o, loc) {
  if (loc === undefined) loc = o
  let s = '<text class="map-text" x="'
  s += loc.mapX
  s += '" y="'
  s += loc.mapY - QuestJs._settings.mapLabelOffset
  if (QuestJs._settings.mapLabelRotate) s += '" transform="rotate(' + QuestJs._settings.mapLabelRotate + ',' + loc.mapX + ',' + (loc.mapY - QuestJs._settings.mapLabelOffset) + ')'
  s += '">'
  s += o.mapLabel ? o.mapLabel : QuestJs._tools.sentenceCase(o.alias)
  s += '</text>'
  return s
}



map.polygon = function(room, points, attrs) { return map.polyany('polygon', room, points, attrs) }
map.polyline = function(room, points, attrs) { return map.polyany('line', room, points, attrs) }
map.polyroom = function(room, points, attrs) { return map.polyany('room', room, points, attrs) }

map.polyany = function(type, room, points, attrs) {
  let s = '<poly' + (type === 'line' ? 'line' : 'gon') + ' points="'
  s += points.map(el => '' + (room.mapX + el[0]) + ',' + (room.mapY + el[1])).join(' ')
  s += '" '
  if (attrs) s += ' style="' + attrs + '"'
  if (type === 'room') s += map.getClickAttrs(room)
  s += '/>'
  //QuestJs._log.info(s)
  return s
}


map.rectRoom = function(room, points, attrs) { return map.rect(true, room, points, attrs) }
map.rectangle = function(room, points, attrs) { return map.rect(false, room, points, attrs) }

map.rect = function(isRoom, room, points, attrs) {
  let s = '<rect x="' + (room.mapX + points[0][0]) + '" y="' + (room.mapY + points[0][1])
  s += '" width="' + points[1][0] + '" height="' + points[1][1] + '"'
  if (attrs) s += ' style="' + attrs + '"'
  if (isRoom) s += map.getClickAttrs(room)
  s += '/>'
  return s
}

map.text = function(room, st, points, attrs) {
  let s = '<text x="' + (room.mapX + points[0]) + '" y="' + (room.mapY + points[1]) + '"'
  if (attrs) s += ' style="' + attrs + '"'
  s += ' text-anchor="middle">' + st + '</text>'
  //QuestJs._log.info(s)
  return s
}

map.bezier = function(room, points, attrs) {
  let s = '<path d="M '
  s += (room.mapX + points[0][0]) + ' ' + (room.mapY + points[0][1])
  points.shift()
  s += points.length === 2 ? ' q ' : ' c '
  s += points.map(el => '' + el[0] + ' ' + el[1]).join(' ')
  s += '" '
  if (attrs) s += ' style="' + attrs + '"'
  s += '/>'
  //QuestJs._log.info(s)
  return s
}




map.marker = function(x, y) {
  let s = '<circle cx="'
  s += x
  s += '" cy="'
  s += y
  s += '" r="5" stroke="black" fill="blue"/>'
  return s
}


if (QuestJs._settings.playMode === 'dev') {
  QuestJs._commands.unshift(new QuestJs._command.Cmd('DebugMap', {
    regex:/^debug map$/,
    objects:[
    ],
    script:function() {
      for (let key in QuestJs._w) {
        if (QuestJs._w[key].mapZ == undefined) continue
        QuestJs._io.metamsg(QuestJs._w[key].name + ': ' + QuestJs._w[key].mapX + ', ' + QuestJs._w[key].mapY + ', ' + QuestJs._w[key].mapZ + ' Region=' + QuestJs._w[key].mapRegion)
      }
      return QuestJs._world.SUCCESS_NO_TURNSCRIPTS
    },
  }))
}



QuestJs._command.findCmd('Map').script = function() {
  if (QuestJs._settings.hideMap) {
    $('#quest-map').show()
    delete QuestJs._settings.hideMap
  }
  else {
    $('#quest-map').hide()
    QuestJs._settings.hideMap = true
  }
  QuestJs._IO.calcMargins()
  QuestJs._io.msg(QuestJs._lang.done_msg)
}