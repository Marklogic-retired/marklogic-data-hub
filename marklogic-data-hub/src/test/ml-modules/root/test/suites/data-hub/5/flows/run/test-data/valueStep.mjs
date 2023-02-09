import flowUtils from "/data-hub/5/impl/flow-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";


function main(contentItem, options) {
  const collectionValue = contentItem.uri;
  const instance = {
    collection: collectionValue
  };
  return {
    uri: "/processed/customer1.json",
    value: flowUtils.makeEnvelope(instance, {}, [], "json"),
    context: {
      collections: ["test-data"],
      permissions: hubUtils.parsePermissions("data-hub-operator,read,data-hub-operator,update")
    }
  };
}

export default {
  main: main
};
