import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

function main(content, options) {
  const legacyOptions = options.options;
  const contentUri = content["uri"];
  let contentValue = content["value"];
  const contentContext = content["context"];

  if(hubUtils.isJsonDocument(contentValue)) {
    contentValue = contentValue.toObject();
    contentValue = (contentValue && contentValue.content) ? contentValue.content : contentValue;
  }

  let result = {};
  result["uri"] = contentUri;
  result["value"] = require(legacyOptions["mainModuleUri"]).main(contentUri, contentValue, legacyOptions);
  result["context"] = contentContext;

  return result;
}

export default {
  main
};
