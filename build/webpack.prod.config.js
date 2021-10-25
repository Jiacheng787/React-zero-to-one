const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(baseConfig, {
  mode: "production",
  stats: "errors-only",
  module: {
    rules: [
      {
        test: /\.css$/i,
        include: /node_modules/,
        use: [
          // 生产环境下将 CSS 抽取到单独的样式文件中
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css', // 最终输出的文件名
      chunkFilename: '[id].css'
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      // 生产环境压缩 JS
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        }
      }),
      // 生产环境压缩 CSS
      new CssMinimizerPlugin(),
    ]
  }
})
