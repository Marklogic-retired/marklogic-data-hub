const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function main(contentItem, options) {
  const collectionValue = contentItem.uri;
  const instance = {
    collection: collectionValue
  };
  return {
    uri: "/processed/customer1.json",
    value: datahub.flow.flowUtils.makeEnvelope(instance, {}, [], "json"),
    context: {
      collections: ["test-data"],
      permissions: datahub.hubUtils.parsePermissions("data-hub-operator,read,data-hub-operator,update")
    }
  };
}

module.exports = {
  main: main
};
