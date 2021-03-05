const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

/**
 * Example of converting the "uri" value into an array.
 */
function main(contentItem, options) {
  const instance = {
    contentValue: fn.head(xdmp.eval(contentItem.uri))
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
