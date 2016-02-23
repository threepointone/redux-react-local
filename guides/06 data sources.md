async data sources
---

it should be possible to 'mount' side-effecting sources of data onto the react tree. here's an example of conditionally tracking mouse move position on a document

```jsx

@local({
  ident: 'mouse'
})
class Mouse extends Component{
  onMove = ({pageX, pageY}) => {
    this.props.setState({pageX, pageY})
  }
  componentDidMount(){
    window.addEventListener('mousemove', this.onMove)
  }
  componentWillUnmount(){
    window.removeEventListener('mousemove', this.onMove)
  }
  render(){
    return null
  }
}

@connect(state => state.local.mouse)
class App extends Component{
  state = {
    tracking: false
  }
  onClick = () => {
    this.setState({tracking: !this.state.tracking})
  }
  render(){
    let {pageX, pageY} = this.props
    return <div onClick={this.onClick}>

      {this.state.tracking ? <Mouse/> : null}

      x: {pageX}, y: {pageY}
      <br/>

      ps -  because `persist` defaults to `true`,
      the above stays even when not tracking.
      magic!

    </div>
  }
}
```

gotcha
---

in the above example, on first render, pageX and pageY will be `undefined`, because `<Mouse/>` wouldn't have had a chance to register itself yet. You can workaround this by making sure data source components are higher up in the react tree, than the components that will read from it.