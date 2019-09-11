/* Custom steps for data hub 5 are 'on rails' code execution within a single transaction, after which the output
   from these steps will create in-memory objects that will then be written in one single, isolated transaction.

   This is designed to run in QUERY (read-only) mode by default. If you need transactionally consistent updates or
   serializable read locking on documents, then you must upgrade to an UPDATE transaction either through an update
   (such as declareUpdate()) or by setting the value of 'stepUpdate' as true in the options and it will be
   executed in update mode.
 */
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(content, options) {

  //grab the doc id/uri
  let id = content.uri;

  //here we can grab and manipulate the context metadata attached to the document
  let context = content.context;

  //let's set our output format, so we know what we're exporting
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  //here we check to make sure we're not trying to push out a binary or text document, just xml or json
  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
    datahub.debug.log({
      message: 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.',
      type: 'error'
    });
    throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.');
  }

  /*
  This scaffolding assumes we obtained the document from the database. If you are inserting information, you will
  have to map data from the content.value appropriately and create an instance (object), headers (object), and triples
  (array) instead of using the flowUtils functions to grab them from a document that was pulled from MarkLogic.
  Also you do not have to check if the document exists as in the code below.

  Example code for using data that was sent to MarkLogic server for the document
  let instance = content.value;
  let triples = [];
  let headers = {};
   */

  //Here is an example of a check to make sure it's still present in the cluster before operating on it
  if (!fn.docAvailable(id)) {
    datahub.debug.log({message: 'The document with the uri: ' + id + ' could not be found.', type: 'error'});
    throw Error('The document with the uri: ' + id + ' could not be found.')
  }

  //grab the 'doc' from the content value space
  let doc = content.value;

  // let's just grab the root of the document if its a Document and not a type of Node (ObjectNode or XMLNode)
  if (doc && (doc instanceof Document || doc instanceof XMLDocument)) {
    doc = fn.head(doc.root);
  }

  //get our instance, default shape of envelope is envelope/instance, else it'll return an empty object/array
  let instance = datahub.flow.flowUtils.getInstanceAsObject(doc) || {};

  // get triples, return null if empty or cannot be found
  let triples = datahub.flow.flowUtils.getTriplesAsObject(doc) || [];

  //gets headers, return null if cannot be found
  let headers = datahub.flow.flowUtils.getHeadersAsObject(doc) || {};

  //If you want to set attachments, uncomment here
  // instance['$attachments'] = instance;


  //insert code to manipulate the instance, triples, headers, uri, context metadata, etc.


  //form our envelope here now, specifying our output format
  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  //create our return content object, we have a handy helper function for creating a json scaffolding, but you
  //can also do a node-based one by using nodebuilder, especially if you're dealing with xml!
  let newContent = datahub.flow.flowUtils.createContentAsObject();

  //assign our envelope value
  newContent.value = envelope;

  //assign the uri we want, in this case the same
  newContent.uri = id;

  //assign the context we want
  newContent.context = context;

  //now let's return out our content to be written, it can be any combination of
  return newContent;
}

module.exports = {
  main: main
};
