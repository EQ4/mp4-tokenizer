var ns = module.exports
  , run = !module.parent
  , fs = require('fs')
  , indent = require('./indent')
  , containerAtoms = [
      'dinf'
    , 'ilst'
    , 'meta'
    , 'mdia'
    , 'minf'
    , 'moov'
    , 'stbl'
    , 'trak'
    , 'udta'
    ]
  , leafParsers = {
      stsd: require('./parsers/stsd')
    , tkhd: require('./parsers/tkhd')
    }


ns.parseAtom = function(buffer, level) {
  var cursor = 0
    , extendedLength = false

  while (cursor < buffer.length) {
    var atomSize = buffer.readUInt32BE(cursor)
    cursor += 4
    var atomType = buffer.toString('utf8', cursor, cursor += 4)

    // handle the case where we have an extended length
    if (extendedLength = (atomSize === 1)) {
      atomSize = buffer.readUInt32BE(cursor) << 4
      cursor += 4
      atomSize += buffer.readUInt32BE(cursor)
      cursor += 4
    }

    // print out our atom in the hierarchy
    console.log(indent(level), atomType, '( ' + atomSize + ' bytes )')

    var endCursor = cursor + atomSize - (extendedLength ? 16 : 8)
      , atomBuffer = buffer.slice(cursor, endCursor)

    if (containerAtoms.indexOf(atomType) !== -1) {
      ns.parseAtom(atomBuffer, level+1)
    } else {
      ns.parseLeafAtom(atomSize, atomType, atomBuffer, level+1)
    }

    cursor = endCursor
  }
}

ns.parseLeafAtom = function(atomSize, atomType, buffer, level) {
  var parserModule = leafParsers[atomType]
  if (parserModule) {
    parseAtom = parserModule.parse
    parseAtom(atomSize, atomType, buffer, level)
  }
}


if (run) {
  if (process.argv.length === 3) {
    var program = process.argv[0] + ' ' + process.argv[1]
      , fileName = process.argv[2]
    if (fs.existsSync(fileName)) {
        ns.parseAtom(fs.readFileSync(fileName), 0)
    } else {
      console.error('file not found:', fileName)
    }
  } else {
    console.error('usage:', program, 'FILENAME')
  }
}
