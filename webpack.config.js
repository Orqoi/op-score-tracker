const webpack = require('webpack');

module.exports = {
  // Your existing Webpack configuration
  resolve: {
    fallback: {
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};
