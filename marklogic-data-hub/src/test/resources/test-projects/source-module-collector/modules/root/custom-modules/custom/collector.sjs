function collect(options) {
  return cts.uris(null, ['score-zero'], cts.collectionQuery(['loadCustomersJSON']), 0)
}

module.exports = {
  collect
}
