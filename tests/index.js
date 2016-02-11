/* global describe, it, beforeEach, afterEach */

import React, {Component, PropTypes} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {findRenderedDOMComponentWithTag, Simulate} from 'react-addons-test-utils';

import {Root, local} from '../src';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('local', () => {
  let node;
  beforeEach(() => node = document.createElement('div'));
  afterEach(() => unmountComponentAtNode(node));

  it('stubby stub', done => {
    @local({
      ident: 'app',
      initial: 0,
      reducer(state, {meta, me}){
        if (me){
          switch (meta.type){
            case 'increment': return state + 1;
          }
        }
        return state;
      }
    })
    class App extends Component{
      componentDidMount(){
        expect(typeof this.props.dispatch).toEqual('function');
        expect(typeof this.props.$).toEqual('function');
        expect(this.props.state).toEqual(0);
        done();
      }
      render(){
        return null;
      }
    }

    render(<Root><App/></Root>, node);

  });
});
