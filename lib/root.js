'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _class, _temp2;

var _react = require('react');

var _tree = require('./tree');

var T = _interopRequireWildcard(_tree);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isBrowserLike = typeof navigator !== 'undefined';

var Root = (_temp2 = _class = function (_Component) {
  _inherits(Root, _Component);

  function Root() {
    var _temp, _this, _ret;

    _classCallCheck(this, Root);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.fns = {}, _this._local = function (ident, fn) {
      _this.fns[ident] = [].concat(_toConsumableArray(_this.fns[ident] || []), [fn]);
      return function () {
        return _this.fns[ident] = _this.fns[ident].filter(function (x) {
          return x !== fn;
        });
      };
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Root.prototype.getChildContext = function getChildContext() {
    return {
      $$local: this._local
    };
  };

  Root.prototype.componentWillMount = function componentWillMount() {
    var _this2 = this;

    if (isBrowserLike) {
      this.dispose = this.context.store.subscribe(function () {
        var state = _this2.context.store.getState().local,
            changed = false;
        T.entries(state.$$changed).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var key = _ref2[0];
          var value = _ref2[1];

          changed = true;
          (_this2.fns[key] || []).forEach(function (fn) {
            return fn(value);
          });
        });
        if (changed) {
          _this2.context.store.dispatch({ type: '$$local.flushed' });
        }
      });
    }
  };

  Root.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.dispose) {
      this.dispose();
    }
  };

  Root.prototype.render = function render() {
    return this.props.children;
  };

  return Root;
}(_react.Component), _class.contextTypes = {
  store: _react.PropTypes.object
}, _class.childContextTypes = {
  $$local: _react.PropTypes.func
}, _temp2);
exports.default = Root;