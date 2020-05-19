const { override, fixBabelImports, addLessLoader, babelInclude } = require('customize-cra');
const path = require('path')
const themeVariables = require('@marklogic/design-system/src/theme-variables.json')

module.exports = override(
  babelInclude([
    path.resolve(__dirname, 'src'),
    /@marklogic\/design-system/
  ]),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
     style: true,
  }),
 addLessLoader({
   javascriptEnabled: true,
   modifyVars: themeVariables
 }),
);