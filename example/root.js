import React, { Component, PropTypes } from 'react'



// redux
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'

// redux-saga
import createSagaMiddleware from 'redux-saga'
import { Sagas } from 'react-redux-saga'

// optimist
import optimist from 'redux-optimist'
import { Optimist } from 'react-redux-optimist'

// redux-react-local
import Local, { reducer } from '../src'

// fsa
import ensureFSA from './ensure-fsa'

// perf
import raf from 'raf'
import { batchedSubscribe } from 'redux-batched-subscribe'
import { unstable_batchedUpdates } from 'react-dom'

// via https://gist.github.com/peteruithoven/9a9363e064ee8bdf28ae
let rafID
let notifyFunc
function animFrame() {
  if (notifyFunc) {
    unstable_batchedUpdates(notifyFunc)
    notifyFunc = null
  }
  rafID = raf(animFrame)
}

function rafUpdateBatcher(notify) {
  if (rafID === undefined) rafID = raf(animFrame)
  notifyFunc = notify
}

export function makeStore(reducers = {}, initial = {}, middleware = []) {
  let sagaMiddleware = createSagaMiddleware()
  // create a redux store
  const store = createStore(
    // reducer
    optimist(combineReducers({
      ...reducers,
      local: reducer
    })),

    // initial state
    initial || {},

    // middleware
    compose(
      applyMiddleware(...(function *() {
        yield* middleware
        yield sagaMiddleware
        if (process.env.NODE_ENV === 'development') {
          yield ensureFSA
        }
      }())),
      typeof window === 'object' &&
      typeof window.devToolsExtension !== 'undefined' &&
      process.env.NODE_ENV === 'development'
        ? window.devToolsExtension() : f => f,
      batchedSubscribe(process.env.RAF === true ?
        rafUpdateBatcher : unstable_batchedUpdates))
  )

  store.sagas = sagaMiddleware
  return store
}


export default class Root extends Component {
  // optionally accept middleware/reducers to add on to the redux store
  static propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    })
  };
  store = this.props.store ||
    makeStore(this.props.reducers, this.props.initial, this.props.middleware)
  render() {
    return <Provider store={this.store}>
      <Local.Root>
        <Sagas middleware={this.store.sagas}>
          <Optimist>
            {this.props.children}
          </Optimist>
        </Sagas>
      </Local.Root>
    </Provider>
  }
}
