// REQUEST LIST
const GET_BOOkMARK = 'GET_BOOkMARK'
const GET_MOSTSITE = 'GET_MOSTSITE'

chrome.runtime.onConnect.addListener(function(port) {

  // Only service port name "pip"
  if (port.name !== 'pip') return

  port.onMessage.addListener(function(msg) {
    switch (msg.request) {

      case GET_BOOkMARK:
        // Get bookmarks recent
        chrome.bookmarks.getRecent(7, (bookmarkNodes) => {
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