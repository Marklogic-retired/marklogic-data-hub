'use strict'

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

  let source;

  // for xml we need to use xpath
  if (doc && xdmp.nodeKind(doc) === 'element' && doc instanceof XMLDocument) {
    source = fn.head(doc.xpath('/*:envelope/*:instance/node()'));
  }
  // for json we need to return the instance
  else if (doc && doc instanceof Document) {
    source = fn.head(doc.root);
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
  // now check to see if we have XML or json, then just go to the instance
  if (source instanceof Element) {
    source = fn.head(source.xpath('/*:envelope/*:instance/*:root/node()'))
  } else if (source instanceof ObjectNode) {
    source = source.envelope.instance;
  }
  let sku = !fn.empty(source.sku || source.SKU) ? xs.string(fn.head(source.sku || source.SKU)) : null;
  let price = !fn.empty(source.price) ? xs.decimal(fn.head(source.xpath('//price'))) : null;
  let title = !fn.empty(source.title) ? xs.string(fn.head(source.title)) : null;

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'Product',
    '$version': '0.0.1',
    'sku': sku,
    'price': price,
    'title': title
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