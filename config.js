const path = require('path')

const config = {}

config.indexImage = {
  entry: path.join(__dirname, 'app/images/backgrounds'),
  output: path.join(__dirname, 'app/image-index.js')
}

module.exports = config