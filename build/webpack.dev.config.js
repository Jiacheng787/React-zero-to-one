const path = require('path');
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const DevServerBuiltPlugin = require("./DevServerBuiltPlugin");
// 从 .env 文件中读取环境变量，加载到 Node 的 process.env 中
const envParams = require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });

module.exports = merge(baseConfig, {
  mode: "development",
  // 开发环境下开启 sourceMap
  devtool: "eval-cheap-module-source-map",
  stats: 'none',
  // 设置 logger 的日志级别
  // 关掉 webapck-dev-server 启动打印的 info 日志
  infrastructureLogging: {
    level: 'error',
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
    // new webpack.ProgressPlugin((percentage, message, ...args) => {
    //   console.log(Math.round(percentage * 100) + "%", message, args);
    // }),
    // 从 process.env 读取环境变量，传入 DefinePlugin
    new webpack.EnvironmentPlugin(Object.keys(envParams.parsed))
  ]
})
