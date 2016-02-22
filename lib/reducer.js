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
  if (!has.call(obj, key)) {
    return obj;
  }
  return Object.keys(obj).reduce(function (o, k) {
    return k === key ? o : (o[k] = obj[k], o);
  }, {});
}

function localReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? { $$fns: {} } : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case '$$local.setState':
      return setState(state, action);
    case '$$local.register':
      return register(state, action);
    case '$$local.swap':
      return swap(state, action);
    case '$$local.unmount':
      return unmount(state, action);
    default:
      return reduceAll(state, action);
  }
}

function setState(state, _ref) {
  var payload = _ref.payload;

  // todo - test for undefined
  if (payload.state === undefined) {
    throw new Error('cannot set undefined as local state');
  }
  return _extends({}, state, _defineProperty({}, payload.ident, payload.state));
}

function register(state, action) {
  var _extends4;

  var _action$payload = action.payload;
  var ident = _action$payload.ident;
  var initial = _action$payload.initial;
  var reducer = _action$payload.reducer;
  var fn = state.$$fns[ident];

  if (ident === '$$fns') {
    throw new Error('cannot have an ident named `$$fns`, sorry!');
  }

  if (fn && fn !== identity && fn !== reducer) {
    // todo - throw, but not when hot reloading
    console.warn(ident + ' already exists, swapping anyway'); // eslint-disable-line no-console
  }

  return _extends({}, state, (_extends4 = {}, _defineProperty(_extends4, ident, state[ident] !== undefined ? state[ident] : initial), _defineProperty(_extends4, '$$fns', _extends({}, state.$$fns, _defineProperty({}, ident, reducer))), _extends4));
}

function swap(state, action) {
  var payload = action.payload;

  return register(unmount(state, action), _extends({}, action, {
    payload: _extends({}, payload, {
      ident: payload.next
    })
  }));
}

function unmount(state, action) {
  var _action$payload2 = action.payload;
  var persist = _action$payload2.persist;
  var ident = _action$payload2.ident;

  if (persist) {
    return _extends({}, state, {
      $$fns: _extends({}, state.$$fns, _defineProperty({}, ident, identity))
    });
  } else // we use this as a signal that it's been unmounted
    {
      return _extends({}, omit(state, ident), {
        $$fns: omit(state.$$fns, ident)
      });
    }
}

function reduceAll(state, action) {
  // update all local keys
  var _action$meta = action.meta;
  _action$meta = _action$meta === undefined ? {} : _action$meta;
  var ident = _action$meta.ident;
  var local = _action$meta.local;
  var $$fns = state.$$fns;
  var o = { $$fns: $$fns };
  var changed = false;

  Object.keys(state).forEach(function (key) {
    if (key === '$$fns') {
      return;
    }

    var $action = action;
    // if this originated from the same key, then add me: true
    if (key === ident && local) {
      $action = _extends({}, $action, { me: true });
    }

    // reduce
    var computed = $$fns[key](state[key], $action);
    if (computed === undefined) {
      console.warn('did you forget to return state from the ' + key + ' reducer?'); // eslint-disable-line no-console
    }

    if (computed !== state[key]) {
      changed = true;
    }
    o[key] = computed;
  });

  if (!changed) {
    // prevent rerenders if nothing's changed
    return state;
  }

  return o;
}