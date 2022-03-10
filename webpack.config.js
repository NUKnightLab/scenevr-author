const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require("path")

const webpack = require('webpack');
const config = {
    entry:  path.resolve(__dirname, "app", "static", "js", "index.jsx"),
    output: {
        path: path.resolve(__dirname, "app", "static"),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "styles.css"
      })
    ],
    module: {
      rules: [
        {
          test: /\.jsx?/,
          exclude: [
            path.resolve(__dirname, "node_modules")
          ],
          use: [
            'babel-loader'
          ]
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ]
        }
      ]
    }
};
module.exports = config;
