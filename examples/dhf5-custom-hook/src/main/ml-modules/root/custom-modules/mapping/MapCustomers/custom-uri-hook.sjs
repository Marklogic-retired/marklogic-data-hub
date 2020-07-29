/**
 * This is a simple example (not prescriptive, just an example), of a custom hook to override the document URI.
 */
declareUpdate();

// A custom hook receives the following parameters via DHF. Each can be optionally declared.
var uris; // an array of URIs (may only be one) being processed
var content; // an array of objects for each document being processed
var options; // the options object passed to the step by DHF
var flowName; // the name of the flow being processed
var stepNumber; // the index of the step within the flow being processed; the first step has a step number of 1
var step; // the step definition object

content.forEach(c => {
  let value = c.value.toObject();
  // Validate the ID property is in the instance
  if (value.envelope &&
    value.envelope.instance &&
    value.envelope.instance.Customer &&
    value.envelope.instance.Customer.id) {

    // Extract the id and construct a new URI
    let id = value.envelope.instance.Customer.id;
    let newUri = '/customers/' + sem.uuidString() + '/' + id + '.json';

    // Set the contents new URI
    c.uri = newUri;
  }
})
