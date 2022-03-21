function baselineQueryInterceptorA(baselineQuery) {
  return cts.andQuery([baselineQuery, cts.collectionQuery("InterceptorA")]);
}

function baselineQueryInterceptorB(baselineQuery) {
  return cts.andQuery(cts.andQueryQueries(baselineQuery).toArray().concat([cts.collectionQuery("InterceptorB")]));
}

module.exports = {
  baselineQueryInterceptorA,
  baselineQueryInterceptorB
}