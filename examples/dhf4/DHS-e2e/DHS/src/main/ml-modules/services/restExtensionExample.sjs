// GET
//
// This function returns a document node corresponding to each
// user-defined parameter in order to demonstrate the following
// aspects of implementing REST extensions:
// - Returning multiple documents
// - Overriding the default response code
// - Setting additional response headers
//
function get(context, params) {
  var results = [];
  context.outputTypes = [];
  for (var pname in params) {
    if (params.hasOwnProperty(pname)) {
      results.push({title: params[pname], result: getCustomerWithSalesAsTitle(params[pname])});
      context.outputTypes.push('application/json');
    }
  }

  // Return a successful response status other than the default
  // using an array of the form [statusCode, statusMessage].
  // Do NOT use this to return an error response.
  context.outputStatus = [201, 'Yay'];

  // Set additional response headers using an object
  context.outputHeaders =
    {'X-My-Header1' : 42, 'X-My-Header2': 'h2val' };

  // Return a Sequence to return multiple documents
  return Sequence.from(results);
};

// GET Helper Function
//
function getCustomerWithSalesAsTitle(contactTitle) {
  var wordMatch = Sequence.from(cts.elementWordMatch(xs.QName("ContactTitle"), "*"+contactTitle+"*", ["collation=http://marklogic.com/collation/codepoint", "case-insensitive"])).toArray();
  return cts.search(cts.orQuery([cts.elementWordQuery(xs.QName('ContactTitle'), wordMatch), cts.jsonPropertyWordQuery('ContactTitle', wordMatch)]))
};


// Include an export for each method supported by your extension.
exports.GET = get;
