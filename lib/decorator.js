'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = local;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isBrowserLike = typeof navigator !== 'undefined';

function whenUndefined(o, orElse) {
  return o === undefined ? orElse : o;
}

var has = {}.hasOwnProperty;

// modified from gaearon/react-pure-render
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (var i = 0; i < keysA.length; i++) {
    if (!has.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

function local() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? // can swap out state on unmount
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

  // if (!initial) {
  //   throw new Error('cannot annotate with @local without an initial state')
  // }

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
    var _class, _temp2;

    return _temp2 = _class = function (_Component) {
      _inherits(ReduxReactLocal, _Component);

      function ReduxReactLocal() {
        var _temp, _this, _ret;

        _classCallCheck(this, ReduxReactLocal);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.store = _this.context.store, _this.state = function () {
          var id = getId(_this.props),
              storeState = _this.store.getState();

          if (!storeState.local) {
            throw new Error('did you forget to include the `local` reducer?');
          }
          return {
            id: id,
            value: whenUndefined(storeState.local.get(id), getInitial(_this.props))
          };
        }(), _this.$ = function (action) {
          // 'localize' an event. super convenient for making actions 'local' to this component
          return _extends({}, action, {
            type: _this.state.id + ':' + action.type,
            meta: _extends({}, action.meta || {}, {
              ident: _this.state.id,
              type: action.type,
              local: true
            })
          });
        }, _this._setState = function (state) {
          _this.store.dispatch({ type: '$$local.setState', payload: { state: state, ident: _this.state.id } });
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      ReduxReactLocal.prototype.componentWillMount = function componentWillMount() {
        var _this2 = this;

        this.store.dispatch({
          type: '$$local.register',
          payload: {
            ident: this.state.id,
            initial: this.state.value,
            reducer: reducer,
            persist: persist
          }
        });
        if (isBrowserLike) {
          this.dispose = this.context.$$local(this.state.id, function (value) {
            _this2.setState({ value: value });
          });
        }
      };

      ReduxReactLocal.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) || this.state.id !== nextState.id || this.state.value !== nextState.value;
      };

      ReduxReactLocal.prototype.componentWillReceiveProps = function componentWillReceiveProps(next) {
        var id = getId(next);

        if (id !== this.state.id) {
          var init = getInitial(next);
          this.store.dispatch({
            type: '$$local.swap',
            payload: {
              ident: this.state.id,
              next: id,
              initial: init,
              reducer: reducer,
              persist: persist
            }
          });

          this.setState({
            id: id,
            value: whenUndefined(this.store.getState().local.get(id), init)
          });
        }
      };

      ReduxReactLocal.prototype.componentWillUnmount = function componentWillUnmount() {
        this.store.dispatch({
          type: '$$local.unmount',
          payload: {
            ident: this.state.id,
            persist: persist
          }
        });
        if (this.dispose) {
          this.dispose();
        }
      };

      ReduxReactLocal.prototype.render = function render() {
        return _react2.default.createElement(
          Target,
          _extends({}, this.props, {
            $: this.$,
            ident: this.state.id,
            dispatch: this.store.dispatch,
            state: this.state.value,
            setState: this._setState }),
          this.props.children
        );
      };

      return ReduxReactLocal;
    }(_react.Component), _class.contextTypes = {
      store: _react.PropTypes.shape({
        subscribe: _react.PropTypes.func.isRequired,
        dispatch: _react.PropTypes.func.isRequired,
        getState: _react.PropTypes.func.isRequired
      }),
      $$local: _react.PropTypes.func
    }, _class.displayName = 'local:' + (Target.displayName || Target.name), _temp2;
  };
}