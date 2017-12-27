// REQUEST LIST 
const GET_BOOkMARK = 'GET_BOOkMARK'
const GET_MOSTSITE = 'GET_MOSTSITE'

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