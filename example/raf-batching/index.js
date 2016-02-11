
var ReactRAFBatchingStrategy = require('./strategy');
var ReactUpdates = require('react/lib/ReactUpdates');

function inject() {
  ReactUpdates.injection.injectBatchingStrategy(ReactRAFBatchingStrategy);
}

var ReactRAFBatching = {
  inject: inject
};

module.exports = ReactRAFBatching;