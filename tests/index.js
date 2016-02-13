/* global describe, it, beforeEach, afterEach */

import React, {Component, PropTypes} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {connect} from 'react-redux';

import {Root, local} from '../src';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);


describe('redux-react-local', () => {
  let node;
  beforeEach(() => node = document.createElement('div'));
  afterEach(() => unmountComponentAtNode(node));
  // ident
  it('passes ident', () => {

    @local({
      ident: 'app'
    })
    class App extends Component{
      componentDidMount(){
        expect(this.props.ident).toEqual('app');
      }
      render(){
        return null;
      }
    }
    render(<Root><App/></Root>, node);
  });

  it('ident can use props', () => {
    @local({
      ident: props => `comp:${props.abc}`
    })
    class App extends Component{
      static propTypes = {
        abc: PropTypes.string.isRequired
      };
      componentDidMount(){
        expect(this.props.ident).toEqual('comp:xyz');
      }
      render(){
        return null;
      }
    }

    render(<Root><App abc='xyz'/></Root>, node);
  });

  it('throws if you don\'t pass ident', () => {
    expect(() => @local()
    class App extends Component{
      render(){
        return null;
      }
    }).toThrow();

  });

  it('uses ident as a key for redux store', () => {
    @local({
      ident: 'app',
      initial: 'zzz'
    })
    class App extends Component{
      render(){
        return <Inner/>;
      }
    }

    @connect(x => x)
    class Inner extends Component{
      render(){
        return <div>{this.props.local.app}</div>;
      }
    }

    render(<Root><App /></Root>, node);
    expect(node.innerText).toEqual('zzz');
  });

  // state
  it('can have an initial state', () => {
    @local({
      ident: 'app',
      initial: 999
    })
    class App extends Component{
      componentDidMount(){
        expect(this.props.state).toEqual(999);
      }
      render(){
        return null;
      }
    }
    render(<Root><App /></Root>, node);
  });

  it('initial state can use props', () => {
    @local({
      ident: 'app',
      initial: props => props.x + 2
    })
    class App extends Component{
      componentDidMount(){
        expect(this.props.state).toEqual(7);
      }
      render(){
        return null;
      }
    }
    render(<Root><App x={5}/></Root>, node);
  });

  it('accepts a reducer that gets called on all actions', () => {
    @local({
      ident: 'app',
      initial: 0,
      reducer(state, {type, payload}){
        if (type === 'xyz'){
          return state + payload;
        }
        return state;
      }
    })
    class App extends Component{
      componentDidMount(){
        let {dispatch} = this.props;
        expect(typeof dispatch).toEqual('function');
        dispatch({type: 'xyz', payload: 1});
        dispatch({type: 'xyz', payload: 1});
        dispatch({type: 'xyz', payload: 1});
      }
      render(){
        return <div>{this.props.state}</div>;
      }
    }
    render(<Root><App /></Root>, node);
    expect(node.innerText).toEqual('3');

  });
  it('gets called on all actions', () => {
    // as above
  });

  it('updates when state changes', () => {
    // as above
  });

  it('passes the redux dispatch function', () => {
    // as above
  });

  it('passes a \'localization\' helper', () => {
    @local({
      ident: 'app'
    })
    class App extends Component{
      componentDidMount(){
        let {$} = this.props;
        expect($({type: 'name', payload: {some: 'payload'}})).toEqual({
          type: 'app:name',
          payload: {some: 'payload'},
          meta: {
            ident: 'app',
            type: 'name',
            local: true
          }
        });
      }
      render(){
        return null;
      }
    }
    render(<Root><App /></Root>, node);
  });
  it('local events have meta information', () => {
    // as above
  });

  it('local actions can be detected', () => {
    class App extends Component{
      componentDidMount(){
        this.props.dispatch(this.props.$({type: 'beep', payload: 10}));
      }
      render(){
        return <span>{this.props.state}</span>;
      }
    }
    let App1 = local({
      ident: 'one',
      initial: 10,
      reducer(state, {me, meta, payload}){

        if (me && meta.type === 'beep'){
          return state + payload;
        }
        // alternately, you could test for 'one:beep',
        // but this is cumbersome, and gets harder for props generated idents
        return state;
      }
    })(App);

    let App2 = local({
      ident: 'two',
      initial: 100,
      reducer(state, {me, meta, payload}){
        if (me && meta.type === 'beep'){
          return state * payload;
        }
        return state;
      }
    })(App);

    render(<Root>
      <div>
        <App1 />:<App2 />
      </div>
    </Root>, node);

    expect(node.innerText).toEqual('20:1000');

  });

  it(`can 'setState' locally`, () => {

    @local({
      ident: 'app',
      initial: {value: 0}
    })
    class App extends Component{
      componentDidMount(){
        let {setState, state} = this.props;
        setState({value: state.value + 1});
      }
      render(){
        let {value} = this.props.state;
        return <div>{value}</div>;
      }
    }

    render(<Root><App /></Root>, node);
    expect(node.innerText).toEqual('1');

  });


});

