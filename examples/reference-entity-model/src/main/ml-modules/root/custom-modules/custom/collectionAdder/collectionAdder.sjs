function main(contentItem, options) {
  contentItem.context.collections = contentItem.context.originalCollections.concat(options.collectionToAdd);
  return contentItem;
}

module.exports = {
  main: main
};
