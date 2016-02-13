/* global describe, it, beforeEach, afterEach */

import React, {PropTypes, Component} from 'react' ;
import {local, Root} from '../src';

import {render, unmountComponentAtNode} from 'react-dom';
// import {cps, put, SagaCancellationException} from 'redux-saga';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);


describe('react-redux-optimist', () => {
  let node;
  beforeEach(() => node = document.createElement('div'));
  afterEach(() => unmountComponentAtNode(node));

  it('optimistic updates', () => {


    @local({
      ident: 'app',
      initial: {x: 0, y: 0, z: 0},
      reducer(state, {type, payload} = {}){
        switch (type){
          case 'act': return {...state, x: 1, y: 2, w: payload.w};
          case 'act:commit': return {...state, x: 2, z: 3, w: payload.w};
          case 'act:revert': return {...state, y: 5, z: 9, w: payload.w};
        }
        return state;
      }
    })

    class App extends Component{
      static contextTypes = {
        optimist: PropTypes.func
      };
      componentDidMount(){
        let {dispatch} = this.props;
        let o = this.context.optimist('act');

        dispatch(o.begin({payload: {w: 1}}));
        // dispatch(o.commit({w: 5}));
        dispatch(o.revert({payload: {w: 5}}));
      }
      render(){
        return <div>{JSON.stringify(this.props.state)}</div>;
      }
    }
    render(<Root><App /></Root>, node);

    expect(node.innerText).toEqual(JSON.stringify({
      x: 0, y: 5, z: 9, w: 5
    }));

  });

});
