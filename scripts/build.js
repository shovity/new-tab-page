const fs = require('fs')
const path = require('path')

const IMAGE_FOLDER = path.join(__dirname, '../statics/images/backgrounds')
const IMAGE_FOLDER_MIN = path.join(__dirname, '../statics/images/backgrounds/min')
const IMAGE_INDEX = path.join(__dirname, '../statics/javascripts/imageIndex.js')

// Index images
fs.readdir(IMAGE_FOLDER, (err, images) => {
  if (err) throw err
  // remove min folder
  const imgsFilted = images.filter(img => img !== 'min')
  fs.readdir(IMAGE_FOLDER_MIN, (err, imagesMin) => {
    if (err) throw err
    // write image index file
    fs.writeFile(
      IMAGE_INDEX,
      `// THIS FILE AUTO GENERATED\n// DO NOT EDIT\nwindow.imageIndex = ${JSON.stringify(imgsFilted)};window.imageMinIndex = ${JSON.stringify(imagesMin)};`,
      (err) => {
        if (err) throw err
        console.log('images indexing conplete')
      }
    )
  })
})