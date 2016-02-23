import React, { PropTypes, Component } from 'react'

function whenUndefined(o, orElse) {
  return o === undefined ? orElse : o
}

const isBrowserLike = typeof navigator !== 'undefined'

const has = {}.hasOwnProperty

// modified from gaearon/react-pure-render
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!objB::has(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

export default function local({
  ident,            // string / ƒ(props)
  initial = {},     // value / ƒ(props)
  reducer = x => x, // ƒ(state, action) => state
  persist = true    // can swap out state on unmount
} = {}) {
  if (!ident) {
    throw new Error('cannot annotate with @local without an ident')
  }

  // if (!initial) {
  //   throw new Error('cannot annotate with @local without an initial state')
  // }

  function getId(props) {
    if (typeof ident === 'string') {
      return ident
    }
    return ident(props)
  }

  function getInitial(props) {
    if (typeof initial !== 'function') {
      return initial
    }
    return initial(props)
  }

  return function (Target) {

    return class ReduxReactLocal extends Component {
      static contextTypes = {
        store: PropTypes.shape({
          subscribe: PropTypes.func.isRequired,
          dispatch: PropTypes.func.isRequired,
          getState: PropTypes.func.isRequired
        })
      }
      static displayName = 'local:' + (Target.displayName || Target.name);

      store = this.context.store

      state = (() => {
        let id = getId(this.props)
        return {
          id,
          value: whenUndefined(this.store.getState().local[id], getInitial(this.props))
        }
      })()

      $ = action => {
        // 'localize' an event. super convenient for making actions 'local' to this component
        return  {
          ...action,
          type: `${this.state.id}:${action.type}`,
          meta: {
            ...action.meta || {},
            ident: this.state.id,
            type: action.type,
            local: true
          }
        }
      };

      _setState = state => {
        this.store.dispatch({ type: '$$local.setState', payload: { state, ident: this.state.id } })
      };

      componentWillMount() {

        this.store.dispatch({
          type: '$$local.register',
          payload: {
            ident: this.state.id,
            initial: this.state.value,
            reducer,
            persist
          }
        })

        if(isBrowserLike) {
          this.dispose = this.store.subscribe(() =>{
            this.setState({
              value: this.store.getState().local[this.state.id]
            })
          })
        }
      }
      shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) ||
          (this.state.id !== nextState.id) ||
          (this.state.value !== nextState.value)
      }

      componentWillReceiveProps(next) {
        let id = getId(next)

        if (id !== this.state.id) {
          let init = getInitial(next)
          this.store.dispatch({
            type: '$$local.swap',
            payload: {
              ident: this.state.id,
              next: id,
              initial: init,
              reducer,
              persist
            }
          })
          this.setState({ id })
        }
      }

      componentWillUnmount() {
        this.store.dispatch({
          type: '$$local.unmount',
          payload: {
            ident: this.state.id,
            persist
          }
        })
        if(this.dispose) {
          this.dispose()
        }
      }

      render() {
        return <Target
          {...this.props}
          $={this.$}
          ident={this.state.id}
          dispatch={this.store.dispatch}
          state={this.store.getState().local[this.state.id]}
          setState={this._setState}>
            {this.props.children}
        </Target>
      }
    }
  }
}

