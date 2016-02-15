var path = require('path');
module.exports = {
  entry: {
    app: ['babel-polyfill', './example/transplant.js']
  },
  output: {
    path: path.join(__dirname, './example'),
    publicPath: '/example',
    filename: 'app.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader?modules' }
    ]
  }
};
