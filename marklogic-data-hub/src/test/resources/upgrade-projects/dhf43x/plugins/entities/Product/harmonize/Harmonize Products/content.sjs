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
  if(doc && xdmp.nodeKind(doc) === 'element' && doc instanceof XMLDocument) {
    source = doc
  }
  // for json we need to return the instance
  else if(doc && doc instanceof Document) {
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
  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/*:envelope/*:instance';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  /* These mappings were generated using mapping: Product Mapping, version: 2 on 2019-04-09T10:10:47.505299-07:00.*/
  let sku = !fn.empty(fn.head(source.xpath('//SKU'))) ? xs.string(fn.head(fn.head(source.xpath('//SKU')))) : null;
  let price = !fn.empty(fn.head(source.xpath('//price'))) ? xs.decimal(fn.head(fn.head(source.xpath('//price')))) : null;

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

