
var browser;

document.addEventListener('deviceready', function() {

  $(function() {
      if (!visitSite())
        $.mobile.changePage('#page-front', {changeHash: false});
  });

  $(document).on('pagechangefailed', function(ev, cb) {
    alert('pagechange failed :( '+cb.toPage);
  });

}, false);

// catch web intent
function handleOpenURL(url) {
  var url = $.url(url);
  setTimeout(function() {
    switch(url.attr('host')) {
    case 'set-default': 
      if (setDefault(url.param('base'), url.param('path'), url.param('token')))
        visitSite();
      break;
    case 'payment-return':
      // on returning from a payment, redirect to that page
      returnurl = decodeURIComponent(url.attr('path').substring(1));
      visitUrl(appendQuery(returnurl, url.attr('query')));
      break;
    default:
      // TODO leave app again
      break;
    }
  }, 0);
}


// open foodsoft website
function visitSite(path) {
  var url = pref.get('foodsoft_base');
  if (!url) {
    return false;
  }
  if (!path) {
    var path = pref.get('foodsoft_path');
    if (!path) path = 'payments/adyen/pin';
  }
  return visitUrl(url+'/'+path);
}


// open url in iframe (with hooks)
function visitUrl(url) {
  var page_id = 'foodsoft_adyen_pin';
  // always set mobile_app parameter to indicate we're the app
  var url = appendQuery(url, 'mobile_app=1');
  // and include token (now we have a query string already)
  if (pref.get('foodsoft_token'))
    url = appendQuery(url, 'token='+encodeURIComponent(pref.get('foodsoft_token')));
  // load and focus
  $.mobile.changePage('#page-site', {changeHash: false});
  $.mobile.loading('show');
  browser = window.open(url, '_blank', 'location=no,clearcache=yes,hidden=yes');
  browser.addEventListener('loadstart', function(ev) {
    if (ev.url.indexOf(pref.get('foodsoft_base'))!=0) {
      setTimeout(function() {
        // cancel navigation event by revisiting the page :/
        visitSite();
        // then open url externally
        window.open(ev.url, '_system');
      }, 0);
    }
  });
  browser.addEventListener('loadstop', function(ev) {
    $.mobile.loading('hide');
    browser.show();
    // when coming back to the main app, exit
    // http://community.phonegap.com/nitobi/topics/inappbrowser_dev_team_can_you_confirm_theses_issues_or_not#reply_12231482
    $(window).on('focus', function() {
      // for now, we exit the app when the inappbrowser is closed
      navigator.app.exitApp(); // TODO iOS
    });
  });
  browser.addEventListener('exit', function(ev) {
    browser = null;
  });
  return true;
}

// set site location
function setDefault(base, path, token) {
  if (!base) {
    alert('No URL given');
    return false;
  }
  if (!token) {
    alert('No token given');
    return false;
  }
  pref.set('foodsoft_base', base);
  pref.set('foodsoft_path', path);
  pref.set('foodsoft_token', token);
  return true;
}


// preferences in localStorage
var pref = {
  set: function(key, val) {
    if (val === undefined)
      window.localStorage.removeItem(key);
    else
      window.localStorage.setItem(key, val);
  },
  get: function getPref(key) {
    return window.localStorage.getItem(key);
  }
}

// set or append parameters to url query string
function appendQuery(url, params) {
  if (url.indexOf('?') >= 0)
    return url + '&' + params;
  else
    return url + '?' + params;
}

