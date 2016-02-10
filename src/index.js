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
  let reduced = Object
    .keys(state.registered)
    .reduce((o, key) =>{
      let a = action;

      if (meta && meta.local && key === meta.id){
        a = {
          ...a,
          me: true
        };
      }
      return Object.assign(o, {
        [key]: state.registered[key].reducer(state[key], a)
      });
    }, {});
  return {
      ...state,
      ...reduced
    };
}

export function local({
  ident, initial = {}, reducer = x => x, saga
} = {}){

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
          id: getId(this.props)
        };

        componentWillMount(){
          this.props.dispatch({
            type: 'local.register',
            payload: {
              id: this.state.id,
              reducer,
              initial: getInitial(this.props)
            }
          });
        }
        componentDidMount(){
          if (saga){
            this.runningSaga = this.context.sagas.run(saga, {$: this.$, id: getId(this.props), getState: () => this.props.local || getInitial(this.props)});
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

            this.setState({ id });

          }
        }
        $ = (type, payload) => {
          return {
            type: `${getId(this.props)}:${type}`,
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
            dispatch: this.props.dispatch,
            state: this.props.local || getInitial(this.props),
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

