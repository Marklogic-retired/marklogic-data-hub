const { override, fixBabelImports, addLessLoader, babelInclude } = require('customize-cra');
const path = require('path')
const themeVariables = require('@marklogic/design-system/src/theme-variables.json')

module.exports = override(
  babelInclude([
    path.resolve(__dirname, 'src'),
    /@marklogic\/design-system/, // Required for @marklogic/design-system to compile
    // In a real environment (where node_modules paths are guaranteed),
    // you may use /@marklogic\/design-system/ for specificity
  ]),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
     style: true,
  }),
 addLessLoader({
   javascriptEnabled: true,
   modifyVars: themeVariables
 })
)
// Refer to theme vars below
// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less