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
  return rawContent;
}

module.exports = {
  createContent: createContent
};
