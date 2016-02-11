import React, { Component } from 'react';
import {render} from 'react-dom';
import { Root, local } from '../src';
import {cps, put} from 'redux-saga';

function times(n, fn){
  let ctr = 0, arr = [];
  while (ctr < n){
    arr.push(fn(ctr));
    ctr++;
  }
  return arr;
}

class App extends Component {

  render() {
    return <div onClick={this.onClick}>
      {times(100, i =>
        <Cell id={i} key={i}/>
        )}
    </div>;
  }
}

function sleep(period, done){
  // console.log(period);
  setTimeout(() => done(null, true), period);
}

 function rgbToHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    r = r.length < 2 ? '0' + r : r;
    g = g.length < 2 ? '0' + g : g;
    b = b.length < 2 ? '0' + b : b;
    return '#' + r + g + b;
  }

function ltoRgb(l){
  let v = Math.round(l * 2.55);
  return rgbToHex(v, v, v);
}

@local({
  ident: ({id}) => `cell:${id}`,
  initial: () => ({
    period: Math.random() * 200,
    brightness: Math.random() * 100
  }),
  reducer: (state, {payload, meta, me}) => {
    if (me){
      if (meta.type === 'tick'){
        return {
          ...state,
          brightness: payload
        };
      }
    }
    return state;
  },
  saga: function*(_, {getState, $}){
    while (true){
      yield cps(sleep, getState().period);
      yield put($('tick', Math.random() * 100));
    }
  }
})
class Cell extends Component{
  static style = {
    width: 100,
    height: 100,
    display: 'block',
    float: 'left'
  };
  render(){
    let {ident, state} = this.props;
    return <div style={{
        ...Cell.style,
        backgroundColor: ltoRgb(state.brightness)
      }}>{ident}</div>;
  }
}


render(<Root >
  <App />
</Root>, document.getElementById('app'));

