const CompressionPlugin = require("compression-webpack-plugin")
module.exports = {
  // 使用相对路径，兼容子目录和根目录
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [
          new CompressionPlugin({
            test: /\.js$|\.html$|.\css/,
            threshold: 1024,
            deleteOriginalAssets: false
          })
        ]
      }
    }
  },
}
