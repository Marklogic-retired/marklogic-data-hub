
function get(context, params) {
  // return zero or more document nodes

};

function post(context, params, input) {
  // return zero or more document nodes
};

function put(context, params, input) {
  // return at most one document node
};

function deleteFunction(context, params) {
  // return at most one document node
};


/*
	This module will have two functions:
	1) a GET function will accept a parameter called query and it will execute the users search and return the appropriate results
	2) an ERROR function will return an error if one occurs
*/

'use strict';

function doSearch(context, params) {

	const collectionstring = params.q 
    const collectionsarray = collectionstring.split(',')


	//defining the data we want extracted and returned
	const myPaths = { paths: ['/envelope/instance/Provider/ProviderName', 
	                          '/envelope/instance/Provider/NPI',
	                          '/envelope/instance/Provider/State',
	                          '/envelope/instance/Provider/City',
	                          '/envelope/instance/Provider/Zip'] };

	//defining the custom grammar components
	
/*	const myGrammar = { salary: cts.jsonPropertyReference('baseSalary'), 
	                    dept: cts.jsonPropertyReference('department') };
*/	
	// grammar for current indexes
	//const myGrammar = { salary: cts.jsonPropertyReference('baseSalary') };


	// conditional check to ensure the q variable is not undefined or null
	if (collectionstring) { 	

		// do the search and return results
		const jsearch = require('/MarkLogic/jsearch');
		const resultdocs = jsearch.collections(collectionsarray)
		    .documents()
		    .slice(0,4000000000)
		    .map({ extract: myPaths })
		    .result();

		//for testing, lets output the value of q
		context.outputStatus = [200, 'request was a success and exported data for collection: ' + collectionstring];
		return (resultdocs);

	} else {
		
		context.outputStatus = [200, 'request was a success but q: ' + collectionstring + ' did not make sense'];

		return ('sorry, we could not understand your search.');		
	}

};

function returnErrToClient(statusCode, statusMsg, body) {
	fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([statusCode, statusMsg, body]));
};

exports.GET = doSearch;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
