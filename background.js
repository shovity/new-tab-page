// REQUEST LIST 
const GET_BOOkMARK = 'GET_BOOkMARK'
const GET_MOSTSITE = 'GET_MOSTSITE'
const GET_NOTES = 'GET_NOTES'
const POST_NOTES = 'POST_NOTES'
const ARE_YOU_READY = 'ARE_YOU_READY'

chrome.runtime.onConnect.addListener(function(port) {

  // Only service port name "pip"
  if (port.name !== 'pip') return


  // listen update bookmark
  chrome.bookmarks.onCreated.addListener(() => {
    chrome.bookmarks.getTree((bookmarkNodes) => {
      port.postMessage({ request: GET_BOOkMARK, data: bookmarkNodes })
    })
  })

  chrome.bookmarks.onRemoved.addListener(() => {
    chrome.bookmarks.getTree((bookmarkNodes) => {
      port.postMessage({ request: GET_BOOkMARK, data: bookmarkNodes })
    })
  })

  chrome.bookmarks.onChanged.addListener(() => {
    chrome.bookmarks.getTree((bookmarkNodes) => {
      port.postMessage({ request: GET_BOOkMARK, data: bookmarkNodes })
    })
  })

  chrome.bookmarks.onMoved.addListener(() => {
    chrome.bookmarks.getTree((bookmarkNodes) => {
      port.postMessage({ request: GET_BOOkMARK, data: bookmarkNodes })
    })
  })

  // listen mesg from newtab page
  port.onMessage.addListener(function(msg) {
    switch (msg.request) {

      case ARE_YOU_READY:
        // check background script ready
        port.postMessage({ request: msg.request, data: true })
        break

      case GET_BOOkMARK:
        // Get bookmarks recent
        chrome.bookmarks.getTree((bookmarkNodes) => {
          port.postMessage({ request: msg.request, data: bookmarkNodes })
        })
        break

      case GET_MOSTSITE:
        // Get most sites visited
        chrome.topSites.get((mostVisitedUrls) => {
          port.postMessage({ request: msg.request, data: mostVisitedUrls })
        })
        break

      case POST_NOTES:
        // Get notes
        chrome.storage.local.set({ 'notes': msg.data }, () => {
        })
        break

      case GET_NOTES:
        // Get notes
        chrome.storage.local.get('notes', (data) => {
          port.postMessage({ request: msg.request, data })
        })
        break

      default:
        port.postMessage({ err: 'request not macth' })
    }
  })
})

// chrome.tabs.captureVisibleTab((data) => {
//   console.log(data)
// })
// chrome.tabs.getAllInWindow((tabs) => {
//   console.log(tabs)
// })