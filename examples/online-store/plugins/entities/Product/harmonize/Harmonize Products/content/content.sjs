
/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {
  let doc = cts.doc(id);
  let root = doc.root.toObject();

  let source;

  // for xml we need to use xpath
  if (root && xdmp.nodeKind(root) === 'element') {
    source = root.xpath('/*:envelope/*:instance/node()');
  }
  // for json we need to return the instance
  else if (root && root.envelope && root.envelope.instance) {
    source = root.envelope.instance;
  }
  // for everything else
  else {
    source = doc;
  }

  return extractInstanceProduct(source);
}

/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a Product
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceProduct(source) {
  // the original source documents
  let attachments = source;

  let sku = xs.string(source.sku || source.SKU);
  let price = xs.decimal(source.price);

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'Product',
    '$version': '0.0.1',
    'sku': sku,
    'price': price
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

