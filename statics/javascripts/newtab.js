// REQUEST LIST
const GET_BOOkMARK = 'GET_BOOkMARK'
const GET_MOSTSITE = 'GET_MOSTSITE'

// Init config
const wallpaperRandom = false

// Init varible
const images = window.imageIndex.map(e => `statics/images/backgrounds/${e}`)

// Random wallpaper
if (wallpaperRandom) {
  const i = Math.floor(Math.random() * images.length)
  window.document.body.style.backgroundImage = `url(${images[i]})`
}

/**
 * Book mark bar handle
 */
const bookmark = {}

bookmark.htmlElement = bookmarkBar

bookmark.createItem = (node) => {
  const { url, title, children } = node
  if (children) {
    setTimeout(() => {
      bookmark.render(node)
    })
    return ''
  }

  return (
    `<a class="item" href="${url}">
      <img src="chrome://favicon/${url}">
      <div class="title">${title}</div>
    </a>`
  )
}

bookmark.createParent = (node) => {
  const label = node.title
  const nodes = node.children
  
  let result = '<div class="parent">'

  result += `
  <div class="parent-header">
    <img src="/statics/images/folder.svg">
    <div class="label">${label}</div>
  </div>`

  nodes.forEach(node => {
    result += bookmark.createItem(node)
  })

  return result + '</div>'
}

bookmark.render = (node, clear = false) => {
  if (clear) bookmark.htmlElement.innerHTML = ''
  bookmark.htmlElement.innerHTML += bookmark.createParent(node)
  return ''
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
      bookmark.render(data[0].children[0], true)
      break

    case GET_MOSTSITE:
      // console.log(data)
      break

    default:
      console.log('Revice response not match')
  }
})


