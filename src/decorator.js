import React, {Component} from 'react';
import {connect} from 'react-redux';

const has = {}.hasOwnProperty;

function omit(obj, key) {
  if (!obj::has(key)){
    return obj;
  }
  return Object.keys(obj).reduce((o, k) =>
    k === key ?
      o :
      (o[k] = obj[k], o),
    {});
}


export default function local({
  ident,            // string / ƒ(props)
  initial = {},     // value / ƒ(props)
  reducer = x => x, // ƒ(state, action) => state
  persist = true    // can swap out state on unmount
} = {}){
  if (!ident){
    throw new Error('cannot annotate with @local without an ident');
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

  return function(Target){

    return @connect((state, props) => {
      if (!state.local){
        throw new Error('did you forget to add the `local` reducer?');
      }
      return {
        $$local: state.local[getId(props)]
      };
    })
    class ReduxReactLocal extends Component{
      static displayName = 'local:' + (Target.displayName || Target.name);

      state = {
        id: getId(this.props),
        value: getInitial(this.props)
      };

      $ = action => {
        // 'localize' an event. super convenient for making actions 'local' to this component
        return  {
          ...action,
          type: `${this.state.id}:${action.type}`,
          meta: {
            ...action.meta || {},
            ident: this.state.id,
            type: action.type,
            $$l: true
          }
        };
      };

      _setState = state => {
        this.props.dispatch({type: '$$local.setState', payload: {state, ident: this.state.id}});
        // should we setState here too?
      };

      componentWillMount(){

        this.props.dispatch({
          type: '$$local.register',
          payload: {
            ident: this.state.id,
            initial: this.state.value,
            reducer,
            persist
          }
        });
      }

      componentWillReceiveProps(next){
        let id = getId(next);

        if (id !== this.state.id){
          let init = getInitial(next);
          this.props.dispatch({
            type: '$$local.swap',
            payload: {
              ident: this.state.id,
              next: id,
              initial: init,
              reducer,
              persist
            }
          });
          this.setState({ id, value: next.$$local !== undefined ? next.$$local : init });
        }
        else {
          this.setState({ value: next.$$local });
        }

      }

      componentWillUnmount(){
        this.props.dispatch({
          type: '$$local.unmount',
          payload: {
            ident: this.state.id,
            persist
          }
        });
      }

      render(){
        return <Target
          {...omit(this.props, '$$local')}
          $={this.$}
          ident={this.state.id}
          dispatch={this.props.dispatch}
          state={this.state.value}
          setState={this._setState}>
            {this.props.children}
        </Target>;
      }
    };
  };
}

