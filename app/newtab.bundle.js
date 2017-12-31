/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__style_css__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__style_css__);

// REQUEST LIST
const GET_NOTES     = 'GET_NOTES'
const POST_NOTES    = 'POST_NOTES'
const GET_BOOkMARK  = 'GET_BOOkMARK'
const GET_MOSTSITE  = 'GET_MOSTSITE'
const ARE_YOU_READY = 'ARE_YOU_READY'


// init config
const debug           = true
const minWallpaper    = false
const wallpaperRandom = true
const showMostSite    = true

// init varible
const wW        = window.document.documentElement.clientWidth
const wH        = window.document.documentElement.clientHeight
const images    = window.imageIndex.map(e => `images/backgrounds/${e}`)

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
  const i = Math.floor(Math.random() * images.length)
  wall.style.backgroundImage = `url(${images[i]})`
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
    <img src="images/folder.svg">
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

{
  
  const addWave = (x, y) => {
    
    waveClickBox.innerHTML =
    `<div class="wave active" style="transform: translate(${x}px, ${y}px)">
      <div></div>
      <div></div>
      <div></div>
    </div>`
  }

  window.addEventListener('mousedown', (event) => {
    const x = event.clientX
    const y = event.clientY
    addWave(x, y)
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
      if (showMostSite) port.postMessage({ request: GET_MOSTSITE })
      break

    case GET_MOSTSITE:
      setTimeout(() => {
        bookmark.render({ children: data, title: 'Most visited' })
      })
      break

    case GET_NOTES:
      notes = data.notes || []
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(2);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(6)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./style.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "* {\n  outline: none;\n  box-sizing: border-box;\n}\n\nbody {\n  position: relative;\n  width: 100vw;\n  height: 100vh;\n  margin: 0;\n  padding: 0;\n  font-family: roboto, arial, sans-serif;\n  background: #000;\n  color: #dedede;\n  font-size: 12px;\n}\n\n#wall {\n  width: 100vw;\n  height: 100vh;\n  /*background: #000 url(images/backgrounds/716428.png) no-repeat;*/\n  background-size: cover;\n  z-index: -1;\n  /*animation: fade-in 0.2s ease-in-out 0s;*/\n}\n\n/*Bookmark Bar*/\n\n#r-snack {\n  overflow-y: auto;\n  padding-left: 10px;\n  position: fixed;\n  top: 0;\n  left: calc(100% - 1px);\n  height: 100vh;\n  transition: transform .3s ease-in-out;\n}\n\n#r-snack:hover {\n  transform: translateX(calc(-100% + 1px));\n}\n\n#r-snack:hover + #floatAddNote {\n  opacity: 0;\n}\n\n#bookmarkBar {\n  background: rgba(0, 0, 0, 0.6);\n  width: 200px;\n  padding: 30px 0;\n  min-height: 100vh;\n}\n\n#r-snack::-webkit-scrollbar {\n  background: rgba(0, 0, 0, 0.6);\n  width: 5px;\n}\n \n#r-snack::-webkit-scrollbar-track {\n  background: rgba(0, 0, 0, 0.2);\n}\n \n#r-snack::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.6);\n}\n\n#bookmarkBar .item {\n  display: inline-block;\n  width: 100%;\n  padding: 2px 20px;\n  cursor: pointer;\n  color: inherit;\n  text-decoration: none;\n  transition: transform .2s ease-out;\n}\n\n#bookmarkBar .item:hover {\n  background: rgba(0, 0, 0, 0.5);\n  transform: translateX(-10px);\n}\n\n#bookmarkBar .title {\n  display: inline-block;\n  overflow: hidden;\n  max-width: 140px;\n  height: 19px;\n  padding: 0 3px;\n}\n\n.parent-header {\n  padding: 10px 10px 5px 10px;\n}\n\n.parent-header > img {\n  width: 24px;\n  margin-bottom: -5px;\n}\n\n.parent-header > .label {\n  display: inline-block;\n}\n\n@keyframes fade-in {\n  from { opacity: 0 }\n  to { opacity: 1 }\n}\n\n/*Noter*/\n\n#floatAddNote {\n  background: #e91e63;\n  position: fixed;\n  right: 50px;\n  bottom: 50px;\n  border-radius: 50%;\n  width: 50px;\n  height: 50px;\n  line-height: 48px;\n  font-size: 24px;\n  text-align: center;\n  transition: opacity .3s ease-in-out;\n  cursor: pointer;\n  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.26), 0 4px 18px 0 rgba(0,0,0,0.18);\n}\n\n#floatAddNote::before {\n  content: \"+\"\n}\n\n#noteBox .note {\n  color: #000;\n  position: fixed;\n  top: 0;\n  left: 0;\n  background: rgb(255, 255, 141);\n  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.26), 0 4px 18px 0 rgba(0,0,0,0.18);\n}\n\n#noteBox .note:hover {\n  z-index: 10;\n}\n\n#noteBox .box {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n#noteBox textarea {\n  font-family: IndieFlower, roboto, arial;\n  padding: 10px;\n  width: 300px;\n  height: 100px;\n  background: none;\n  border: none;\n  margin-bottom: -3px;\n}\n\n.note .note-controls {\n  position: relative;\n  background: rgba(0, 0, 0, 0.2);\n  width: 100%;\n  height: 20px;\n  opacity: 0;\n  transition: opacity .3s ease-in-out;\n}\n\n.note:hover .note-controls {\n  opacity: 1;\n}\n\n#noteBox .note-remove {\n  cursor: pointer;\n  position: absolute;\n  top: 2px;\n  right: 5px;\n  background: #F44336;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  text-align: center;\n  line-height: 12px;\n}\n\n#noteBox .note-remove::before {\n  color: #fff;\n  font-family: IndieFlower;\n  content: \"X\";\n}\n\n/*click wave*/\n\n.wave {\n  position: fixed;\n  top: 0;\n  left: 0;\n}\n\n.wave div {\n  position: fixed;\n  right: 0;\n  top: 50%;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 50%;\n  transform: translate(50%, -50%);\n}\n\n.wave.active div:nth-child(1) {\n  animation: wave 1s linear 0s;\n}\n\n.wave.active div:nth-child(2) {\n  animation: wave 1s linear .4s;\n}\n\n.wave.active div:nth-child(3) {\n  animation: wave 1s linear .8s;\n}\n\n/* bookmark wave*/\n\n#waveBookmark {\n  position: fixed;\n  top: 0;\n  left: 0;\n}\n\n#waveBookmark div {\n  position: fixed;\n  right: 0;\n  top: 50%;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 50%;\n  transform: translate(50%, -50%);\n}\n\n#waveBookmark.active div:nth-child(1) {\n  animation: wave 1s linear .2s;\n}\n\n#waveBookmark.active div:nth-child(2) {\n  animation: wave 1s linear .4s;\n}\n\n#waveBookmark.active div:nth-child(3) {\n  animation: wave 1s linear .6s;\n}\n\n#waveBookmark.active div:nth-child(4) {\n  animation: wave 1s linear .8s;\n}\n\n#waveBookmark.active div:nth-child(5) {\n  animation: wave 1s linear 1s;\n}\n\n@keyframes wave {\n  from {\n    opacity: 1;\n    width: 0; \n    height: 0;\n  }\n  to {\n    opacity: .2;\n    width: 150px;\n    height: 150px;\n  }\n}\n\n@font-face {\n font-family: \"IndieFlower\";\n src: url(" + __webpack_require__(5) + ");\n}", ""]);

// exports


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 4 */,
/* 5 */
/***/ (function(module, exports) {

module.exports = "data:font/ttf;base64,AAEAAAARAQAABAAQRFNJRwAAAAEAAPBsAAAACEZGVE1bDnDdAADwKAAAABxHREVGAZUAJAAA8EQAAAAoT1MvMjXOFnIAAAGYAAAAYGNtYXAHgg/5AAAHkAAAAxZjdnQgABcEIQAADDQAAAASZnBnbQaZnDcAAAqoAAABc2dhc3D//wAEAADwIAAAAAhnbHlmj9yDEgAADxgAAKIQaGVhZPY4eDcAAAEcAAAANmhoZWEHuQNrAAABVAAAACRobXR4lQQSYwAAAfgAAAWYbG9jYajPgPgAAAxIAAACzm1heHADfQHKAAABeAAAACBuYW1lwJb4iQAAsSgAADfacG9zdOJX9BEAAOkEAAAHGXByZXAc/32cAAAMHAAAABYAAQAAAAEAQtKREfhfDzz1AB8EAAAAAADJmJqFAAAAAMmYmoX/ev4MBFoD4gAAAAgAAgAAAAAAAAABAAAD4v4MAAAEd/96/4EEWgABAAAAAAAAAAAAAAAAAAABZgABAAABZgDdAAUAwwAEAAEAAAAAAAoAAAIAACgAAwABAAMB2QGQAAUAAALNApoAAACPAs0CmgAAAegAMwEAAAACAAAAAAAAAAAAoAAAL1AAAEoAAAAAAAAAACAgICAAQAAg+wID4v4MAAAD4gH0AAAAkwAAAAABdgJLAAAAIAABAYAAAAAAAAABgAAAAYAAAACZABAA8AAKAxMACQJTAAoCjAAJAdQACgBpABQBsAAUASkACQGmABMB1wAIAIYACQGAAA8A0QAtAT0ACgG5ABMBRgAOAf0ACgG5ABMBpgATAkkAEwHDABMBpgAdAYAAEQE0AAoAVwATAIT/8QHzAAQCGQATAZ0AHAEXAAgDQwATAkAAEwL3ABQCEAATAvcAFAIZABMCD//dAkkAIQIZABAArAAPAcIAFgHgABMBYwATAiMAEwJwAB0CcAATAoMAFAKSABoCUf/2AoMAFAJTAAMCSQAcAbAAEwLQAAoCIwAUAZ0AEgJJABEB6QAUAbkACgG5AAkBgAAyAqAAHACxABQCBgATAf0ACgHMABMCGQATAhAAEwGC//cBd/96Abb/8gCzAAwAzf+QAZ3//gB7ABoDAAAcAdcAHQHzABMCFQATAaYAEwFjABECDwARAVAACgICABEBjwAKAqAACgHL//8B8wARAdcAEwGTABMAmQATAcMAAAGcABcBgAAAAJkAFQHMABMDCQAKAnkAIAGPABAAeAAXAg8AJAGXAEUCrAAjAREAEgMGAAQBegAiAYAADwLVACUBJgAiAQUACAHXAA8BMAAGANH//AC5AAkCAgAPAacAFADaADIByACaAMr/8QEFAAgCowAcAoIAEgJEAAYCRAAMARcAGAJAABMCQAATAkAAEwJAABMCQAATAkAAEwPYABMCEAATAhkAEwIZABMCGQATAhkAEwCs/+0ArP/nAKz/zgCs/5UC9wAUAnAAHQJwABMCcAATAnAAEwJwABMCcAATAcsANAJwABMCSQAcAkkAHAJJABwCSQAcAZ0AEgH9ADICXQAhAgYAEwIGABMCBgATAgYAEwIGABMCBgATA4cAEwHMABMCEAATAhAAEwIQABMCEAATALMAEACz//UAs//PALP/zgGhABgB1wAdAfMAEwHzABMB8wATAfMAEwHzABMBWAAlAfMAEwICABECAgARAgIAEQICABEB8wARAhUAHAHzABECQAATAgYAEwJAABMCBgATAkAAEwIGABMCEAATAcwAEwIQABMBzAATAhAAEwHMABMCEAATAcwAEwL3ABQCVAATAvcAFAIZABMCGQATAhAAEwIZABMCEAATAhkAEwIQABMCGQATAhAAEwIZABMCEAATAkkAIQF3/3oCSQAhAXf/egJJACEBd/96AkkAIQF3/3oCGQAQAbb/8gG2/64ArP+uALP/zgCz/9IArAADALP/8ACsAAAAs//yAKz/+ACzAD8BwgAWAM3/kAHgABMBnf/+AWMAEwB7/+8BYwATAHsAEgFjABMA5AAaAWMAEwFVABoBYwAMAHv/ugJwAB0B1wAdAnAAHQHXAB0CcAAdAdcAHQHXAB0CcAATAfMAEwJwABMB8wATAnAAEwHzABMDZQATA4EAEwJR//YBYwARAlH/9gFjABECUf/2AWMAEQKDABQCDwARAoMAFAIPABECgwAUAg8AEQKDABQCDwARAlMAAwFQAAoCUwADAboACgJJABwCAgARAkkAHAICABECSQAcAgIAEQJJABwCAgARAkkAHAICABECSQAoAgIAEQLQAAoCoAAKAZ0AEgHzABEBnQASAkkAEQHXABMCSQARAdcAEwJJABEB1wATAYL/pAPYABMDhwATAnAAEwHzABMCgwAUAg8AEQGAADIBgAA0AOYAFwCcADEBVgBe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AwcGBx4EFxYHBi4ExgcTCgICEgIMEBIRDgkGDBMLAgIBBQYGAg43QEM2IwEcOkFIKR5CNyQJDgoGDBQYDCAxLC0cHD5AOS0aJDxJSSAgFDJiVkYsBgYPCzJBSkhB3i1LOBERBAYaNUpTWFBCFgkJFA0NCwQWGRYEAgcNEhggFAIDAyAoEwYBECooDBETBw4ZFBEGBggFAQkSHSk1IR0sIBYRBggGRWBCKRwICAoODik9QkAAAAEAEQAFAfIB4QA/AAAlDgMjIi4ENSY+ARYHDgMVFB4EMzI+AjU0NjQmNT4BMzIeBBceAxUUBiMiLgQBgBchIikgJDotIRULCBYfFggCAgICCBEaJC8cEi4pHQEBBg4KDBAKBAICAgUTEg4RDRAPBwQJEZENJSEYHzVDR0UcNj0RGR8EERIQAxU5Pj0wHiMxNBIKLjQuCQoLIDI6NikHFDIvJwoPBhAZHiAcAAAAABoBPgABAAAAAAAAADoAdgABAAAAAAABAAwAywABAAAAAAACAAcA6AABAAAAAAADACMBOAABAAAAAAAEAAwBdgABAAAAAAAFABIBqQABAAAAAAAGAAsB1AABAAAAAAAIABACAgABAAAAAAAJABACNQABAAAAAAAKAAECSgABAAAAAAAMABoCggABAAAAAAANETglDwABAAAAAAAOABs2gAADAAEECQAAAHQAAAADAAEECQABABgAsQADAAEECQACAA4A2AADAAEECQADAEYA8AADAAEECQAEABgBXAADAAEECQAFACQBgwADAAEECQAGABYBvAADAAEECQAIACAB4AADAAEECQAJACACEwADAAEECQAKAAICRgADAAEECQAMADQCTAADAAEECQANInACnQADAAEECQAOADY2SABDAG8AcAB5AHIAaQBnAGgAdAAgACgAYwApACAAMgAwADEAMAAsACAASwBpAG0AYgBlAHIAbAB5ACAARwBlAHMAdwBlAGkAbgAgACgAawBpAG0AYgBlAHIAbAB5AGcAZQBzAHcAZQBpAG4ALgBjAG8AbQApAABDb3B5cmlnaHQgKGMpIDIwMTAsIEtpbWJlcmx5IEdlc3dlaW4gKGtpbWJlcmx5Z2Vzd2Vpbi5jb20pAABJAG4AZABpAGUAIABGAGwAbwB3AGUAcgAASW5kaWUgRmxvd2VyAABSAGUAZwB1AGwAYQByAABSZWd1bGFyAABLAGkAbQBiAGUAcgBsAHkARwBlAHMAdwBlAGkAbgA6ACAASQBuAGQAaQBlACAARgBsAG8AdwBlAHIAOgAgADIAMAAxADAAAEtpbWJlcmx5R2Vzd2VpbjogSW5kaWUgRmxvd2VyOiAyMDEwAABJAG4AZABpAGUAIABGAGwAbwB3AGUAcgAASW5kaWUgRmxvd2VyAABWAGUAcgBzAGkAbwBuACAAMQAuADAAMAAxACAAMgAwADEAMAAAVmVyc2lvbiAxLjAwMSAyMDEwAABJAG4AZABpAGUARgBsAG8AdwBlAHIAAEluZGllRmxvd2VyAABLAGkAbQBiAGUAcgBsAHkAIABHAGUAcwB3AGUAaQBuAABLaW1iZXJseSBHZXN3ZWluAABLAGkAbQBiAGUAcgBsAHkAIABHAGUAcwB3AGUAaQBuAABLaW1iZXJseSBHZXN3ZWluAAAuAAAuAABoAHQAdABwADoALwAvAGsAaQBtAGIAZQByAGwAeQBnAGUAcwB3AGUAaQBuAC4AYwBvAG0AAGh0dHA6Ly9raW1iZXJseWdlc3dlaW4uY29tAABDAG8AcAB5AHIAaQBnAGgAdAAgACgAYwApACAAMgAwADEAMAAsACAASwBpAG0AYgBlAHIAbAB5ACAARwBlAHMAdwBlAGkAbgAgACgAawBpAG0AYgBlAHIAbAB5AGcAZQBzAHcAZQBpAG4ALgBjAG8AbQApAA0ACgANAAoAVABoAGkAcwAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUAIABpAHMAIABsAGkAYwBlAG4AcwBlAGQAIAB1AG4AZABlAHIAIAB0AGgAZQAgAFMASQBMACAATwBwAGUAbgAgAEYAbwBuAHQAIABMAGkAYwBlAG4AcwBlACwAIABWAGUAcgBzAGkAbwBuACAAMQAuADEALgAgACAAVABoAGkAcwAgAGwAaQBjAGUAbgBzAGUAIABpAHMAIABjAG8AcABpAGUAZAAgAGIAZQBsAG8AdwAsACAAYQBuAGQAIABpAHMAIABhAGwAcwBvACAAYQB2AGEAaQBsAGEAYgBsAGUAIAB3AGkAdABoACAAYQAgAEYAQQBRACAAYQB0ADoAIAAgAGgAdAB0AHAAOgAvAC8AcwBjAHIAaQBwAHQAcwAuAHMAaQBsAC4AbwByAGcALwBPAEYATAANAAoADQAKAA0ACgAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ADQAKAFMASQBMACAATwBQAEUATgAgAEYATwBOAFQAIABMAEkAQwBFAE4AUwBFACAAVgBlAHIAcwBpAG8AbgAgADEALgAxACAALQAgADIANgAgAEYAZQBiAHIAdQBhAHIAeQAgADIAMAAwADcADQAKAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAC0ALQANAAoADQAKAFAAUgBFAEEATQBCAEwARQANAAoAVABoAGUAIABnAG8AYQBsAHMAIABvAGYAIAB0AGgAZQAgAE8AcABlAG4AIABGAG8AbgB0ACAATABpAGMAZQBuAHMAZQAgACgATwBGAEwAKQAgAGEAcgBlACAAdABvACAAcwB0AGkAbQB1AGwAYQB0AGUAIAB3AG8AcgBsAGQAdwBpAGQAZQAgAGQAZQB2AGUAbABvAHAAbQBlAG4AdAAgAG8AZgAgAGMAbwBsAGwAYQBiAG8AcgBhAHQAaQB2AGUAIABmAG8AbgB0ACAAcAByAG8AagBlAGMAdABzACwAIAB0AG8AIABzAHUAcABwAG8AcgB0ACAAdABoAGUAIABmAG8AbgB0ACAAYwByAGUAYQB0AGkAbwBuACAAZQBmAGYAbwByAHQAcwAgAG8AZgAgAGEAYwBhAGQAZQBtAGkAYwAgAGEAbgBkACAAbABpAG4AZwB1AGkAcwB0AGkAYwAgAGMAbwBtAG0AdQBuAGkAdABpAGUAcwAsACAAYQBuAGQAIAB0AG8AIABwAHIAbwB2AGkAZABlACAAYQAgAGYAcgBlAGUAIABhAG4AZAAgAG8AcABlAG4AIABmAHIAYQBtAGUAdwBvAHIAawAgAGkAbgAgAHcAaABpAGMAaAAgAGYAbwBuAHQAcwAgAG0AYQB5ACAAYgBlACAAcwBoAGEAcgBlAGQAIABhAG4AZAAgAGkAbQBwAHIAbwB2AGUAZAAgAGkAbgAgAHAAYQByAHQAbgBlAHIAcwBoAGkAcAANAAoAdwBpAHQAaAAgAG8AdABoAGUAcgBzAC4ADQAKAA0ACgBUAGgAZQAgAE8ARgBMACAAYQBsAGwAbwB3AHMAIAB0AGgAZQAgAGwAaQBjAGUAbgBzAGUAZAAgAGYAbwBuAHQAcwAgAHQAbwAgAGIAZQAgAHUAcwBlAGQALAAgAHMAdAB1AGQAaQBlAGQALAAgAG0AbwBkAGkAZgBpAGUAZAAgAGEAbgBkACAAcgBlAGQAaQBzAHQAcgBpAGIAdQB0AGUAZAAgAGYAcgBlAGUAbAB5ACAAYQBzACAAbABvAG4AZwAgAGEAcwAgAHQAaABlAHkAIABhAHIAZQAgAG4AbwB0ACAAcwBvAGwAZAAgAGIAeQAgAHQAaABlAG0AcwBlAGwAdgBlAHMALgAgAFQAaABlACAAZgBvAG4AdABzACwAIABpAG4AYwBsAHUAZABpAG4AZwAgAGEAbgB5ACAAZABlAHIAaQB2AGEAdABpAHYAZQAgAHcAbwByAGsAcwAsACAAYwBhAG4AIABiAGUAIABiAHUAbgBkAGwAZQBkACwAIABlAG0AYgBlAGQAZABlAGQALAAgAHIAZQBkAGkAcwB0AHIAaQBiAHUAdABlAGQAIABhAG4AZAAvAG8AcgAgAHMAbwBsAGQAIAB3AGkAdABoACAAYQBuAHkAIABzAG8AZgB0AHcAYQByAGUAIABwAHIAbwB2AGkAZABlAGQAIAB0AGgAYQB0ACAAYQBuAHkAIAByAGUAcwBlAHIAdgBlAGQAIABuAGEAbQBlAHMAIABhAHIAZQAgAG4AbwB0ACAAdQBzAGUAZAAgAGIAeQAgAGQAZQByAGkAdgBhAHQAaQB2AGUAIAB3AG8AcgBrAHMALgAgAFQAaABlACAAZgBvAG4AdABzACAAYQBuAGQAIABkAGUAcgBpAHYAYQB0AGkAdgBlAHMALAAgAGgAbwB3AGUAdgBlAHIALAAgAGMAYQBuAG4AbwB0ACAAYgBlACAAcgBlAGwAZQBhAHMAZQBkACAAdQBuAGQAZQByACAAYQBuAHkAIABvAHQAaABlAHIAIAB0AHkAcABlACAAbwBmACAAbABpAGMAZQBuAHMAZQAuACAAVABoAGUAIAByAGUAcQB1AGkAcgBlAG0AZQBuAHQAIABmAG8AcgAgAGYAbwBuAHQAcwAgAHQAbwAgAHIAZQBtAGEAaQBuACAAdQBuAGQAZQByACAAdABoAGkAcwAgAGwAaQBjAGUAbgBzAGUAIABkAG8AZQBzACAAbgBvAHQAIABhAHAAcABsAHkAIAB0AG8AIABhAG4AeQAgAGQAbwBjAHUAbQBlAG4AdAAgAGMAcgBlAGEAdABlAGQAIAB1AHMAaQBuAGcAIAB0AGgAZQAgAGYAbwBuAHQAcwAgAG8AcgAgAHQAaABlAGkAcgAgAGQAZQByAGkAdgBhAHQAaQB2AGUAcwAuAA0ACgANAAoARABFAEYASQBOAEkAVABJAE8ATgBTAA0ACgAiAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUAIgAgAHIAZQBmAGUAcgBzACAAdABvACAAdABoAGUAIABzAGUAdAAgAG8AZgAgAGYAaQBsAGUAcwAgAHIAZQBsAGUAYQBzAGUAZAAgAGIAeQAgAHQAaABlACAAQwBvAHAAeQByAGkAZwBoAHQAIABIAG8AbABkAGUAcgAoAHMAKQAgAHUAbgBkAGUAcgAgAHQAaABpAHMAIABsAGkAYwBlAG4AcwBlACAAYQBuAGQAIABjAGwAZQBhAHIAbAB5ACAAbQBhAHIAawBlAGQAIABhAHMAIABzAHUAYwBoAC4AIABUAGgAaQBzACAAbQBhAHkAIABpAG4AYwBsAHUAZABlACAAcwBvAHUAcgBjAGUAIABmAGkAbABlAHMALAAgAGIAdQBpAGwAZAAgAHMAYwByAGkAcAB0AHMAIABhAG4AZAAgAGQAbwBjAHUAbQBlAG4AdABhAHQAaQBvAG4ALgANAAoADQAKACIAUgBlAHMAZQByAHYAZQBkACAARgBvAG4AdAAgAE4AYQBtAGUAIgAgAHIAZQBmAGUAcgBzACAAdABvACAAYQBuAHkAIABuAGEAbQBlAHMAIABzAHAAZQBjAGkAZgBpAGUAZAAgAGEAcwAgAHMAdQBjAGgAIABhAGYAdABlAHIAIAB0AGgAZQAgAGMAbwBwAHkAcgBpAGcAaAB0ACAAcwB0AGEAdABlAG0AZQBuAHQAKABzACkALgANAAoADQAKACIATwByAGkAZwBpAG4AYQBsACAAVgBlAHIAcwBpAG8AbgAiACAAcgBlAGYAZQByAHMAIAB0AG8AIAB0AGgAZQAgAGMAbwBsAGwAZQBjAHQAaQBvAG4AIABvAGYAIABGAG8AbgB0ACAAUwBvAGYAdAB3AGEAcgBlACAAYwBvAG0AcABvAG4AZQBuAHQAcwAgAGEAcwAgAGQAaQBzAHQAcgBpAGIAdQB0AGUAZAAgAGIAeQAgAHQAaABlACAAQwBvAHAAeQByAGkAZwBoAHQAIABIAG8AbABkAGUAcgAoAHMAKQAuAA0ACgANAAoAIgBNAG8AZABpAGYAaQBlAGQAIABWAGUAcgBzAGkAbwBuACIAIAByAGUAZgBlAHIAcwAgAHQAbwAgAGEAbgB5ACAAZABlAHIAaQB2AGEAdABpAHYAZQAgAG0AYQBkAGUAIABiAHkAIABhAGQAZABpAG4AZwAgAHQAbwAsACAAZABlAGwAZQB0AGkAbgBnACwAIABvAHIAIABzAHUAYgBzAHQAaQB0AHUAdABpAG4AZwAgAC0ALQAgAGkAbgAgAHAAYQByAHQAIABvAHIAIABpAG4AIAB3AGgAbwBsAGUAIAAtAC0AIABhAG4AeQAgAG8AZgAgAHQAaABlACAAYwBvAG0AcABvAG4AZQBuAHQAcwAgAG8AZgAgAHQAaABlACAATwByAGkAZwBpAG4AYQBsACAAVgBlAHIAcwBpAG8AbgAsACAAYgB5ACAAYwBoAGEAbgBnAGkAbgBnACAAZgBvAHIAbQBhAHQAcwAgAG8AcgAgAGIAeQAgAHAAbwByAHQAaQBuAGcAIAB0AGgAZQAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUAIAB0AG8AIABhACAAbgBlAHcAIABlAG4AdgBpAHIAbwBuAG0AZQBuAHQALgANAAoADQAKACIAQQB1AHQAaABvAHIAIgAgAHIAZQBmAGUAcgBzACAAdABvACAAYQBuAHkAIABkAGUAcwBpAGcAbgBlAHIALAAgAGUAbgBnAGkAbgBlAGUAcgAsACAAcAByAG8AZwByAGEAbQBtAGUAcgAsACAAdABlAGMAaABuAGkAYwBhAGwAIAB3AHIAaQB0AGUAcgAgAG8AcgAgAG8AdABoAGUAcgAgAHAAZQByAHMAbwBuACAAdwBoAG8AIABjAG8AbgB0AHIAaQBiAHUAdABlAGQAIAB0AG8AIAB0AGgAZQAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUALgANAAoADQAKAFAARQBSAE0ASQBTAFMASQBPAE4AIAAmACAAQwBPAE4ARABJAFQASQBPAE4AUwANAAoAUABlAHIAbQBpAHMAcwBpAG8AbgAgAGkAcwAgAGgAZQByAGUAYgB5ACAAZwByAGEAbgB0AGUAZAAsACAAZgByAGUAZQAgAG8AZgAgAGMAaABhAHIAZwBlACwAIAB0AG8AIABhAG4AeQAgAHAAZQByAHMAbwBuACAAbwBiAHQAYQBpAG4AaQBuAGcAIABhACAAYwBvAHAAeQAgAG8AZgAgAHQAaABlACAARgBvAG4AdAAgAFMAbwBmAHQAdwBhAHIAZQAsACAAdABvACAAdQBzAGUALAAgAHMAdAB1AGQAeQAsACAAYwBvAHAAeQAsACAAbQBlAHIAZwBlACwAIABlAG0AYgBlAGQALAAgAG0AbwBkAGkAZgB5ACwAIAByAGUAZABpAHMAdAByAGkAYgB1AHQAZQAsACAAYQBuAGQAIABzAGUAbABsACAAbQBvAGQAaQBmAGkAZQBkACAAYQBuAGQAIAB1AG4AbQBvAGQAaQBmAGkAZQBkACAAYwBvAHAAaQBlAHMAIABvAGYAIAB0AGgAZQAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUALAAgAHMAdQBiAGoAZQBjAHQAIAB0AG8AIAB0AGgAZQAgAGYAbwBsAGwAbwB3AGkAbgBnACAAYwBvAG4AZABpAHQAaQBvAG4AcwA6AA0ACgANAAoAMQApACAATgBlAGkAdABoAGUAcgAgAHQAaABlACAARgBvAG4AdAAgAFMAbwBmAHQAdwBhAHIAZQAgAG4AbwByACAAYQBuAHkAIABvAGYAIABpAHQAcwAgAGkAbgBkAGkAdgBpAGQAdQBhAGwAIABjAG8AbQBwAG8AbgBlAG4AdABzACwAIABpAG4AIABPAHIAaQBnAGkAbgBhAGwAIABvAHIAIABNAG8AZABpAGYAaQBlAGQAIABWAGUAcgBzAGkAbwBuAHMALAAgAG0AYQB5ACAAYgBlACAAcwBvAGwAZAAgAGIAeQAgAGkAdABzAGUAbABmAC4ADQAKAA0ACgAyACkAIABPAHIAaQBnAGkAbgBhAGwAIABvAHIAIABNAG8AZABpAGYAaQBlAGQAIABWAGUAcgBzAGkAbwBuAHMAIABvAGYAIAB0AGgAZQAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUAIABtAGEAeQAgAGIAZQAgAGIAdQBuAGQAbABlAGQALAAgAHIAZQBkAGkAcwB0AHIAaQBiAHUAdABlAGQAIABhAG4AZAAvAG8AcgAgAHMAbwBsAGQAIAB3AGkAdABoACAAYQBuAHkAIABzAG8AZgB0AHcAYQByAGUALAAgAHAAcgBvAHYAaQBkAGUAZAAgAHQAaABhAHQAIABlAGEAYwBoACAAYwBvAHAAeQAgAGMAbwBuAHQAYQBpAG4AcwAgAHQAaABlACAAYQBiAG8AdgBlACAAYwBvAHAAeQByAGkAZwBoAHQAIABuAG8AdABpAGMAZQAgAGEAbgBkACAAdABoAGkAcwAgAGwAaQBjAGUAbgBzAGUALgAgAFQAaABlAHMAZQAgAGMAYQBuACAAYgBlACAAaQBuAGMAbAB1AGQAZQBkACAAZQBpAHQAaABlAHIAIABhAHMAIABzAHQAYQBuAGQALQBhAGwAbwBuAGUAIAB0AGUAeAB0ACAAZgBpAGwAZQBzACwAIABoAHUAbQBhAG4ALQByAGUAYQBkAGEAYgBsAGUAIABoAGUAYQBkAGUAcgBzACAAbwByACAAaQBuACAAdABoAGUAIABhAHAAcAByAG8AcAByAGkAYQB0AGUAIABtAGEAYwBoAGkAbgBlAC0AcgBlAGEAZABhAGIAbABlACAAbQBlAHQAYQBkAGEAdABhACAAZgBpAGUAbABkAHMAIAB3AGkAdABoAGkAbgAgAHQAZQB4AHQAIABvAHIAIABiAGkAbgBhAHIAeQAgAGYAaQBsAGUAcwAgAGEAcwAgAGwAbwBuAGcAIABhAHMAIAB0AGgAbwBzAGUAIABmAGkAZQBsAGQAcwAgAGMAYQBuACAAYgBlACAAZQBhAHMAaQBsAHkAIAB2AGkAZQB3AGUAZAAgAGIAeQAgAHQAaABlACAAdQBzAGUAcgAuAA0ACgANAAoAMwApACAATgBvACAATQBvAGQAaQBmAGkAZQBkACAAVgBlAHIAcwBpAG8AbgAgAG8AZgAgAHQAaABlACAARgBvAG4AdAAgAFMAbwBmAHQAdwBhAHIAZQAgAG0AYQB5ACAAdQBzAGUAIAB0AGgAZQAgAFIAZQBzAGUAcgB2AGUAZAAgAEYAbwBuAHQAIABOAGEAbQBlACgAcwApACAAdQBuAGwAZQBzAHMAIABlAHgAcABsAGkAYwBpAHQAIAB3AHIAaQB0AHQAZQBuACAAcABlAHIAbQBpAHMAcwBpAG8AbgAgAGkAcwAgAGcAcgBhAG4AdABlAGQAIABiAHkAIAB0AGgAZQAgAGMAbwByAHIAZQBzAHAAbwBuAGQAaQBuAGcAIABDAG8AcAB5AHIAaQBnAGgAdAAgAEgAbwBsAGQAZQByAC4AIABUAGgAaQBzACAAcgBlAHMAdAByAGkAYwB0AGkAbwBuACAAbwBuAGwAeQAgAGEAcABwAGwAaQBlAHMAIAB0AG8AIAB0AGgAZQAgAHAAcgBpAG0AYQByAHkAIABmAG8AbgB0ACAAbgBhAG0AZQAgAGEAcwANAAoAcAByAGUAcwBlAG4AdABlAGQAIAB0AG8AIAB0AGgAZQAgAHUAcwBlAHIAcwAuAA0ACgANAAoANAApACAAVABoAGUAIABuAGEAbQBlACgAcwApACAAbwBmACAAdABoAGUAIABDAG8AcAB5AHIAaQBnAGgAdAAgAEgAbwBsAGQAZQByACgAcwApACAAbwByACAAdABoAGUAIABBAHUAdABoAG8AcgAoAHMAKQAgAG8AZgAgAHQAaABlACAARgBvAG4AdAAgAFMAbwBmAHQAdwBhAHIAZQAgAHMAaABhAGwAbAAgAG4AbwB0ACAAYgBlACAAdQBzAGUAZAAgAHQAbwAgAHAAcgBvAG0AbwB0AGUALAAgAGUAbgBkAG8AcgBzAGUAIABvAHIAIABhAGQAdgBlAHIAdABpAHMAZQAgAGEAbgB5ACAATQBvAGQAaQBmAGkAZQBkACAAVgBlAHIAcwBpAG8AbgAsACAAZQB4AGMAZQBwAHQAIAB0AG8AIABhAGMAawBuAG8AdwBsAGUAZABnAGUAIAB0AGgAZQAgAGMAbwBuAHQAcgBpAGIAdQB0AGkAbwBuACgAcwApACAAbwBmACAAdABoAGUAIABDAG8AcAB5AHIAaQBnAGgAdAAgAEgAbwBsAGQAZQByACgAcwApACAAYQBuAGQAIAB0AGgAZQAgAEEAdQB0AGgAbwByACgAcwApACAAbwByACAAdwBpAHQAaAAgAHQAaABlAGkAcgAgAGUAeABwAGwAaQBjAGkAdAAgAHcAcgBpAHQAdABlAG4ADQAKAHAAZQByAG0AaQBzAHMAaQBvAG4ALgANAAoADQAKADUAKQAgAFQAaABlACAARgBvAG4AdAAgAFMAbwBmAHQAdwBhAHIAZQAsACAAbQBvAGQAaQBmAGkAZQBkACAAbwByACAAdQBuAG0AbwBkAGkAZgBpAGUAZAAsACAAaQBuACAAcABhAHIAdAAgAG8AcgAgAGkAbgAgAHcAaABvAGwAZQAsACAAbQB1AHMAdAAgAGIAZQAgAGQAaQBzAHQAcgBpAGIAdQB0AGUAZAAgAGUAbgB0AGkAcgBlAGwAeQAgAHUAbgBkAGUAcgAgAHQAaABpAHMAIABsAGkAYwBlAG4AcwBlACwAIABhAG4AZAAgAG0AdQBzAHQAIABuAG8AdAAgAGIAZQAgAGQAaQBzAHQAcgBpAGIAdQB0AGUAZAAgAHUAbgBkAGUAcgAgAGEAbgB5ACAAbwB0AGgAZQByACAAbABpAGMAZQBuAHMAZQAuACAAVABoAGUAIAByAGUAcQB1AGkAcgBlAG0AZQBuAHQAIABmAG8AcgAgAGYAbwBuAHQAcwAgAHQAbwAgAHIAZQBtAGEAaQBuACAAdQBuAGQAZQByACAAdABoAGkAcwAgAGwAaQBjAGUAbgBzAGUAIABkAG8AZQBzACAAbgBvAHQAIABhAHAAcABsAHkAIAB0AG8AIABhAG4AeQAgAGQAbwBjAHUAbQBlAG4AdAAgAGMAcgBlAGEAdABlAGQAIAB1AHMAaQBuAGcAIAB0AGgAZQAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUALgANAAoADQAKAFQARQBSAE0ASQBOAEEAVABJAE8ATgANAAoAVABoAGkAcwAgAGwAaQBjAGUAbgBzAGUAIABiAGUAYwBvAG0AZQBzACAAbgB1AGwAbAAgAGEAbgBkACAAdgBvAGkAZAAgAGkAZgAgAGEAbgB5ACAAbwBmACAAdABoAGUAIABhAGIAbwB2AGUAIABjAG8AbgBkAGkAdABpAG8AbgBzACAAYQByAGUAIABuAG8AdAAgAG0AZQB0AC4ADQAKAA0ACgBEAEkAUwBDAEwAQQBJAE0ARQBSAA0ACgBUAEgARQAgAEYATwBOAFQAIABTAE8ARgBUAFcAQQBSAEUAIABJAFMAIABQAFIATwBWAEkARABFAEQAIAAiAEEAUwAgAEkAUwAiACwAIABXAEkAVABIAE8AVQBUACAAVwBBAFIAUgBBAE4AVABZACAATwBGACAAQQBOAFkAIABLAEkATgBEACwAIABFAFgAUABSAEUAUwBTACAATwBSACAASQBNAFAATABJAEUARAAsACAASQBOAEMATABVAEQASQBOAEcAIABCAFUAVAAgAE4ATwBUACAATABJAE0ASQBUAEUARAAgAFQATwAgAEEATgBZACAAVwBBAFIAUgBBAE4AVABJAEUAUwAgAE8ARgAgAE0ARQBSAEMASABBAE4AVABBAEIASQBMAEkAVABZACwAIABGAEkAVABOAEUAUwBTACAARgBPAFIAIABBACAAUABBAFIAVABJAEMAVQBMAEEAUgAgAFAAVQBSAFAATwBTAEUAIABBAE4ARAAgAE4ATwBOAEkATgBGAFIASQBOAEcARQBNAEUATgBUACAATwBGACAAQwBPAFAAWQBSAEkARwBIAFQALAAgAFAAQQBUAEUATgBUACwAIABUAFIAQQBEAEUATQBBAFIASwAsACAATwBSACAATwBUAEgARQBSACAAUgBJAEcASABUAC4AIABJAE4AIABOAE8AIABFAFYARQBOAFQAIABTAEgAQQBMAEwAIABUAEgARQANAAoAQwBPAFAAWQBSAEkARwBIAFQAIABIAE8ATABEAEUAUgAgAEIARQAgAEwASQBBAEIATABFACAARgBPAFIAIABBAE4AWQAgAEMATABBAEkATQAsACAARABBAE0AQQBHAEUAUwAgAE8AUgAgAE8AVABIAEUAUgAgAEwASQBBAEIASQBMAEkAVABZACwAIABJAE4AQwBMAFUARABJAE4ARwAgAEEATgBZACAARwBFAE4ARQBSAEEATAAsACAAUwBQAEUAQwBJAEEATAAsACAASQBOAEQASQBSAEUAQwBUACwAIABJAE4AQwBJAEQARQBOAFQAQQBMACwAIABPAFIAIABDAE8ATgBTAEUAUQBVAEUATgBUAEkAQQBMACAARABBAE0AQQBHAEUAUwAsACAAVwBIAEUAVABIAEUAUgAgAEkATgAgAEEATgAgAEEAQwBUAEkATwBOACAATwBGACAAQwBPAE4AVABSAEEAQwBUACwAIABUAE8AUgBUACAATwBSACAATwBUAEgARQBSAFcASQBTAEUALAAgAEEAUgBJAFMASQBOAEcAIABGAFIATwBNACwAIABPAFUAVAAgAE8ARgAgAFQASABFACAAVQBTAEUAIABPAFIAIABJAE4AQQBCAEkATABJAFQAWQAgAFQATwAgAFUAUwBFACAAVABIAEUAIABGAE8ATgBUACAAUwBPAEYAVABXAEEAUgBFACAATwBSACAARgBSAE8ATQAgAE8AVABIAEUAUgAgAEQARQBBAEwASQBOAEcAUwAgAEkATgAgAFQASABFACAARgBPAE4AVAAgAFMATwBGAFQAVwBBAFIARQAuAABDb3B5cmlnaHQgKGMpIDIwMTAsIEtpbWJlcmx5IEdlc3dlaW4gKGtpbWJlcmx5Z2Vzd2Vpbi5jb20pDQoNClRoaXMgRm9udCBTb2Z0d2FyZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgU0lMIE9wZW4gRm9udCBMaWNlbnNlLCBWZXJzaW9uIDEuMS4gIFRoaXMgbGljZW5zZSBpcyBjb3BpZWQgYmVsb3csIGFuZCBpcyBhbHNvIGF2YWlsYWJsZSB3aXRoIGEgRkFRIGF0OiAgaHR0cDovL3NjcmlwdHMuc2lsLm9yZy9PRkwNCg0KDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0KU0lMIE9QRU4gRk9OVCBMSUNFTlNFIFZlcnNpb24gMS4xIC0gMjYgRmVicnVhcnkgMjAwNw0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0NCg0KUFJFQU1CTEUNClRoZSBnb2FscyBvZiB0aGUgT3BlbiBGb250IExpY2Vuc2UgKE9GTCkgYXJlIHRvIHN0aW11bGF0ZSB3b3JsZHdpZGUgZGV2ZWxvcG1lbnQgb2YgY29sbGFib3JhdGl2ZSBmb250IHByb2plY3RzLCB0byBzdXBwb3J0IHRoZSBmb250IGNyZWF0aW9uIGVmZm9ydHMgb2YgYWNhZGVtaWMgYW5kIGxpbmd1aXN0aWMgY29tbXVuaXRpZXMsIGFuZCB0byBwcm92aWRlIGEgZnJlZSBhbmQgb3BlbiBmcmFtZXdvcmsgaW4gd2hpY2ggZm9udHMgbWF5IGJlIHNoYXJlZCBhbmQgaW1wcm92ZWQgaW4gcGFydG5lcnNoaXANCndpdGggb3RoZXJzLg0KDQpUaGUgT0ZMIGFsbG93cyB0aGUgbGljZW5zZWQgZm9udHMgdG8gYmUgdXNlZCwgc3R1ZGllZCwgbW9kaWZpZWQgYW5kIHJlZGlzdHJpYnV0ZWQgZnJlZWx5IGFzIGxvbmcgYXMgdGhleSBhcmUgbm90IHNvbGQgYnkgdGhlbXNlbHZlcy4gVGhlIGZvbnRzLCBpbmNsdWRpbmcgYW55IGRlcml2YXRpdmUgd29ya3MsIGNhbiBiZSBidW5kbGVkLCBlbWJlZGRlZCwgcmVkaXN0cmlidXRlZCBhbmQvb3Igc29sZCB3aXRoIGFueSBzb2Z0d2FyZSBwcm92aWRlZCB0aGF0IGFueSByZXNlcnZlZCBuYW1lcyBhcmUgbm90IHVzZWQgYnkgZGVyaXZhdGl2ZSB3b3Jrcy4gVGhlIGZvbnRzIGFuZCBkZXJpdmF0aXZlcywgaG93ZXZlciwgY2Fubm90IGJlIHJlbGVhc2VkIHVuZGVyIGFueSBvdGhlciB0eXBlIG9mIGxpY2Vuc2UuIFRoZSByZXF1aXJlbWVudCBmb3IgZm9udHMgdG8gcmVtYWluIHVuZGVyIHRoaXMgbGljZW5zZSBkb2VzIG5vdCBhcHBseSB0byBhbnkgZG9jdW1lbnQgY3JlYXRlZCB1c2luZyB0aGUgZm9udHMgb3IgdGhlaXIgZGVyaXZhdGl2ZXMuDQoNCkRFRklOSVRJT05TDQoiRm9udCBTb2Z0d2FyZSIgcmVmZXJzIHRvIHRoZSBzZXQgb2YgZmlsZXMgcmVsZWFzZWQgYnkgdGhlIENvcHlyaWdodCBIb2xkZXIocykgdW5kZXIgdGhpcyBsaWNlbnNlIGFuZCBjbGVhcmx5IG1hcmtlZCBhcyBzdWNoLiBUaGlzIG1heSBpbmNsdWRlIHNvdXJjZSBmaWxlcywgYnVpbGQgc2NyaXB0cyBhbmQgZG9jdW1lbnRhdGlvbi4NCg0KIlJlc2VydmVkIEZvbnQgTmFtZSIgcmVmZXJzIHRvIGFueSBuYW1lcyBzcGVjaWZpZWQgYXMgc3VjaCBhZnRlciB0aGUgY29weXJpZ2h0IHN0YXRlbWVudChzKS4NCg0KIk9yaWdpbmFsIFZlcnNpb24iIHJlZmVycyB0byB0aGUgY29sbGVjdGlvbiBvZiBGb250IFNvZnR3YXJlIGNvbXBvbmVudHMgYXMgZGlzdHJpYnV0ZWQgYnkgdGhlIENvcHlyaWdodCBIb2xkZXIocykuDQoNCiJNb2RpZmllZCBWZXJzaW9uIiByZWZlcnMgdG8gYW55IGRlcml2YXRpdmUgbWFkZSBieSBhZGRpbmcgdG8sIGRlbGV0aW5nLCBvciBzdWJzdGl0dXRpbmcgLS0gaW4gcGFydCBvciBpbiB3aG9sZSAtLSBhbnkgb2YgdGhlIGNvbXBvbmVudHMgb2YgdGhlIE9yaWdpbmFsIFZlcnNpb24sIGJ5IGNoYW5naW5nIGZvcm1hdHMgb3IgYnkgcG9ydGluZyB0aGUgRm9udCBTb2Z0d2FyZSB0byBhIG5ldyBlbnZpcm9ubWVudC4NCg0KIkF1dGhvciIgcmVmZXJzIHRvIGFueSBkZXNpZ25lciwgZW5naW5lZXIsIHByb2dyYW1tZXIsIHRlY2huaWNhbCB3cml0ZXIgb3Igb3RoZXIgcGVyc29uIHdobyBjb250cmlidXRlZCB0byB0aGUgRm9udCBTb2Z0d2FyZS4NCg0KUEVSTUlTU0lPTiAmIENPTkRJVElPTlMNClBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhlIEZvbnQgU29mdHdhcmUsIHRvIHVzZSwgc3R1ZHksIGNvcHksIG1lcmdlLCBlbWJlZCwgbW9kaWZ5LCByZWRpc3RyaWJ1dGUsIGFuZCBzZWxsIG1vZGlmaWVkIGFuZCB1bm1vZGlmaWVkIGNvcGllcyBvZiB0aGUgRm9udCBTb2Z0d2FyZSwgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6DQoNCjEpIE5laXRoZXIgdGhlIEZvbnQgU29mdHdhcmUgbm9yIGFueSBvZiBpdHMgaW5kaXZpZHVhbCBjb21wb25lbnRzLCBpbiBPcmlnaW5hbCBvciBNb2RpZmllZCBWZXJzaW9ucywgbWF5IGJlIHNvbGQgYnkgaXRzZWxmLg0KDQoyKSBPcmlnaW5hbCBvciBNb2RpZmllZCBWZXJzaW9ucyBvZiB0aGUgRm9udCBTb2Z0d2FyZSBtYXkgYmUgYnVuZGxlZCwgcmVkaXN0cmlidXRlZCBhbmQvb3Igc29sZCB3aXRoIGFueSBzb2Z0d2FyZSwgcHJvdmlkZWQgdGhhdCBlYWNoIGNvcHkgY29udGFpbnMgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgbGljZW5zZS4gVGhlc2UgY2FuIGJlIGluY2x1ZGVkIGVpdGhlciBhcyBzdGFuZC1hbG9uZSB0ZXh0IGZpbGVzLCBodW1hbi1yZWFkYWJsZSBoZWFkZXJzIG9yIGluIHRoZSBhcHByb3ByaWF0ZSBtYWNoaW5lLXJlYWRhYmxlIG1ldGFkYXRhIGZpZWxkcyB3aXRoaW4gdGV4dCBvciBiaW5hcnkgZmlsZXMgYXMgbG9uZyBhcyB0aG9zZSBmaWVsZHMgY2FuIGJlIGVhc2lseSB2aWV3ZWQgYnkgdGhlIHVzZXIuDQoNCjMpIE5vIE1vZGlmaWVkIFZlcnNpb24gb2YgdGhlIEZvbnQgU29mdHdhcmUgbWF5IHVzZSB0aGUgUmVzZXJ2ZWQgRm9udCBOYW1lKHMpIHVubGVzcyBleHBsaWNpdCB3cml0dGVuIHBlcm1pc3Npb24gaXMgZ3JhbnRlZCBieSB0aGUgY29ycmVzcG9uZGluZyBDb3B5cmlnaHQgSG9sZGVyLiBUaGlzIHJlc3RyaWN0aW9uIG9ubHkgYXBwbGllcyB0byB0aGUgcHJpbWFyeSBmb250IG5hbWUgYXMNCnByZXNlbnRlZCB0byB0aGUgdXNlcnMuDQoNCjQpIFRoZSBuYW1lKHMpIG9mIHRoZSBDb3B5cmlnaHQgSG9sZGVyKHMpIG9yIHRoZSBBdXRob3Iocykgb2YgdGhlIEZvbnQgU29mdHdhcmUgc2hhbGwgbm90IGJlIHVzZWQgdG8gcHJvbW90ZSwgZW5kb3JzZSBvciBhZHZlcnRpc2UgYW55IE1vZGlmaWVkIFZlcnNpb24sIGV4Y2VwdCB0byBhY2tub3dsZWRnZSB0aGUgY29udHJpYnV0aW9uKHMpIG9mIHRoZSBDb3B5cmlnaHQgSG9sZGVyKHMpIGFuZCB0aGUgQXV0aG9yKHMpIG9yIHdpdGggdGhlaXIgZXhwbGljaXQgd3JpdHRlbg0KcGVybWlzc2lvbi4NCg0KNSkgVGhlIEZvbnQgU29mdHdhcmUsIG1vZGlmaWVkIG9yIHVubW9kaWZpZWQsIGluIHBhcnQgb3IgaW4gd2hvbGUsIG11c3QgYmUgZGlzdHJpYnV0ZWQgZW50aXJlbHkgdW5kZXIgdGhpcyBsaWNlbnNlLCBhbmQgbXVzdCBub3QgYmUgZGlzdHJpYnV0ZWQgdW5kZXIgYW55IG90aGVyIGxpY2Vuc2UuIFRoZSByZXF1aXJlbWVudCBmb3IgZm9udHMgdG8gcmVtYWluIHVuZGVyIHRoaXMgbGljZW5zZSBkb2VzIG5vdCBhcHBseSB0byBhbnkgZG9jdW1lbnQgY3JlYXRlZCB1c2luZyB0aGUgRm9udCBTb2Z0d2FyZS4NCg0KVEVSTUlOQVRJT04NClRoaXMgbGljZW5zZSBiZWNvbWVzIG51bGwgYW5kIHZvaWQgaWYgYW55IG9mIHRoZSBhYm92ZSBjb25kaXRpb25zIGFyZSBub3QgbWV0Lg0KDQpESVNDTEFJTUVSDQpUSEUgRk9OVCBTT0ZUV0FSRSBJUyBQUk9WSURFRCAiQVMgSVMiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gQU5ZIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5UIE9GIENPUFlSSUdIVCwgUEFURU5ULCBUUkFERU1BUkssIE9SIE9USEVSIFJJR0hULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUNCkNPUFlSSUdIVCBIT0xERVIgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBJTkNMVURJTkcgQU5ZIEdFTkVSQUwsIFNQRUNJQUwsIElORElSRUNULCBJTkNJREVOVEFMLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgVEhFIFVTRSBPUiBJTkFCSUxJVFkgVE8gVVNFIFRIRSBGT05UIFNPRlRXQVJFIE9SIEZST00gT1RIRVIgREVBTElOR1MgSU4gVEhFIEZPTlQgU09GVFdBUkUuAAAgAGgAdAB0AHAAOgAvAC8AcwBjAHIAaQBwAHQAcwAuAHMAaQBsAC4AbwByAGcALwBPAEYATAAAIGh0dHA6Ly9zY3JpcHRzLnNpbC5vcmcvT0ZMAAAAAAIAAAAAAAD/swAzAAAAAAAAAAAAAAAAAAAAAAAAAAABZgAAAAEAAgADAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgA/AEAAQQBCAEMARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAGEArACjAIQAhQC9AJYA6ACGAI4AiwCdAKkApAECAIoA2gCDAJMA8gDzAI0AlwCIAMMA3gDxAJ4AqgD1APQA9gCiAK0AyQDHAK4AYgBjAJAAZADLAGUAyADKAM8AzADNAM4A6QBmANMA0ADRAK8AZwDwAJEA1gDUANUAaADrAO0AiQBqAGkAawBtAGwAbgCgAG8AcQBwAHIAcwB1AHQAdgB3AOoAeAB6AHkAewB9AHwAuAChAH8AfgCAAIEA7ADuALoBAwEEAQUBBgEHAQgA/QD+AQkBCgELAQwA/wEAAQ0BDgEPAQEBEAERARIBEwEUARUBFgEXARgBGQEaARsA+AD5ARwBHQEeAR8BIAEhASIBIwEkASUBJgEnASgBKQD6ANcBKgErASwBLQEuAS8BMAExATIBMwE0ATUA4gDjATYBNwE4ATkBOgE7ATwBPQE+AT8BQAFBAUIAsACxAUMBRAFFAUYBRwFIAUkBSgFLAUwA+wD8AOQA5QFNAU4BTwFQAVEBUgFTAVQBVQFWAVcBWAFZAVoBWwFcAV0BXgFfAWAAuwFhAWIBYwFkAOYA5wCmAWUBZgFnAWgBaQFqANgA4QDbANwA3QDgANkA3wFrAWwBbQFuAW8BcAFxAXIAsgCzALYAtwDEALQAtQDFAIIAwgCHAKsAvgC/ALwBcwCMAO8BdADAAMEBdQF2B2h5cGhlbl8HQW1hY3JvbgdhbWFjcm9uBkFicmV2ZQZhYnJldmUHQW9nb25lawdhb2dvbmVrC0NjaXJjdW1mbGV4C2NjaXJjdW1mbGV4CkNkb3RhY2NlbnQKY2RvdGFjY2VudAZEY2Fyb24GZGNhcm9uBkRjcm9hdAdFbWFjcm9uB2VtYWNyb24GRWJyZXZlBmVicmV2ZQpFZG90YWNjZW50CmVkb3RhY2NlbnQHRW9nb25lawdlb2dvbmVrBkVjYXJvbgZlY2Fyb24LR2NpcmN1bWZsZXgLZ2NpcmN1bWZsZXgKR2RvdGFjY2VudApnZG90YWNjZW50DEdjb21tYWFjY2VudAxnY29tbWFhY2NlbnQLSGNpcmN1bWZsZXgLaGNpcmN1bWZsZXgEaGJhcgZJdGlsZGUGaXRpbGRlB2ltYWNyb24GSWJyZXZlBmlicmV2ZQdJb2dvbmVrB2lvZ29uZWsLSmNpcmN1bWZsZXgLamNpcmN1bWZsZXgMS2NvbW1hYWNjZW50DGtjb21tYWFjY2VudAZMYWN1dGUGbGFjdXRlDExjb21tYWFjY2VudAxsY29tbWFhY2NlbnQGTGNhcm9uBmxjYXJvbgRMZG90BGxkb3QGTmFjdXRlBm5hY3V0ZQxOY29tbWFhY2NlbnQMbmNvbW1hYWNjZW50Bk5jYXJvbgZuY2Fyb24LbmFwb3N0cm9waGUHT21hY3JvbgdvbWFjcm9uBk9icmV2ZQZvYnJldmUNT2h1bmdhcnVtbGF1dA1vaHVuZ2FydW1sYXV0BlJhY3V0ZQZyYWN1dGUMUmNvbW1hYWNjZW50DHJjb21tYWFjY2VudAZSY2Fyb24GcmNhcm9uBlNhY3V0ZQZzYWN1dGULU2NpcmN1bWZsZXgLc2NpcmN1bWZsZXgMVGNvbW1hYWNjZW50DHRjb21tYWFjY2VudAZUY2Fyb24GdGNhcm9uBlV0aWxkZQZ1dGlsZGUHVW1hY3Jvbgd1bWFjcm9uBlVicmV2ZQZ1YnJldmUFVXJpbmcFdXJpbmcNVWh1bmdhcnVtbGF1dA11aHVuZ2FydW1sYXV0B1VvZ29uZWsHdW9nb25lawtXY2lyY3VtZmxleAt3Y2lyY3VtZmxleAtZY2lyY3VtZmxleAt5Y2lyY3VtZmxleAZaYWN1dGUGemFjdXRlClpkb3RhY2NlbnQKemRvdGFjY2VudAdBRWFjdXRlB2FlYWN1dGULT3NsYXNoYWN1dGULb3NsYXNoYWN1dGUMU2NvbW1hYWNjZW50DHNjb21tYWFjY2VudAZXZ3JhdmUGd2dyYXZlBldhY3V0ZQZ3YWN1dGUJV2RpZXJlc2lzCXdkaWVyZXNpcwZZZ3JhdmUGeWdyYXZlBEV1cm8LY29tbWFhY2NlbnQFUi5hbHQFdS5lbmQAAAAAAAAB//8AAwAAAAEAAAAAx/6w3wAAAADJdyWXAAAAAMmYmmYAAQAAAA4AAAAYACAAAAACAAEAAQFlAAEABAAAAAIAAAABAAAAAQAAAAAAAQAAAAA="

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(7);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);
//# sourceMappingURL=newtab.bundle.js.map