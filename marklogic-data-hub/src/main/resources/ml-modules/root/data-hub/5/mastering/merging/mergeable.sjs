'use strict';

/*
 * A class that encapsulates the configurable portions of the merging process.
 */
class Mergeable {

  constructor(mergeStep, options) {
    this.mergeStep = mergeStep;
    this.options = options;
  }

  /*
   * Returns an array of MergeRuleDefinitions class instances that describe the rule sets for merging
   * @return []MergeRuleDefinitions
   * @since 5.8.0
   */
  mergeRuleDefinitions() {
  }

  /*
   * Returns a contentObject after processing multiple contentObjects
   * @return contentObject
   * @since 5.8.0
   */
  buildMergeDocument(contentObject) {
  }

  /*
   * Returns contentObject after applying respective actions to it
   * @return contentObject
   * @since 5.8.0
   */
  applyDocumentContext(contentObject, actionDetails) {
    const targetEntity = this.options.targetEntityType || this.options.targetEntityTitle;
    switch (actionDetails.action) {
      case "merge" :
        contentObject.context.collections.push(`sm-${targetEntity}-merged`);
        contentObject.context.collections.push(`sm-${targetEntity}-mastered`);
        break;
      case "notify":
        contentObject.context.collections.push(`sm-${targetEntity}-notification`);
        break;
      case "no-action":
        contentObject.context.collections.push(`sm-${targetEntity}-mastered`);
        break;
      default:
    }
    return contentObject;
  }
}

module.exports = {
  Mergeable: Mergeable,
}