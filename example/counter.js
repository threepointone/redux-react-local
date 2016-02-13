import React, {Component} from 'react';
import {render} from 'react-dom';
import {local, Root} from '../src';

// no need for a saga here, just directly reduce

@local({
  ident: 'app',
  initial: 0,
  reducer(state, {me, meta: {type} = {}}){
    if (me && type === 'increment'){
      return state + 1;
    }
    return state;
  }
})
class App extends Component{
  onClick = () => {
    let {$, dispatch} = this.props;
    dispatch($({type: 'increment'}));
  };
  render(){
    return <div onClick={this.onClick}>
      clicked {this.props.state} times
    </div>;
  }
}

render(<Root><App/></Root>, window.app);

