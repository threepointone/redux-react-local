import React, { PropTypes, Component } from 'react'
import { render } from 'react-dom'
import { local } from '../src'
import Root from './root'
import { cps, call } from 'redux-saga/effects'
import { Saga } from 'react-redux-saga'

import styles from './stress.css'

function sleep(period, done) {
  setTimeout(() => done(null, true), period)
}


@local({
  ident: ({ id }) => `cell:${id}`,
  initial: () => Math.random() * 100
})
class Cell extends Component {
  static propTypes = {
    period: PropTypes.number.isRequired
  };
  *saga(_, { period, setState }) {
    while (true) {  //eslint-disable-line no-constant-condition
      yield cps(sleep, period)
      yield call(setState, Math.random())
    }
  }
  render() {
    return <div className={styles.cell} style={{ opacity: this.props.state }}>
      <Saga saga={this.saga} period={this.props.period} setState={this.props.setState} />
    </div>
  }
}

function times(n, fn) {
  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(fn(i))
  }
  return arr
}

class App extends Component {
  render() {
    return <div onClick={this.onClick}>
      {times(1000, i => <Cell period={Math.random() * 10000} id={i} key={i} />)}
    </div>
  }
}


render(<Root><App /></Root>, document.getElementById('app'))

