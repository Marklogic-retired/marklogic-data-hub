'use strict';

function flatToMultipleEntries(flatStructure, configString) {
  var config = JSON.parse(configString)
  var nodes = []
  for (var breakout of config.breakout) {
    for (var result of flatStructure.xpath(breakout.xpath)) {
      const builder = new NodeBuilder()
      builder.addNode({
        type: breakout.type,
        source: result,
        parent: flatStructure
      })
      nodes.push(builder.toNode())
    }
  }
  return Sequence.from(nodes)
}

module.exports = {
 flatToMultipleEntries
}
