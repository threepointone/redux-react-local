'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.localReducer = localReducer;
exports.local = local;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function log() {
  var _console;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  (_console = console).log.apply(_console, args.concat([this]));
  return this;
}

function localReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {
    registered: {}
  } : arguments[0];
  var action = arguments[1];

  if (action.meta && action.meta.local) {
    switch (action.meta.type) {
      case 'setState':
        return _extends({}, state, _defineProperty({}, action.meta.id, _extends({}, state[action.meta.id], action.payload)));
    }
  }
  if (action.type === 'local.register') {
    var _extends4;

    return _extends({}, state, (_extends4 = {}, _defineProperty(_extends4, action.payload.id, state[action.payload.id] || action.payload.initial), _defineProperty(_extends4, 'registered', _extends({}, state.registered, _defineProperty({}, action.payload.id, {
      reducer: action.payload.reducer
    }))), _extends4));
  }

  var reduced = Object.keys(state.registered).reduce(function (o, key) {
    return Object.assign(o, _defineProperty({}, key, state.registered[key].reducer(state[key], action)));
  }, {});
  return _extends({}, state, reduced);
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

  return function (Target) {
    var _class, _temp2;

    function prefix(id) {
      return id; // oh well
    }

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
    })((_temp2 = _class = function (_Component) {
      _inherits(ReduxReactLocal, _Component);

      function ReduxReactLocal() {
        var _Object$getPrototypeO;

        var _temp, _this, _ret;

        _classCallCheck(this, ReduxReactLocal);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(ReduxReactLocal)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
          id: getId(_this.props)
        }, _this._dispatch = function (action) {
          // check for action.type
          _this.props.dispatch({
            type: '$:' + prefix(getId(_this.props)) + ':' + action.type,
            payload: action.payload,
            meta: {
              // this is just to be faster when reducing
              id: _this.state.id,
              type: action.type,
              local: true
            }
          });
        }, _this._setState = function (state) {
          _this._dispatch({
            type: 'setState',
            payload: state
          });
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(ReduxReactLocal, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.props.dispatch({
            type: 'local.register',
            payload: {
              id: this.state.id,
              reducer: reducer,
              initial: getInitial(this.props)
            }
          });
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
          var id = getId(next);

          if (id !== this.state.id) {
            this.setState({
              id: id
            });
            this.props.dispatch({
              type: 'local.swap',
              payload: {
                id: this.state.id,
                next: id,
                initial: getInitial(next)
              }
            });
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Target, {
            setState: this._setState,
            xpatch: this._dispatch,
            state: this.props.local || getInitial(this.props)
          }, this.props.children);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.props.dispatch({
            type: 'local.unmount',
            payload: {
              id: this.id
            }
          });
        }
      }]);

      return ReduxReactLocal;
    }(_react.Component), _class.displayName = 'Ò:' + Target.displayName, _temp2));
  };
}