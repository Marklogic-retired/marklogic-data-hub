
/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {
  const jsearch = require('/MarkLogic/jsearch');

  // find every order document with id == the passed in id variable
  var orders = jsearch
    .collections('Order')
    .documents()
    .where(
      jsearch.byExample({
        'id': id
      })
    )
    .result('value')
    .results.map(function(doc) {
      return doc.document.envelope.instance;
    });

  // the original source documents
  var attachments = orders;

  /* The following property is a local reference. */
  var products = [];
  var price = 0;

  for (var i = 0; i < orders.length; i++) {
    var order = orders[i];
    if (order.sku) {
      // either return an instance of a Product
      // product = extractInstanceProduct(item.Product);

      // or a reference to a Product
      products.push(makeReferenceObject('Product', order.sku));
      price += xs.decimal(parseFloat(order.price)) * xs.decimal(parseInt(order.quantity, 10));
    }
  }

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'Order',
    '$version': '0.0.1',
    'id': id,
    'products': products,
    'price': price,
  }
};

function makeReferenceObject(type, ref) {
  return {
    '$type': type,
    '$ref': ref
  };
}

module.exports = {
  createContent: createContent
};

