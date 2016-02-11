import React, {PropTypes, Component} from 'react';
import { Provider, connect } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import {createStore, combineReducers, applyMiddleware} from 'redux';
// local component state, synced to a redux store

function log(...args){
  console.log(...args, this);
  return this;
}


export class Root extends Component{
  static propTypes = {
    middleware: PropTypes.array,
    reducers: PropTypes.object
  };
  static defaultProps = {
    middleware: [],
    reducers: {}
  };
  sagas = createSagaMiddleware();
  store = createStore(combineReducers({
    // reducers
    ...this.props.reducers,
    local: localReducer
  }), {
    // initial state
  }, applyMiddleware(
    // middleware
    ...this.props.middleware,
    this.sagas
  ));
  static childContextTypes = {
    sagas: PropTypes.func
  };
  getChildContext(){
    return {
      sagas: this.sagas
    };
  }
  render(){
    return <Provider store={this.store}>
      {this.props.children}
    </Provider>;
  }
}


const identity = x => x;

export function localReducer(state = {registered: {}}, action){
  let {payload, type, meta} = action;
  if (type === 'local.register'){
    if (state.registered[payload.id] && state.registered[payload.id].reducer !== identity){
      // todo - throw, but not when hot reloading
      console.warn(`${payload.id} already exists`);
    }
    return {
        ...state,
        [payload.id] : state[payload.id] || payload.initial,
        registered : {
          ...state.registered,
          [payload.id]: {
            reducer: payload.reducer
          }
        }
      };
  }

  if (type === 'local.swap'){
    // ???
    return state;
  }

  if (type === 'local.unmount'){
    return {
        ...state,
        // we leave the data in place
        // [action.payload.id] : state[action.payload.id] || action.payload.initial,
        registered : {
          ...state.registered,
          [payload.id]: {
            reducer: identity // signals that this is unmounted
          }
        }
      };
  }


  let ret = {registered: state.registered}, changed = false;
  Object.keys(state.registered).forEach((key, i) => {
    let a = action;

    if (meta && meta.local && key === meta.id){
      a = {
        ...a,
        me: true
      };
    }

    let computed = state.registered[key].reducer(state[key], a);

    if (computed !== state[key]){
      changed = true;
    }
    ret[key] = computed;
  });


  if (!changed) {
    return state;
  }
  return ret;

}

export function local({
  ident, initial = {}, reducer = x => x, saga
} = {}){
  if (!ident){
    throw new Error('cannot annotate with @local without an ident');
  }

  return function(Target){

    function getId(props){
      if (typeof ident === 'string'){
        return ident;
      }
      return ident(props);
    }

    function getInitial(props){
      if (typeof initial !== 'function'){
        return initial;
      }
      return initial(props);
    }

    return connect((state, props) => ({local: state.local[getId(props)]}))(
      class ReduxReactLocal extends Component{
        static displayName = 'local:' + (Target.displayName || Target.name);
        static contextTypes = {
          sagas: PropTypes.func
        };

        state = {
          id: getId(this.props),
          value: getInitial(this.props)
        };

        componentWillMount(){
          this.props.dispatch({
            type: 'local.register',
            payload: {
              id: this.state.id,
              reducer,
              initial: this.state.value
            }
          });
        }
        componentDidMount(){
          if (saga){
            this.runningSaga = this.context.sagas.run(saga, {
              $: this.$,
              ident: this.state.id,
              getState: () => this.state.value
            });
          }
        }
        componentWillReceiveProps(next){
          let id = getId(next);

          if (id !== this.state.id){
            this.props.dispatch({
              type: 'local.swap',
              payload: {
                id: this.state.id,
                next: id,
                initial: getInitial(next)
              }
            });

          }
          this.setState({ id, value: next.local });
        }
        $ = (type, payload) => {
          return {
            type: `${this.state.id}:${type}`,
            payload,
            meta: {
              // this is just to be faster when reducing
              id: this.state.id,
              type,
              local: true
            }
          };
        };
        render(){
          return React.createElement(Target, {
            ...this.props,
            $: this.$,
            ident: this.state.id,
            dispatch: this.props.dispatch,
            state: this.state.value,
          }, this.props.children);
        }
        componentWillUnmount(){
          this.props.dispatch({
            type: 'local.unmount',
            payload: {
              id: this.id
            }
          });
          if (this.runningSaga){
            this.runningSaga.cancel();
            delete this.runningSaga;
          }
        }
      }
    );
  };
}

