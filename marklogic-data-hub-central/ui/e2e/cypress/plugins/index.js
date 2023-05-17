const wp = require("@cypress/webpack-preprocessor");

module.exports = (on) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: [".ts", ".tsx", ".js"]
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
            options: {transpileOnly: true}
          }
        ]
      }
    },
  };
  on("file:preprocessor", wp(options));
};

module.exports = (on, config) => {
  require("cypress-fail-fast/plugin")(on, config);
  return config;
};