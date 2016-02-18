import React, { Component } from 'react'
import { renderToString } from 'react-dom/server'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { local, reducer } from '../src'

import {
  // transforms redux state atom into one that can be JSON.stringify'ed
  stringifySafe,
  // preps a redux store with the all local reducers/state in a react element
  resolveLocalReducers
} from '../src/server'


@local({
  ident: 'counter',
  initial: 0,
  reducer(state, { type }) {
    return type === 'increment' ?
      state + 1 :
      state
  }
})
class Counter extends Component {
  render() {
    return <div>{this.props.state}</div>
  }
}


class App extends Component {
  render() {
    return <Provider store={this.props.store}>
      <Counter/>
    </Provider>
  }
}

let store = createStore(combineReducers({
  local: reducer
}))


// this parses the reducers out the tree and preps the store
// side effectful!
resolveLocalReducers(<App store={store}></App>)

// dispatch some actions
store.dispatch({ type: 'increment' })
store.dispatch({ type: 'increment' })
store.dispatch({ type: 'increment' })

// render to html
console.log(
  renderToString(<App store={store} />)
  )
// <div>3</div>

// prep state for serialization
const serialized = stringifySafe(store.getState())

console.log(
  JSON.stringify(serialized)
  )

// {"local":{"$$fns":{},"counter":3}}


// on the client side, use this json as your redux store's initial state as usual
// that's it!

