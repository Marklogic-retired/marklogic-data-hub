/* global exports */
function get() {
  const thesaurusDirectory = '/mdm/config/thesauri/';
  const thesaurusUris = cts.uris(
    '',
    [],
    cts.directoryQuery(thesaurusDirectory)
  );

  const availableThesauri = thesaurusUris.toArray().reduce((result, thesaurusUri) => {
    result[thesaurusUri] = {
      displayName: thesaurusUri.toString().replace(thesaurusDirectory, '')
    }
    return result;
  }, {});

  return { availableThesauri }
}

exports.GET = get;
