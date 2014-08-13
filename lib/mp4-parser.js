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

  this._length = length
  this._bytesRead = 0
  this._level = 0
  this._levelDownAt = []

  // iteratively parse our atoms until all of the bytes have been consumed,
  // keeping track of what level we're on along the way
  this
    .loop(function(end) {
      this
        // read our header
        .readUInt32BE('length')
        .readString(4, 'utf8', 'type')
        // check for extended length
        .tap(function(atomHeader) {
          this.extendedHeader = false
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
        // parse the atom data
        .tap(function(atomHeader) {
          console.log(indent(this._level), atomHeader.type, "(" + atomHeader.length + " bytes)")
          var atomDataBytes = atomHeader.length - (this.extendedHeader ? 16 : 8)
          if ( this.isContainer(atomHeader.type) ) {
            this._bytesRead += (this.extendedHeader ? 16 : 8)
            // because we are parsing iteratively and not recursively, we need to keep
            // track of what "level" we're at by comparing the number of bytes read to
            // the end position for each atom (see levelDownIfNecessary() below)
            this._level++
            this._levelDownAt.push({ type: atomHeader.type, bytes: this._bytesRead + atomHeader.length })
          } else {
            this.skip(atomDataBytes)
            this._bytesRead += atomHeader.length
          }

          // stop when we're done
          if (this._bytesRead >= this._length) end()
        })
        .flush()

        this.levelDownIfNecessary()
      })
}
util.inherits(MP4Parser, Tokenizr)

MP4Parser.prototype.levelDownIfNecessary = function() {
  if (!this._levelDownAt.length) return
  while (this._levelDownAt.length && this._bytesRead >= this._levelDownAt[this._levelDownAt.length-1].bytes) {
    this._level--
    this._levelDownAt.pop()
  }
}

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