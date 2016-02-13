import React, {Component, PropTypes} from 'react';

import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import optimist from 'redux-optimist';
import {Optimist} from './optimist';
import {Sagas} from './sagas';

import reducer from './reducer';

import ensureFSA from './ensure-fsa';

import { batchedSubscribe } from 'redux-batched-subscribe';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import {createStore, combineReducers, applyMiddleware, compose} from 'redux';

export default class Root extends Component{
  static propTypes = {
    middleware: PropTypes.array,
    reducers: PropTypes.object
  };
  createStore(){
    return createStore(optimist(combineReducers({
    // reducers
    ...this.props.reducers || {},
    local: reducer
    })), {
      // initial state
    }, compose(applyMiddleware(
      // middleware
      ...this.props.middleware || [],
      this.sagas,
      ensureFSA // todo - only for development
    ), batchedSubscribe(batchedUpdates)));
  }
  createSagaMiddleware(){
    return createSagaMiddleware();
  }

  sagas = this.createSagaMiddleware();
  store = this.createStore();


  render(){
    return <Provider store={this.store}>
      <Sagas middleware={this.sagas}>
        <Optimist>
          {this.props.children}
        </Optimist>
      </Sagas>
    </Provider>;
  }
}
