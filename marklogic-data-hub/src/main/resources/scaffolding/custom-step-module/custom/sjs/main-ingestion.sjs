/**
 * This shows an example of a custom ingestion step, this is for when data comes into the data hub
 * We must construct an envelope wrapper about it and add any metadata or in-flight transforms here
 * so it is persisted once written to the database.
 *
 * Anytime data is sent to a step that is not from the database, it is mutable
 */


//If you'd like to construct triples using the semantics library, uncomment below
//const sem = require("/MarkLogic/semantics.xqy");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(content, options) {

  //example of how to check options for an input format in case we wanted to do operations based on type
  //let inputFormat = options.inputFormat ? options.inputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  //What output format do we want for the data?
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  //Example of error checking for data types
  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML && outputFormat !== datahub.flow.consts.BINARY && outputFormat !== datahub.flow.consts.TEXT) {
    let errMsg = 'The output format of type ' + outputFormat + ' is invalid. Valid options are '
      + datahub.flow.consts.XML + ' , ' + datahub.flow.consts.JSON + ', '+ datahub.flow.consts.TEXT +' or' + datahub.flow.consts.BINARY + '.';
    datahub.debug.log({message: errMsg, type: 'error'});
    throw Error(errMsg);
  }

  //we're going to grab the value of the content that was passed in, and use that to define our instance
  let instance = content.value.root || content.value;

  //If the type of data is binary OR the expected output was set to unstructured data (binary/text), let's return it as is.
  if (instance.nodeType === Node.BINARY_NODE || outputFormat === datahub.flow.consts.BINARY || outputFormat === datahub.flow.consts.TEXT) {
    return content;
  }
  else if (instance.nodeType === Node.TEXT_NODE) {
    //if it's text, and we want json or xml, let's try to parse it. If it can't, it'll throw an unchecked error.
    instance = datahub.flow.flowUtils.parseText(instance, outputFormat);
  }

  //let's create our triples array.
  let triples = [];

  //now our headers for any document level metadata
  let headers = datahub.flow.flowUtils.createHeaders(options);

  //And lastly we put it all together in an envelope structure
  content.value = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  //Context changes are possible, here we show how to grab the context and example manipulate it
  //let context = content.context;
  //Get permissions, we can manipulate them here
  //let permissions = context.permissions;

  //uri is set on content.uri
  //content.uri = "my/new/uri.json";

  //Now we return out our 'content' object to be written
  return content;
}

module.exports = {
  main: main
};
