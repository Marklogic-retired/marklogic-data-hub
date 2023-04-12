const acceleratorHelper = require("/fhir-accelerator/sub-node-preprocess-helper.sjs");

const paths = {
  headers: "/envelope/headers",
  instance: "/envelope/instance"
}

function transform(content) {
  return acceleratorHelper.basicSubNodeDocument(content, paths)
}

function getURI(preMappedContent) {
  uriRoot = "/pretransformed/providerLocation/"
  uriExtension = ".json"

  var providerId = fn.head(preMappedContent.xpath("instance/Provider/NPI"))

  uri = uriRoot + providerId + uriExtension

  return uri
}

function getCollections(content) {
  return ["pretransformed", "pretransformed-ProviderLocation"]
}

module.exports = {
  transform: transform,
  getURI: getURI,
  getCollections: getCollections
}
