import {PropTypes, Children, Component} from 'react';
import createSagaMiddleware from 'redux-saga';

export class Sagas extends Component{
  static createSagaMiddleware = createSagaMiddleware;
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

export class Saga extends Component{
  static propTypes = {
    saga: PropTypes.func.isRequired
  };
  static contextTypes = {
    sagas: PropTypes.func.isRequired
  };

  componentDidMount(){
    this.runningSaga = this.context.sagas.run(this.props.saga, this.props);
  }

  componentWillReceiveProps(){
    // ??
  }
  render(){
    return !this.props.children ? null : Children.only(this.props.children);
  }
  componentWillUnmount(){
    this.runningSaga.cancel();
    delete this.runningSaga;
  }
}



