module.exports = function(config){
  config.set({
    browsers: ['Chrome'],
    files: ['./index.js'],
    reporters: ['mocha', 'coverage'],
    mochaReporter: {
      output: 'autowatch'
    },
    preprocessors: {
      '../src/*.js': ['coverage'],
      './index.js': ['webpack'],
    },
    webpack: {
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel'
        }, {
          test: /\.js$/,
          include: require('path').resolve('src/'),
          loader: 'isparta'
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    frameworks: ['mocha', 'expect']
  });
};
