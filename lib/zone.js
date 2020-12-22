const zoneExit = function (char, dir) {
  const newX = char.positionX + this.data.x;
  const newY = char.positionY + this.data.y;

  // Exits to other places
  for (let el of this.origin.exits) {
    if (char.positionX === el.x && char.positionY === el.y && dir === el.dir) {
      const tpParams = { char: char, dir: dir };
      if (el.blocking) {
        QuestJs._io.msg(el.blockedmsg || QuestJs._lang.not_that_way, tpParams);
        return false;
      }
      if (el.isLocked) {
        QuestJs._io.msg(el.lockedmsg || QuestJs._lang.locked_exit, tpParams);
        return false;
      }
      //QuestJs._log.info(this)
      QuestJs._io.msg(el.msg || QuestJs._lang.go_successful, tpParams);
      this.origin.onZoneExit(dir);
      QuestJs._world.setRoom(char, el.dest);
      return true;
    }
  }

  // If the direction is "in", "up", or "down", just say no
  if (this.origin.defaultToBlocked || this.data.type !== 'compass') {
    QuestJs._io.msg("You can't go " + dir);
    return false;
  }

  // Check if a feature blocks the way
  for (let name in QuestJs._w) {
    const o = QuestJs._w[name];
    if (o.zone === this.origin.name && newX === o.x && newY === o.y && o.featureNoExit) {
      QuestJs._io.msg(o.featureNoExit.replace('#', dir));
      return false;
    }
  }

  // Check if this would cross a border
  for (let el of this.origin.getBorders()) {
    if (el.border(newX, newY)) {
      QuestJs._io.msg(el.borderMsg.replace('#', dir));
      return false;
    }
  }

  // Handle objects at the old location
  this.origin.onZoneExit(dir);

  // More the player
  char.positionX = newX;
  char.positionY = newY;
  QuestJs._io.msg(QuestJs._lang.stop_posture(char));
  QuestJs._io.msg(QuestJs._lang.go_successful, { char: char, dir: dir });
  QuestJs._world.setRoom(char, this.origin.name, false, true);

  return true;
};

