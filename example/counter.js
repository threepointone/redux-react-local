import React, {Component} from 'react';
import {render} from 'react-dom';
import {local, Root} from '../src';

@local({
  ident: 'app',
  initial: 0,
  reducer(state, {me, meta = {}}){
    if (me && meta.type === 'increment'){
      return state + 1;
    }
    return state;
  }
})
class App extends Component{
  onClick = () => {
    let {$, dispatch} = this.props;
    dispatch($('increment'));
  };
  render(){
    return <div onClick={this.onClick}>
      clicked {this.props.state} times
    </div>;
  }
}

render(<Root><App/></Root>, window.app);

