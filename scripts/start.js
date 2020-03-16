process.env.NODE_ENV = "development"

const Webpack = require("webpack")
const WebpackDevServer = require("webpack-dev-server")
const configFac = require("../config/webpack.config")
const paths = require("../config/paths")

const PackageJson = require(paths.PackageJson)

const args = process.argv.slice(2)

if (args.length) {
  var config = configFac(args[0])
} else {
  var config = configFac()
}

const compiler = Webpack(config)
const devServer = new WebpackDevServer(compiler, {
  historyApiFallback: true,
  proxy: PackageJson.proxy,
})

devServer.listen(4000, "localhost", err => {
  if (err) {
    return console.log(err)
  }
})
