redux-react-local
---

- setState for local components, but persist to a redux store
- colocate reducers and components


`npm install react redux react-redux redux-react-local --save`

```jsx
import {localReducer, local} from 'redux-react-local';

// include the reducer on your redux store on a 'local' key
let store = combineReducers({
  local: localReducer
})

//...

// and connect your components
local({
  ident: 'app',
  initial: {count: 0},
  // optionally -
  reducer(state, action){
    if(action.self){
      switch(action.meta.type){
      // increment decrement etc
    }
    // reduce on other global dispatches here
    return state;
  }
})
(function App({state, setState, xpatch}){
  return <div onClick={() => setState({count: state.count + 1})>
    clicked {state.count} times <br/>
  </div>
})

```

more -

- dispatch / reduce locally
- listen on other 'components' via redux/connect

local
---

- `ident` - a 'unique' string that corresponds to the component. eg - 'app', 'inbox', 'messages:341', etc
- `ident (props)` - a function that returns the above
- `initial` - initial state
- `initial (props)` - a function that returns the above
- `reducer (state, action)`
