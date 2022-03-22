/**
 * This scaffolded step module provides a template for implementing your own logic as a DHF step.
 * All of the comments in this module are intended to explain how to implement a DHF step. You are free to delete
 * any or all of the comments at any point.
 */

const flowApi = require('/data-hub/public/flow/flow-api.sjs');

/**
 * Performs the main step processing on the given content, returning zero or many content objects. DHF will run this function
 * in query (read-only) mode, as the intent of a step is for it to return content objects that DHF will then handle persisting.
 *
 * The content argument is either a content object, as defined by
 * https://github.com/marklogic/marklogic-data-hub/blob/master/specs/models/ContentObject.schema.json, or it is an array of content
 * objects defined by that same schema. The argument will be an array if acceptsBatch=true in the step configuration.
 *
 * The function must return a single content object or an array of content objects, defined by the same ContentObject schema
 * referenced above. A returned content object may be the content object that was passed into this function, or it may be a
 * new content object.
 *
 * @param content either a single content object, or an array of content objects
 * @param options an object consisting of combined options from the runtime options, the step configuration, the flow options,
 *  and the step definition options
 * @returns a content object, or an array of content objects
 */
function main(content, options) {
  let testInvokeQueryMode =
    xdmp.invokeFunction
    (
      function(){ return cts.uris(null, ["limit=1"]);},
      {
        database: xdmp.database(),
        transactionMode: "query",
        isolation: "different-transaction"
      }
    );

  let testInvokeUpdateMode= xdmp.invokeFunction
  (
    function(){xdmp.documentInsert(
      '/testInsert.json',
      {test:'new content here'},
      {metadata: {'valid-start' : '2014-06-03T14:13:05.472585-07:00',
          'valid-end' : '9999-12-31T11:59:59Z'}, collections: ["separateTransaction"]})},{
      database: xdmp.database(),
      transactionMode: "update-auto-commit",
      isolation: "different-transaction"
    });
  return {
    uri: "/new/" + content.uri,
    value: content.value,
    context: content.context
  };
}

module.exports = {
  main
};
