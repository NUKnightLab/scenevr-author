const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
