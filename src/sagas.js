import {PropTypes, Children, Component} from 'react';

export class Sagas extends Component{
  static propTypes = {
    middleware: PropTypes.func.isRequired
  };
  static childContextTypes = {
    sagas: PropTypes.func.isRequired
  };
  getChildContext(){
    return {
      sagas: this.props.middleware
    };
  }
  render(){
    return Children.only(this.props.children);
  }
}
