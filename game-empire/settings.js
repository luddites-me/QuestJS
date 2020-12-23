"use strict";

// About your game
QuestJs._settings.title = "Nation!";
QuestJs._settings.author = "The Pixie"
QuestJs._settings.version = "0.1";
QuestJs._settings.thanks = [];
QuestJs._settings.files = ["geography", "code", "data", "npcs"]
QuestJs._settings.libraries.push('board')
QuestJs._settings.tests = true



QuestJs._settings.setup = function() {
  const boardSettings = {
    cellSize:20,
    size:nation.size,
    height:500,
    width:1500,
    angle:75,
    offsetX:20,
    offsetY:2,
    baseHeight:100,
    compass:{x: 1000, y:300},
    title:'The Game!',
    showRegions:true,
    showLabels:true,
    titleStyle:'font: 20pt bold',
    /*defs:function() {
      let s = '<filter id="dilate"><feMorphology id="morph" operator="dilate" radius="0" /></filter>'
      s += '<animate xlink:href="#morph" id="anim-dialiate" attributeName="radius" from="40" to="0" dur="3s" fill="freeze"/>'
      
      s += '  <filter id="displacementFilter"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/>'
      s += '<feDisplacementMap in2="turbulence" in="SourceGraphic" scale="50" xChannelSelector="R" yChannelSelector="G"/></filter>'
      s += ' <animate xlink:href="#displacementFilter" id="anim-turbulent" attributeName="scale" from="100" to="0" dur="5s" fill="freeze"/>'
      return s
    },*/
    switchesPos:{x:900, y:80},
    switchesWidth:240,
    switches:[
      {on:'orange', off:'green', att:'showRegions', text:'Toggle region display'},
      {on:'black', off:'silver', att:'showLabels', text:'Toggle label display'},
    ],
    /*extras:function() {
      let s = '<circle cx="820" cy="70" r="10" fill="'
      s += (this.showRegions ? 'orange' : 'green') + '" onclick="toggle(\'showRegions\')"/>'
      s += '<text x="850" y="77" fill="black">Toggle region display</text>'
      s += '<circle cx="820" cy="90" r="10" fill="'
      s += (this.showLabels ? 'black' : 'grey') + '" onclick="toggle(\'showLabels\')"/>'
      s += '<text x="850" y="97" fill="black">Toggle label display</text>'
      return s
    },*/
    getColourAt:function(x, y) {
      if (this.showRegions) {
        for (let el of nation.regions) {
          if (el.contains(x, y)) return el.colour
        }
      }
      else {
        for (let el of nation.regions) {
          if (el.cityAt(x, y)) return 'grey'
        }
      }
      return nation.map[x][y].colour
    },
    getFeaturesAt:function(x, y) {
      const result = []
      const city = nation.cityAt(x,y)
      if (city) {
        result.push('city' + city.pop)
        if (this.showLabels) result.push('cityName')
      }
      if (x === 3 && y === 3) result.push('black')
      //if (x === 8 && y === 1) return ['yellow', 'green']
      //if (x === 0 && y === 0) return ['go']
      return result
    },
    getLeftBorder:function(x, y) {
      if (nation.map[x][y].riverLeft) return 'stroke="blue" stroke-width="' + nation.map[x][y].riverLeft + '"'
      return false
    },
    getRightBorder:function(x, y) {
      if (nation.map[x][y].riverRight) return 'stroke="blue" stroke-width="' + nation.map[x][y].riverRight + '"'
      return false
    },
    features:{
      city1:{width:60, height:80, y:4, file:'city0.png',},
      city2:{width:60, height:80, y:4, file:'city1.png',},
      city3:{width:60, height:80, y:4, file:'city2.png',},
      city4:{width:60, height:80, y:4, file:'city3.png',},
      city5:{width:60, height:80, y:4, file:'city4.png',},
      city6:{width:60, height:80, y:4, file:'city5.png',},
      city7:{width:60, height:80, y:4, file:'city6.png',},
      cityName:{width:30, height:60, layer:'labels', script:function(x2, y2, x, y) {
        const city = nation.cityAt(x,y)
        return '<text x="' + x2 + '" y="' + (y2+15) + '" style="font-weight:bold;text-anchor:middle" fill="black">' + city.name + '</text>'
      }},
      go:{width:30, height:30, flatFile:'square_one.png',},
      black:{width:30, height:60, x:0, y:-2, file:'icon_man.png',},
      blue:{width:30, height:60, x:5, y:0, file:'icon_man_blue.png',},
      red:{width:30, height:60, x:10, y:2, file:'icon_man_red.png',},
      yellow:{width:30, height:60, x:-5, y:4, file:'icon_man_yellow.png',},
      green:{width:30, height:60, x:-10, y:6, file:'icon_man_green.png',},
      text2:{text:'Something', style:"font-weight:bold", colour:"orange",},
      text:{width:30, height:60, script:function(x, y) {
        return '<text x="' + x + '" y="' + (y-5) + '" style="font-weight:bold;text-anchor:middle" fill="orange">Grumpy!</text>'
      }},
    },
  }
  
  // need to add:
  // three rivers, going from 0,size to size,0
  // sea filling size,0 corner
  // forest area
  // desert area
  // mountain area filling 0,size corner
  // four towns and one city, some on rivers
  
  QuestJs._board.setup(boardSettings)
  
  QuestJs._io.msg('So here you are in your own throne room...')
  QuestJs._io.msg('Becoming the ruler was quite a surprise, but after the goblin hoard wiped out the entire royal family, you were next in line. Your realm is one of the smallest kingdoms on the continent, and it is still reeling from a goblin invasion, so it will be no easy task. Oh, and some of your subjects are demanding a republic...')
  QuestJs._io.metamsg('This game is about ruling you kingdom wisely - or not. You will need to talk to your advisors to learn what needs doing, and give them orders to get it done. They are not all necessarily to be trusted...')
  QuestJs._io.metamsg('Use the SLEEP command in your bedroom to have time pass (i.e., tale a turn). You may want to use the HELP command too.')
  QuestJs._io.metamsg('Good luck, your majesty.')
}



