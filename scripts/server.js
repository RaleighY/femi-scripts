process.env.NODE_ENV = "production"

const Webpack = require("webpack")
const configFac = require("../config/webpack.config.server")

const args = process.argv.slice(2)

if (args.length) {
  var config = configFac(args[0])
} else {
  var config = configFac()
}

try {
  var compiler = Webpack(config)
} catch (e) {
  console.log("Compiler Error", e)
}

compiler.run((err, stats) => {
  if (err) {
    console.log(err)
  }
})
