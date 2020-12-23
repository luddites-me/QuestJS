





const board = {}

QuestJs._board = board;

board.setup = function(settings) {
  this.settings = settings
  
  this.QuestJs._settings.cosAngle = Math.cos(this.QuestJs._settings.angle * Math.PI / 180)
  this.QuestJs._settings.sinAngle = Math.sin(this.QuestJs._settings.angle * Math.PI / 180)
  this.QuestJs._settings.rootTwo = Math.sqrt(2)
  this.QuestJs._settings.cellPoly = [
    [-this.QuestJs._settings.sinAngle * this.QuestJs._settings.cellSize, 0],
    [0, -this.QuestJs._settings.cosAngle * this.QuestJs._settings.cellSize],
    [this.QuestJs._settings.sinAngle * this.QuestJs._settings.cellSize, 0],
    [0, this.QuestJs._settings.cosAngle * this.QuestJs._settings.cellSize],
  ]  
  
  $('<div id="map" style="position: fixed;bottom: 0px; left: 200px;width:' + this.QuestJs._settings.width + 'px;height:' + this.QuestJs._settings.height + 'px;">This will be the board...</div>').insertAfter('#dialog')
  $('#main').css('margin-bottom',"420px");
  this.update()
}


board.update = function() {
  this.map = []
  this.labels = []
  
  this.map.push('<defs>')
  this.map.push('<linearGradient id="leftBaseGradient" gradientTransform="rotate(120)"><stop offset="0%"  stop-color="black" /><stop offset="30%" stop-color="white" /></linearGradient>')
  this.map.push('<linearGradient id="rightBaseGradient" gradientTransform="rotate(60)"><stop offset="45%"  stop-color="black" /><stop offset="80%" stop-color="white" /></linearGradient>')
  if (this.QuestJs._settings.defs) this.map.push(this.QuestJs._settings.defs())
  this.map.push('</defs>')
  
  
  if (this.QuestJs._settings.title) this.map.push(board.getTitle())
  
  // 0,0 is at the left, x increases towards the bottom, y to the top
  // 0,size is at the top; size,0 at the bottom; size,size at the right
  // Start at 0,size; then 0,size-1 and 1,size

  for (let i = 0; i < this.QuestJs._settings.size; i++) {
    for (let j = 0; j < i; j++) {
      const x = j
      const y = this.QuestJs._settings.size - i + j
      board.handleCell(x, y)
    }
  }
  for (let i = this.QuestJs._settings.size; i <= (2 * this.QuestJs._settings.size); i++) {
    for (let j = 0; j < (2 * this.QuestJs._settings.size - i); j++) {
      const x = j + i - this.QuestJs._settings.size
      const y = j
      board.handleCell(x, y)
    }
  }

  if (this.QuestJs._settings.baseHeight) this.map.push(board.getBase())
  if (this.QuestJs._settings.compassPane) this.map.push(board.getCompass(this.QuestJs._settings.compass.x, this.QuestJs._settings.compass.y))
  if (this.QuestJs._settings.switches) this.map.push(board.getSwitches())
  if (this.QuestJs._settings.extras) this.map.push(this.QuestJs._settings.extras())
  $('#map').html('<svg width="' + this.QuestJs._settings.width + '" height="' + this.QuestJs._settings.height + '" viewBox="0 0 ' + this.QuestJs._settings.width + ' ' + this.QuestJs._settings.height + '" xmlns="http://www.w3.org/2000/svg">' + this.map.join() + this.labels.join() + '</svg>')
  return true
}  


board.handleCell = function(x, y) {
  const [x2, y2] = board.getCoord(x, y)
  
  let s = '<polygon points="'
  for (let el of this.QuestJs._settings.cellPoly) {
    s += (x2 + el[0]) + ',' + (y2 + el[1]) + ' '
  }
  s += '" '
  s += board.QuestJs._settings.cellBorder ? board.QuestJs._settings.cellBorder(x, y) : 'stroke="none"'
  s += ' fill="' + this.QuestJs._settings.getColourAt(x, y) + '"/>'
  
  if (typeof this.QuestJs._settings.getLeftBorder === 'function') {
    const leftBorder = this.QuestJs._settings.getLeftBorder(x, y)
    if (leftBorder) {
      s += '<line x1="' + (x2 + this.QuestJs._settings.cellPoly[0][0]) + '" y1="' + (y2 + this.QuestJs._settings.cellPoly[0][1]) + '" '
      s += 'x2="' + (x2 + this.QuestJs._settings.cellPoly[3][0]) + '" y2="' + (y2 + this.QuestJs._settings.cellPoly[3][1]) + '" ' + leftBorder + '/>'
    }
    const rightBorder = this.QuestJs._settings.getRightBorder(x, y)
    if (rightBorder) {
      s += '<line x1="' + (x2 + this.QuestJs._settings.cellPoly[2][0]) + '" y1="' + (y2 + this.QuestJs._settings.cellPoly[2][1]) + '" '
      s += 'x2="' + (x2 + this.QuestJs._settings.cellPoly[3][0]) + '" y2="' + (y2 + this.QuestJs._settings.cellPoly[3][1]) + '" ' + rightBorder + '/>'
    }
  }
  
  for (let el of this.QuestJs._settings.getFeaturesAt(x, y)) {
    const feature = this.QuestJs._settings.features[el]
    if (feature === undefined) {
      QuestJs._log.info('WARNING: Failed to find a feature called "' + el + '" when drawing board')
      continue
    }
    if (feature.script) {
      if (feature.layer) {
        this[feature.layer].push(feature.script(x2, y2, x, y))
      }
      else {
        s += feature.script(x2, y2, x, y)
      }
    }
    else if (feature.text) {
      const s = '<text x="' + x2 + '" y="' + (y2+(feature.y ? feature.y : 0)) + '" style="text-anchor:middle;'
      if (feature.style) s += feature.style
      s += '" '
      if (feature.colour) s+= 'fill="' + feature.colour + '"'      
      s += '>' + feature.text + '</text>'
      this.labels.push(s)
    }
    else if (feature.file) {
      let x3 = x2-feature.width/2
      if (feature.x) x3 += feature.x
      let y3 = y2-feature.height
      if (feature.y) y3 += feature.y
      s += '<image href="' + QuestJs._settings.imagesFolder + feature.file + '" '
      s += 'width="' + feature.width + '" height="' + feature.height + '" '
      s += 'x="' + x3 + '" y="' + y3 + '"/>'
    }
    else if (feature.flatFile) {
      let x3 = x2-feature.width/2 + 18
      let y3 = y2-feature.height + 30.5 - 0.26 * this.QuestJs._settings.cellSize
      s += '<image href="' + QuestJs._settings.imagesFolder + feature.flatFile + '" '
      s += 'width="' + Math.round(this.QuestJs._settings.cellSize * this.QuestJs._settings.rootTwo) + '"'
      s += ' x="' + x3 + '" y="' + y3 + '" transform-origin="'
      s += x3 + 'px ' + y3 + 'px" transform="scale(1, '
      s += (this.QuestJs._settings.cosAngle/this.QuestJs._settings.sinAngle) + ') rotate(45)"/>'
    }
  }
  this.map.push(s)
}


