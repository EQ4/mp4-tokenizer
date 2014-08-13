var ns = module.exports
  , run = !module.parent
  , fs = require('fs')
  , MP4Parser = require('./mp4-parser')



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
