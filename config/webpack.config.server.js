const path = require("path")
const webpack = require("webpack")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const InterpolateHtmlPlugin = require("interpolate-html-plugin")
const styledComponentsTransformer = require("typescript-plugin-styled-components").default()
const tsImportPluginFactory = require("ts-import-plugin")
const TerserJSPlugin = require("terser-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const safePostCssParser = require("postcss-safe-parser")

const env = require("./env")
const divers = require("./divers")

module.exports = function configFac() {
  return {
    target: "node",
    mode: env.NODE_ENV,
    entry: divers.entry,
    output: divers.output,
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
