redux-react-local
---

- mad science inc.


`npm install redux-react-local --save`

```jsx
import {Root, local} from 'redux-react-local';

// connect your components
local({
  ident: 'app',
  initial: {count: 0},
  // optionally -
  reducer(state, action){
    if(action.me){
      switch(action.meta.type){
      // increment decrement etc
    }
    // reduce on other global dispatches here
    return state;
  },
  saga: function* (_, {getState, $}){
    // via redux-saga
  }
})
(function App({state, dispatch, $}){
  return <div onClick={() => dispatch($('increment'))>
    clicked {state.count} times
  </div>
})

render(<Root><App/></App>, /* ... */);

```

more -

- dispatch / reduce locally
- listen on other 'components' via redux/connect

local
---

decorator for a react component

- `ident` - a 'unique' string that corresponds to the component. eg - 'app', 'inbox', 'messages:341', etc
- `ident (props)` - a function that returns the above
- `initial` - initial state
- `initial (props)` - a function that returns the above
- `reducer (state, action)`
- `saga *(getState, {$, dispatch, getState})`

actions in reducers get annotated with data to assist in reducing. an action that originated in the same component will have `action.me === true`. further, `action.meta.type` will contain be as it originated. note - you must wrap your actions with `$()` to ensure this behavior.

sagas are started once the component mounts, and gets passed a callback to get redux state. it also gets passed an object with `$()`, a locally scoped `getState()`, and the `id` of the component.

passed props
---

- dispatch - via redux
- $ - helper to locally scope an action
- state
- ident


Root
---

- middleware - an array of redux middleware
- reducers - an object with reducers

this sets up a redux store, adding support for sagas and local annotations. I'll come up with a better way to integrate with existing redux apps.

