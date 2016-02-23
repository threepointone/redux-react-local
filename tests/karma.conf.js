module.exports = function (config) {
  config.set({
    browsers: [ 'Chrome' ],
    files: [ '../node_modules/babel-polyfill/dist/polyfill.js','./index.js' ],
    reporters: [ 'mocha', 'coverage' ],
    mochaReporter: {
      output: 'autowatch'
    },
    preprocessors: {
      '../src/*.js': [ 'coverage' ],
      './*.js': [ 'webpack' ]
    },
    webpack: {
      module: {
        loaders: [ {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel'
        }, {
          test: /\.js$/,
          include: require('path').join(__dirname, '../src'),
          loader: 'isparta'
        } ]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    frameworks: [ 'mocha', 'expect' ]
  })
}
