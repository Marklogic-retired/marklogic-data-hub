const DataHub = require('/data-hub/5/datahub.sjs');
const datahub = new DataHub();

function main(content, options) {
  //here we can grab and manipulate the context metadata attached to the document
  //let context = content.context;

  //let's set our output format, so we know what we're exporting
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  //here we check to make sure we're not trying to push out a binary or text document, just xml or json
  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
    datahub.debug.log({message: 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.', type: 'error'
    });
    throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON +'.');
  }

  //grab the 'doc' from the content value space
  let doc = content.value;

  // let's just grab the root of the document if its a Document and not a type of Node (ObjectNode or XMLNode)
  if (doc && (doc instanceof Document || doc instanceof XMLDocument)) {
    doc = fn.head(doc.root);
  }


  let envelope = {
    envelope: {
      headers: {},
      triple:{},
      instance: doc,
      attachments:null
    }
  };

  let currentURI = /[^/]*$/.exec(content.uri)[0];


  let temporalURI = "/temporal/ingestion/" + currentURI;

  content.uri = temporalURI;
  content.value = envelope;

  return content;
}

module.exports = {
  main: main
};
