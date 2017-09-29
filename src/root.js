import { Component, PropTypes } from 'react'

import * as T from './tree'
import {getLocalState} from './utils';

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
        let state = getLocalState(this.context.store.getState()), changed = false
        T.entries(state.$$changed).forEach(([ key, value ]) => {
          changed = true;
          (this.fns[key] || []).forEach(fn => fn(value))
        })
        if(changed) {
          this.context.store.dispatch({ type: '$$local.flushed' })
        }

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
