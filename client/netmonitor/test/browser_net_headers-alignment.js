/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

/**
 * Bug 1360457 - Mis-alignment between headers and columns on overflow
 */

add_task(function* () {
  requestLongerTimeout(4);

  let { tab, monitor } = yield initNetMonitor(INFINITE_GET_URL, true);
  let { document, windowRequire, store } = monitor.panelWin;
  let Actions = windowRequire("devtools/client/netmonitor/src/actions/index");

  store.dispatch(Actions.batchEnable(false));

  // Wait until the first request makes the empty notice disappear
  yield waitForRequestListToAppear();

  let requestsContainer = document.querySelector(".requests-list-contents");
  ok(requestsContainer, "Container element exists as expected.");
  let headers = document.querySelector(".requests-list-headers");
  ok(headers, "Headers element exists as expected.");

  yield waitForRequestsToOverflowContainer();

  // Get first request line, not child 0 as this is the headers
  let firstRequestLine = requestsContainer.childNodes[1];

  // Find number of columns
  let numberOfColumns = headers.childElementCount;
  for (let columnNumber = 0; columnNumber < numberOfColumns; columnNumber++) {
    let aHeaderColumn = headers.childNodes[columnNumber];
    let aRequestColumn = firstRequestLine.childNodes[columnNumber];
    is(aHeaderColumn.getBoundingClientRect().left,
       aRequestColumn.getBoundingClientRect().left,
       "Headers for columns number " + columnNumber + " are aligned."
    );
  }

  // Stop doing requests.
  yield ContentTask.spawn(tab.linkedBrowser, {}, function* () {
    content.wrappedJSObject.stopRequests();
  });

  // Done: clean up.
  return teardown(monitor);

  function waitForRequestListToAppear() {
    info("Waiting until the empty notice disappears and is replaced with the list");
    return waitUntil(() => !!document.querySelector(".requests-list-contents"));
  }

  function* waitForRequestsToOverflowContainer() {
    info("Waiting for enough requests to overflow the container");
    while (true) {
      info("Waiting for one network request");
      yield waitForNetworkEvents(monitor, 1);
      if (requestsContainer.scrollHeight > requestsContainer.clientHeight) {
        info("The list is long enough, returning");
        return;
      }
    }
  }
});
