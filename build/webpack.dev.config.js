const path = require('path');
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
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
    open: true,
    // publicPath: '/',
    host: 'localhost',
    port: '8066',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // 从 process.env 读取环境变量，传入 DefinePlugin
    new webpack.EnvironmentPlugin(Object.keys(envParams.parsed))
  ]
})
