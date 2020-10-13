const webpack = require("webpack")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const InterpolateHtmlPlugin = require("interpolate-html-plugin")

const env = require("./env")
const divers = require("./divers")

module.exports = function configFac(obj) {
  return {
    mode: env.NODE_ENV,
    entry: divers.entry(obj.appName),
    output: divers.output(obj),
    module: {
      rules: [
        divers.loaders.vue,
        divers.loaders.url,
        divers.loaders.css,
        divers.loaders.less,
        divers.loaders.ts,
      ],
    },
    resolve: {
      plugins: [
        divers.config.useTs !== false &&
          new TsconfigPathsPlugin({
            /*configFile: "./path/to/tsconfig.json" */
          }),
      ].filter(Boolean),
      alias: {
        // "@appReact": paths.resolveApp("src/apps/appReact"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".vue"],
    },
    optimization: {
      splitChunks: divers.splitChunks,
      minimize: env.isEnvProduction,
      minimizer: [divers.plugins.terserJSPlugin, divers.plugins.optimizeCSSAssetsPlugin],
    },
    plugins: [
      env.isEnvProduction && new CleanWebpackPlugin(),
      !obj.system && divers.plugins.copyPlugin,
      !obj.system && divers.plugins.htmlWebpackPlugin,
      !obj.system && new InterpolateHtmlPlugin(env), // 用于在html模板中使用环境变量做判断
      divers.plugins.miniExtractPlugin,
      divers.plugins.vueLoaderPlugin,
      new webpack.DefinePlugin({}), // 用于传递环境变量
    ].filter(Boolean),
    devtool: env.isEnvDevelopment ? "source-map" : false,
    externals: ["React", "React-dom", "vue"],
    node: {
      fs: "empty",
    },
  }
}
