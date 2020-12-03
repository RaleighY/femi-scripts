const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

const envFac = require("./env")
const divers = require("./divers")

module.exports = function configFac(obj) {
  const env = envFac(obj)
  const { entry, output, loaders, plugins, splitChunks, config, devtool, externals } = divers(env)

  return {
    mode: env.NODE_ENV,
    entry: entry,
    output: output,
    module: {
      rules: [
        loaders.vue,
        loaders.url,
        loaders.css,
        loaders.less,
        loaders.ts,
        { parser: { system: false } },
      ],
    },
    resolve: {
      plugins: [
        config.useTs !== false &&
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
      // splitChunks: splitChunks,
      minimize: env.isEnvProduction,
      minimizer: [plugins.terserJSPlugin, plugins.optimizeCSSAssetsPlugin],
    },
    plugins: [
      plugins.cleanWebpackPlugin,
      plugins.copyPlugin,
      plugins.htmlWebpackPlugin,
      plugins.interpolateHtmlPlugin, // 用于在html模板中使用环境变量做判断
      plugins.miniExtractPlugin,
      plugins.vueLoaderPlugin,
      plugins.definePlugin,
    ].filter(Boolean),
    devtool,
    externals,
    node: {
      fs: "empty",
    },
  }
}
