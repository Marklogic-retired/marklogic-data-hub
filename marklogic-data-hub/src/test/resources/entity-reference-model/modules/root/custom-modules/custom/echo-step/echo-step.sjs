const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const flowUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/flow-utils.mjs");
const hubUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/hub-utils.mjs");

/**
 * Simple custom step that just marks the content as processed via a URI alteration.
 */
function main(contentItem, options) {
  if (options.throwErrorOnPurpose) {
    throw Error("Throwing error on purpose: " + contentItem.uri);
  }
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
