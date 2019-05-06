/**
 * This is a simple example (not prescriptive, just an example), of a custom hook that determines if the incoming order
 * is a duplicate of an existing order in the staging database, and if so, the existing order is archived. The benefit
 * of using a custom hook is that an update transaction has less impact here vs performing an update in the main module.
 */
declareUpdate();

// A custom hook will always receive an array of URIs
var uris;

// Custom hooks can define zero or more properties in the step definition that declares them
var archiveCollection;

for (const doc of cts.search(cts.documentQuery(uris))) {
  const order = doc.toObject();
  const instance = order.envelope.instance;
  const existingDuplicateOrders = cts.search(cts.andQuery([
    cts.collectionQuery("Order"),
    cts.jsonPropertyValueQuery("id", instance.id),
    cts.jsonPropertyValueQuery("customer", instance.customer),
    cts.jsonPropertyValueQuery("order_date", instance.order_date),
    cts.jsonPropertyValueQuery("product_id", instance.product_id)
  ]));

  for (const duplicateOrder of existingDuplicateOrders) {
    const duplicateUri = xdmp.nodeUri(duplicateOrder);
    // Generate a random URI so that previously archived documents are never overwritten
    const archiveUri = "/archive/" + sem.uuidString() + ".json";
    xdmp.documentInsert(archiveUri, duplicateOrder, xdmp.documentGetPermissions(duplicateUri), archiveCollection);
  }
}
