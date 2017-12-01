
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
  if (options.contentGoBoom === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("CONTENT-BOOM"), "I BLEW UP");
  }

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
    source = root;
  }

  return extractInstanceE2eentity(source);
}

/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a e2eentity
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceE2eentity(source) {
  // the original source documents
  let attachments = source;

  let id = xs.string(source.id);
  let name = xs.string(source.name);
  let salary = xs.decimal(source.salary);

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'e2eentity',
    '$version': '0.0.1',
    'id': id,
    'name': name,
    'salary': salary
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

