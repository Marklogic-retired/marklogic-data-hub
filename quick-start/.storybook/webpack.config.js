module.exports = (baseConfig, env, defaultConfig) => {
    defaultConfig.module.rules.unshift({
        test: /\.stories\.ts?$/,
        loaders: [
            {
                loader: require.resolve('@storybook/addon-storysource/loader'),
                options: {parser: 'typescript'}
            }
        ],
        enforce: 'pre'
    });
    return defaultConfig;
};