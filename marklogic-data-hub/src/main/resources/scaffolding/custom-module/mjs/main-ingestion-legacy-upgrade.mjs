function main(content, options) {
  let legacyOptions = options.options;
  let result = {};
  result["uri"] = content.uri;
  result["value"] = require(legacyOptions["mainModuleUri"]).main(content.uri, content.value, legacyOptions);
  return result;
}

export default {
    main
};
