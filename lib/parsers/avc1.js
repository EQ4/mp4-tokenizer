var ns = module.exports
  , run = !module.parent
  , atom = require('../atom')

ns.parse = function(buffer, level) {
  var cursor = 0
    , descData = {}

  descData.version = buffer.readUInt16BE(cursor)
  cursor += 2
  descData.revision = buffer.readUInt16BE(cursor)
  cursor += 2
  descData.vendor = buffer.toString('utf8', cursor, cursor += 4)
  descData.temporalQuality = buffer.readUInt32BE(cursor)
  cursor += 4
  descData.spatialQuality = buffer.readUInt32BE(cursor)
  cursor += 4
  descData.width = buffer.readUInt16BE(cursor)
  cursor += 2
  descData.height = buffer.readUInt16BE(cursor)
  cursor += 2
  descData.horizontalResolution = (1.0 * buffer.readUInt32BE(cursor)) / (2 << 15)
  cursor += 4
  descData.verticalResolution = (1.0 * buffer.readUInt32BE(cursor)) / (2 << 15)
  cursor += 4
  descData.dataSize = buffer.readUInt32BE(cursor)
  cursor += 4
  descData.frameCount = buffer.readUInt16BE(cursor)
  cursor += 2
  descData.compressorName = buffer.toString('utf8', cursor, cursor += 32)
  descData.depth = buffer.readInt16BE(cursor)
  cursor += 2
  descData.colorTableId = buffer.readInt16BE(cursor)
  cursor += 2

  // parse the color table, if any
  if (descData.colorTableId === 0) {
    var colorTable = {}
    colorTable.size = buffer.readUInt32BE(cursor)
    colorTable.type = buffer.toString('utf8', cursor += 4, cursor += 4)
    colorTable.seed = buffer.readUInt32BE(cursor)
    cursor += 4
    colorTable.flags = buffer.readUInt16BE(cursor)
    cursor += 2
    colorTable.size = buffer.readUInt16BE(cursor)
    cursor += 2
    colorTable.colors = []
    for (var i=0; i<=colorTable.size; ++i) {
      var color = {}
      // ignore first 2 bytes (which should be 0 anyway)
      color.red = buffer.readUInt16BE(cursor += 2)
      color.green = buffer.readUInt16BE(cursor += 2)
      color.blue = buffer.readUInt16BE(cursor += 2)
      colorTable.colors.push(color)
    }
    descData.colorTable = colorTable
  }

  //console.log("\n\n", descData, "\n\n")

  // parse any additional sample description extension atoms
  var atomBuffer = buffer.slice(cursor, buffer.length)
  atom.parseAtom(atomBuffer, level)
}
