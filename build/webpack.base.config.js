const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoPrefixer = require("autoprefixer");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
  entry: path.resolve(__dirname, '../src/index.tsx'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[contenthash].[name].js',
    assetModuleFilename: 'static/[hash][ext]',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        include: /node_modules/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [
                  autoPrefixer()
                ]
              }
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          },
        ],
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)$/,
        exclude: /node_modules/,
        // Webpack 5 新增 Asset Modules ，不再使用 url-loader 和 file-loader
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpg|gif|jpeg|ico|cur)$/,
        exclude: /node_modules/,
        type: 'asset/resource'
      },
    ],
  },
  resolve: {
    // 引入模块的时候可以省略这些后缀
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.d.ts'],
    alias: {
      "@": path.resolve(__dirname, "../src"),
      "@assets": path.resolve(__dirname, "../src/assets"),
      "@components": path.resolve(__dirname, "../src/components"),
    }
  },
  plugins: [
    // new ProgressBarPlugin({
    //   format: `:msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`
    // }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../public/index.html'),
      title: "react-zero-to-one",
      filename: "index.html",
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css', // 最终输出的文件名
      chunkFilename: '[id].css'
    }),
    new CleanWebpackPlugin()
  ],
  optimization: {
    splitChunks: {
      minSize: 3000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          // "initial" 针对入口文件做代码分割
          // "all" 把 node_modules 开发依赖都打包进 vendors
          // "async"(默认就是异步，针对异步加载的模块做代分割)
          chunks: 'all',
          // priority: 10,
        },
      }
    }
  }
}
