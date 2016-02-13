import React, {Component, PropTypes} from 'react';

// redux
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';

// redux-saga
import createSagaMiddleware from 'redux-saga';
import {Sagas} from './sagas';

// optimist
import optimist from 'redux-optimist';
import {Optimist} from './optimist';

// redux-react-local
import localReducer from './reducer';

// disto
import ensureFSA from './ensure-fsa';
import {batchedSubscribe} from 'redux-batched-subscribe';
import {unstable_batchedUpdates as batchedUpdates} from 'react-dom';


export default class Root extends Component{
  // optionally accept middleware/reducers to add on to the redux store
  static propTypes = {
    middleware: PropTypes.array,
    reducers: PropTypes.object
  };

  createStore(){
    // create a redux store
    return createStore(
      // reducer
      optimist(combineReducers({
        ...this.props.reducers || {},
        local: localReducer
      })),
      // initial state
      this.props.initial || {},
      // middleware
      compose(applyMiddleware(...this.middle()), batchedSubscribe(batchedUpdates))
    );
  }

  *middle(){
    if (this.props.middleware){
      yield* this.props.middleware;
    }
    yield this.sagaMiddleware;
    if (process.env.NODE_ENV === 'development'){
      yield ensureFSA;
    }
  }

  sagaMiddleware = createSagaMiddleware();

  store = this.createStore();

  render(){
    return <Provider store={this.store}>
      <Sagas middleware={this.sagaMiddleware}>
        <Optimist>
          {this.props.children}
        </Optimist>
      </Sagas>
    </Provider>;
  }
}
