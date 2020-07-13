var contentArray;
var options;

// This is passed in because it's defined in the processors config in the flow file
var exampleVariable;

contentArray.forEach(content => {
  // The entity-services-mapping step results in "value" being a node, so must call toObject first
  const contentValue = content.value.toObject();

  // Variables can be used to affect the behavior of a reusable processor; just logging the value in this example
  console.log("Received exampleVariable value: " + exampleVariable);

  // Example of mapping data from the source document, located in the attachment, to the header
  const orderDate = contentValue.envelope.attachments.envelope.instance.OrderDate;
  contentValue.envelope.headers.mappedOrderDate = orderDate;

  content.value = contentValue;
});
