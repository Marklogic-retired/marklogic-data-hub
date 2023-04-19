function main(content, options) {
  let result = {};
  let legacyOptions = options.options;
  result["value"] = require(legacyOptions["mainModuleUri"]).main(content.uri, content.value, legacyOptions);
  return result;
}

export default {
    main
};
