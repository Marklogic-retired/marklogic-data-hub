const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

/**
 * Simple custom step that just marks the content as processed via a URI alteration.
 */
function main(contentItem, options) {
  const instance = cts.doc(contentItem.uri).toObject();
  return {
    uri: "/echo" + contentItem.uri,
    value: datahub.flow.flowUtils.makeEnvelope(instance, {}, [], "json"),
    context: {
      permissions: datahub.hubUtils.parsePermissions("data-hub-operator,read,data-hub-operator,update")
    }
  };
}

module.exports = {
  main: main
};
