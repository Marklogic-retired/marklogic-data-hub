var trace = require("/com.marklogic.hub/lib/trace-lib.xqy");

function transform(context, params, content) {
  var response = content.toObject();

  for (var i = 0; i < response.results.length; i++) {
    var result = response.results[i];
    var doc = cts.doc(result.uri);
    result.content = trace.traceToJsonSlim(doc);
    response.pageLength = response['page-length'];
  }
  return response;
}

exports.transform = transform;
