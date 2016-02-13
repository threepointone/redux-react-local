'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Saga = exports.Sagas = undefined;

var _index = require('/Users/sunilpai/code/redux-react-local/node_modules/redbox-react/lib/index.js');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('/Users/sunilpai/code/redux-react-local/node_modules/react-transform-catch-errors/lib/index.js');

var _index4 = _interopRequireDefault(_index3);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _index5 = require('/Users/sunilpai/code/redux-react-local/node_modules/react-transform-hmr/lib/index.js');

var _index6 = _interopRequireDefault(_index5);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp, _class2, _temp2;

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Sagas: {
    displayName: 'Sagas'
  },
  Saga: {
    displayName: 'Saga'
  }
};

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2 = (0, _index6.default)({
  filename: 'src/sagas.js',
  components: _components,
  locals: [module],
  imports: [_react3.default]
});

var _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2 = (0, _index4.default)({
  filename: 'src/sagas.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _index2.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformHmrLibIndexJs2(_UsersSunilpaiCodeReduxReactLocalNode_modulesReactTransformCatchErrorsLibIndexJs2(Component, id), id);
  };
}

var Sagas = exports.Sagas = _wrapComponent('Sagas')((_temp = _class = function (_Component) {
  _inherits(Sagas, _Component);

  function Sagas() {
    _classCallCheck(this, Sagas);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Sagas).apply(this, arguments));
  }

  _createClass(Sagas, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        sagas: this.props.middleware
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.Children.only(this.props.children);
    }
  }]);

  return Sagas;
}(_react2.Component), _class.createSagaMiddleware = _reduxSaga2.default, _class.propTypes = {
  middleware: _react2.PropTypes.func.isRequired
}, _class.childContextTypes = {
  sagas: _react2.PropTypes.func.isRequired
}, _temp));

var Saga = exports.Saga = _wrapComponent('Saga')((_temp2 = _class2 = function (_Component2) {
  _inherits(Saga, _Component2);

  function Saga() {
    _classCallCheck(this, Saga);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Saga).apply(this, arguments));
  }

  _createClass(Saga, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.runningSaga = this.context.sagas.run(this.props.saga, this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps() {
      // ??
    }
  }, {
    key: 'render',
    value: function render() {
      return !this.props.children ? null : _react2.Children.only(this.props.children);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.runningSaga.cancel();
      delete this.runningSaga;
    }
  }]);

  return Saga;
}(_react2.Component), _class2.propTypes = {
  saga: _react2.PropTypes.func.isRequired
}, _class2.contextTypes = {
  sagas: _react2.PropTypes.func.isRequired
}, _temp2));

// {
//       $: this.$,
//       ident: this.state.id,
//       getState: () => this.state.value,
//       setState: this._setState
//     }