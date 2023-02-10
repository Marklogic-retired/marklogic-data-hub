const {override, addLessLoader, babelInclude, addWebpackAlias, adjustStyleLoaders} = require("customize-cra");
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
    lessOptions: {
      javascriptEnabled: true,
    },
  }),

  adjustStyleLoaders(({use: [, , postcss]}) => {
    const postcssOptions = postcss.options;
    postcss.options = {postcssOptions};
  })
);