function main(content, options) {
  let legacyOptions = options.options;
  let result = {};
  let contentObj = content["value"].toObject();
  contentObj = (contentObj && contentObj.content) ? contentObj.content : contentObj;
  result["uri"] = content.uri;
  result["value"] = require(legacyOptions["mainModuleUri"]).main(content.uri, contentObj, legacyOptions);
  return result;
}

export default {
    main
};
