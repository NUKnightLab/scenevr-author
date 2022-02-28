const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require("path")

const webpack = require('webpack');
const config = {
    entry:  path.resolve(__dirname, "app", "static", "js", "index.jsx"),
    output: {
        path: path.resolve(__dirname, "app", "static", "dist"),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "styles.css"
      }),
      new CopyWebpackPlugin({
        patterns: [
            { from: path.resolve(__dirname, "app", "static", "assets"), to: path.resolve(__dirname, "app", "static", "dist") },
            { from: path.resolve(__dirname, "app", "static", "fonts"), to: path.resolve(__dirname, "app", "static", "dist", "fonts") },
        ]
      }),
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
