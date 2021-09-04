const path = require('path');
const webpack = require('webpack');
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const envParams = require('dotenv').config({ path: path.resolve(__dirname, '../.env.production') });

module.exports = merge(baseConfig, {
  mode: "production",
  stats: "errors-only",
  plugins: [
    new webpack.EnvironmentPlugin(Object.keys(envParams.parsed))
  ]
})
