var ns = module.exports
  , run = !module.parent
  , indent = require('../indent')

ns.parse = function(atomSize, atomType, buffer, level) {
  var cursor = 0
    , atomData = {}

  atomData.version = buffer.readUInt8(cursor)
  cursor += 1
  atomData.flags = buffer.toString('binary', cursor, cursor += 3)
  atomData.creationTime = buffer.readUInt32BE(cursor)
  cursor += 4
  atomData.modificationTime = buffer.readUInt32BE(cursor)
  cursor += 4
  atomData.trackId = buffer.readUInt32BE(cursor)
  cursor += 4
  atomData.__reserved_1__ = buffer.readUInt32BE(cursor)
  cursor += 4
  atomData.duration = buffer.readUInt32BE(cursor)
  cursor += 4
  atomData.__reserved_2__ = buffer.toString('binary', cursor, cursor += 8)
  atomData.layer = buffer.readInt16BE(cursor)
  cursor += 2
  atomData.alternateGroup = buffer.readInt16BE(cursor)
  cursor += 2
  atomData.volume = (1.0 * buffer.readUInt16BE(cursor)) / (2 << 7)
  cursor += 2
  atomData.__reserved_3__ = buffer.readInt16BE(cursor)
  cursor += 2
  atomData.matrix = buffer.toString('binary', cursor, cursor += 36)
  atomData.width = (1.0 * buffer.readUInt32BE(cursor)) / (2 << 15)
  cursor += 4
  atomData.height = (1.0 * buffer.readUInt32BE(cursor)) / (2 << 15)
  cursor += 4

  //console.log("\n", atomData, "\n")
}
