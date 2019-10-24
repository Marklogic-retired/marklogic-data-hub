
'use strict'

/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, rawContent, options) {
  if (options.contentGoBoom === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("CONTENT-BOOM"), "I BLEW UP");
  }

  xdmp.log(['rawContent', rawContent]);
  xdmp.log(['rawContent-kind', xdmp.nodeKind(rawContent)]);
  let source;

  // for xml we need to use xpath
  if (rawContent && xdmp.nodeKind(rawContent) === 'element') {
    let instance = rawContent.xpath('/*:envelope/*:instance/node()').root;
    xdmp.log(['instance:', instance]);
    if (instance != null) {
      xdmp.log('setting source to instance');
      source = instance;
    }
    else {
      xdmp.log('setting source to rawContent');
      xdmp.log(['rawContent', rawContent]);
      source = rawContent;
    }
  }
  // for json we need to return the instance
  else if (rawContent && rawContent.envelope && rawContent.envelope.instance) {
    source = rawContent.envelope.instance;
  }
  // for everything else
  else {
    source = rawContent;
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
  xdmp.log(['source', source]);
  xdmp.log(xdmp.nodeKind(source));

  // the original source documents
  let attachments = source;

  let id = xs.string(fn.head(source.xpath('id/string()')));
  let name = xs.string(fn.head(source.xpath('name/string()')));
  let salary = xs.decimal(fn.head(source.xpath('salary/string()')));

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

