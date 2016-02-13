import {PropTypes, Component, Children} from 'react';
import {BEGIN, COMMIT, REVERT} from 'redux-optimist';

export class Optimist extends Component{
  nextTransactionID = 0;
  optimist = name => {
    const id = this.nextTransactionID++;
    return {
      begin: action => ({
        type: name,
        ...action,
        optimist: {type: BEGIN, id}
      }),
      commit: action => ({
        type: `${name}:commit`,
        ...action,
        optimist: {type: COMMIT, id}
      }),
      revert: action => ({
        type: `${name}:revert`,
        ...action,
        optimist: {type: REVERT, id}
      })
    };
  };
  static childContextTypes = {
    optimist: PropTypes.func
  };
  getChildContext(){
    return {
      optimist: this.optimist
    }
  }
  render(){
    return Children.only(this.props.children);
  }
}


