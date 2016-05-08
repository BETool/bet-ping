'use strict';

const BET_FIRST_INSTALL_UID = '__bet_install_uid'
const BET_FIRST_INSTALL_FLAG = '__bet_install_flag'
const BET_FIRST_DAY_UID = '__bet_day_uid'
const BET_FIRST_DAY_FLAG = '__bet_day_flag'

const ua_id = 'UA-77440563-1';
const domain = 'http://x.drive2-walls.ru';
const prefix = '/drive2-walls/';
const moz_strorage_id = 'http://d2w_loader.mozilla.storage';
var msg_prefix = 'v1/';

const userAgent = window.navigator.userAgent.toLowerCase();

let browser = {
  version: (userAgent.match( /.+(?:me|ox|on|rv|it|era|opr|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
  opera: (/opera/i.test(userAgent) || /opr/i.test(userAgent)),
  msie: (/msie/i.test(userAgent) && !/opera/i.test(userAgent) || /trident\//i.test(userAgent)),
  mozilla: /firefox/i.test(userAgent),
  chrome: /chrome/i.test(userAgent),
  safari: (!(/chrome/i.test(userAgent)) && /webkit|safari|khtml/i.test(userAgent)),
  maxthon: /maxthon/i.test(userAgent),
  mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/i.test(userAgent),
  mac: /mac/i.test(userAgent)
};

let msg_type = 'def';
if (browser.chrome) {
  msg_type = 'ch';
} else if (browser.mozilla) {
  msg_type = 'moz';
} else if (browser.opera || !browser.chrome) {
  msg_type = 'op';
} else if (browser.safari) {
  msg_type = 'sf';
} else if (browser.maxthon) {
  msg_type = 'mx';
}

msg_prefix += msg_type + '/';

if (typeof console == 'undefined' && typeof Components !='undefined' && Components.classes) {
  var aConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
  var console = {
    log: function (str) {
      aConsoleService.logStringMessage(str);
    }
  };
}

function req (url) {
  if (typeof Image != 'undefined') {
    var img = new Image();
    img.src = url;
  } else if (typeof require != 'undefined') {
    var Request = require('sdk/request').Request;
    var _req = Request({
      url: url,
      onComplete: function (response) { }
    });
    _req.get();
  } else {
    console.log('GET request fail');
  }
}

function get (key) {
  if (typeof Components != 'undefined' && Components.classes) {
    var url = moz_strorage_id;
    var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
    var ssm = Components.classes['@mozilla.org/scriptsecuritymanager;1'].getService(Components.interfaces.nsIScriptSecurityManager);
    var dsm = Components.classes['@mozilla.org/dom/storagemanager;1'].getService(Components.interfaces.nsIDOMStorageManager);
    var uri = ios.newURI(url, '', null);
    var principal = ssm.getCodebasePrincipal(uri);
    var storage = dsm.getLocalStorageForPrincipal(principal, '');
    return storage.getItem(key);
  }
  return window.localStorage[key];
}

function set(key,val) {
  if (typeof Components != 'undefined' && Components.classes){
    var url = moz_strorage_id;
    var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
    var ssm = Components.classes['@mozilla.org/scriptsecuritymanager;1'].getService(Components.interfaces.nsIScriptSecurityManager);
    var dsm = Components.classes['@mozilla.org/dom/storagemanager;1'].getService(Components.interfaces.nsIDOMStorageManager);
    var uri = ios.newURI(url, '', null);
    var principal = ssm.getCodebasePrincipal(uri);
    var storage = dsm.getLocalStorageForPrincipal(principal, '');
    storage.setItem(key, val);
  } else {
    window.localStorage[key] = val;
  }
}

function sendGA (prefix, message) {
  var c_prefix = prefix;
  var c_message = message;

  setTimeout(function () {
    var i, img, message, now, params, prefix, uid, variables;
    now = Date.now();

    if (get(BET_FIRST_INSTALL_UID) == null) {
      uid = String(parseInt(Math.random() * 1e9));
      set(BET_FIRST_INSTALL_UID, uid);
    } else {
      uid = get(BET_FIRST_INSTALL_UID);
    }

    if (get(BET_FIRST_DAY_UID) == null) {
      set(BET_FIRST_DAY_UID, now);
    }

    variables = {
      tid: ua_id,
      cid: uid + '.' + now,
      t: 'pageview',
      dl: domain + c_prefix + c_message,
      de: 'windows-1251',
      v: '1',
      _v: 'j19',
      _s: 1
    };

    params = ((function () {
      var _results;
      _results = [];
      for (i in variables) {
        _results.push('' + (encodeURIComponent(i)) + '=' + (encodeURIComponent(variables[i])));
      }
      return _results;
    })()).join('&');

    req('http://www.google-analytics.com/collect?' + params);
  }, 0);
}

module.exports = function () {
  let d = new Date();
  let dayFlag = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  if (!get(BET_FIRST_INSTALL_FLAG)) {
    sendGA(prefix, msg_prefix + 'firstlaunch');
    set(BET_FIRST_INSTALL_FLAG, true);
  }
  if (get(BET_FIRST_DAY_FLAG) != dayFlag) {
    sendGA(prefix, msg_prefix + 'dayfirstlaunch');
    set(BET_FIRST_DAY_FLAG, dayFlag);
  }
}
