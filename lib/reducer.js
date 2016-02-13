'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = localReducer;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var identity = function identity(x) {
  return x;
};

var has = {}.hasOwnProperty;

function omit(obj, key) {
  var _context;

  if (!(_context = obj[key], has).call(_context, key)) {
    return obj;
  }
  return Object.keys(obj).reduce(function (o, k) {
    return k === key ? o : (o[k] = obj[k], o);
  }, {});
}

function localReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? { registered: {} } : arguments[0];
  var action = arguments[1];
  var payload = action.payload;
  var type = action.type;
  var meta = action.meta;
  // this is the test sequence -
  // - setState
  // - local.register
  // - local.swap
  // - then reduce on all local keys
  // - local.unmount

  if (meta && meta.local && meta.type === 'setState') {
    // shortcircuit
    return _extends({}, state, _defineProperty({}, meta.ident, payload));
  }

  if (type === 'local.register') {
    var _extends4;

    if (state.registered[payload.ident] && state.registered[payload.ident].reducer !== identity) {
      // todo - throw, but not when hot reloading
      console.warn(payload.ident + ' already exists');
    }
    if (payload.ident === 'registered') {
      throw new Error('cannot have an ident named `registered`, sorry!');
    }
    state = _extends({}, state, (_extends4 = {}, _defineProperty(_extends4, payload.ident, state[payload.ident] !== undefined ? state[payload.ident] : payload.initial), _defineProperty(_extends4, 'registered', _extends({}, state.registered, _defineProperty({}, payload.ident, {
      reducer: payload.reducer
    }))), _extends4));
  }

  if (type === 'local.swap') {
    // ???
    return state;
  }

  // update all local keys
  var ret = { registered: state.registered },
      changed = false;
  Object.keys(state.registered).forEach(function (key) {
    var a = action;

    // if this originated from the same key, then add me: true
    if (meta && meta.local && key === meta.ident) {
      a = _extends({}, a, {
        me: true
      });
    }

    // reduce
    var computed = state.registered[key].reducer(state[key], a);
    if (computed === undefined) {
      console.warn('did you forget to return state from the ' + key + ' reducer?');
    }

    if (computed !== state[key]) {
      changed = true;
    }
    ret[key] = computed;
  });

  if (changed) {
    // prevent rerenders if nothing's changed
    state = ret;
  }

  if (type === 'local.unmount') {
    if (payload.persist) {
      state = _extends({}, state, {
        registered: _extends({}, state.registered, _defineProperty({}, payload.ident, { reducer: identity }))
      });
    } else {
      state = _extends({}, omit(state, payload.ident), {
        registered: omit(state.registered, payload.ident)
      });
    }
  }

  return state;
}