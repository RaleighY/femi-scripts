const webpack = require("webpack")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const InterpolateHtmlPlugin = require("interpolate-html-plugin")

const env = require("./env")
const divers = require("./divers")

module.exports = function configFac(appName) {
  return {
    mode: env.NODE_ENV,
    entry: divers.entry(appName),
    output: divers.output(appName),
    module: {
      rules: [
        {
          oneOf: [
            divers.loaders.urlLoader,
            divers.loaders.css,
            divers.loaders.less,
            // divers.loaders.js,
            divers.loaders.ts,
            divers.loaders.fileLoader,
          ],
        },
      ],
    },
    resolve: {
      plugins: [
        new TsconfigPathsPlugin({
          /*configFile: "./path/to/tsconfig.json" */
        }),
      ],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    optimization: {
      splitChunks: divers.splitChunks,
      minimize: env.isEnvProduction,
      minimizer: [divers.plugins.terserJSPlugin, divers.plugins.optimizeCSSAssetsPlugin],
    },
    plugins: [
      divers.plugins.htmlWebpackPlugin,
      divers.plugins.copyPlugin,
      divers.plugins.miniExtractPlufin,
      env.isEnvProduction && new CleanWebpackPlugin(), //清空文件夹
      /* 用于在html模板中使用环境变量做判断 */
      new InterpolateHtmlPlugin(env),
      /* 用于传递环境变量 */
      new webpack.DefinePlugin({}),
    ].filter(Boolean),
    devtool: env.isEnvDevelopment ? "source-map" : false,
    externals: [],
    node: {
      fs: "empty",
    },
  }
}