board.getTitle = function() {
  const x = this.QuestJs._settings.titleX || 10
  const y = this.QuestJs._settings.titleY || (this.QuestJs._settings.height / 4)
  let s = '<text x="' + x + '" y="' + y
  if (this.QuestJs._settings.titleStyle) s += '" style="' + this.QuestJs._settings.titleStyle
  s += '">' + this.QuestJs._settings.title + '</text>'
  return s
}

board.getCompass = function(x, y) {
  let s = '<image href="' + QuestJs._settings.imagesFolder + 'compass45.png" width="160" height="159" x="' 
  s += x + '" y="' + y
  s += '" transform="scale(1, ' + (this.QuestJs._settings.cosAngle/this.QuestJs._settings.sinAngle) + ')" transform-origin="'
  s += x + 'px ' + y + 'px"/>'
  return s
}

board.getSwitches = function() {
  const x = this.QuestJs._settings.switchesPos.x || 800
  const y = this.QuestJs._settings.switchesPos.y || 100
  let s = ''
  if (this.QuestJs._settings.switchesWidth) {
    s += '<rect x="' + x + '" y="' + y + '" width="' + this.QuestJs._settings.switchesWidth + '" height="'
    s += (this.QuestJs._settings.switches.length * 18 + 14) + '" fill="#eee" stroke="black"/>'
  }
  let offset = 0
  for (let el of this.QuestJs._settings.switches) {
    QuestJs._log.info(el)
    s += '<circle cx="' + (x + 14) + '" cy="' + (y + 15 + offset) + '" r="8" fill="'
    s += (this.settings[el.att] ? el.on : el.off) + '" stroke="black" onclick="'
    s += el.customFunction ? el.customFunction : 'board.toggle(\'' + el.att + '\')'
    s += '"/>'
    s += '<text x="' + (x + 26) + '" y="' + (y + 20 + offset) + '" fill="black">' + el.text + '</text>'
    offset += 20
  }
  return s
}

board.getBase = function() {
  let s = '<polygon points="'
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.cellPoly[0][0]) + ','
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY) + ' '
  
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.sinAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize + this.QuestJs._settings.cellPoly[0][0]) + ','
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY + this.QuestJs._settings.cosAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize) + ' '
  
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.sinAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize + this.QuestJs._settings.cellPoly[0][0]) + ',' 
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY + this.QuestJs._settings.cosAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize + this.QuestJs._settings.baseHeight) + ' '
  
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.cellPoly[0][0]) + ','
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY + this.QuestJs._settings.baseHeight) + ' '
  s += '" stroke="none" fill="url(\'#leftBaseGradient\')"/>'
  
  
  s += '<polygon points="'
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.sinAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize * 2 + this.QuestJs._settings.cellPoly[0][0]) + ',' 
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY) + ' '
  
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.sinAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize + this.QuestJs._settings.cellPoly[0][0]) + ',' 
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY + this.QuestJs._settings.cosAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize) + ' '
  
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.sinAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize + this.QuestJs._settings.cellPoly[0][0]) + ','
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY + this.QuestJs._settings.cosAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize + this.QuestJs._settings.baseHeight) + ' '
  
  s += (this.QuestJs._settings.offsetX + this.QuestJs._settings.sinAngle * this.QuestJs._settings.size * this.QuestJs._settings.cellSize * 2 + this.QuestJs._settings.cellPoly[0][0]) + ','
  s += (this.QuestJs._settings.height / 2 + this.QuestJs._settings.offsetY + this.QuestJs._settings.baseHeight) + ' '
  s += '" stroke="none" fill="url(\'#rightBaseGradient\')"/>'

  return s
}


board.getCoord = function(x, y) {
  const x2 = this.QuestJs._settings.cellSize * (x + y) * this.QuestJs._settings.sinAngle + this.QuestJs._settings.offsetX
  const y2 = this.QuestJs._settings.height / 2 + this.QuestJs._settings.cellSize * (x - y) * this.QuestJs._settings.cosAngle + this.QuestJs._settings.offsetY
  return [x2, y2]
}


board.toggle = function(att) {
  board.settings[att] = !board.settings[att]
  board.update()
}
