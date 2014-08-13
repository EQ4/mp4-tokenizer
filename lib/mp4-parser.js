var ns = module.exports
  , run = !module.parent
  , fs = require('fs')
  , util = require('util')
  , Tokenizr = require('stream-tokenizr')
  , indent = require('./indent')


function MP4Parser(length, options) {
  // allow use without 'new'
  if (!(this instanceof MP4Parser))
    return new MP4Parser(options)

  Tokenizr.call(this, options)

  this.length = length
  this.read = 0

  this
    .loop(function(end) {
      this.readUInt32BE('length')
        .readString(4, 'utf8', 'type')
        .tap(function(atomHeader) {
          this.extendedHeader = false
          // check for extended length
          if (atomHeader.length === 1) {
            this.extendedHeader = true
            this
              .readUInt32BE('highBits')
              .readUInt32BE('lowBits')
              .tap(function(lengthBits) {
                atomHeader.length = lengthBits.highBits << 4
                atomHeader.length += lengthBits.lowBits
              })
          }
        })
        .tap(function(atomHeader) {
          console.log(atomHeader.type, "(" + atomHeader.length + " bytes)")
          if ( this.isContainer(atomHeader.type) ) {
          } else {
            var bytesToSkip = atomHeader.length - (this.extendedHeader ? 16 : 8)
            this.skip(bytesToSkip)
          }
          this.read += atomHeader.length
        })
        .flush()
        if (this.read >= this.length) end()
      })
}
util.inherits(MP4Parser, Tokenizr);


MP4Parser.prototype.isContainer = function(type) {
  return !!~[
      'dinf'
    , 'ilst'
    , 'meta'
    , 'mdia'
    , 'minf'
    , 'moov'
    , 'stbl'
    , 'trak'
    , 'udta'
    ].indexOf(type)
}


if (run) {
  if (process.argv.length === 3) {
    var program = process.argv[0] + ' ' + process.argv[1]
      , fileName = process.argv[2]

    fs.stat(fileName, function(err, stats) {
      if (err) {
        console.error('file not found:', fileName)
        process.exit(1)
      }
      var readable = fs.createReadStream(fileName)
        , mp4Parser = new MP4Parser(stats.size)

      readable.pipe(mp4Parser)
    })
  } else {
    console.error('usage:', program, 'FILENAME')
  }
}