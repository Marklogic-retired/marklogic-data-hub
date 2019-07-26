/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param rawContent - the raw content being loaded.
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, rawContent, options) {
  // name the binary uri with a pdf extension
	var binaryUri = fn.replace(id, ".json", ".pdf");

  // stash the binary uri in the options map for later
  options.binaryUri = binaryUri;

  // save the incoming binary as a pdf
  xdmp.eval('declareUpdate(); xdmp.documentInsert(binaryUri, rawContent)', {
    binaryUri: binaryUri,
    rawContent: rawContent
  },{
    isolation: 'different-transaction',
    commit: 'auto'
  });

  // extract the contents of the pdf and return them
  // as the content for the envelope
  return xdmp.documentFilter(rawContent);

}

module.exports = {
  createContent: createContent
};
