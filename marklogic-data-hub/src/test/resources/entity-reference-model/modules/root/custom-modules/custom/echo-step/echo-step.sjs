const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

/**
 * Simple custom step that just marks the content as processed via a URI alteration.
 */
function main(contentItem, options) {
  const instance = cts.doc(contentItem.uri).toObject();
  return {
    uri: "/echo" + contentItem.uri,
    value: flowUtils.makeEnvelope(instance, {}, [], "json"),
    context: {
      permissions: hubUtils.parsePermissions("data-hub-operator,read,data-hub-operator,update")
    }
  };
}

module.exports = {
  main: main
};
