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

  return extractInstanceFarm(source);
}

/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a Farm
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstanceFarm(source) {
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
  /* These mappings were generated using mapping: FarmMapping, version: 1 on 2024-06-17T12:42:09.7712616+02:00.*/
  let id = !fn.empty(fn.head(source.xpath('//id'))) ? xs.int(fn.head(fn.head(source.xpath('//id')))) : null;
  let name = !fn.empty(fn.head(source.xpath('//name'))) ? xs.string(fn.head(fn.head(source.xpath('//name')))) : null;

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'Farm',
    '$version': '0.0.1',
    'id': id,
    'name': name
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
