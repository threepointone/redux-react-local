'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFSA = isFSA;
exports.default = ensureFSAMiddleware;

var _lodash = require('lodash.isplainobject');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validKeys = ['type', 'payload', 'error', 'meta', 'optimist']; // like '@meadow/redux-ensure-fsa', but allows `optimist` as a key

function isValidKey(key) {
  return validKeys.indexOf(key) > -1;
}

function isFSA(action) {
  return (0, _lodash2.default)(action) && typeof action.type !== 'undefined' && Object.keys(action).every(isValidKey);
}

function ensureFSAMiddleware() {
  return function (next) {
    return function (action) {
      if (!isFSA(action)) {
        console.log(action); // eslint-disable-line
        throw new Error('Flux Standard Action Violation: Actions must only have type, payload, error, optimist, or meta properties.');
      }

      return next(action);
    };
  };
}