import React, {Component} from 'react';
import {render} from 'react-dom';
import {local, Root} from '../src';
import {take, race, put, cps} from 'redux-saga';
import {Saga} from '../src/sagas';

// Event iterator
function events(target, event) {
  let fns = [], handler = e => {
    fns.forEach(fn => fn(null, e));
    fns = [];
  };
  target.addEventListener(event, handler);

  return {
    next(fn) {
      fns.push(fn);
    },
    dispose(){
      target.removeEventListener(event, handler);
      fns = handler = null;
    }
  };
}

@local({
  ident: 'app',
  initial: {active: false},
  reducer(state, {me, meta, payload: {pageX, pageY} = {}}){
    if (me){
      switch (meta.type){
        case 'mousedown': return {...state, x: pageX, y: pageY, active: true};
        case 'mousemove': return {...state, x: pageX, y: pageY};
        case 'mouseup': return {...state, active: false};
      }
    }
    return state;
  }
})
class App extends Component{
  *saga(_, {$}){
    while (true){
      yield take('app:mousedown');

      // start listening to mousemove and mouseup events
      let up$ = events(window, 'mouseup');
      let move$ = events(window, 'mousemove');

      while (true){
        let {up, move} = yield race({
          up: cps(up$.next),
          move: cps(move$.next)
        });

        if (move){
          yield put($({type: 'mousemove', payload: move}));
        }
        else {
          yield put($({type: 'mouseup', payload: up}));
          break;
        }
      }

      // cleanup
      up$.dispose();
      move$.dispose();
    }

  }
  onMouseDown = e => {
    let {$, dispatch} = this.props;
    dispatch($({type: 'mousedown', payload: e}));
  };
  render(){
    let {active, x, y} = this.props.state;
    return <div onMouseDown={this.onMouseDown}>
      <Saga saga={this.saga} $={this.props.$}/>
      <span>{active ? `${x}:${y}` : 'click and drag'}</span>
    </div>;
  }
}

render(<Root><App/></Root>, window.app);

