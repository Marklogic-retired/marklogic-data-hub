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
    '@menu-highlight-color': '#7F86B5',
    '@background-color-light': '#ffffff',
    '@card-actions-background': '#f7f9fa',
    '@table-row-hover-bg': '#E9F7FE',
    '@item-hover-bg': '#E9F7FE'
    },
 }),
);
// Refer to theme vars below
// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less