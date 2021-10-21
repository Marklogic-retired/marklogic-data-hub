const {override, fixBabelImports, addLessLoader, babelInclude, addWebpackAlias} = require("customize-cra");
const path = require("path");
const themeVariables = require("@marklogic/design-system/src/theme-variables.json");

module.exports = override(
  babelInclude([
    path.resolve(__dirname, "src"),
    /@marklogic\/design-system/
  ]),
  fixBabelImports("@marklogic/design-system",
    {
      libraryDirectory: "es",
      camel2DashComponentName: false,
      style: true
    }
  ),
  fixBabelImports("@marklogic/design-system/es/MLIcon",
    {
      libraryDirectory: "",
      camel2DashComponentName: false,
      customName: function (name) {
        return `@marklogic/design-system/es/MLIcon/${name}`;
      },
      style: function () {
        return "@marklogic/design-system/es/MLIcon/style";
      }
    }
  ),
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),
  //Configure path alias
  addWebpackAlias({
    ["@components"]: path.resolve(__dirname, "src/components"),
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: themeVariables
  })
);
