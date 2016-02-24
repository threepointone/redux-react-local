import React, { Component } from 'react'
import { renderToString } from 'react-dom/server'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { local, reducer,
  // transforms redux state atom into one that can be JSON.stringify'ed
  stringifySafe } from '../src'

import * as T from '../src/tree'


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


let store = createStore(combineReducers({
  local: reducer
}))


// do a throwaway renderToString to 'parse'
// the reducers out the tree and prep the store
// side effectful!
renderToString(<Provider store={store}>
  <Counter/>
</Provider>)
// dispatch some actions
store.dispatch({ type: 'increment' })
store.dispatch({ type: 'increment' })
store.dispatch({ type: 'increment' })


console.log(  // eslint-disable-line no-console
  'state', T.toObject(store.getState().local.$$tree))


// actually render to final html
console.log(  // eslint-disable-line no-console
  renderToString(<Provider store={store}>
    <Counter/>
  </Provider>))
// <div>3</div>

// prep state for serialization
const serialized = stringifySafe(store.getState())

console.log(  // eslint-disable-line no-console
  JSON.stringify(serialized))

// {"local":{"$$fns":{},"counter":3}}

// on the client side, use this json as your redux store's initial state as usual
// that's it!

// render(<Provider store={createStore(combineReducers({ local: reducer }), serialized)}>
//   <Counter/>
// </Provider>, element)
