const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

/**
 * Trivial example of a custom step for testing a collector that returns values.
 */
function main(contentItem, options) {
  const instance = {
    contentValue: contentItem.uri
  };
  return {
    uri: "/processed/" + sem.uuidString() + ".json",
    value: datahub.flow.flowUtils.makeEnvelope(instance, {}, [], "json"),
    context: {
      permissions: datahub.hubUtils.parsePermissions("data-hub-operator,read,data-hub-operator,update")
    }
  };
}

module.exports = {
  main: main
};
