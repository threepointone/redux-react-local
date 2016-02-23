import React, { PropTypes, Component } from 'react'

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

      state = (() => {
        let id = getId(this.props),
          state = this.context.store.getState().local[id],
          init = state !== undefined ? state : getInitial(this.props)
        return {
          id,
          value: init
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
        this.context.store.dispatch({ type: '$$local.setState', payload: { state, ident: this.state.id } })
        this.setState({ value: state })
      };

      componentWillMount() {

        this.context.store.dispatch({
          type: '$$local.register',
          payload: {
            ident: this.state.id,
            initial: this.state.value,
            reducer,
            persist
          }
        })

        // MEMORY LEAK ON SERVER SIDE
        this.dispose = this.context.store.subscribe(() =>{
          this.setState({
            value: this.context.store.getState().local[this.state.id]
          })
        })
      }

      componentWillReceiveProps(next) {
        let id = getId(next)

        if (id !== this.state.id) {
          let init = getInitial(next)
          this.context.store.dispatch({
            type: '$$local.swap',
            payload: {
              ident: this.state.id,
              next: id,
              initial: init,
              reducer,
              persist
            }
          })
          let state = this.context.store.getState().local[id]
          this.setState({ id, value: state !== undefined ? state : init })
        }
      }

      componentWillUnmount() {
        this.context.store.dispatch({
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
          dispatch={this.context.store.dispatch}
          state={this.state.value}
          setState={this._setState}>
            {this.props.children}
        </Target>
      }
    }
  }
}

