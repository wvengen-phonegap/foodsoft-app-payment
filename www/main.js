
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
      if (setDefault(url.param('base'), url.param('path'), url.param('key')))
        visitSite();
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
  if (window.localStorage.getItem('foodsoft_key')) {
    path += '?key=' + pref.get('foodsoft_key');
  }

  $.mobile.changePage('#page-site', {changeHash: false});
  $.mobile.loading('show');
  $('#site-frame').load(function() {
    $.mobile.loading('hide');
  });
  $('#site-frame').attr('src', url+'/'+path);
  return true;
}

// set site location
function setDefault(base, path, key) {
  if (!base) {
    alert('No URL given');
    return false;
  }
  if (!key) {
    alert('No key given');
    return false;
  }
  pref.set('foodsoft_base', base);
  pref.set('foodsoft_path', path);
  pref.set('foodsoft_key', key);
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
