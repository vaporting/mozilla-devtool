/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */
"use strict";

const {
  createFactory,
} = require("devtools/client/shared/vendor/react");
// Test utils.
const expect = require("expect");
const { render } = require("enzyme");

const ConsoleOutput = createFactory(require("devtools/client/webconsole/new-console-output/components/ConsoleOutput"));
const serviceContainer = require("devtools/client/webconsole/new-console-output/test/fixtures/serviceContainer");
const { setupStore } = require("devtools/client/webconsole/new-console-output/test/helpers");
const {initialize} = require("devtools/client/webconsole/new-console-output/actions/ui");
const {
  getInitialMessageCountForViewport
} = require("devtools/client/webconsole/new-console-output/utils/messages.js");

const MESSAGES_NUMBER = 100;
function getDefaultProps(initialized) {
  const store = setupStore(
    Array.from({length: MESSAGES_NUMBER})
      // Alternate message so we don't trigger the repeat mechanism.
      .map((_, i) => i % 2 ? "new Date(0)" : "console.log(NaN)")
  );

  if (initialized) {
    store.dispatch(initialize());
  }

  return {
    store,
    serviceContainer,
  };
}

describe("ConsoleOutput component:", () => {
  it("Render only the last messages that fits the viewport when non-initialized", () => {
    const rendered = render(ConsoleOutput(getDefaultProps(false)));
    const messagesNumber = rendered.find(".message").length;
    expect(messagesNumber).toBe(getInitialMessageCountForViewport(window));
  });

  it("Render every message when initialized", () => {
    const rendered = render(ConsoleOutput(getDefaultProps(true)));
    expect(rendered.find(".message").length).toBe(MESSAGES_NUMBER);
  });
});
