// Useful for when your test needs a step that throws an error
function main(content, options) {
  if (options.throwErrorOnPurpose) {
    throw Error("Throwing error on purpose");
  }
  if (options.throwErrorForUris && options.throwErrorForUris.includes(content.uri)) {
    throw Error("Throwing error on purpose for URI: " + content.uri);
  }
  return content;
}

module.exports = {
  main
};
