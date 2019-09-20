/* global exports */
function get() {
  const dictionaryDirectory = '/mdm/config/dictionaries/';
  const dictionaryUris = cts.uris(
    '',
    [],
    cts.directoryQuery(dictionaryDirectory)
  );

  const availableDictionaries = dictionaryUris.toArray().reduce((result, dictionaryUri) => {
    result[dictionaryUri] = {
      displayName: dictionaryUri.toString().replace(dictionaryDirectory, '')
    }
    return result;
  }, {});

  return { availableDictionaries }
}

exports.GET = get;
