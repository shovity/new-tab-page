const path = require('path')

const JS_SOURCE_PATH = path.join(__dirname, 'src')

module.exports = {
  entry: {
    newtab: path.join(JS_SOURCE_PATH, 'newtab'),
    background: path.join(JS_SOURCE_PATH, 'background')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'app')
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|ttf|svg)$/,
        use: [ 'url-loader' ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]}
    ]
  },
  devtool: "source-map"
}