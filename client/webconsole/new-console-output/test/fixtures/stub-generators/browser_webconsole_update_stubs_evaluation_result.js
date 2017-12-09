/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

Cu.import("resource://gre/modules/osfile.jsm", {});

add_task(function* () {
  let fileContent = yield generateEvaluationResultStubs();
  let filePath = OS.Path.join(`${BASE_PATH}/stubs`, "evaluationResult.js");
  yield OS.File.writeAtomic(filePath, fileContent);
  ok(true, "Make the test not fail");
});
