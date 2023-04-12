const acceleratorHelper = require("/fhir-accelerator/sub-node-preprocess-helper.sjs");

const paths = {
  headers: "/envelope/headers",
  instance: "/envelope/instance"
}

function transform(content) {
  return acceleratorHelper.basicSubNodeDocument(content, paths)
}

function getURI(preMappedContent) {
  uriRoot = "/pretransformed/member/"
  uriExtension = ".json"

  var memberId = fn.head(preMappedContent.xpath("instance/Member/memberID"))

  uri = uriRoot + memberId + uriExtension

  return uri
}

function getCollections(content) {
  return ["pretransformed", "pretransformed-member"]
}

module.exports = {
  transform: transform,
  getURI: getURI,
  getCollections: getCollections
}
