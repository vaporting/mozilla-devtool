/* vim: set ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// Test editing a node's text content

const TEST_URL = URL_ROOT + "doc_markup_edit.html";
const {DEFAULT_VALUE_SUMMARY_LENGTH} = require("devtools/server/actors/inspector");

add_task(function* () {
  let {inspector, testActor} = yield openInspectorForURL(TEST_URL);

  info("Expanding all nodes");
  yield inspector.markup.expandAll();
  yield waitForMultipleChildrenUpdates(inspector);

  yield editContainer(inspector, testActor, {
    selector: ".node6",
    newValue: "New text",
    oldValue: "line6"
  });

  yield editContainer(inspector, testActor, {
    selector: "#node17",
    newValue: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. " +
              "DONEC POSUERE PLACERAT MAGNA ET IMPERDIET.",
    oldValue: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
              "Donec posuere placerat magna et imperdiet."
  });

  yield editContainer(inspector, testActor, {
    selector: "#node17",
    newValue: "New value",
    oldValue: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. " +
              "DONEC POSUERE PLACERAT MAGNA ET IMPERDIET."
  });

  yield editContainer(inspector, testActor, {
    selector: "#node17",
    newValue: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. " +
              "DONEC POSUERE PLACERAT MAGNA ET IMPERDIET.",
    oldValue: "New value"
  });
});

function* editContainer(inspector, testActor,
                        {selector, newValue, oldValue}) {
  let nodeValue = yield getFirstChildNodeValue(selector, testActor);
  is(nodeValue, oldValue, "The test node's text content is correct");

  info("Changing the text content");
  let onMutated = inspector.once("markupmutation");
  let container = yield focusNode(selector, inspector);

  let isOldValueInline = oldValue.length <= DEFAULT_VALUE_SUMMARY_LENGTH;
  is(!!container.inlineTextChild, isOldValueInline, "inlineTextChild is as expected");
  is(!container.canExpand, isOldValueInline, "canExpand property is as expected");

  let field = container.elt.querySelector("pre");
  is(field.textContent, oldValue,
     "The text node has the correct original value after selecting");
  setEditableFieldValue(field, newValue, inspector);

  info("Listening to the markupmutation event");
  yield onMutated;

  nodeValue = yield getFirstChildNodeValue(selector, testActor);
  is(nodeValue, newValue, "The test node's text content has changed");

  let isNewValueInline = newValue.length <= DEFAULT_VALUE_SUMMARY_LENGTH;
  is(!!container.inlineTextChild, isNewValueInline, "inlineTextChild is as expected");
  is(!container.canExpand, isNewValueInline, "canExpand property is as expected");

  if (isOldValueInline != isNewValueInline) {
    is(container.expanded, !isNewValueInline,
      "Container was automatically expanded/collapsed");
  }

  info("Selecting the <body> to reset the selection");
  let bodyContainer = yield getContainerForSelector("body", inspector);
  inspector.markup.markNodeAsSelected(bodyContainer.node);
}
