import React, {Component} from 'react';
import {render} from 'react-dom';
import {connect} from 'react-redux';

import {local, Root} from '../src';

@local({
  ident: 'app',
  initial: 0,
  reducer(state, {type}){
    if (type === 'increment'){
      return state + 1;
    }
    return state;
  }
})
class Counter extends Component{
  onClick = () => {
    this.props.dispatch({type: 'increment'});
  };
  render(){
    return <div>
      <button onClick={this.onClick}>clicked {this.props.state} times</button>

    </div>;
  }
}

@connect(state => state.local)
class Debug extends Component{
  render(){
    return <div>
      debugging: {this.props.app}
    </div>;
  }
}

class App extends Component{
  render(){
    return <div>
      <Counter/>
      <Counter/>
      <Debug/>
    </div>;
  }
}

render(<Root><App/></Root>, document.getElementById('app'));
