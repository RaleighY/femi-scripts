module.exports = function(obj) {
  process.env.NODE_ENV = "development"

  const Webpack = require("webpack")
  const WebpackDevServer = require("webpack-dev-server")
  const configFac = require("../config/webpack.config")
  const paths = require("../config/paths")
  const userConfig = require(paths.Config)

  const webpackConfig = configFac(obj)

  try {
    var compiler = Webpack(webpackConfig)
  } catch (e) {
    console.log("Compiler Error", e)
  }

  const devServer = new WebpackDevServer(compiler, {
    historyApiFallback: true,
    proxy: userConfig.proxy,
  })

  devServer.listen(userConfig.port || 4000, "localhost", err => {
    if (err) {
      return console.log(err)
    }
  })
}
