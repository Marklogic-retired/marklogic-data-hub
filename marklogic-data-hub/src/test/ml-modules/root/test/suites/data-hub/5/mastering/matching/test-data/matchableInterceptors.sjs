function baselineQueryInterceptorA(baselineQuery) {
  return cts.andQuery([baselineQuery, cts.collectionQuery("InterceptorA")]);
}

function baselineQueryInterceptorB(baselineQuery) {
  return cts.andQuery(cts.andQueryQueries(baselineQuery).toArray().concat([cts.collectionQuery("InterceptorB")]));
}

function filterQueryInterceptor(filterQuery, docNode) {
  return cts.andQuery([filterQuery, cts.collectionQuery(fn.string(docNode.xpath("envelope/headers/filterCollection")))]);
}

function scoreDocumentInterceptor(defaultScore, contentObjectA, contentObjectB, matchingRulesetDefinitions) {
  let score = 0;
  for (const matchRuleset of matchingRulesetDefinitions) {
    const matchRulesetScore = matchRuleset.score(contentObjectA, contentObjectB);
    if (matchRulesetScore > score) {
      score = matchRulesetScore;
    }
  }
  return score;
}

module.exports = {
  baselineQueryInterceptorA,
  baselineQueryInterceptorB,
  filterQueryInterceptor,
  scoreDocumentInterceptor
}