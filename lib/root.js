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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _sagas = require('./sagas');

var _optimist = require('./optimist');

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _ensureFsa = require('./ensure-fsa');

var _ensureFsa2 = _interopRequireDefault(_ensureFsa);

var _reduxBatchedSubscribe = require('redux-batched-subscribe');

var _reactDom = require('react-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _components = {
  Root: {
    displayName: 'Root'
  }
};

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2 = (0, _index6.default)({
  filename: 'src/root.js',
  components: _components,
  locals: [module],
  imports: [_react3.default]
});

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2 = (0, _index4.default)({
  filename: 'src/root.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _index2.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2(_UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2(Component, id), id);
  };
}

// redux


// redux-saga


// optimist


// redux-react-local


// fsa


// perf


function makeStore() {
  var reducers = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var initial = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var middleware = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

  // create a redux store
  return (0, _redux.createStore)(
  // reducer
  _optimist.Optimist.wrap((0, _redux.combineReducers)(_extends({}, reducers || {}, {
    local: _reducer2.default
  }))),
  // initial state
  initial || {},
  // middleware
  (0, _redux.compose)(_redux.applyMiddleware.apply(undefined, _toConsumableArray(middleware)), (0, _reduxBatchedSubscribe.batchedSubscribe)(_reactDom.unstable_batchedUpdates)));
}

var Root = _wrapComponent('Root')((_temp2 = _class = function (_Component) {
  _inherits(Root, _Component);

  function Root() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Root);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Root)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.sagaMiddleware = _sagas.Sagas.createSagaMiddleware(), _this.store = makeStore(_this.props.reducers, _this.props.initial, _this.middle()), _temp), _possibleConstructorReturn(_this, _ret);
  }
  // optionally accept middleware/reducers to add on to the redux store


  _createClass(Root, [{
    key: 'middle',
    value: regeneratorRuntime.mark(function middle() {
      return regeneratorRuntime.wrap(function middle$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this.props.middleware) {
                _context.next = 2;
                break;
              }

              return _context.delegateYield(this.props.middleware, 't0', 2);

            case 2:
              _context.next = 4;
              return this.sagaMiddleware;

            case 4:
              if (!(process.env.NODE_ENV === 'development')) {
                _context.next = 7;
                break;
              }

              _context.next = 7;
              return _ensureFsa2.default;

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, middle, this);
    })
  }, {
    key: 'render',
    value: function render() {
      return _react3.default.createElement(
        _reactRedux.Provider,
        { store: this.store },
        _react3.default.createElement(
          _sagas.Sagas,
          { middleware: this.sagaMiddleware },
          _react3.default.createElement(
            _optimist.Optimist,
            null,
            this.props.children
          )
        )
      );
    }
  }]);

  return Root;
}(_react2.Component), _class.propTypes = {
  middleware: _react2.PropTypes.array,
  reducers: _react2.PropTypes.object
}, _temp2));

exports.default = Root;