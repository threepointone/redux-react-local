'use strict';

var _decorator = require('./decorator');

var _decorator2 = _interopRequireDefault(_decorator);

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  local: _decorator2.default,
  reducer: _reducer2.default
};