const fs = require("fs")
const path = require("path")
const webpack = require("webpack")
const shell = require("shelljs")
const styledComponentsTransformer = require("typescript-plugin-styled-components").default()
const TerserJSPlugin = require("terser-webpack-plugin")
const safePostCssParser = require("postcss-safe-parser")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const InterpolateHtmlPlugin = require("interpolate-html-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const DefinePlugin = webpack.DefinePlugin

const paths = require("./paths")
const userConfig = require(paths.userConfig)

module.exports = function(env) {
  const { appEntry } = env
  const { entry: userEntry, alias } = userConfig
  const useOutputHash = userConfig.output && userConfig.output.hash === false ? false : true

  let tsconfig
  if (fs.existsSync(paths.tsconfig)) {
    tsconfig = require(paths.tsconfig)
  }

  if (alias) {
    const tsconfigPaths = {}
    Object.keys(alias).forEach(key => {
      if (tsconfig) {
        tsconfigPaths[key] = [alias[key]]
      }
      alias[key] = paths.resolveApp(alias[key])
    })
    if (tsconfig) {
      tsconfig.compilerOptions.paths = Object.assign(tsconfig.compilerOptions.paths, tsconfigPaths)
      fs.writeFileSync(paths.tsconfig, JSON.stringify(tsconfig))
      shell.exec(`prettier --write ${paths.resolveApp(paths.tsconfig)}`)
    }
  }

  const hasVue3Compiler = fs.existsSync(path.resolve("node_modules/@vue/compiler-sfc"))
  const hasVue2Compiler = fs.existsSync(path.resolve("node_modules/vue-template-compiler"))
  const vueVersion = hasVue3Compiler ? 3 : hasVue2Compiler ? 2 : 0

  const entry = () => {
    if (!userEntry) {
      console.log('Please add { ..."entry": "your entry path" ... } in "femi.json"')
      process.exit(0)
    }

    if (appEntry) {
      if (userEntry[appEntry]) {
        console.log(`Current Env:`, env.NODE_ENV)
        console.log(`Current App:`, appEntry)
        console.log(`Current Entry:`, userEntry[appEntry])
        return userEntry[appEntry]
      } else {
        throw new Error(`${appEntry} entry not found`)
      }
    } else {
      if (userEntry.default) {
        console.log(`Current Env:`, env.NODE_ENV)
        console.log(`Current App:`, "default")
        console.log(`Current Entry:`, userEntry.default)
        return userEntry.default
      } else if (typeof userEntry === "string") {
        return userEntry
      } else {
        console.log("You have not assign default entry.")
        return
      }
    }
  }

  const output = () => {
    const outputApp = env.appEntry ? `${env.appEntry}/js/[name]` : "js/[name]"
    const appHash = env.isEnvProduction && useOutputHash ? ".[chunkhash:8]" : ""
    return Object.assign(
      {
        publicPath: process.env.PUBLIC_URL ? process.env.PUBLIC_URL + "/" : "/",
        filename: `${outputApp}${appHash}.js`,
        chunkFilename: `${outputApp}${appHash}.chunk.js`,
        path: paths.output,
      },
      env.isSystem
        ? {
            libraryTarget: "system",
          }
        : {}
    )
  }

  const plugins = () => {
    const { isSystem } = env

    const VueLoaderPlugin = require(vueVersion === 3 ? "vue-loader-v16" : "vue-loader")
      .VueLoaderPlugin

    return {
      htmlWebpackPlugin: !isSystem && htmlWebpackPlugin,
      copyPlugin: !isSystem && copyPlugin,
      interpolateHtmlPlugin: !isSystem && interpolateHtmlPlugin,
      miniExtractPlugin: !isSystem && miniExtractPlugin,
      cleanWebpackPlugin: env.isEnvProduction && cleanWebpackPlugin,
      vueLoaderPlugin: vueVersion !== 0 && new VueLoaderPlugin(),
      tsconfigPathsPlugin: tsconfig && new TsconfigPathsPlugin(),
      terserJSPlugin,
      optimizeCSSAssetsPlugin,
      definePlugin,
    }
  }

  const tsLoader = {
    test: /\.tsx?$/,
    exclude: /(node_modules\/)/,
    use: {
      loader: "ts-loader",
      options: {
        getCustomTransformers: () => ({
          before: [styledComponentsTransformer],
        }),
      },
    },
  }

  const jsLoader = {
    test: /\.jsx?$/,
    exclude: [path.resolve(__dirname, "node_modules")],
    loader: "babel-loader",
  }

  const vueLoader =
    vueVersion === 3
      ? { test: /\.vue$/, loader: "vue-loader-v16" }
      : {
          test: /\.vue$/,
          loader: "vue-loader",
        }

  const styleLoader = {
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
  }

  const cssLoader = {
    loader: "css-loader",
    options: {
      // minimize: true,
    },
  }

  const lessLoader = {
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
  }

  const fileLoader = {
    loader: "file-loader",
    exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
    options: {
      name: "media/[name].[hash:8].[ext]",
    },
  }

  const urlLoader = {
    test: /\.(bmp|gif|jpe?g|png)$/,
    loader: "url-loader",
    options: {
      limit: 10000,
      name: "media/[name].[hash:8].[ext]",
    },
  }

  const terserJSPlugin = new TerserJSPlugin({
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
  })

  const optimizeCSSAssetsPlugin = new OptimizeCSSAssetsPlugin({
    cssProcessorPluginOptions: {
      parser: safePostCssParser,
      map: false,
    },
  })

  const htmlWebpackPlugin = new HtmlWebpackPlugin(
    Object.assign({
      inject: true,
      template: paths.html,
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
  )

  const copyPlugin = new CopyPlugin({
    patterns: [
      {
        from: "public",
        globOptions: {},
      },
    ],
  })

  const cleanWebpackPlugin = new CleanWebpackPlugin()
  const interpolateHtmlPlugin = new InterpolateHtmlPlugin(env)

  /* 分离出css */
  const miniExtractPlugin = new MiniCssExtractPlugin({
    filename: env.isEnvProduction && useOutputHash ? "css/[name].[hash].css" : "css/[name].css",
    chunkFilename:
      env.isEnvProduction && useOutputHash ? "css/[name].[hash].chunk.css" : "css/[name].css",
    ignoreOrder: false, // Enable to remove warnings about conflicting order
  })

  const definePlugin = new DefinePlugin(env.stringify)

  const splitChunks = {
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
  }

  return {
    userConfig,
    entry: entry(),
    output: output(),
    alias,
    loaders: {
      js: jsLoader,
      ts: tsLoader,
      vue: vueLoader,
      css: {
        test: /.css$/,
        use: env.isSystem
          ? [styleLoader, cssLoader]
          : [env.isEnvProduction ? MiniCssExtractPlugin.loader : styleLoader, cssLoader],
      },
      less: {
        test: /.less$/,
        use: env.isSystem
          ? [styleLoader, cssLoader, lessLoader]
          : [
              env.isEnvProduction ? MiniCssExtractPlugin.loader : styleLoader,
              cssLoader,
              lessLoader,
            ],
      },
      file: fileLoader,
      url: urlLoader,
      styleLoader,
      cssLoader,
      lessLoader,
    },
    plugins: plugins(),
    // splitChunks,
    devtool: env.isEnvDevelopment ? "source-map" : false,
    externals: (env.isEnvProduction && userConfig.externals) || [],
  }
}
