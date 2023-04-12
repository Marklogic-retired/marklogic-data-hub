
const defaultRootXpath = "/"

function basicSubNodeDocument(content, options) {

  var newDocumentNode = {}

  for (const [key, value] of Object.entries(options)) {
    newDocumentNode[key] = content.xpath(value)
  }

  const builder = new NodeBuilder()
  builder.startDocument()
  builder.addNode(newDocumentNode)
  builder.endDocument()
  var newDocument = builder.toNode()

  return newDocument
}

module.exports = {
  basicSubNodeDocument: basicSubNodeDocument
}
