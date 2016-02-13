/* global describe, it, beforeEach, afterEach */
 //    ✔ passes ident
 //    ✔ ident can use props
 //    ✔ throws if you don't pass ident
 //    ✔ uses ident as a key for redux store (skipped)
 //    ✔ can have an initial state
 //    ✔ initial state can use props
 //    ✔ accepts a reducer that gets called on all actions
 //    ✔ gets called on all actions
 //    ✔ updates when state changes
 //    ✔ passes the redux dispatch function
 //    ✔ passes a 'localization' helper
 //    ✔ localized events have meta information
 //    ✔ actions that originated in the same component can be detected
 //    ✔ accepts a saga
 //    ✔ starts when the component is mounted
 //    ✔ gets cancelled when the component unmounts
 //    ✔ receives the ident
 //    ✔ can dispatch global/local actions
 //    ✔ can read from global/local redux state


import React, {Component, PropTypes} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {connect} from 'react-redux';
import {put, cps, SagaCancellationException} from 'redux-saga';

import {Saga} from '../src/sagas';

import {Root, local} from '../src';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

function sleep(period, done){
  setTimeout(() => done(null, true), period);
}

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

  // sagas
  it('accepts a saga', done => {
    let started = false;

    class App extends Component{
      *saga(){
        started = true;
        yield cps(sleep, 300);
        done();
      }
      render(){
        return <Saga saga={this.saga}/>;
      }
    }
    expect(started).toEqual(false);

    render(<Root><App /></Root>, node);
    expect(started).toEqual(true);
  });

  it('starts when the component is mounted', () => {
    // as above
  });

  it('gets cancelled when the component unmounts', done => {
    let unmounted = false;

    class App extends Component{
      *saga(){
        try {
          while (true){
            yield cps(sleep, 100);
          }
        }
        catch (e){
          if (e instanceof SagaCancellationException && unmounted === true){
            done();
          }
        }
      }
      render(){
        return <Saga saga={this.saga} />;
      }
    }

    render(<Root><App /></Root>, node);

    sleep(500, () => {
      unmounted = true;
      unmountComponentAtNode(node);
    });


  });

  it('receives the ident', done => {

    @local({
      ident: 'app'
    })
    class App extends Component{
      *saga(_, {ident}){
        expect(ident).toEqual('app');
        done();
      }
      render(){
        return <Saga saga={this.saga} ident={this.props.ident} />;
      }
    }
    render(<Root><App /></Root>, node);

  });

  it('can dispatch global/local actions', done => {
    @local({
      ident: 'app',
      initial: 1,
      reducer(state, {me, type, payload, meta}){
        if (me && meta.type === 'localE'){
          return state + payload.x;
        }
        if (type === 'globalE'){
          return state * payload.x;
        }
        return state;
      }
    })
    class App extends Component{
      *saga(_, {$}){
        yield put($({type: 'localE', payload: {x: 1}}));
        yield put({type: 'globalE', payload: {x: 10}});
        expect(node.innerText).toEqual('20');
        done();
      }
      render(){
        return <div>
          <Saga saga={this.saga} $={this.props.$}/>
          {this.props.state}
        </div>;
      }
    }

    render(<Root><App /></Root>, node);

  });

  it('can receive props', done => {
    class App extends Component{
      *saga(_, {x}){
        expect(x).toEqual(123);
        done();
      }
      render(){
        return <Saga saga={this.saga} x={123} />;
      }
    }

    render(<Root><App/></Root>, node);
  });

  it('can read from global redux state', done => {

    class App extends Component{
      *saga(getState){
        expect(getState().x.a).toEqual(123);
        done();
      }
      render(){
        return <Saga saga={this.saga} />;
      }
    }

    render(<Root reducers={{x: (state = {a: 123}) => state}}>
      <App/>
    </Root>, node);

  });

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

