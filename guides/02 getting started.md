```jsx
import {reducer} from 'redux-react-local';

// when you're constructing your redux store,
// add `local` as a key with the above `reducer`
// example -
const store = createStore(combineReducers({
  // ... your other reducers
  local: reducer
}));

// you can now annotate any of your components with `@local`

```