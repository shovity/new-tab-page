// REQUEST LIST 
const GET_NOTES     = 'GET_NOTES'
const POST_NOTES    = 'POST_NOTES'
const GET_BOOkMARK  = 'GET_BOOkMARK'
const GET_MOSTSITE  = 'GET_MOSTSITE'
const ARE_YOU_READY = 'ARE_YOU_READY'

let bookmarksCache = null
let notesCache = null

const notifiBookmarkUpdated = (port, type) => {
  chrome.bookmarks.getTree((bookmarkNodes) => {
    console.log('notifi changed', type)
    bookmarksCache = bookmarkNodes
    port.postMessage({ request: GET_BOOkMARK, data: bookmarkNodes })
  })
}


chrome.runtime.onConnect.addListener((port) => {

  // Only service port name "pip"
  if (port.name !== 'pip') return

  // listen update bookmark
  chrome.bookmarks.onCreated.addListener(()           => notifiBookmarkUpdated(port, 'created'))
  chrome.bookmarks.onRemoved.addListener(()           => notifiBookmarkUpdated(port, 'removed'))
  chrome.bookmarks.onChanged.addListener(()           => notifiBookmarkUpdated(port, 'changed'))
  chrome.bookmarks.onMoved.addListener(()             => notifiBookmarkUpdated(port, 'moved'))

  // listen mesg from newtab page
  port.onMessage.addListener(function(msg) {
    switch (msg.request) {

      case ARE_YOU_READY:
        // check background script ready
        port.postMessage({ request: msg.request, data: true })
        break

      case GET_BOOkMARK:
        // Get bookmarks recent
        if (bookmarksCache) {
          port.postMessage({ request: msg.request, data: bookmarksCache })
          console.log('get bookmarks cached')
        } else {
          console.log('get bookmarks none cache')
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
          console.log('write notes')
          notesCache.notes = msg.data
        })
        break

      case GET_NOTES:
        // Get notes
        if (notesCache) {
          console.log('get notes cached')
          port.postMessage({ request: msg.request, data: notesCache })
        } else {
          console.log('get notes none cache')
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