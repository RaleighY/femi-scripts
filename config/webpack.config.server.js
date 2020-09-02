const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const env = require("./env")
const divers = require("./divers")

module.exports = function configFac() {
  return {
    target: "node",
    mode: env.NODE_ENV,
    entry: divers.entry,
    output: divers.output(),
    module: {
      rules: [divers.loaders.ts],
    },
    resolve: {
      plugins: [
        new TsconfigPathsPlugin({
          /*configFile: "./path/to/tsconfig.json" */
        }),
      ],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    plugins: [new CleanWebpackPlugin()],
    devtool: env.isEnvDevelopment ? "source-map" : false,
    externals: [],
    node: {
      fs: "empty",
      net: "empty",
    },
  }
}
