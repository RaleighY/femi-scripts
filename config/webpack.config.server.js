const envFac = require("./env")
const divers = require("./divers")

module.exports = function configFac() {
  const env = envFac()
  const { alias, entry, output, loaders, plugins, splitChunks, devtool, externals } = divers(env)

  return {
    target: "node",
    mode: env.NODE_ENV,
    entry: entry,
    output: output,
    module: {
      rules: [loaders.ts],
    },
    resolve: {
      plugins: [plugins.tsconfigPathsPlugin].filter(Boolean),
      alias,
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    plugins: [plugins.cleanWebpackPlugin].filter(Boolean),
    devtool,
    externals,
    node: {
      fs: "empty",
      net: "empty",
    },
  }
}
