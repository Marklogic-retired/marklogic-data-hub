function baselineQueryInterceptorA(baselineQuery) {
  return cts.andQuery([baselineQuery, cts.collectionQuery("InterceptorA")]);
}

function baselineQueryInterceptorB(baselineQuery) {
  return cts.andQuery(cts.andQueryQueries(baselineQuery).toArray().concat([cts.collectionQuery("InterceptorB")]));
}

function filterQueryInterceptor(filterQuery, docNode) {
  return cts.andQuery([filterQuery, cts.collectionQuery(fn.string(docNode.xpath("envelope/headers/filterCollection")))]);
}

module.exports = {
  baselineQueryInterceptorA,
  baselineQueryInterceptorB,
  filterQueryInterceptor
}