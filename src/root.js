import { Component, PropTypes } from 'react'

const isBrowserLike = typeof navigator !== 'undefined'

export default class Root extends Component {
  static contextTypes = {
    store: PropTypes.object
  }
  static childContextTypes = {
    $$local: PropTypes.func
  }
  getChildContext() {
    return {
      $$local: this._local
    }
  }

  fns = {}
  _local = (ident, fn) => {
    this.fns[ident] = [ ...this.fns[ident] || [], fn ]
    return () => this.fns[ident] = this.fns[ident].filter(x => x!== fn)
  }
  componentWillMount() {
    if(isBrowserLike) {
      this.dispose = this.context.store.subscribe(() => {
        let state = this.context.store.getState().local

        Object.keys(state.$$changed || {}).forEach(key => {
          let val = state.get(key);
          (this.fns[key] || []).forEach(fn => fn(val))
        })
        // !!!
        state.$$changed = {}
      })
    }

  }
  componentWillUnmount() {
    if(this.dispose)  {
      this.dispose()
    }
  }
  render() {
    return this.props.children
  }
}
