'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocalState = getLocalState;
function getLocalState(state) {
  if (typeof state.get === 'function') {
    return state.get('local');
  }
  return state.local;
};