'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

exports.default = local;

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  ReduxReactLocal: {
    displayName: 'ReduxReactLocal',
    isInFunction: true
  }
};

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2 = (0, _index6.default)({
  filename: 'src/decorator.js',
  components: _components,
  locals: [module],
  imports: [_react3.default]
});

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2 = (0, _index4.default)({
  filename: 'src/decorator.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _index2.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2(_UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2(Component, id), id);
  };
}

function local() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? // experimental - can swap out state on unmount
  {} : arguments[0];

  var ident = _ref.ident;
  var _ref$initial = _ref.initial;
  var // string / ƒ(props)
  initial = _ref$initial === undefined ? {} : _ref$initial;
  var _ref$reducer = _ref.reducer;
  var // value / ƒ(props)
  reducer = _ref$reducer === undefined ? function (x) {
    return x;
  } : _ref$reducer;
  var _ref$persist = _ref.persist;
  var // ƒ(state, action) => state
  persist = _ref$persist === undefined ? true : _ref$persist;

  if (!ident) {
    throw new Error('cannot annotate with @local without an ident');
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

  return function (Target) {
    var _dec, _class, _class2, _temp2;

    return _wrapComponent('ReduxReactLocal')((_dec = (0, _reactRedux.connect)(function (state, props) {
      return {
        local: state.local[getId(props)]
      };
    }), _dec(_class = (_temp2 = _class2 = function (_Component) {
      _inherits(ReduxReactLocal, _Component);

      function ReduxReactLocal() {
        var _Object$getPrototypeO;

        var _temp, _this, _ret;

        _classCallCheck(this, ReduxReactLocal);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(ReduxReactLocal)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
          id: getId(_this.props),
          value: getInitial(_this.props)
        }, _this.$ = function (action) {
          // 'localize' an event. super conveninent for actions 'local' to this component
          return _extends({}, action, {
            type: _this.state.id + ':' + action.type,
            meta: _extends({}, action.meta || {}, {
              ident: _this.state.id,
              type: action.type,
              local: true
            })
          });
        }, _this._setState = function (state) {
          _this.props.dispatch({ type: '$$local.setState', payload: { state: state, ident: _this.state.id } });
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(ReduxReactLocal, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.props.dispatch({
            type: '$$local.register',
            payload: {
              ident: this.state.id,
              initial: this.state.value,
              reducer: reducer,
              persist: persist
            }
          });
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
          var id = getId(next);

          if (id !== this.state.id) {
            var init = getInitial(next);
            this.props.dispatch({
              type: '$$local.swap',
              payload: {
                ident: this.state.id,
                next: id,
                initial: init,
                reducer: reducer,
                persist: persist
              }
            });
            this.setState({ id: id, value: next.local !== undefined ? next.local : init });
          } else {
            this.setState({ value: next.local });
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.props.dispatch({
            type: '$$local.unmount',
            payload: {
              ident: this.state.id,
              persist: persist
            }
          });
        }
      }, {
        key: 'render',
        value: function render() {
          return _react3.default.createElement(Target, _extends({}, this.props, {
            $: this.$,
            ident: this.state.id,
            dispatch: this.props.dispatch,
            state: this.state.value,
            setState: this._setState
          }), this.props.children);
        }
      }]);

      return ReduxReactLocal;
    }(_react2.Component), _class2.displayName = 'local:' + (Target.displayName || Target.name), _temp2)) || _class));
  };
}