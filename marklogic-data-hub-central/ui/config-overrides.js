const {override, addLessLoader, babelInclude, addWebpackAlias} = require("customize-cra");
const path = require("path");

module.exports = override(
  babelInclude([
    path.resolve(__dirname, "src"),
  ]),
  //Configure path alias
  addWebpackAlias({
    ["@components"]: path.resolve(__dirname, "src/components"),
  }),
  addLessLoader({
    javascriptEnabled: true,
  })
);