const ZONE = function (defaultToBlocked) {
  const res = {
    exits: [],
    zone: true,
    defaultToBlocked: defaultToBlocked,
    // The below are all defaults for map drawing
    insideColour: 'yellow',
    outsideColour: 'silver',
    featureColour: 'blue',
    playerColour: 'black',
    mapCells: [],
    mapFeatures: [],
    mapLabels: [],
    cellSize: 16,
    mapBorder: true,
    mapFont: '12px sans-serif',
  };
  for (let ex of QuestJs._lang.exit_list) {
    if (ex.type === 'nocmd') continue;
    res[ex.name] = new QuestJs._create.Exit('_', { use: zoneExit, data: ex });
  }

  res.getExits = function (options) {
    const exits = [];
    for (let ex of QuestJs._lang.exit_list) {
      if (ex.type !== 'nocmd' && this.hasExit(options)) exits.push(ex);
    }
    return exits;
  };

  res.hasExit = function (dir, options) {
    //QuestJs._log.info("looking " + dir+ " at " + QuestJs._game.player.positionX + "," + QuestJs._game.player.positionY)
    if (options === undefined) options = {};
    if (!this[dir]) return false;

    // Check for special exit
    for (let el of this.exits) {
      //QuestJs._log.info("checking " + el.dest + " dir=" + el.dir + " (" + el.x + "," + el.y + ")")
      if (
        QuestJs._game.player.positionX === el.x &&
        QuestJs._game.player.positionY === el.y &&
        dir === el.dir
      ) {
        //QuestJs._log.info("found special")
        if (el.blocking) return false;
        if (options.excludeLocked && el.isLocked) return false;
        if (options.excludeScenery && el.scenery) return false;
        //QuestJs._log.info("it is good")
        return true;
      }
    }

    // Non-compass directions not allowed
    if (this.defaultToBlocked || this[dir].data.type !== 'compass') {
      return false;
    }

    // Check if this would cross a border
    const newX = QuestJs._game.player.positionX + this[dir].data.x;
    const newY = QuestJs._game.player.positionY + this[dir].data.y;
    for (let el of this.getBorders()) {
      if (el.borderMsg !== undefined) continue;
      if (el.border(newX, newY)) {
        return false;
      }
    }

    return true;
  };

  res.desc = function () {
    for (let el of this.descs) {
      if (el.when !== undefined) {
        if (el.when(QuestJs._game.player.positionX, QuestJs._game.player.positionY))
          return this.getDesc(el);
      } else if (el.x !== undefined) {
        if (el.x === QuestJs._game.player.positionX && el.y === QuestJs._game.player.positionY)
          return this.getDesc(el);
      } else {
        //QuestJs._log.info(el)
        return this.getDesc(el);
      }
    }
    return (
      'ERROR: No description found for zone at x=' +
      QuestJs._game.player.positionX +
      ', y=' +
      QuestJs._game.player.positionY
    );
  };

  res.getDesc = function (el) {
    return (typeof el.desc === 'function' ? el.desc() : el.desc) + this.getFeatureDescs();
  };

  res.onZoneExit = function (dir) {
    for (let name in QuestJs._w) {
      const o = QuestJs._w[name];
      if (o.loc === this.name && o !== QuestJs._game.player) {
        delete o.loc;
        o.positionX = QuestJs._game.player.positionX;
        o.positionY = QuestJs._game.player.positionY;
        o.zoneElsewhere = this.name;
      }
    }
  };

  res.getFeatureDescs = function () {
    let s = '';
    for (let name in QuestJs._w) {
      const el = QuestJs._w[name];
      if (el.zone !== this.name || el.zoneBorder) continue;
      if (
        QuestJs._game.player.positionX === el.positionX &&
        QuestJs._game.player.positionY === el.positionY &&
        el.featureLookHere
      ) {
        s += ' ' + el.featureLookHere;
      } else {
        const d = this.getDirection(QuestJs._game.player, el.positionX, el.positionY, el.range);
        if (d) s += ' ' + el.featureLook.replace('#', d);
      }
    }
    for (let el of this.getBorders()) {
      if (el.isAdjacentTo(QuestJs._game.player) && el.borderDesc) s += ' ' + el.borderDesc;
    }
    return s;
  };

  res.beforeEnter = function () {
    if (QuestJs._game.player.positionX === undefined) QuestJs._game.player.positionX = 0;
    if (QuestJs._game.player.positionY === undefined) QuestJs._game.player.positionY = 0;
    for (let name in QuestJs._w) {
      const o = QuestJs._w[name];
      if (
        o.zoneElsewhere === this.name &&
        o.positionX === QuestJs._game.player.positionX &&
        o.positionY === QuestJs._game.player.positionY
      ) {
        o.loc = this.name;
        delete o.zoneElsewhere;
      }
    }
  };

  // Gets the compass direction from that char to the given co-ordinate
  // If range is given, will return false if the distance is greater than that
  // No guarantee what will happen if the char is at at the coordinates
  // (because of the way floats are handled it may not be accurate/reliable)
  res.getDirection = function (char, objX, objY, range) {
    const x = objX - char.positionX;
    const y = objY - char.positionY;
    const r = Math.sqrt(x * x + y * y);
    if (range && r > range) return false;
    const theta = (Math.atan(y / x) * 180) / Math.PI;
    if (x > 0 && theta <= 22.5 && theta >= -22.5) return QuestJs._lang.exit_list[7].name;
    if (x > 0 && theta <= 67.5 && theta >= 22.5) return QuestJs._lang.exit_list[2].name;
    if (x > 0 && theta >= -67.5 && theta <= -22.5) return QuestJs._lang.exit_list[12].name;

    if (x < 0 && theta <= 22.5 && theta >= -22.5) return QuestJs._lang.exit_list[5].name;
    if (x < 0 && theta <= 67.5 && theta >= 22.5) return QuestJs._lang.exit_list[10].name;
    if (x < 0 && theta >= -67.5 && theta <= -22.5) return QuestJs._lang.exit_list[0].name;

    return y > 0 ? QuestJs._lang.exit_list[1].name : QuestJs._lang.exit_list[11].name;
  };

  res.getBorders = function () {
    const borders = [];
    for (name in QuestJs._w) {
      if (QuestJs._w[name].zoneBorder && QuestJs._w[name].zone === this.name)
        borders.push(QuestJs._w[name]);
    }
    return borders;
  };

  res.getBorderAt = function (x, y) {
    for (let el of this.getBorders()) {
      if (el.border(x, y)) {
        return el;
      }
    }
    return false;
  };

  res.getFeatureAt = function (x, y) {
    for (let name in QuestJs._w) {
      const el = QuestJs._w[name];
      if (el.zone !== this.name || el.zoneBorder) continue;
      if (x === el.positionX && y === el.positionY) {
        return el;
      }
    }
    return false;
  };

  res.drawMap = function () {
    if (this.size === undefined) return false;
    const cells = [];
    const features = [];
    const labels = [];
    for (let x = -this.size; x <= this.size; x++) {
      for (let y = -this.size; y <= this.size; y++) {
        const x2 = (this.size + x) * this.cellSize;
        const y2 = (this.size - y) * this.cellSize;
        if (this.getBorderAt(x, y)) {
          cells.push(
            '<rect x="' +
              x2 +
              '" y="' +
              y2 +
              '" width="' +
              this.cellSize +
              '" height="' +
              this.cellSize +
              '" stroke="none" fill="' +
              this.outsideColour +
              '"/>',
          );
        } else {
          cells.push(
            '<rect x="' +
              x2 +
              '" y="' +
              y2 +
              '" width="' +
              this.cellSize +
              '" height="' +
              this.cellSize +
              '" stroke="none" fill="' +
              this.insideColour +
              '"/>',
          );
        }
        const feature = this.getFeatureAt(x, y);
        if (feature) {
          const colour = feature.zoneColour || this.featureColour;
          features.push(
            '<circle cx="' +
              (x2 + this.cellSize / 2) +
              '" cy="' +
              (y2 + this.cellSize / 2) +
              '" r="' +
              (this.cellSize / 2 - 1) +
              '" stroke="none" fill="' +
              colour +
              '"/>',
          );
          if (feature.zoneMapName)
            labels.push(
              '<text x="' +
                (x2 + this.cellSize) +
                '" y="' +
                (y2 + 5) +
                '" style="font: ' +
                this.mapFont +
                '; fill: black;">' +
                feature.zoneMapName +
                '</text>',
            );
        }
      }
    }

    const map = cells.concat(this.mapCells, features, this.mapFeatures, labels, this.mapLabels);

    const x2 = (this.size + QuestJs._game.player.positionX) * this.cellSize;
    const y2 = (this.size - QuestJs._game.player.positionY) * this.cellSize;
    map.push(
      '<rect x="' +
        (x2 + 4) +
        '" y="' +
        (y2 + 4) +
        '" width="' +
        (this.cellSize - 8) +
        '" height="' +
        (this.cellSize - 8) +
        '" stroke="none" fill="' +
        this.playerColour +
        '"/>',
    );

    const svgSize = (this.size * 2 + 1) * this.cellSize;
    if (this.mapBorder)
      map.push(
        '<rect x="0" y="0" width="' +
          svgSize +
          '" height="' +
          svgSize +
          '" stroke="black" fill="none"/>',
      );
    QuestJs._io.draw(svgSize, svgSize, map);
    return true;
  };

  return res;
};

