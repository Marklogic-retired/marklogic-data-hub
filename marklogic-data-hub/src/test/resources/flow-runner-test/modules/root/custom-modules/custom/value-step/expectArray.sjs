const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

/**
 * Example of converting the "uri" value into an array.
 */
function main(contentItem, options) {
  const instance = {
    contentValue: fn.head(xdmp.eval(contentItem.uri))
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
