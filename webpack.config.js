const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: [ resolve('./dist'), resolve('./public') ]
  },
  resolve: {
    extensions: ['.js', '.css'],
    alias: {
      '@': resolve('./src')
    }
  },
  entry:　{
    app: resolve('./src/app.js')
  },
  output: {
    path: resolve('./dist'),
    filename: '[name].js'
  },
  module: { 
    rules: [
      { test: /\.css$/, exclude: /node_modules/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: 'index.html'
    }),
    new CleanWebpackPlugin()
  ],
  node: {
    fs: 'empty'
  }
}

function resolve(_path) {
  return path.resolve(__dirname, _path)
}