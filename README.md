# MP4 Tokenizer

Streaming MP4 tokenizer that emits individual mp4 atoms.

## How to Use

This module allows you to open an MP4 file as a readable stream, emitting
atoms as the stream is being read without unnecessary buffering.

### Usage

```JavaScript
var fs = require('fs')
  , MP4Tokenizer = require('./mp4-tokenizer')
  , fileName = "myfile.mp4"

fs.stat(fileName, function(err, stats) {
  if (err) {
    console.error('file not found:', fileName)
    process.exit(1)
  }
  var readable = fs.createReadStream(fileName)
    , mp4Tokenizer = new MP4Tokenizer(stats.size)

  readable.pipe(mp4Tokenizer).on('data', function(atom) {
    console.log(atom)
  })
})
```

### Example

See [lib/index.js](lib/index.js).


## License

[MIT](LICENSE.md)
