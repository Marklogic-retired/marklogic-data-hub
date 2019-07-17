/**
 * Simple example of a custom match action that just logs some of its inputs.
 *
 * @param uri
 * @param matches
 * @param mergeOptions
 */
function customMatch(uri, matches, mergeOptions) {
  console.log("Found slight matches for URI: " + uri, matches);
}

exports.customMatch = customMatch;
