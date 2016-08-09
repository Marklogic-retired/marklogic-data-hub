var trace = require("/com.marklogic.hub/lib/trace-lib.xqy");


function transform(contenxt, params, content) {
  var response = content.toObject();

  for (var i = 0; i < response.results.length; i++) {
    var result = response.results[i];
    var doc = cts.doc(result.uri).root;
    result.content = trace.traceToJson(doc);
    response.pageLength = response['page-length'];
  }
  return response;
}

exports.transform = transform;
