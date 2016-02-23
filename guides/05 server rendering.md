server side rendering api
---

(wip)

tl;dr

- call `ReactDOM.renderToString(<App/>)` once before dispatching any actions [(example)](https://github.com/threepointone/redux-react-local/blob/master/example/server.js)
- pass your initial state through `stringifySafe` before calling `JSON.stringify`


#### longer explanation

([react/#1739](a https://github.com/facebook/react/issues/1739))

server side rendering with react booboos -

- `renderToString` is synchronous
- of consequence - componentDidMount, componentWillUnmount, componentWillReceiveProps, componentWillUpdate - none of these will trigger[1]
- further, there's no way to render just the plain tree structure in memory and analyze it, so if there's application structure/data that you need to pull out and treat/transform before finally rendering to string, you... can't.
- because of this, it's non-trivial to render dynamic react apps, where some async logic is 'hidden' in a subtree somewhere
- workarounds include hoisting all this logic to the very top (react-router), fibers (react-async), etc etc
- as an aside, this is also why you never attach an external event handler in componentWillMount, if you expect to unmount it on componentWillUnmount. The latter never triggers on the server side, leaving you with a memory leak. The workaround is to only attach handlers in componentDidMount (and by its nature, only on the client side).

- we treat the registration of reducers as an idempotent operation on the redux store
- we leverage the fact that initialization / `componentWillMount` hooks _do_ run on `renderToString` to register our local reducers onto the redux store. thus, we do a throwaway `renderToString` on the app with the redux store in its context.
- after that, we dispatch whatever actions we need to as usual
- we need to strip out the reducers from the redux store's state before stringifying it, to that effect we run it through `stringifySafe`
- on the client side, on first render, the reducers get registered again at the correct positions, while picking up initial state from the redux store
- boom!

