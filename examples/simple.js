import React, { Component } from 'react';
import {render} from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';

import { localReducer, local } from '../src';


const store = createStore(combineReducers({
  local: localReducer
})); // no more global reducers!

let App = local({
  ident: ()=> 'app',
  initial: () => ({count: 0}),
  reducer: (state, action) => {
    switch (action.meta.type){
      case 'increment': return {
        ...state,
        count: state.count + 1
      };
      case 'decrement': return {
        ...state,
        count: state.count - 1
      };
    }
  }
})(connect(state => state)(
  class App extends Component {
  onClick = () => {
    this.props.setState({
      xyz: 123
    });
  };
  render() {
    return <div onClick={this.onClick}>
      we here now {this.props.state.xyz}
    </div>;
  }
}));


render(<Provider store={store}>
  <App />
</Provider>, document.getElementById('app'));

