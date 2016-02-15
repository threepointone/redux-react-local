import React, {Component} from 'react';
import {render} from 'react-dom';

import {local, Root} from '../src';

@local({
  ident: 'app',
  initial: 0,
  reducer(state, {me, meta: {type}}){
    if (me && type === 'increment'){
      return state + 1;
    }
    return state;
  }
})
class App extends Component{
  onClick = () => {
    this.props.dispatch(this.props.$({type: 'increment'}));
  };
  render(){
    return <div>
      <button onClick={this.onClick}>click</button>
      <br/>
      {this.props.state}
    </div>;
  }
}

render(<Root><App/></Root>, document.getElementById('app'));
