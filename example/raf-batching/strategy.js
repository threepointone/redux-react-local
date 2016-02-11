
var ReactUpdates = require('react/lib/ReactUpdates');

var requestAnimationFrame = require('./raf');

function tick() {
  ReactUpdates.flushBatchedUpdates();
  requestAnimationFrame(tick);
}

var ReactRAFBatchingStrategy = {
  isBatchingUpdates: true,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, param) {
    callback(param);
  }
};

requestAnimationFrame(tick);

module.exports = ReactRAFBatchingStrategy;