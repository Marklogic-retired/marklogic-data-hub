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
  }
}

module.exports = {
  Mergeable: Mergeable,
}