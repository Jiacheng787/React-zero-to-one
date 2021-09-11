const path = require('path');
const webpack = require("webpack");
const { promisify } = require('util');
const figlet = promisify(require('figlet'));
const chalk = require('chalk');
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const DevServerBuiltPlugin = require("./DevServerBuiltPlugin");
// 从 .env 文件中读取环境变量，加载到 Node 的 process.env 中
const envParams = require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });

module.exports = merge(baseConfig, {
  mode: "development",
  // 开发环境下开启 sourceMap
  devtool: "source-map",
  stats: 'none',
  devServer: {
    static: path.resolve(__dirname, '../dist'),
    // contentBase: path.join(__dirname, 'dist'),
    compress: true,
    hot: true,
    // open: true,
    // publicPath: '/',
    host: 'localhost',
    port: '8066',
    onListening: async () => {
      console.log(await figlet("Garfield CLI"));
      console.log(chalk.bgBlue.black(' INFO ') + "  Starting development server...");
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new DevServerBuiltPlugin("localhost", "8066"),
    // new webpack.ProgressPlugin((percentage, message, ...args) => {
    //   console.log(Math.round(percentage * 100) + "%", message, args);
    // }),
    // 从 process.env 读取环境变量，传入 DefinePlugin
    new webpack.EnvironmentPlugin(Object.keys(envParams.parsed))
  ]
})
