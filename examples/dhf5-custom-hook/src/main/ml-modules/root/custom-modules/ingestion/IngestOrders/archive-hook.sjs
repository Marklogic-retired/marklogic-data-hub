/**
 * This is a simple example (not prescriptive, just an example), of a custom hook that determines if the incoming order
 * is a duplicate of an existing order in the staging database, and if so, the existing order is archived. The benefit
 * of using a custom hook is that an update transaction has less impact here vs performing an update in the main module.
 */
declareUpdate();

// A custom hook receives the following parameters via DHF. Each can be optionally declared.
var uris; // an array of URIs (may only be one) being processed
var content; // an array of objects for each document being processed
var options; // the options object passed to the step by DHF
var flowName; // the name of the flow being processed
var stepNumber; // the index of the step within the flow being processed; the first step has a step number of 1
var step; // the step definition object

// Custom hooks can define zero or more properties in the step definition that declares them
var archiveCollection;

for (const contentObject of content) {
  const order = contentObject.value;

  /**
   * If a hook is configured with runBefore = true, then the content value will be the "raw" data, not yet wrapped in
   * an envelope. If it's configured with runBefore = false, which is the case in this example, then the content value
   * will be an envelope.
   */
  const instance = order.envelope.instance;

  /**
   * Note that for better performance, a single query should be done based on all of the objects in the content
   * array. This works fine though for the small set of data being ingested in this example.
   */
  const existingDuplicateOrders = cts.search(cts.andQuery([
    cts.collectionQuery("IngestOrders"),
    cts.jsonPropertyValueQuery("id", instance.id),
    cts.jsonPropertyValueQuery("customer", instance.customer),
    cts.jsonPropertyValueQuery("order_date", instance.order_date),
    cts.jsonPropertyValueQuery("product_id", instance.product_id)
  ]));

  for (const duplicateOrder of existingDuplicateOrders) {
    const duplicateUri = xdmp.nodeUri(duplicateOrder);
    // Generate a random URI so that previously archived documents are never overwritten
    const archiveUri = "/archive/" + sem.uuidString() + duplicateUri;
    xdmp.documentInsert(archiveUri, duplicateOrder, xdmp.documentGetPermissions(duplicateUri), archiveCollection);
    xdmp.documentDelete(duplicateUri);
  }
}
