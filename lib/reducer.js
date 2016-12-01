'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = localReducer;

var _tree = require('./tree');

var T = _interopRequireWildcard(_tree);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var identity = function identity(x) {
  return x;
};


function get(key) {
  // todo - cache on an 'instance'
  return T.get(this.$$tree, key);
}

function localReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    $$tree: T.make(),
    $$fns: T.make(),
    $$changed: T.make()
  };
  var action = arguments[1];

  // ack!
  state.get = state.get || get;
  state.$$tree = state.$$tree || T.make();
  state.$$fns = state.$$fns || T.make();
  state.$$changed = state.$$changed || T.make();

  switch (action.type) {
    case '$$local.flushed':
      return flush(state, action);
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

function flush(state) {
  return {
    get: state.get,
    $$tree: state.$$tree,
    $$fns: state.$$fns,
    $$changed: T.make()
  };
}

function setState(state, _ref) {
  var payload = _ref.payload;

  if (payload.state === undefined) {
    throw new Error('cannot set undefined as local state');
  }

  return {
    get: state.get,
    $$fns: state.$$fns,
    $$tree: T.set(state.$$tree, payload.ident, payload.state),
    $$changed: T.set(state.$$changed, payload.ident, payload.state)
  };
}

function register(state, action) {
  var _action$payload = action.payload,
      ident = _action$payload.ident,
      initial = _action$payload.initial,
      reducer = _action$payload.reducer,
      fn = T.get(state.$$fns, ident);


  if (fn && fn !== identity && fn !== reducer) {
    throw new Error('local key ' + ident + ' already exists');
  }
  // this way we can 'persist' across unmounts
  // also makes preloading data simple
  var prevState = T.get(state.$$tree, ident);
  return {
    get: state.get,
    $$tree: prevState !== undefined ? state.$$tree : T.set(state.$$tree, ident, initial),
    $$fns: fn === reducer ? state.$$fns : T.set(state.$$fns, ident, reducer),
    $$changed: !prevState ? state.$$changed : T.set(state.$$changed, ident, prevState !== undefined ? prevState : initial)
  };
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
  var _action$payload2 = action.payload,
      persist = _action$payload2.persist,
      ident = _action$payload2.ident;

  if (persist) {
    return {
      get: state.get,
      $$tree: state.$$tree,
      $$changed: state.$$changed,
      $$fns: T.set(state.$$fns, ident, identity) // we use this as a signal that it's been unmounted
    };
  } else {
    return {
      get: state.get,
      $$changed: state.$$changed,
      $$tree: T.del(state.$$tree, ident),
      $$fns: T.del(state.$$fns, ident)
    };
  }
}

function reduceAll(state, action) {
  // update all local keys
  var _action$meta = action.meta;
  _action$meta = _action$meta === undefined ? {} : _action$meta;
  var ident = _action$meta.ident,
      local = _action$meta.local,
      $$fns = state.$$fns,
      changed = [],
      reducers = T.toObject($$fns),
      t = state.$$tree,
      entries = local ? [[ident, T.get(t, ident)]] : // localized actions trigger only the relevant reducer
  T.entries(state.$$tree);


  for (var i = 0; i < entries.length; i++) {
    var _entries$i = _slicedToArray(entries[i], 2),
        key = _entries$i[0],
        value = _entries$i[1];

    var $action = action;
    // if this originated from the same key, then add me: true
    if (key === ident && local) {
      $action = _extends({}, $action, { me: true });
    }

    // reduce
    var computed = reducers[key] ? reducers[key](value, $action) : value;

    if (computed === undefined) {
      throw new Error('did you forget to return state from the ' + key + ' reducer?'); // eslint-disable-line no-console
    }

    if (computed !== value) {
      t = T.set(t, key, computed);
      changed.push([key, computed]);
    }
  }

  return changed.length > 0 ? {
    get: state.get,
    $$fns: state.$$fns,
    $$tree: t,
    $$changed: changed.reduce(function (c, _ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          key = _ref3[0],
          value = _ref3[1];

      return T.set(c, key, value);
    }, state.$$changed)
  } : state;
}