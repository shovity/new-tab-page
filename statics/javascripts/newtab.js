// REQUEST LIST
const GET_BOOkMARK  = 'GET_BOOkMARK'
const GET_MOSTSITE  = 'GET_MOSTSITE'
const GET_NOTES     = 'GET_NOTES'
const POST_NOTES    = 'POST_NOTES'
const ARE_YOU_READY = 'ARE_YOU_READY'


// init config
const wallpaperRandom = true
const minWallpaper    = false
const debug           = true

// init varible
const wW        = window.document.documentElement.clientWidth
const wH        = window.document.documentElement.clientHeight
const images    = window.imageIndex.map(e => `statics/images/backgrounds/${e}`)
const imagesMin = window.imageMinIndex.map(e => `statics/images/backgrounds/min/${e}`)

// create port to connect to background scripts (when boot chrome)
let port = chrome.runtime.connect({ name: "pip" })

// delay request
const requestDelay = 1000

// define interval request
let requsetInterval = null
let backgroundNotReady = true

// note state
let notes = []

if (!debug) console.log = () => 'debug disabled'

// validate html element
if (!wall) document.body.innerHTML          += '<div id="wall"></div>'
if (!bookmarkBar) window.body.innerHTML     += '<div id="r-snack"><div id="bookmarkBar"></div></div>'
if (!floatAddNote) document.body.innerHTML  += '<div id="floatAddNote"></div><div id="noteBox"></div>'

// random wallpaper
if (wallpaperRandom) {
  if (minWallpaper) {
    const i = Math.floor(Math.random() * imagesMin.length)
    wall.style.backgroundImage = `url(${imagesMin[i]})`
  } else {
    const i = Math.floor(Math.random() * images.length)
    wall.style.backgroundImage = `url(${images[i]})`
  }
}

/**
 * Bookmark bar
 */

const bookmark = {
  htmlElement: window.bookmarkBar
}

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
 * Noter
 */

const pushState = () => {
  // console.log('push state: ', notes)
  port.postMessage({ request: POST_NOTES, data: notes })
}

const createNoteObject = (msg, x, y, w = 300, h = 100) => {
  // random position
  if (!x || !y) {
    x = Math.floor(Math.random() * (wW - 500))
    y = Math.floor(Math.random() * (wH - 250))
  }

  return { msg, x, y, w, h}
}

const createNoteHtmlElement = (id, msg, x, y, w, h) => {
  // console.log('render note id: ', id)
  return `
    <div id="noteid-${id}" class="note" style="transform: translate(${x}px, ${y}px)">
      <div class="box">
        <div class="note-controls" move-noteid="${id}">
          <div class="note-remove" remove-noteid="${id}"></div>
        </div>
        <textarea placeholder="new note" editor-noteid="${id}" style="width:${w}px; height:${h-20}px; ">${msg}</textarea>
      </div>
    </div>
  `
}

const addNote = (note) => {
  let { id, msg, x, y, w, h } = note

  // New note don't have a id
  // push it to state
  if (id === undefined) {
    id = notes.push({ id: notes.length, msg, x, y, w, h }) - 1
  }

  // render html
  noteBox.innerHTML += createNoteHtmlElement(id, msg, x, y, w, h)
}

const renderNotes = (notes, clear = true) => {
  // clear before render
  if (clear) noteBox.innerHTML = ''
  // loop adding
  notes.forEach(note => {
    addNote(note)
  })
}

