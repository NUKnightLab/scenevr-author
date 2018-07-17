const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const webpack = require('webpack');
const config = {
    entry:  __dirname + '/app/static/js/index.jsx',
    output: {
        path: __dirname + '/app/static/dist',
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      new CopyWebpackPlugin([
        { from: __dirname + '/app/static/assets', to: __dirname + '/app/static/dist' },
        { from: __dirname + '/app/static/fonts', to: __dirname + '/app/static/dist/fonts' },
      ]),
    ],
    module: {
      rules: [
        {
          test: /\.jsx?/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
                 fallback: 'style-loader',
                 use: 'css-loader',
               })
        }
      ]
    }
};
module.exports = config;