const ZONE_BORDER = function (loc) {
  const res = {
    zoneBorder: true,
    zone: loc,
    isAtLoc: function (loc, situation) {
      if (situation === QuestJs._world.LOOK && this.scenery) return false;
      if (situation === QuestJs._world.SIDE_PANE && this.scenery) return false;
      return this.isAdjacentTo(QuestJs._game.player);
    },
    isAdjacentTo: function (char) {
      if (char.loc !== this.zone) return false;
      for (let x = char.positionX - 1; x <= char.positionX + 1; x++) {
        for (let y = char.positionY - 1; y <= char.positionY + 1; y++) {
          if (this.border(x, y)) return true;
        }
      }
      return false;
    },
  };
  return res;
};

const ZONE_ITEM = function (loc, x, y) {
  const res = { positionX: x, positionY: y, zoneElsewhere: loc };
  return res;
};

const ZONE_FEATURE = function (loc, x, y, range, adjacent) {
  const res = {
    positionX: x,
    positionY: y,
    range: range,
    adjacent: adjacent,
    zone: loc,
    scenery: true,
    isAtLoc: function (loc, situation) {
      if (situation === QuestJs._world.LOOK && this.scenery) return false;
      if (situation === QuestJs._world.SIDE_PANE && this.scenery) return false;
      if (typeof loc !== 'string') loc = loc.name;
      if (adjacent) {
        return (
          loc === this.zone &&
          Math.abs(QuestJs._game.player.positionX - this.x) < 2 &&
          Math.abs(QuestJs._game.player.positionY - this.y) < 2
        );
      } else {
        return (
          loc === this.zone &&
          QuestJs._game.player.positionX === this.x &&
          QuestJs._game.player.positionY === this.y
        );
      }
    },
  };
  return res;
};
