const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = async ({config, mode}) => {
  config.plugins.push( new webpack.ProvidePlugin({
    CodeMirror: 'codemirror'
  }));
  config.module.rules.push(
    {
      test: [/\.stories\.ts?$/, /index\.ts$/],
      loaders: [
        {
          loader: require.resolve('@storybook/addon-storysource/loader'),
          options: {
            parser: 'typescript',
          },
        },
      ],
      include: [path.resolve(__dirname, '../src')],
      enforce: 'pre',
    },
    {
      test: /\.(ico|jpg|jpeg|png|gif|eot|otf|svg|webp|ttf|woff|woff2)(\?.*)?$/,
      loaders: ["file-loader"],
      include: path.resolve(__dirname, '../')
    }
  );

  return config;
};
