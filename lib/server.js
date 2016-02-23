'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.stringifySafe = stringifySafe;
var has = {}.hasOwnProperty;

function stringifySafe(state) {
  if (!has.call(state, 'local')) {
    return state;
  }

  return _extends({}, state, {
    local: _extends({}, state.local, {
      $$fns: {}
    })
  });
}