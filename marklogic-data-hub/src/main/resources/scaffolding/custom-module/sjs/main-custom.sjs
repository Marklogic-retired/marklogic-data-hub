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
  const inputDocument = content.value;

  // DHF recommends wrapping documents in an envelope, particularly for curated documents based on an entity model.
  // If your input document is already an envelope, you can typically just call toObject() it and modify what you need.
  // Otherwise, the below code is a starting point for constructing the 3 parts of an envelope.
  // If your input document is XML and you need to modify it, it is recommended to generate an XQuery custom step instead.´
  const instance = inputDocument.toObject();
  const headers = {};
  const triples = [];

  // If you are creating a new entity instance, it is recommended to define the entity type name, and optionally the version,
  // as shown below. This will result in an envelope/instance/info block being added to your document, as well as your instance
  // data being located under envelope/instance/(entity type name).
  // instance['$type'] = 'myEntityTypeName';
  // instance['$version'] = '0.0.1';

  // If you would like to include the input document as an attachment in the envelope, you can do so via the below code.
  // instance['$attachments'] = [inputDocument];

  // makeEnvelope is a convenience function for building an envelope with the inputs that were defined above.
  // You may wish to specify the output format in your step configuration. But for a custom step, which is typically coded
  // based on an expected output format, it's usually simpler to define the output format in the code.
  const outputFormat = 'json';
  const envelope = flowApi.makeEnvelope(instance, headers, triples, outputFormat);

  // Return a new content object. You may also modify the incoming content object and return it instead.
  // You may also choose any URI that you want, and either modify the content.context object or construct a new context object
  // based on the ContentObject schema that is referenced above.
  return {
    uri: content.uri,
    value: envelope,
    context: content.context
  };
}

module.exports = {
  main
};
