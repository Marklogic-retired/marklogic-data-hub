const path = require('path');
const autoprefixer = require('autoprefixer');

module.exports = (baseConfig, env, defaultConfig) => {
  baseConfig.module.rules.push(
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
      test: /\.css$/,
      use: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader'),
          options: {
            importLoaders: 1,
          },
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
            plugins: () => [
              require('postcss-flexbugs-fixes'), // eslint-disable-line
              autoprefixer({
                flexbox: 'no-2009',
              }),
            ],
          },
        },
      ],
    },
    {
      test: /\.(ico|jpg|jpeg|png|gif|eot|otf|svg|webp|ttf|woff|woff2)(\?.*)?$/,
      loaders: ["file-loader"],
      include: path.resolve(__dirname, '../')
    }
  );

  return baseConfig;
};
