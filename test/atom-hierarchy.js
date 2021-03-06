var ns = module.exports
  , run = !module.parent
  , fs = require('fs')
  , MP4Tokenizer = require('../lib/mp4-tokenizer')


function indent(level) {
  var t = ''
  for (var c=0; c<level; ++c) t += '  '
  return t
}


function logAtom(atom) {
  console.log(
      indent(atom.level)
    , atom.type
    , "(" + atom.length + " bytes)"
  )
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
        , mp4Tokenizer = new MP4Tokenizer(stats.size)

      readable.pipe(mp4Tokenizer).on('data', logAtom)
    })
  } else {
    console.error('usage:', program, 'FILENAME')
  }
}
