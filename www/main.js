
document.addEventListener('deviceready', function() {
  $(function() {
    visitSite();
  });
});

// catch web intent
function handleOpenURL(url) {
  var url = $.url(url);
  // setTimeout needed for iOS
  setTimeout(function() {
    switch(url.attr('host')) {
    case 'set-default': 
      if (setDefault(url.param('base'), url.param('path'), url.param('token')))
        visitSite();
      break;
    case 'payment-return':
      // on returning from a payment, redirect to that page
      visitUrl(decodeURI(url.attr('path')) + '?' + url.attr('query'));
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
  // always set mobile_app parameter to indicate we're the app
  if (url.indexOf('?')>0)
    var url = url + '&amp;mobile_app=1';
  else
    var url = url + '?mobile_app=1';
  // and include token (now we have a query string already)
  if (pref.get('foodsoft_token'))
    url += '&amp;token='+encodeURI(pref.get('foodsoft_token'));
  // open in iframe
  $.mobile.changePage('#page-site', {changeHash: false});
  $.mobile.loading('show');
  $('#site-frame').load(function() {
    $.mobile.loading('hide');
  });
  $('#site-frame').attr('src', url);
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
