var run = !module.parent
  , fs = require('fs')
  , util = require('util')
  , Tokenizr = require('stream-tokenizr')


function MP4Tokenizer(length, options) {
  options = options || {}
  options.objectMode = true

  // allow use without 'new'
  if (!(this instanceof MP4Tokenizer))
    return new MP4Tokenizer(options)

  Tokenizr.call(this, options)

  this._length = length
  this._bytesRead = 0
  this._level = 0
  this._levelDownAt = []

  this.parseAtoms()
}
util.inherits(MP4Tokenizer, Tokenizr)

MP4Tokenizer.prototype.parseAtoms = function() {
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
          this._headerLength = 8
          if (atomHeader.length === 1) {
            this._headerLength = 16
            this
              .readUInt32BE('lengthHighBits')
              .readUInt32BE('lengthLowBits')
              .tap(function(lengthBits) {
                atomHeader.length = lengthBits.lengthHighBits << 4
                atomHeader.length += lengthBits.lengthLowBits
              })
          }
        })
        // parse the atom data
        .tap(function(atom) {
          atom.level = this._level
          this._bytesRead += this._headerLength
          var atomDataLength = atom.length - this._headerLength
          if ( this.isContainer(atom.type) ) {
            // because we are parsing iteratively and not recursively, we need to keep
            // track of what "level" we're at by comparing the number of bytes read to
            // the end position for each atom (see levelDownIfNecessary() below)
            this._level++
            this._levelDownAt.push({ type: atom.type, bytes: this._bytesRead + atomDataLength })
            atom.isContainer = true
            this.push(atom)

            if (this.checkIfDone()) end()
            this.levelDownIfNecessary()
          } else {
            atom.isContainer = false
            this.readBuffer(atomDataLength, function(data, state) {
              this._bytesRead += atomDataLength

              atom.data = data
              this.push(atom)

              if (this.checkIfDone()) end()
              this.levelDownIfNecessary()
            }.bind(this))
          }
        })
        .flush()

      })
}

MP4Tokenizer.prototype.levelDownIfNecessary = function() {
  if (!this._levelDownAt.length) return
  while (this._levelDownAt.length && this._bytesRead >= this._levelDownAt[this._levelDownAt.length-1].bytes) {
    this._level--
    this._levelDownAt.pop()
  }
}

MP4Tokenizer.prototype.checkIfDone = function() {
  return this._bytesRead >= this._length
}

MP4Tokenizer.prototype.isContainer = function(type) {
  return !!~[
      'dinf'
    , 'ilst'
    , 'meta'
    , 'mdia'
    , 'minf'
    , 'moof'
    , 'moov'
    , 'mvex'
    , 'stbl'
    , 'traf'
    , 'trak'
    ].indexOf(type)
}

module.exports = MP4Tokenizer
