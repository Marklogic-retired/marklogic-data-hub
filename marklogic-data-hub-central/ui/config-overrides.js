const {override, babelInclude, addWebpackAlias} = require("customize-cra");
const addLessLoader = require("customize-cra-less-loader");
const path = require("path");

module.exports = override(
  babelInclude([
    path.resolve(__dirname, "src"),
  ]),
  //Configure path alias
  addWebpackAlias({
    ["@api"]: path.resolve(__dirname, "src/api"),
    ["@components"]: path.resolve(__dirname, "src/components"),
    ["@config"]: path.resolve(__dirname, "src/config"),
    ["@util"]: path.resolve(__dirname, "src/util"),
  }),
  addLessLoader({
    lessLoaderOptions: {
      lessOptions: {
        javascriptEnabled: true,
      }
    }
  })
);
