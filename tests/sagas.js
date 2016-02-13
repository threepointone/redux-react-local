/* global describe, it, beforeEach, afterEach */

import React, {Component} from 'react';
import {Sagas, Saga} from '../src/sagas';
import {Root, local} from '../src';
import {render, unmountComponentAtNode} from 'react-dom';
import {cps, put, SagaCancellationException} from 'redux-saga';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

function sleep(period, done){
  setTimeout(() => done(null, true), period);
}


describe('react-redux-saga', () => {
  let node;
  beforeEach(() => node = document.createElement('div'));
  afterEach(() => unmountComponentAtNode(node));

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
  });
