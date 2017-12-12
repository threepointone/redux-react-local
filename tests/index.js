/* global describe, it, beforeEach, afterEach */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { render, unmountComponentAtNode } from 'react-dom'

import * as T from '../src/tree'

import { createStore, combineReducers } from 'redux'
import { connect, Provider } from 'react-redux'

import { local, reducer, Root } from '../src'

import expect from 'expect'
import expectJSX from 'expect-jsx'
expect.extend(expectJSX)

class LocalRoot extends Component {
  store = createStore(
    combineReducers({ local: reducer })
  )
  render() {
    return (<Provider store={this.store}>
      <Root>
        {this.props.children}
      </Root>
    </Provider>)
  }
}

describe('redux-react-local', () => {
  let node
  beforeEach(() => node = document.createElement('div'))
  afterEach(() => unmountComponentAtNode(node))

  it('should throw when you don\'t include the reducer', () => {
    let store = createStore(combineReducers({ x: (x = {}) => x }))
    @local({
      ident: 'app'
    })
    class App extends Component {
      render() {
        return null
      }
    }
    expect(() =>
      render(<Provider store={store}><App/></Provider>, node)).toThrow()
  })

  // ident
  it('passes ident', () => {

    @local({
      ident: 'app'
    })
    class App extends Component {
      componentDidMount() {
        expect(this.props.ident).toEqual('app')
      }
      render() {
        return null
      }
    }
    render(<LocalRoot><App/></LocalRoot>, node)
  })

  it('local.register', () => {
    // as below
  })

  it('should be able to persist and swap between stores', done => {

    let opts = {
      ident: props => `faux:${props.faux}`,
      initial: props => props.faux
    }

    class Inner extends Component {
      componentWillMount() {
        this.props.setState(this.props.state + 1)
      }
      componentWillReceiveProps(next) {
        if (next.ident !== this.props.ident) {
          next.setState(next.state + 1)
        }
      }
      render() {
        return null
      }
    }

    let Inner1 = local(opts)(Inner)
    let Inner2 = local({ ...opts, persist: false })(Inner)


    @connect(state => state)
    class App extends Component {
      state = { faux: 1 }
      componentDidMount() {
        setTimeout(() => {
          this.setState({ faux: 1 }, () =>
            this.setState({ faux: 2 }, () =>
              this.setState({ faux: 3 }, () =>
                this.setState({ faux: 2 }, () => {
                  let o = T.toObject(this.props.local.$$tree)
                  expect(o).toEqual({
                    // these 3 persisted
                    'faux:1': 2,
                    'faux:2': 4,  // and this one incremented twice
                    'faux:3': 4,

                    // 6 and 8 evaporate, and 7 came back with fresh data
                    'faux:7': 8
                  })
                  done()
                }))))

        }, 200)

      }
      render() {
        return (<div>
          <Inner1 faux={this.state.faux} key='one'/>
          <Inner2 faux={this.state.faux + 5} key='two'/>
        </div>)

      }
    }

    render(<LocalRoot><App/></LocalRoot>, node)
  })

  it('local.unmount')

  it('ident can use props', () => {
    @local({
      ident: props => `comp:${props.abc}`
    })
    class App extends Component {
      static propTypes = {
        abc: PropTypes.string.isRequired
      }
      componentDidMount() {
        expect(this.props.ident).toEqual('comp:xyz')
      }
      render() {
        return null
      }
    }

    render(<LocalRoot><App abc='xyz'/></LocalRoot>, node)
  })

  it('throws if you don\'t pass ident', () => {
    expect(() => @local()
    class App extends Component {
      render() {
        return null
      }
    }).toThrow()

  })

  it('uses ident as a key for redux store', () => {
    @local({
      ident: 'app',
      initial: 'zzz'
    })
    class App extends Component {
      render() {
        return <Inner/>
      }
    }

    @connect(x => x)
    class Inner extends Component {
      render() {
        return <div>{this.props.local.get('app')}</div>
      }
    }

    render(<LocalRoot><App /></LocalRoot>, node)
    expect(node.innerText).toEqual('zzz')
  })

  it('should throw when you have 2 different components with the sme ident', () => {
    @local({ ident: 'app' })
    class App1 extends Component {
      render() {
        return null
      }
    }

    @local({ ident: 'app' })
    class App2 extends Component {
      render() {
        return null
      }
    }

    expect(() => render(<LocalRoot>
      <div>
        <App1 />
        <App2 />
      </div>
    </LocalRoot>, node)).toThrow()
  })

  // state
  it('can have an initial state', () => {
    @local({
      ident: 'app',
      initial: 999
    })
    class App extends Component {
      componentDidMount() {
        expect(this.props.state).toEqual(999)
      }
      render() {
        return null
      }
    }
    render(<LocalRoot><App /></LocalRoot>, node)
  })

  it('initial state can use props', () => {
    @local({
      ident: 'app',
      initial: props => props.x + 2
    })
    class App extends Component {
      componentDidMount() {
        expect(this.props.state).toEqual(7)
      }
      render() {
        return null
      }
    }
    render(<LocalRoot><App x={5}/></LocalRoot>, node)
  })

  it('accepts a reducer that gets called on all actions', () => {
    @local({
      ident: 'app',
      initial: 0,
      reducer(state, { type, payload }) {
        if (type === 'xyz') {
          return state + payload
        }
        return state
      }
    })
    class App extends Component {
      componentDidMount() {
        let { dispatch } = this.props
        expect(typeof dispatch).toEqual('function')
        dispatch({ type: 'xyz', payload: 1 })
        dispatch({ type: 'xyz', payload: 1 })
        dispatch({ type: 'xyz', payload: 1 })
      }
      render() {
        return <div>{this.props.state}</div>
      }
    }
    render(<LocalRoot><App /></LocalRoot>, node)
    expect(node.innerText).toEqual('3')

  })
  it('gets called on all actions', () => {
    // as above
  })

  it('updates when state changes', () => {
    // as above
  })

  it('passes the redux dispatch function', () => {
    // as above
  })

  it('passes a \'localization\' helper', () => {
    @local({
      ident: 'app'
    })
    class App extends Component {
      componentDidMount() {
        expect(this.props.$({ type: 'name', payload: { some: 'payload' } })).toEqual({
          type: 'app:name',
          payload: { some: 'payload' },
          meta: {
            ident: 'app',
            type: 'name',
            local: true
          }
        })
      }
      render() {
        return null
      }
    }
    render(<LocalRoot><App /></LocalRoot>, node)
  })
  it('local events have meta information', () => {
    // as above
  })

  it('local actions can be detected', () => {
    class App extends Component {
      componentDidMount() {
        this.props.dispatch(this.props.$({ type: 'beep', payload: 10 }))
      }
      render() {
        return <span>{this.props.state}</span>
      }
    }

    let App1 = local({
      ident: 'one',
      initial: 10,
      reducer(state, { me, meta, payload }) {

        if (me && meta.type === 'beep') {
          return state + payload
        }
        // alternately, you could test for 'one:beep',
        // but this is cumbersome, and gets harder for props generated idents
        return state
      }
    })(App)

    let App2 = local({
      ident: 'two',
      initial: 100,
      reducer(state, { me, meta, payload }) {
        if (me && meta.type === 'beep') {
          return state * payload
        }
        return state
      }
    })(App)

    render(<LocalRoot>
      <div>
        <App1 />:<App2 />
      </div>
    </LocalRoot>, node)

    expect(node.innerText).toEqual('20:1000')

  })

  it('can \'setState\' locally', () => {

    @local({
      ident: 'app',
      initial: { value: 0 }
    })
    class App extends Component {
      componentDidMount() {
        let { setState, state } = this.props
        setState({ value: state.value + 1 })
      }
      render() {
        let { value } = this.props.state
        return <div>{value}</div>
      }
    }

    render(<LocalRoot><App /></LocalRoot>, node)
    expect(node.innerText).toEqual('1')

  })

  it('setState throws on undefined', () => {
    @local({
      ident: 'app',
      initial: 0
    })
    class App extends Component {
      componentDidMount() {
        this.props.setState()
      }
      render() {
        return <div>{this.props.state}</div>
      }
    }


    expect(() => render(<LocalRoot><App /></LocalRoot>, node)).toThrow()

  })

  describe('tree', () => {
    it('create', () => {
      let t = T.make()
      expect(T.toObject(t)).toEqual({})
    })
    it('set/get/del', () => {
      let t = T.make()
      expect(T.get(t, 'x')).toEqual(undefined)
      let t2 = T.set(t, 'x', 123)
      expect(T.get(t2, 'x')).toEqual(123)
      let t3 = T.del(t2, 'x')
      expect(T.toObject(t3)).toEqual({})
    })

    it('entries/toObject')

    it('lots of keys')
  })


})

// const has = {}.hasOwnProperty

// function omit(obj, key) {
//   if (!obj::has(key)) {
//     return obj
//   }
//   return Object.keys(obj).reduce((o, k) =>
//     k === key ?
//       o :
//       (o[k] = obj[k], o),
//     {})
// }
