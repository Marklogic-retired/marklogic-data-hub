(function () {

  'use strict';

  $('div.embed-git').each(function(index, item) {
    var div = $(item)
    var url = div.attr('href');
    console.log(url);
    $.ajax(url).then(function(resp) {
      console.log(resp);
      div.html('<pre class="prettyprint">' + resp + '</pre>');
    });
  });
})();
