const fs = require('fs')
const path = require('path')

const IMAGE_FOLDER = path.join(__dirname, '../statics/images')
const IMAGE_INDEX = path.join(__dirname, '../statics/javascripts/imageIndex.js')


// Index images
fs.readdir(IMAGE_FOLDER, (err, images) => {
  fs.writeFile(
    IMAGE_INDEX,
    `window.imageIndex = ${JSON.stringify(images)}`,
    (err) => {
      if (err) throw err
      console.log('images indexing conplete')
    }
  )
})