import React, {Component, PropTypes} from 'react';

// redux
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';

// redux-saga
import {Sagas} from './sagas';

// optimist
import {Optimist} from './optimist';

// redux-react-local
import localReducer from './reducer';

// fsa
import ensureFSA from './ensure-fsa';

// perf
import {batchedSubscribe} from 'redux-batched-subscribe';
import {unstable_batchedUpdates as batchedUpdates} from 'react-dom';

function makeStore(reducers = {}, initial = {}, middleware = []){
  // create a redux store
  return createStore(
    // reducer
    Optimist.wrap(combineReducers({
      ...reducers || {},
      local: localReducer
    })),
    // initial state
    initial || {},
    // middleware
    compose(applyMiddleware(...middleware), batchedSubscribe(batchedUpdates))
  );
}


export default class Root extends Component{
  // optionally accept middleware/reducers to add on to the redux store
  static propTypes = {
    middleware: PropTypes.array,
    reducers: PropTypes.object
  };

  *middle(){
    if (this.props.middleware){
      yield* this.props.middleware;
    }
    yield this.sagaMiddleware;
    if (process.env.NODE_ENV === 'development'){
      yield ensureFSA;
    }
  }

  sagaMiddleware = Sagas.createSagaMiddleware();

  store = makeStore(
    this.props.reducers,
    this.props.initial,
    this.middle()
  );

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
