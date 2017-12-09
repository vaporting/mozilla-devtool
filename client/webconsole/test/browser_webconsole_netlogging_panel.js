/* vim:set ts=2 sw=2 sts=2 et: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/* import-globals-from ../../netmonitor/test/shared-head.js */

// Tests that network log messages bring up the network panel.

"use strict";

const TEST_NETWORK_REQUEST_URI =
  "http://example.com/browser/devtools/client/webconsole/test/" +
  "test-network-request.html";

Services.scriptloader.loadSubScript(
  "chrome://mochitests/content/browser/devtools/client/netmonitor/test/shared-head.js", this);

add_task(function* () {
  let finishedRequest = waitForFinishedRequest(({ request }) => {
    return request.url.endsWith("test-network-request.html");
  });

  const hud = yield loadPageAndGetHud(TEST_NETWORK_REQUEST_URI);
  let request = yield finishedRequest;

  yield hud.ui.openNetworkPanel(request.actor);
  let toolbox = gDevTools.getToolbox(hud.target);
  is(toolbox.currentToolId, "netmonitor", "Network panel was opened");
  let monitor = toolbox.getCurrentPanel();

  let { store, windowRequire } = monitor.panelWin;
  let { getSelectedRequest } = windowRequire("devtools/client/netmonitor/src/selectors/index");

  let selected = getSelectedRequest(store.getState());
  is(selected.method, request.request.method,
     "The correct request is selected");
  is(selected.url, request.request.url,
     "The correct request is definitely selected");

  yield waitForExistingRequests(monitor);
});
