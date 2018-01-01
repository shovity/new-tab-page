// REQUEST LIST 
const GET_NOTES     = 'GET_NOTES'
const POST_NOTES    = 'POST_NOTES'
const GET_BOOKMARK  = 'GET_BOOKMARK'
const GET_MOSTSITE  = 'GET_MOSTSITE'
const ARE_YOU_READY = 'ARE_YOU_READY'

let bookmarksCache = null
let notesCache = null

const notifiBookmarkUpdated = (port, type) => {
  chrome.bookmarks.getTree((bookmarkNodes) => {
    bookmarksCache = bookmarkNodes
    port.postMessage({ request: GET_BOOKMARK, data: bookmarkNodes })
  })
}

chrome.runtime.onConnect.addListener((port) => {

  // Only service port name "pip"
  if (port.name !== 'pip') return

  // listen update bookmark
  chrome.bookmarks.onCreated.addListener(() => notifiBookmarkUpdated(port, 'created'))
  chrome.bookmarks.onRemoved.addListener(() => notifiBookmarkUpdated(port, 'removed'))
  chrome.bookmarks.onChanged.addListener(() => notifiBookmarkUpdated(port, 'changed'))
  chrome.bookmarks.onMoved.addListener(()   => notifiBookmarkUpdated(port, 'moved'))

  // listen mesg from newtab page
  port.onMessage.addListener(function(msg) {
    switch (msg.request) {

      case ARE_YOU_READY:
        // check background script ready
        port.postMessage({ request: msg.request, data: true })
        break

      case GET_BOOKMARK:
        // Get bookmarks recent
        if (bookmarksCache) {
          port.postMessage({ request: msg.request, data: bookmarksCache })
        } else {
          chrome.bookmarks.getTree((bookmarkNodes) => {
            bookmarksCache = bookmarkNodes
            port.postMessage({ request: msg.request, data: bookmarkNodes })
          })
        }
        break

      case GET_MOSTSITE:
        // Get most sites visited
        chrome.topSites.get((mostVisitedUrls) => {
          port.postMessage({ request: msg.request, data: mostVisitedUrls })
        })
        break

      case POST_NOTES:
        // write notes -> storage
        chrome.storage.local.set({ 'notes': msg.data }, () => {
          notesCache.notes = msg.data
        })
        break

      case GET_NOTES:
        // Get notes
        if (notesCache) {
          port.postMessage({ request: msg.request, data: notesCache })
        } else {
          chrome.storage.local.get('notes', (data) => {
            notesCache = data
            port.postMessage({ request: msg.request, data })
          })
        }
        break

      default:
        port.postMessage({ err: 'request not macth' })
    }
  })
})