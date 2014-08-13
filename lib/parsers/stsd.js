var ns = module.exports
  , run = !module.parent
  , indent = require('../indent')
  , sampleDescriptionParsers = {
      avc1: require('./avc1')
    }

ns.parse = function(atomSize, atomType, buffer, level) {
  var cursor = 0
    , atomData = {}

  atomData.version = buffer.readUInt8(cursor)
  atomData.flags = buffer.toString('binary', cursor += 1, cursor += 3)
  atomData.numEntries = buffer.readUInt32BE(cursor)
  cursor += 4
  atomData.sampleDescriptions = []
  for (var i=0; i<atomData.numEntries; ++i) {
    var desc = {}
    desc.size = buffer.readUInt32BE(cursor)
    desc.dataFormat = buffer.toString('utf8', cursor += 4, cursor += 4)
    console.log(indent(level), desc.dataFormat, '( ' + desc.size + ' bytes )')
    desc.__reserved__ = buffer.toString('binary', cursor, cursor += 6)
    desc.dataReferenceIndex = buffer.readUInt16BE(cursor)
    cursor += 2

    var descBuffer = buffer.slice(cursor, cursor + desc.size - 16)
      , descModule = sampleDescriptionParsers[desc.dataFormat]
    if (descModule) {
      desc.description = descModule.parse(descBuffer, level+1)
    } else {
      desc.description = descBuffer.toString()
    }

    atomData.sampleDescriptions.push(desc)
  }
}
