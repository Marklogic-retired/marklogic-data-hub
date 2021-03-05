/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {
  return {
    "an":"instance",
    "document":"that",
    "is":"not",
    "harmononized":"yeah",
    "$attachments": { "and" : "originaldochere" },
    "$type":"Person",
    "$version":"0.0.1"
  }
}

module.exports = {
  createContent: createContent
};

