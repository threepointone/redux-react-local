import React, {Component} from 'react';
import { connect } from 'react-redux';


function log(...args){
  console.log(...args, this);
  return this;
}

export function localReducer(state = {
  registered: {}
}, action){
  if (action.meta && action.meta.local){
    switch (action.meta.type){
      case 'setState':
        return {
          ...state,
          [action.meta.id]: {
            ...state[action.meta.id],
            ...action.payload
          }
        };
    }

  }
  if (action.type === 'local.register'){
    return {
        ...state,
        [action.payload.id] : state[action.payload.id] || action.payload.initial,
        registered : {
          ...state.registered,
          [action.payload.id]: {
            reducer: action.payload.reducer
          }
        }
      };
  }

  let reduced = Object
    .keys(state.registered)
    .reduce((o, key) =>
      Object.assign(o, {
        [key]: state.registered[key].reducer(state[key], action)
      }), {});
  return {
      ...state,
      ...reduced
    };
}

export function local({
  ident, initial = {}, reducer = x => x
} = {}){

  return function(Target){

    function prefix(id){
      return id; // oh well
    }

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
        static displayName = 'Ò:' + Target.displayName;
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
        componentWillReceiveProps(next){
          let id = getId(next);

          if (id !== this.state.id){
            this.setState({
              id
            });
            this.props.dispatch({
              type: 'local.swap',
              payload: {
                id: this.state.id,
                next: id,
                initial: getInitial(next)
              }
          });
          }
        }
        _dispatch = action => {
          // check for action.type
          this.props.dispatch({
            type: `$:${prefix(getId(this.props))}:${action.type}`,
            payload: action.payload,
            meta: {
              // this is just to be faster when reducing
              id: this.state.id,
              type: action.type,
              local: true
            }
          });
        };
        _setState = state => {
          this._dispatch({
            type: 'setState',
            payload: state
          });
        };
        render(){
          return React.createElement(Target, {
            setState: this._setState,
            x: this._dispatch,
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
        }
      }
    );
  };
}


