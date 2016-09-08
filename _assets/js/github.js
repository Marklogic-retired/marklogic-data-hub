(function () {

  'use strict';

  $('div.embed-git').each(function(index, item) {
    var div = $(item)
    var url = div.attr('href');
    $.ajax(url).then(function(resp) {
      div.html('<pre class="prettyprint">' + resp + '</pre>');
    });
  });
})();
