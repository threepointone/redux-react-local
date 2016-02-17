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


function makeStore(initial) {
  return createStore(combineReducers({
    local: reducer
  }), initial)
}


@local({
  ident: 'counter',
  initial: 0,
  reducer(state, { type }) {
    if(type === 'increment') {
      return state + 1
    }
    return state
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

let s = makeStore()

// this parses the reducers out the tree and preps the store
// side effectful!
resolveLocalReducers(<App store={s}></App>)

// dispatch some actions
s.dispatch({ type: 'increment' })
s.dispatch({ type: 'increment' })
s.dispatch({ type: 'increment' })

// render to html
console.log(
  renderToString(<App store={s} />)
  )
// <div>3</div>

// prep state for serialization
const serialized = stringifySafe(s.getState())

console.log(
  JSON.stringify(serialized)
  )

// {"local":{"$$fns":{},"counter":3}}


// on the client side, use this json as your redux store's initial state as usual
// that's it!

