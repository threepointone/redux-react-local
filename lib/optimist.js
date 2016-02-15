'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Optimist = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2;

var _react = require('react');

var _reduxOptimist = require('redux-optimist');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Optimist = exports.Optimist = (_temp2 = _class = function (_Component) {
  _inherits(Optimist, _Component);

  function Optimist() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Optimist);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Optimist)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.transactionID = 0, _this.optimist = function (name) {
      var id = _this.transactionID++;
      return {
        begin: function begin(action) {
          return _extends({
            type: name
          }, action, {
            optimist: { type: _reduxOptimist.BEGIN, id: id }
          });
        },
        commit: function commit(action) {
          return _extends({
            type: name + ':commit'
          }, action, {
            optimist: { type: _reduxOptimist.COMMIT, id: id }
          });
        },
        revert: function revert(action) {
          return _extends({
            type: name + ':revert'
          }, action, {
            optimist: { type: _reduxOptimist.REVERT, id: id }
          });
        }
      };
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Optimist, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        optimist: this.optimist
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);

  return Optimist;
}(_react.Component), _class.childContextTypes = {
  optimist: _react.PropTypes.func
}, _temp2);