{
  // NOTE BEHAVIOR

  // listen remove note
  window.noteBox.addEventListener('click', event => {
    const { target } = event
    if (target.getAttribute('remove-noteid') !== null) {
      const noteId = +target.getAttribute('remove-noteid')
      const noteIndex = notes.findIndex((note) => note.id == noteId)

      if (noteIndex !== -1) notes.splice(noteIndex, 1)
      renderNotes(notes)
      // push state when remove a note
      pushState()
    }
  })

  // Handle move
  let resizeId = false
  let moveId = false
  let fixX = 0
  let fixY = 0

  window.noteBox.addEventListener('mousedown', event => {
    const { target } = event
    // console.log('mouse down on: ', target)

    // detect resize
    if (target.getAttribute('editor-noteid') !== null) {
      const cx = event.clientX
      const cy = event.clientY
      const noteId = +target.getAttribute('editor-noteid')
      const noteIndex = notes.findIndex((note) => note.id == noteId)
      const note = notes[noteIndex]
      
      // detect mouse down over resize btn
      if (note.x + note.w - cx < 15 && note.y + note.h - cy < 15) {
        resizeId = noteId
        console.log('start resize, resizeId ', resizeId)
      }
    }

    if (target.getAttribute('move-noteid') !== null) {
      const noteId = +target.getAttribute('move-noteid')
      const noteIndex = notes.findIndex((note) => note.id == noteId)

      // fix position mouse vs note
      fixX = event.clientX - notes[noteIndex].x
      fixY = event.clientY - notes[noteIndex].y

      // start move handle
      moveId = noteId
    }
  })

  window.addEventListener('mousemove', event => {
    if (moveId === false) return

    event.preventDefault()
    const x = event.clientX - fixX
    const y = event.clientY - fixY

    if (window[`noteid-${moveId}`]) window[`noteid-${moveId}`].style.transform = `translate(${x}px, ${y}px)`
  })

  window.addEventListener('mouseup', event => {
    if (moveId !== false) {
      // update state
      const x = event.clientX - fixX
      const y = event.clientY - fixY
      const noteIndex = notes.findIndex((note) => note.id == moveId)

      if (noteIndex !== -1) {
        notes[noteIndex].x = x
        notes[noteIndex].y = y
      }

      // end move handle
      moveId = false

      // push state when done move a note
      pushState()

    } else if (resizeId !== false) {
      const { target } = event
      const noteIndex = notes.findIndex((note) => note.id == resizeId)
      const w = window['noteid-' + resizeId].offsetWidth
      const h = window['noteid-' + resizeId].offsetHeight

      if (noteIndex !== -1) {
        notes[noteIndex].w = w
        notes[noteIndex].h = h
      }

      // end resize handle
      resizeId = false

      // push state when done move a note
      pushState()
    }

    
  })

  // Handle edit notes
  // keyup only when focus textarea
  window.noteBox.addEventListener('keyup', (event) => {
    const { target } = event
    if (target.getAttribute('editor-noteid') !== null) {
      const noteId = +target.getAttribute('editor-noteid')
      const noteIndex = notes.findIndex((note) => note.id == noteId)

      notes[noteIndex].msg = target.value
      // push state when done press a key if fucus textarea
      pushState()
    }
  })

  // listen add note
  window.floatAddNote.addEventListener('click', () => {
    addNote(createNoteObject(''))
    // push state when add a note
    pushState()
  })
}


/**
 * Long connect "pip"
 * Main way to pass data
 */

port.onMessage.addListener(({ request, data, err }) => {

  if (err) return console.log(err)

  switch (request) {

    case ARE_YOU_READY:
      if (data) {
        port.postMessage({ request: GET_BOOkMARK })
        port.postMessage({ request: GET_NOTES })
        backgroundNotReady = false
        console.log('background is ready, request interval cleared')
        clearInterval(requsetInterval)
        requsetInterval = null
      } else {
        // out of case
      }
      break

    case GET_BOOkMARK:
      bookmark.render(data[0].children[0], true)
      // request get most site visited when recive bookmark
      port.postMessage({ request: GET_MOSTSITE })
      break

    case GET_MOSTSITE:
      setTimeout(() => {
        bookmark.render({ children: data, title: 'Most visited' })
      })
      break

    case GET_NOTES:
      notes = data.notes
      // console.log('reviced notes form backgroud: ', notes)
      renderNotes(notes)
      break

    default:
      // out of service
      console.log('Revice response not match')
  }
})
console.log('load page')
// request note to background scripts .,-+)
port.postMessage({ request: ARE_YOU_READY })
if (requsetInterval === null && backgroundNotReady) requsetInterval = setInterval(() => {
  location.reload()
}, requestDelay)

// you make it 6099f8686c1162b61cead087bc7812a5