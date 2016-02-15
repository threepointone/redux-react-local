import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import { local } from '../src'
import Root from './root'

@local({
  ident: 'counter',
  initial: 0
})
class Counter extends Component {
  onClick = () =>
    this.props.setState(this.props.state + 1);
  render() {
    return (<button onClick={this.onClick}>
      clicked {this.props.state} times
    </button>)
  }
}

@connect(state => state.local)
class Debug extends Component {
  render() {
    return (<div>
      debugging: {this.props.counter}
    </div>)
  }
}

class App extends Component {
  render() {
    return (<div>
      <Counter/>
      <Counter/>
      <Debug/>
    </div>)
  }
}

render(<Root><App/></Root>, document.getElementById('app'))
