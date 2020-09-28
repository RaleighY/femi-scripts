const path = require("path")
const styledComponentsTransformer = require("typescript-plugin-styled-components").default()
const TerserJSPlugin = require("terser-webpack-plugin")
const safePostCssParser = require("postcss-safe-parser")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const vueLoaderPlugin = require("vue-loader/lib/plugin")
const paths = require("./paths")
const env = require("./env")
const userConfig = require(paths.Config)

const isOutputHash =
  env.isEnvProduction && userConfig.output && (userConfig.output.hash === false ? false : true)

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

const vueLoader = {
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
    minimize: true,
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
    template: paths.Html,
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

/* 分离出css */
const miniExtractPlugin = new MiniCssExtractPlugin({
  filename: env.isEnvProduction ? "css/[name].[hash].css" : "css/[name].css",
  chunkFilename: env.isEnvProduction ? "css/[name].[hash].chunk.css" : "css/[name].css",
  ignoreOrder: false, // Enable to remove warnings about conflicting order
})

module.exports = {
  entry(appName) {
    const action = env.isEnvProduction ? "Build" : "Dev"

    if (appName) {
      if (appName && paths["Entry_" + appName]) {
        console.log(`${action} Entry:`, appName)
        return paths["Entry_" + appName]
      } else {
        throw new Error(`${appName} Entry Not Found`)
      }
    } else {
      console.log(`${action} Entry Main`)
      return paths.Entry_Main
    }
  },
  output(appName) {
    const outputApp = appName ? `${appName}/js/[name]` : "js/[name]"
    const appHash = isOutputHash ? ".[chunkhash:8]" : ""
    return {
      publicPath: process.env.PUBLIC_URL ? process.env.PUBLIC_URL + "/" : "/",
      filename: `${outputApp}${appHash}.js`,
      chunkFilename: `${outputApp}${appHash}.chunk.js`,
      path: paths.Output,
    }
  },
  config: {
    isOutputHash,
  },
  loaders: {
    js: jsLoader,
    ts: tsLoader,
    vue: vueLoader,
    css: {
      test: /.css$/,
      use: [env.isEnvProduction ? MiniCssExtractPlugin.loader : styleLoader, cssLoader],
    },
    less: {
      test: /.less$/,
      use: [env.isEnvProduction ? MiniCssExtractPlugin.loader : styleLoader, cssLoader, lessLoader],
    },
    file: fileLoader,
    url: urlLoader,
    styleLoader,
    cssLoader,
    lessLoader,
  },
  plugins: {
    htmlWebpackPlugin,
    copyPlugin,
    miniExtractPlugin,
    terserJSPlugin,
    optimizeCSSAssetsPlugin,
    vueLoaderPlugin,
  },
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
}
