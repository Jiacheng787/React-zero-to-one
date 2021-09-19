const path = require('path');
const webpack = require('webpack');
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const envParams = require('dotenv').config({ path: path.resolve(__dirname, '../.env.production') });

module.exports = merge(baseConfig, {
  mode: "production",
  stats: "errors-only",
  plugins: [
    new webpack.EnvironmentPlugin(Object.keys(envParams.parsed))
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        }
      }),
      new CssMinimizerPlugin(), // 生产环境压缩 CSS
    ]
  }
})
