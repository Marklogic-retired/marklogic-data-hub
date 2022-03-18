'use strict';

/*
 * A class that encapsulates the configurable portions of teh matching process.
 */
class Matchable {
  constructor(matchStep, stepContext) {
    this.matchStep = matchStep;
    this.stepContext = stepContext;
  }

  /*
   * Returns a cts.query to represent the entire set of documents that should be matched against
   * @return cts.query
   * @since 5.8.0
   */
  baselineQuery() {
    // TODO DHFPROD-8589
  }
  /*
   * Returns an array of MatchRulesetDefinition class instances that describe the rule sets for matching
   * @return []MatchRulesetDefinition
   * @since 5.8.0
   */
  matchRulesetDefinitions() {
    // TODO DHFPROD-8590
  }

  /*
   * Returns an array of ThresholdDefinition class instances that describe the thresholds matches can be grouped into
   * @return []ThresholdDefinition
   * @since 5.8.0
   */
  thresholdDefinitions() {
    // TODO DHFPROD-8592
  }

  /*
   * Returns a cts.query that filters out documents that shouldn't match with an individual document. The default is to
   * return a cts.andNotQuery(cts.query(matchStep.filterQuery), cts.documentQuery([selfDocURI, documentsBlockedByUnmerge]))
   * @param {Node} documentNode
   * @return cts.query
   * @since 5.8.0
   */
  filterQuery(documentNode) {
    // TODO DHFPROD-8591
  }

  /*
   * Returns a score in the form of a double of 2 documents
   * @param {ContentObject} contentObjectA
   * @param {ContentObject} contentObjectB
   * @param {[]MatchRulesetDefinition} matchingRulesets
   * @return double
   * @since 5.8.0
   */
  scoreDocument(contentObjectA, contentObjectB, matchingRulesets) {
    // TODO DHFPROD-8609
  }
  /*
   * Returns a JSON Object with details to pass onto the merge step for use in taking action.
   * @param {[]ContentObject} matchingDocumentSet
   * @param {ThresholdDefinition} thresholdBucket
   * @param {[]MatchRulesetDefinition} matchingRulesets
   * @return {}
   * @since 5.8.0
   */
  buildActionDetails(matchingDocumentSet, thresholdBucket, matchRulesets) {
    // TODO DHFPROD-8610
  }
}

module.exports = {
  Matchable
}