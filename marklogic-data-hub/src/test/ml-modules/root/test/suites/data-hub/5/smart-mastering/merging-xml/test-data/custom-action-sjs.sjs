'use strict'

function customAction(uri, matches, mergeOptions) {
  xdmp.documentInsert(
    "/sjs-action-output.json",
    {
      uri: uri,
      matches: matches,
      options: mergeOptions
    }
  );
}

module.exports = {
  customAction
};
