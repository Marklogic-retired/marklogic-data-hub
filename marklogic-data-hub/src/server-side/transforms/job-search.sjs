var perf = require("/com.marklogic.hub/lib/perflog-lib.xqy");
var debug = require("/com.marklogic.hub/lib/debug-lib.xqy");

function transform(context, params, content) {
  debug.dumpEnv();

  return perf.log('/transforms/job-search:transform', function() {
    var response = content.toObject();

    for (var i = 0; i < response.results.length; i++) {
      var result = response.results[i];
      var doc = cts.doc(result.uri).root;
      result.content = doc;
      response.pageLength = response['page-length'];
    }

    return response;
  });
}

exports.transform = transform;
