function main(contentItem, options) {
  // If no value exists, it's probably because the test is using sourceQueryIsScript, so add a simple document so it can be persisted
  if (!contentItem.value) {
    contentItem.value = {"hello":"world"};
  }
  if (options.throwErrorOnPurpose === true) {
    throw Error("Throwing error on purpose");
  }
  return contentItem;
}

module.exports = {
  main: main
};
