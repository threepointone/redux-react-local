import React, { Component } from 'react'
import { render } from 'react-dom'
import { local } from '../src'
import Root from './root'
import { take, race, put, cps } from 'redux-saga/effects'
import { saga } from 'react-redux-saga'

// Event iterator
function events(target, event) {
  let fns = [], handler = e => {
      fns.forEach(fn => fn(null, e))
      fns = []
    }
  target.addEventListener(event, handler)

  return {
    next(fn) {
      fns.push(fn)
    },
    dispose() {
      target.removeEventListener(event, handler)
      fns = handler = null
    }
  }
}

@local({
  ident: 'app',
  initial: { active: false },
  reducer(state, { me, meta, payload: { pageX, pageY } = {} }) {
    if (me) {
      switch (meta.type) {
        case 'mousedown': return { ...state, x: pageX, y: pageY, active: true }
        case 'mousemove': return { ...state, x: pageX, y: pageY }
        case 'mouseup'  : return { ...state, active: false }
      }
    }
    return state
  }
})
@saga(function*(_, { $ }) {
  while (true) {  //eslint-disable-line no-constant-condition
    yield take('app:mousedown')

    // start listening to mousemove and mouseup events
    let up$ = events(window, 'mouseup')
    let move$ = events(window, 'mousemove')

    while (true) {  //eslint-disable-line no-constant-condition
      let { up, move } = yield race({
        up: cps(up$.next),
        move: cps(move$.next)
      })

      if (move) {
        yield put($({ type: 'mousemove', payload: move }))
      }
      else {
        yield put($({ type: 'mouseup', payload: up }))
        break
      }
    }

    // cleanup
    up$.dispose()
    move$.dispose()
  }

})
class App extends Component {
  onMouseDown = e => {
    let { $, dispatch } = this.props
    dispatch($({ type: 'mousedown', payload: e }))
  }
  render() {
    let { active, x, y } = this.props.state
    return <div onMouseDown={this.onMouseDown}>
      <span>{active ? `${x}:${y}` : 'click and drag'}</span>
    </div>
  }
}

render(<Root><App/></Root>, window.app)

