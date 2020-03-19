const { override, fixBabelImports, addLessLoader } = require('customize-cra');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
     style: true,
  }),
 addLessLoader({
   javascriptEnabled: true,
   modifyVars: {
     '@primary-color': '#44499C',
     '@menu-item-color': '#A8A8A8',
     '@menu-highlight-color': '#44499C',
     '@background-color-light': '#ffffff',
     '@card-actions-background': '#f7f9fa',
    },
 }),
);
// Refer to theme vars below
// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less