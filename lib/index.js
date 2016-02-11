'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Root = undefined;

var _index = require('/Users/sunilpai/code/redux-react-local/node_modules/redbox-react/lib/index.js');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('/Users/sunilpai/code/redux-react-local/node_modules/react-transform-catch-errors/lib/index.js');

var _index4 = _interopRequireDefault(_index3);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _index5 = require('/Users/sunilpai/code/redux-react-local/node_modules/react-transform-hmr/lib/index.js');

var _index6 = _interopRequireDefault(_index5);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2;

exports.localReducer = localReducer;
exports.local = local;

var _reactRedux = require('react-redux');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _reduxBatchedSubscribe = require('redux-batched-subscribe');

var _reactDom = require('react-dom');

var _redux = require('redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Root: {
    displayName: 'Root'
  },
  ReduxReactLocal: {
    displayName: 'ReduxReactLocal',
    isInFunction: true
  }
};

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2 = (0, _index6.default)({
  filename: 'src/index.js',
  components: _components,
  locals: [module],
  imports: [_react3.default]
});

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2 = (0, _index4.default)({
  filename: 'src/index.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _index2.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2(_UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2(Component, id), id);
  };
}

// local component state, synced to a redux store

function log() {
  var _console;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  (_console = console).log.apply(_console, args.concat([this]));
  return this;
}

var Root = exports.Root = _wrapComponent('Root')((_temp2 = _class = function (_Component) {
  _inherits(Root, _Component);

  function Root() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Root);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Root)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.sagas = (0, _reduxSaga2.default)(), _this.store = (0, _redux.createStore)((0, _redux.combineReducers)(_extends({}, _this.props.reducers, {
      local: localReducer
    })), {
      // initial state
    }, (0, _redux.compose)(_redux.applyMiddleware.apply(undefined, _toConsumableArray(_this.props.middleware).concat([_this.sagas])), (0, _reduxBatchedSubscribe.batchedSubscribe)(_reactDom.unstable_batchedUpdates))), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Root, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        sagas: this.sagas
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react3.default.createElement(
        _reactRedux.Provider,
        { store: this.store },
        this.props.children
      );
    }
  }]);

  return Root;
}(_react2.Component), _class.propTypes = {
  middleware: _react2.PropTypes.array,
  reducers: _react2.PropTypes.object
}, _class.defaultProps = {
  middleware: [],
  reducers: {}
}, _class.childContextTypes = {
  sagas: _react2.PropTypes.func
}, _temp2));

var identity = function identity(x) {
  return x;
};

function localReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? { registered: {} } : arguments[0];
  var action = arguments[1];
  var payload = action.payload;
  var type = action.type;
  var meta = action.meta;

  if (type === 'local.register') {
    var _extends3;

    if (state.registered[payload.id] && state.registered[payload.id].reducer !== identity) {
      // todo - throw, but not when hot reloading
      console.warn(payload.id + ' already exists');
    }
    if (payload.id === 'registered') {
      throw new Error('cannot have an ident named `registered`, sorry!');
    }
    state = _extends({}, state, (_extends3 = {}, _defineProperty(_extends3, payload.id, state[payload.id] || payload.initial), _defineProperty(_extends3, 'registered', _extends({}, state.registered, _defineProperty({}, payload.id, {
      reducer: payload.reducer
    }))), _extends3));
  }

  if (type === 'local.swap') {
    // ???
    return state;
  }

  var ret = { registered: state.registered },
      changed = false;
  Object.keys(state.registered).forEach(function (key) {
    var a = action;

    if (meta && meta.local && key === meta.id) {
      a = _extends({}, a, {
        me: true
      });
    }

    var computed = state.registered[key].reducer(state[key], a);

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
    var _extends5;

    state = _extends({}, state, (_extends5 = {}, _defineProperty(_extends5, payload.id, payload.persist ? state[payload.id] : undefined), _defineProperty(_extends5, 'registered', _extends({}, state.registered, _defineProperty({}, payload.id, {
      reducer: identity // signals that this is unmounted
    }))), _extends5));
  }

  return state;
}

function local() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var ident = _ref.ident;
  var _ref$initial = _ref.initial;
  var initial = _ref$initial === undefined ? {} : _ref$initial;
  var _ref$reducer = _ref.reducer;
  var reducer = _ref$reducer === undefined ? function (x) {
    return x;
  } : _ref$reducer;
  var saga = _ref.saga;
  var _ref$persist = _ref.persist;
  var persist = _ref$persist === undefined ? true : _ref$persist;

  if (!ident) {
    throw new Error('cannot annotate with @local without an ident');
  }

  return function (Target) {
    var _class2, _temp4;

    function getId(props) {
      if (typeof ident === 'string') {
        return ident;
      }
      return ident(props);
    }

    function getInitial(props) {
      if (typeof initial !== 'function') {
        return initial;
      }
      return initial(props);
    }

    return (0, _reactRedux.connect)(function (state, props) {
      return { local: state.local[getId(props)] };
    })(_wrapComponent('ReduxReactLocal')((_temp4 = _class2 = function (_Component2) {
      _inherits(ReduxReactLocal, _Component2);

      function ReduxReactLocal() {
        var _Object$getPrototypeO2;

        var _temp3, _this2, _ret2;

        _classCallCheck(this, ReduxReactLocal);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return _ret2 = (_temp3 = (_this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO2 = Object.getPrototypeOf(ReduxReactLocal)).call.apply(_Object$getPrototypeO2, [this].concat(args))), _this2), _this2.state = {
          id: getId(_this2.props),
          value: getInitial(_this2.props)
        }, _this2.$ = function (type, payload, more) {
          var action = {
            type: _this2.state.id + ':' + type,
            payload: payload,
            meta: {
              // this is just to be faster when reducing
              id: _this2.state.id,
              type: type,
              local: true
            }
          };
          if (more) {
            Object.assign(action, more);
          }
          return action;
        }, _temp3), _possibleConstructorReturn(_this2, _ret2);
      }

      _createClass(ReduxReactLocal, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.props.dispatch({
            type: 'local.register',
            payload: {
              id: this.state.id,
              reducer: reducer,
              initial: this.state.value
            }
          });
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this3 = this;

          if (saga) {
            this.runningSaga = this.context.sagas.run(saga, {
              $: this.$,
              ident: this.state.id,
              getState: function getState() {
                return _this3.state.value;
              }
            });
          }
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
          var id = getId(next);

          if (id !== this.state.id) {
            this.props.dispatch({
              type: 'local.swap',
              payload: {
                id: this.state.id,
                next: id,
                initial: getInitial(next)
              }
            });
          }
          this.setState({ id: id, value: next.local });
        }
      }, {
        key: 'render',
        value: function render() {
          return _react3.default.createElement(Target, _extends({}, this.props, {
            $: this.$,
            ident: this.state.id,
            dispatch: this.props.dispatch,
            state: this.state.value
          }), this.props.children);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.props.dispatch({
            type: 'local.unmount',
            payload: {
              id: this.id,
              persist: persist
            }
          });
          if (this.runningSaga) {
            this.runningSaga.cancel();
            delete this.runningSaga;
          }
        }
      }]);

      return ReduxReactLocal;
    }(_react2.Component), _class2.displayName = 'local:' + (Target.displayName || Target.name), _class2.contextTypes = {
      sagas: _react2.PropTypes.func
    }, _temp4)));
  };
}