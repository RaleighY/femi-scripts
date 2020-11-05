module.exports = function(obj) {
  process.env.NODE_ENV = "production"

  const Webpack = require("webpack")
  const configFac = require("../config/webpack.config")

  const webpackConfig = configFac(obj)

  try {
    var compiler = Webpack(webpackConfig)
  } catch (e) {
    console.log("Compiler Error", e)
  }

  compiler.run((err, stats) => {
    if (err) {
      console.log(err)
    }
  })
}
