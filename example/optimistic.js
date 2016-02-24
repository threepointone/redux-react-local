
import React, { Component, PropTypes } from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import Root from './root'

import { local } from '../src'

function fakePost() {
  return new Promise((resolve, reject) => {
    // setTimeout(() => resolve({ response: 123 }), 1000)
    setTimeout(() => reject(new Error('some error')), 1000)
  })
}


@local({
  ident: 'todos',
  initial: [],
  reducer(state, action) {
    switch (action.type) {
      case 'ADD_TODO': return state.concat([ action.text ])
      default: return state
    }
  }
})
class Todos extends Component {
  render() {
    return null
  }
}


@local({
  ident: 'status',
  initial: { writing: false, error: null },
  reducer(state, action) {
    switch (action.type) {
      case 'ADD_TODO'         : return { writing: true, error: null }
      case 'ADD_TODO:commit'  : return { writing: false, error: null }
      case 'ADD_TODO:revert'  : return { writing: false, error: action.error }
      default: return state
    }
  }
})
class Status extends Component {
  render() {
    return null
  }
}


let App = connect(state => state.local)(
class App extends Component {
  static contextTypes = {
    optimist: PropTypes.func
  }
  add = async action => {
    let o = this.context.optimist('ADD_TODO'),
      dispatch = this.props.dispatch

    dispatch(o.begin({ text: action.text }))
    try{
      dispatch(o.commit({
        respose: (await fakePost({ text: action.text })).response
      }))
    }
    catch(error) {
      dispatch(o.revert({ error }))
    }

  }
  componentDidMount() {
    setTimeout(() => this.add({ text: 'add me' }), 1000)
  }
  render() {
    return (<div>
      <Todos/>
      <Status/>
      {JSON.stringify(this.props.get('todos'))}
      <br/>
      {JSON.stringify(this.props.get('status'))}
    </div>)
  }
})


render(<Root ><App/></Root>, document.getElementById('app'))
