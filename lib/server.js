'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.stringifySafe = stringifySafe;
// import { renderToString } from 'react-dom/server'

// export function resolveLocalReducers(element) {
//   // this is dumb enough to work
//   renderToString(element)
// }

function stringifySafe(state) {
  if (!state.hasOwnProperty('local')) {
    return state;
  }

  return _extends({}, state, {
    local: _extends({}, state.local, {
      $$fns: {}
    })
  });
}