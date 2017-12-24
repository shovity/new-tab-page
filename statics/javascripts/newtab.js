// REQUEST LIST
const GET_BOOkMARK = 'GET_BOOkMARK'
const GET_MOSTSITE = 'GET_MOSTSITE'

// Init config
const wallpaperRandom = false

// Init varible
const images = window.imageIndex.map(e => `statics/images/${e}`)

// Random wallpaper
if (wallpaperRandom) {
  const i = Math.floor(Math.random() * images.length)
  window.document.body.style.backgroundImage = `url(${images[i]})`
}

/**
 * Long connect "pip"
 * Main way to pass data
 */
const port = chrome.runtime.connect({ name: "pip" })

port.postMessage({ request: GET_BOOkMARK })
port.postMessage({ request: GET_MOSTSITE })

port.onMessage.addListener(({ request, data, err }) => {

  if (err) return console.log(err)

  switch (request) {

    case GET_BOOkMARK:
      console.log(data)
      break

    case GET_MOSTSITE:
      console.log(data)
      break

    default:
      console.log('Revice response not match')
  }
})