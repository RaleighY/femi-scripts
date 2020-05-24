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

const paths = require("./paths")
const env = require("./env")

module.exports = function configFac(appName) {
  const action = env.isEnvProduction ? "打包" : "启动"

  if (appName) {
    console.log(process.env.NODE_ENV)
    if (appName && paths["Entry_" + appName]) {
      console.log(`当前${action}:`, appName)
      var entry = paths["Entry_" + appName]
    } else {
      console.log(`未找到${appName}相应App入口，${action}全部App`)
      var entry = paths.Entry_Main
    }
  } else {
    console.log(`${action}全部App`)
    var entry = paths.Entry_Main
  }

  return {
    mode: env.NODE_ENV,
    entry: entry,
    output: Object.assign({
      publicPath: process.env.PUBLIC_URL ? process.env.PUBLIC_URL + "/" : "/",
      filename: env.isEnvProduction ? "js/[name].[chunkhash:8].js" : "js/[name].js",
      chunkFilename: env.isEnvProduction
        ? "js/[name].[chunkhash:8].chunk.js"
        : "js/[name].chunk.js",
      path: paths.Output,
    }),
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(bmp|gif|jpe?g|png)$/,
              loader: "url-loader",
              options: {
                limit: 10000,
                name: "media/[name].[hash:8].[ext]",
              },
            },
            {
              test: /.css$/,
              use: [
                env.isEnvProduction
                  ? {
                      loader: MiniCssExtractPlugin.loader,
                    }
                  : {
                      loader: "style-loader",
                      options: {
                        insert: function insertAtTop(element) {
                          // 插入到 head 标签的最前面
                          var parent = document.querySelector("head")

                          var lastInsertedElement = window._lastElementInsertedByStyleLoader

                          if (!lastInsertedElement) {
                            parent.insertBefore(element, parent.firstChild)
                          } else if (lastInsertedElement.nextSibling) {
                            parent.insertBefore(element, lastInsertedElement.nextSibling)
                          } else {
                            parent.appendChild(element)
                          }

                          window._lastElementInsertedByStyleLoader = element
                        },
                      },
                    },
                {
                  loader: "css-loader",
                  options: {
                    minimize: true,
                  },
                },
              ],
            },
            {
              test: /.less$/,
              use: [
                env.isEnvProduction
                  ? {
                      loader: MiniCssExtractPlugin.loader,
                    }
                  : {
                      loader: "style-loader",
                      options: {
                        insert: function insertAtTop(element) {
                          var parent = document.querySelector("head")

                          var lastInsertedElement = window._lastElementInsertedByStyleLoader

                          if (!lastInsertedElement) {
                            parent.insertBefore(element, parent.firstChild)
                          } else if (lastInsertedElement.nextSibling) {
                            parent.insertBefore(element, lastInsertedElement.nextSibling)
                          } else {
                            parent.appendChild(element)
                          }

                          window._lastElementInsertedByStyleLoader = element
                        },
                      },
                    },
                {
                  loader: "css-loader",
                },
                {
                  loader: "less-loader",
                  options: {
                    modifyVars: {
                      // antd
                      // "primary-color": "#007EF0",
                      // or
                      // hack: `true; @import "your-less-file-path.less";`, // Override with less file
                    },
                    javascriptEnabled: true,
                  },
                },
              ],
            },
            // {
            //   test: /\.jsx?$/,
            //   exclude: [path.resolve(__dirname, "node_modules")],
            //   loader: "babel-loader",
            // },
            {
              test: /\.tsx?$/,
              exclude: [path.resolve(__dirname, "node_modules")],
              loader: "ts-loader",
              options: {
                getCustomTransformers: () => ({
                  before: [
                    styledComponentsTransformer,
                    tsImportPluginFactory({
                      libraryName: "antd",
                      libraryDirectory: "lib",
                      style: true,
                    }),
                  ],
                }),
                compilerOptions: {
                  module: "es2015",
                },
                allowTsInNodeModules: true,
              },
            },
            {
              loader: "file-loader",
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              options: {
                name: "media/[name].[hash:8].[ext]",
              },
            },
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
      splitChunks: {
        name: false,
        cacheGroups: {
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            chunks: "all",
            name: "vendor-antd",
          },
          react: {
            test: /[\\/]node_modules[\\/]react.*[\\/]/,
            chunks: "all",
            name: "vendor-react",
          },
        },
      },
      minimize: env.isEnvProduction,
      minimizer: [
        new TerserJSPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorPluginOptions: {
            parser: safePostCssParser,
            map: false,
          },
        }),
      ],
    },
    plugins: [
      env.isEnvProduction && new CleanWebpackPlugin(), //清空文件夹
      /*
      1.将生成的js插入到html中，特别是当文件名使用hash时，模板中不能直接使用文件名喔
      2.添加meta到html中
      3.添加manifest和favicon
    */
      new HtmlWebpackPlugin(
        Object.assign({
          inject: true,
          template: paths.Html,
          favicon: paths.Favicon,
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
        })
      ),
      /* 将额外的内容直接插入html */
      new CopyPlugin([{ from: "public", to: "public" }]),
      new HtmlWebpackTagsPlugin({ tags: ["public/index.css"], append: true }),
      /* 用于在html模板中使用环境变量做判断 */
      new InterpolateHtmlPlugin(env),
      /* 用于传递环境变量 */
      new webpack.DefinePlugin({}),
      /* 分离出css */
      new MiniCssExtractPlugin({
        filename: env.isEnvProduction ? "css/[name].[hash].css" : "css/[name].css",
        chunkFilename: env.isEnvProduction ? "css/[name].[hash].chunk.css" : "css/[name].css",
        ignoreOrder: false, // Enable to remove warnings about conflicting order
      }),
    ].filter(Boolean),
    devtool: env.isEnvDevelopment ? "source-map" : false,
    externals: [],
    node: {
      fs: "empty",
    },
  }
}
