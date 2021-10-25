const path = require('path');
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const ESLintPlugin = require('eslint-webpack-plugin');
const DevServerBuiltPlugin = require("./DevServerBuiltPlugin");

module.exports = merge(baseConfig, {
  mode: "development",
  // 开发环境下开启 sourceMap
  devtool: "eval-cheap-module-source-map",
  stats: 'none',
  // 设置 logger 的日志级别
  // 关掉 webapck-dev-server 启动打印的 info 日志
  // infrastructureLogging: {
  //   level: 'error',
  // },
  module: {
    rules: [
      // {
      //   enforce: 'pre', // ESLint 优先级高于其他 JS 相关的 loader
      //   test: /\.(js|ts)x?$/,
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader'
      // },
      {
        test: /\.css$/i,
        include: /node_modules/,
        use: [
          // 开发环境下启用了 HMR，为了让样式源文件的修改同样也能被热替换，不能使用 MiniCssExtractPlugin，而转为随 JS Bundle 一起输出
          'style-loader',
          'css-loader'
        ],
      },
    ]
  },
  devServer: {
    static: path.resolve(__dirname, '../dist'),
    // contentBase: path.join(__dirname, 'dist'),
    compress: true,
    hot: true,
    // open: true,
    // publicPath: '/',
    host: 'localhost',
    port: '8066',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new DevServerBuiltPlugin("localhost", "8066"),
    new webpack.ProgressPlugin({
      handler: (percentage, msg, ...args) => {
        if (!['building', 'emitting'].includes(msg)) return;
        console.log(`${Math.floor(percentage * 100)}%`, msg, ...args);
        if (percentage === 1 || (!msg && args.length === 0)) console.log();
      },
      entries: false,
      dependencies: false,
      activeModules: true,
      modules: true,
      modulesCount: 500,
      profile: false
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx']
    }),
  ]
})
