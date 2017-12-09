/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// Test that classes can be toggled in the class panel

add_task(function* () {
  yield addTab("data:text/html;charset=utf-8,<body class='class1 class2'>");
  let {view, testActor} = yield openRuleView();

  info("Open the class panel");
  view.showClassPanel();

  info("Click on class1 and check that the checkbox is unchecked and the DOM is updated");
  yield toggleClassPanelCheckBox(view, "class1");
  checkClassPanelContent(view, [
    {name: "class1", state: false},
    {name: "class2", state: true}
  ]);
  let newClassName = yield testActor.getAttribute("body", "class");
  is(newClassName, "class2", "The class attribute has been updated in the DOM");

  info("Click on class2 and check the same thing");
  yield toggleClassPanelCheckBox(view, "class2");
  checkClassPanelContent(view, [
    {name: "class1", state: false},
    {name: "class2", state: false}
  ]);
  newClassName = yield testActor.getAttribute("body", "class");
  is(newClassName, "", "The class attribute has been updated in the DOM");

  info("Click on class2 and checks that the class is added again");
  yield toggleClassPanelCheckBox(view, "class2");
  checkClassPanelContent(view, [
    {name: "class1", state: false},
    {name: "class2", state: true}
  ]);
  newClassName = yield testActor.getAttribute("body", "class");
  is(newClassName, "class2", "The class attribute has been updated in the DOM");

  info("And finally, click on class1 again and checks it is added again");
  yield toggleClassPanelCheckBox(view, "class1");
  checkClassPanelContent(view, [
    {name: "class1", state: true},
    {name: "class2", state: true}
  ]);
  newClassName = yield testActor.getAttribute("body", "class");
  is(newClassName, "class1 class2", "The class attribute has been updated in the DOM");
});
