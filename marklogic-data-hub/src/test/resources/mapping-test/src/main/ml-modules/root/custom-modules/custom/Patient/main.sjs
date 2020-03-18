const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function main(contentItem, options) {
  const firstItem = contentItem.uri;
  const instance = {
    firstItem: firstItem
  };
  let x= {
    uri: "/patient/patient1.json",
    value: datahub.flow.flowUtils.makeEnvelope(instance, {}, [], "json"),
    context: {
      collections: ["query-coll"],
      permissions: datahub.hubUtils.parsePermissions("data-hub-operator,read,data-hub-operator,update")
    }
  };
  return x;
}

module.exports = {
  main: main
};
