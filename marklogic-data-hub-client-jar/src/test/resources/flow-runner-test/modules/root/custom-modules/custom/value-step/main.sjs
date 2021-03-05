const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

/**
 * Trivial example of a custom step for testing a collector that returns values.
 */
function main(contentItem, options) {
  const instance = {
    contentValue: contentItem.uri
  };
  return {
    uri: "/processed/" + sem.uuidString() + ".json",
    value: flowUtils.makeEnvelope(instance, {}, [], "json"),
    context: {
      permissions: hubUtils.parsePermissions("data-hub-operator,read,data-hub-operator,update")
    }
  };
}

module.exports = {
  main: main
};
