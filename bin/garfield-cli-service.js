#!/usr/bin/env node
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { promisify } = require('util');
const figlet = promisify(require('figlet'));
const chalk = require('chalk');
const parseArgs = require('minimist');

const args = parseArgs(process.argv.slice(2));
const { _: [command], NODE_ENV } = args;

const webpackConfig = webpackConfigStrategy(NODE_ENV);

const compiler = webpack(webpackConfig);
// 在 Webpack 4 中是先传入 compiler ，再传入 options
// Webpack 5 传参反一下
const server = new WebpackDevServer({
  ...webpackConfig.devServer,
  open: true,
}, compiler);

// Webpack 4 使用 listen() 方法启动开发服务器
// Webpack 5 使用 start() 方法，由于是 async 方法，因此可以通过 .catch() 捕获异常
// server.start();

// 此外还可以使用 startCallback 方法
// server.startCallback();

(async () => {
  console.log(await figlet("Garfield CLI"));
  console.log(chalk.bgBlue.black(' INFO ') + "  Starting development server...");
  server.start();
})();


function webpackConfigStrategy(env) {
  // TODO: 增加 staging 环境支持
  let strategy = {
    development: () => require(path.resolve(__dirname, "../build/webpack.dev.config.js")),
    production: () => require(path.resolve(__dirname, "../build/webpack.prod.config.js")),
  }
  if (!env || !Object.keys(strategy).includes(env)) {
    return {};
  }
  return strategy[env]();
}
