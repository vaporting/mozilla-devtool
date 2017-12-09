/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// Ensure Cmd/Ctrl-clicking link opens a new tab

const TAB_URL = "http://example.com/";
const TEST_URL =
  `data:text/html,<a href="${TAB_URL}">Click me</a>`
  .replace(/ /g, "%20");

addRDMTask(TEST_URL, function* ({ ui }) {
  let store = ui.toolWindow.store;

  // Wait until the viewport has been added
  yield waitUntilState(store, state => state.viewports.length == 1);

  // Cmd-click the link and wait for a new tab
  yield waitForFrameLoad(ui, TEST_URL);
  let newTabPromise = BrowserTestUtils.waitForNewTab(gBrowser, TAB_URL);
  BrowserTestUtils.synthesizeMouseAtCenter("a", {
    ctrlKey: true,
    metaKey: true,
  }, ui.getViewportBrowser());
  let newTab = yield newTabPromise;
  ok(newTab, "New tab opened from link");
  yield removeTab(newTab);
});
