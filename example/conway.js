import React, { Component, PropTypes } from 'react'
import Root from './root'

import styles from './conway.css'

function times(n, fn) {
  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(fn(i))
  }
  return arr
}


import { render } from 'react-dom'
import { local } from '../src'

@local({
  ident: 'app'
})
class App extends Component {
  static propTypes = {
    initial: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number
  }
  render() {
    return <div className={styles.app}>
      {times(100, i => times(100, j => <Cell x={i} y={j}/>))}
    </div>
  }
}


@local({
  ident: props => `cell:${props.x}:${props.y}`
})
class Cell extends Component {
  render() {
    return <div className={styles.cell} style={{ left: 10* this.props.x, top: 10* this.props.y }}></div>
  }
}


render(<Root><App/></Root>, window.app)
