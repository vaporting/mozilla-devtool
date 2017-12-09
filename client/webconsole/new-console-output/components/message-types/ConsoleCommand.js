/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// React & Redux
const { createFactory } = require("devtools/client/shared/vendor/react");
const PropTypes = require("devtools/client/shared/vendor/react-prop-types");
const Message = createFactory(require("devtools/client/webconsole/new-console-output/components/Message"));

ConsoleCommand.displayName = "ConsoleCommand";

ConsoleCommand.propTypes = {
  message: PropTypes.object.isRequired,
  timestampsVisible: PropTypes.bool.isRequired,
  serviceContainer: PropTypes.object,
};

/**
 * Displays input from the console.
 */
function ConsoleCommand(props) {
  const {
    message,
    timestampsVisible,
    serviceContainer,
  } = props;

  const {
    indent,
    source,
    type,
    level,
    messageText: messageBody,
  } = message;

  return Message({
    source,
    type,
    level,
    topLevelClasses: [],
    messageBody,
    serviceContainer,
    indent,
    timestampsVisible,
  });
}

module.exports = ConsoleCommand;
