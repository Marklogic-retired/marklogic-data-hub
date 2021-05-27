/**
 * This scaffolded step module provides a template for implementing your own logic as a DHF ingestion step.
 * All of the comments in this module are intended to explain how to implement a DHF ingestion step. You are free to delete
 * any or all of the comments at any point.
 */

 const flowApi = require('/data-hub/public/flow/flow-api.sjs');

 /**
  * Performs the main step processing on the given content, returning zero or many content objects. DHF will run this function
  * in query (read-only) mode, as the intent of a step is for it to return content objects that DHF will then handle persisting.
  *
  * The content argument is either a content object, as defined by
  * https://github.com/marklogic/marklogic-data-hub/blob/master/specs/models/ContentObject.schema.json, or it is an array of content
  * objects defined by that same schema. Whether or not content object is an array is determined by the tool ingesting data.
  * For example, when using the DHF mlRunIngest REST transform, content will be a single object. When using the DHF transform for
  * MLCP, content will be an array.
  *
  * @param content either a single content object, or an array of content objects
  * @param options an object consisting of combined options from the runtime options, the step configuration, the flow options,
  *  and the step definition options
  * @returns a content object, or an array of content objects, depending on the tool ingesting data
  */
 function main(content, options) {
   const inputDocument = content.value;

   // DHF recommends wrapping documents in an envelope, particularly for curated documents based on an entity model.
   // The below code is a starting point for constructing the 3 parts of an envelope.
   // If your input document is XML and you need to modify it, it is recommended to generate an XQuery custom step instead.´
   const instance = inputDocument.toObject();
   const headers = {};
   const triples = [];

   // makeEnvelope is a convenience function for building an envelope with the inputs that were defined above.
   // You may wish to specify the output format in your step configuration. But for a custom step, which is typically coded
   // based on an expected output format, it's usually simpler to define the output format in the code.
   const outputFormat = 'json';
   content.value = flowApi.makeEnvelope(instance, headers, triples, outputFormat);

   // If this ingestion step is being referenced via the DHF transform for MLCP, you may also modify the 'uri' and
   // 'context' properties. This is not allowed though when referencing the step via the DHF mlRunIngest REST transform,
   // as a REST transform does not allow for these properties to be modified.
   // content.uri = "/test" + content.uri;
   // content.context.collections = ["my-collection"];
   // content.context.permissions = [xdmp.permission("data-hub-common", "read"), xdmp.permission("data-hub-common", "update")];

   return content;
 }

 module.exports = {
   main
 };
