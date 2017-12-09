/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {AddonManager} = require("resource://gre/modules/AddonManager.jsm");
const Services = require("Services");
const {getJSON} = require("devtools/client/shared/getjson");
const EventEmitter = require("devtools/shared/old-event-emitter");

var ADB_LINK = Services.prefs.getCharPref("devtools.webide.adbAddonURL");
var ADB_ADDON_ID = Services.prefs.getCharPref("devtools.webide.adbAddonID");

var platform = Services.appShell.hiddenDOMWindow.navigator.platform;
var OS = "";
if (platform.indexOf("Win") != -1) {
  OS = "win32";
} else if (platform.indexOf("Mac") != -1) {
  OS = "mac64";
} else if (platform.indexOf("Linux") != -1) {
  if (platform.indexOf("x86_64") != -1) {
    OS = "linux64";
  } else {
    OS = "linux32";
  }
}

var addonsListener = {};
addonsListener.onEnabled =
addonsListener.onDisabled =
addonsListener.onInstalled =
addonsListener.onUninstalled = (updatedAddon) => {
  let addons = GetAvailableAddons();
  addons.adb.updateInstallStatus();
};
AddonManager.addAddonListener(addonsListener);

var AvailableAddons = null;
var GetAvailableAddons = exports.GetAvailableAddons = function () {
  if (!AvailableAddons) {
    AvailableAddons = {
      adb: new ADBAddon()
    };
  }
  return AvailableAddons;
};

exports.ForgetAddonsList = function () {
  AvailableAddons = null;
};

function Addon() {}
Addon.prototype = {
  _status: "unknown",
  set status(value) {
    if (this._status != value) {
      this._status = value;
      this.emit("update");
    }
  },
  get status() {
    return this._status;
  },

  updateInstallStatus: function () {
    AddonManager.getAddonByID(this.addonID, (addon) => {
      if (addon && !addon.userDisabled) {
        this.status = "installed";
      } else {
        this.status = "uninstalled";
      }
    });
  },

  install: function () {
    AddonManager.getAddonByID(this.addonID, (addon) => {
      if (addon && !addon.userDisabled) {
        this.status = "installed";
        return;
      }
      this.status = "preparing";
      if (addon && addon.userDisabled) {
        addon.userDisabled = false;
      } else {
        AddonManager.getInstallForURL(this.xpiLink, (install) => {
          install.addListener(this);
          install.install();
        }, "application/x-xpinstall");
      }
    });
  },

  uninstall: function () {
    AddonManager.getAddonByID(this.addonID, (addon) => {
      addon.uninstall();
    });
  },

  installFailureHandler: function (install, message) {
    this.status = "uninstalled";
    this.emit("failure", message);
  },

  onDownloadStarted: function () {
    this.status = "downloading";
  },

  onInstallStarted: function () {
    this.status = "installing";
  },

  onDownloadProgress: function (install) {
    if (install.maxProgress == -1) {
      this.emit("progress", -1);
    } else {
      this.emit("progress", install.progress / install.maxProgress);
    }
  },

  onInstallEnded: function ({addon}) {
    addon.userDisabled = false;
  },

  onDownloadCancelled: function (install) {
    this.installFailureHandler(install, "Download cancelled");
  },
  onDownloadFailed: function (install) {
    this.installFailureHandler(install, "Download failed");
  },
  onInstallCancelled: function (install) {
    this.installFailureHandler(install, "Install cancelled");
  },
  onInstallFailed: function (install) {
    this.installFailureHandler(install, "Install failed");
  },
};

function ADBAddon() {
  EventEmitter.decorate(this);
  // This addon uses the string "linux" for "linux32"
  let fixedOS = OS == "linux32" ? "linux" : OS;
  this.xpiLink = ADB_LINK.replace(/#OS#/g, fixedOS);
  this.addonID = ADB_ADDON_ID;
  this.updateInstallStatus();
}
ADBAddon.prototype = Object.create(Addon.prototype);
