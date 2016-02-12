redux-react-local
---

`npm install redux-react-local --save`

This assumes that you have some familiarity with react and redux.

Ok, so - react's 'components' are awesome, and lets us describe our UIs as hierarchies. Lovely. I'm a big fan of architectures that are 'fractal' - where the 'big' elements can be 'composed' of similar looking smaller ones, and react's components fit the bill. (Other examples - functions, observables, channels, js objects(!), etc)[1]

However, because 'views' don't have global 'references'/identities ala Backbone etc, 'talking' between these components can get cumbersome[2]; we then resort to building *some* form of messaging system external to these components - callbacks, pubsub channels, redux stores, observable event chains, etc. The smart ones use `context` to expose these systems to a particular render tree, avoiding 'global' state, but still getting a similar model.

Redux in particular has become a popular implementation of the flux pattern - all application state is held in one js object, where the value of each of its keys correspond to a 'reducer` function that gets called on every 'action' that's 'dispatched'. Components / external sources can then dispatch actions to 'effect' state in a controlled manner. Very nice.

Now, redux expects you to declare all your reducers outright at the beginning of the app's lifecycle. This is great for state that
1. will exist through the lifecycle of the app
2. makes sense 'across' the app. eg - currently logged in user details, databases/caches, mouse/touch positions, etc.

This state isn't usually specific to a particular component on the page, and will keep reducing on actions till the app exits.

However, this approach doesn't work well for 'dynamic' components that might pop in and out of existence. For example - Imagine a dynamically fetched list of tweets (length unknown till after fetch), each with buttons to like/retweet etc. When hovering/clicking these buttons, we'd need to store this state *somewhere*. Options -

1. We use `this.setState()`, but then that state is opaque to the rest of the app. We'd have to dispatch actions on every setState, and then do dynamic dispatch on actions with its type *and* some form of id, and this is already getting out of hand...
2. We store an array of components states, indexed by some key/id, and update that as and when. However, this collection's 'information' was already available in the *react tree itself*, and it's a shame we don't use it.
3. This is complicated by the fact that each of these elements might have an initial state that's based on its props. This leads to boilerplate on mount/unmount to prime/remove this state, and we end up jumping too many files for something that's really local to just one component.
4. Actions are differentiated (dynamic dispatch?) based on their string 'type', which implies a global 'namespace' of sorts for these action types. This is usually fine, but leads to ickiness in the above situation. ie - should one dispatch `'hover', {id}` or `'${id}:hover'`?, etc

With the above issues, we lose the fractal nature of our architecture. which makes me a sad puppy. Sad puppies are officially considered an animal rights violation, so we have to do something about it.

What I'd really like to do is be able to

- define a reducer for a component's 'state'
- that's called for all actions across the app
- that activates/deactivates with the component's mount/unmount lifecycle
- with state that corresponds to a key/ 'ident' on the redux store
- this ident could be dynamically generated as a ƒ(props)
- dispatch 'locally scoped' actions - ie - where the action type is a ƒ(ident)
- would be nice if the local reducer could 'recognize' actions that originated from 'itself'

[drum roll...]

redux-react-local to the rescue! At its simplest, it looks like this -

```jsx
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
class App extends Component{
  render(){
    return <div onClick={() => this.props.dispatch({type: 'increment'})}>
      clicked {this.props.state} times
    </div>;
  }
}

render(<Root><App/></Root>, window.app);

```

We use a `<Root>` component to wrap the whole tree; this sets up a redux store and other plumbing. We then annotate our components with a `@local` decorator declaring -

- `ident` - short for 'identity', we use this value as a key on our internal store, among other things. This is either a string ('app', 'inbox', etc), or a function that receives props and returns a string.
- `initial` - initial state for this component. Can also be a function that receives props and returns the initial state.
- `reducer` - a reducer for local state; recieves all actions that flow through the redux store.
- `saga` - runs a saga when the component mounts, and cancels it when it unmounts (more on that in a bit)

The wrapped component will then recieve these props -

- `dispatch` - same as redux's dispatch
- `state` - current local state
- `ident` - as above
- `$` - a helper function to 'localize' actions.

`Local` actions
---

We need a way to generate actions that are 'local' to the component that's dispatching them. To that effect, we use `$` which accepts a `type` and a `payload`, and generates an action that's associated with the current component. It looks like this -
```jsx
$('someAction', {some: 'payload'}, moreStuff)

// generates -

{
  type: `${ident}:someAction`,
  payload: {
    some: 'payload'
  },
  meta: {
    ident: ident,
    type: 'someAction'
  },
  ...moreStuff
}
```

Further, when reducing these actions locally, we can tell when a reducer is local to a given action, and add a flag saying so, making it easy to 'recognize' these events in your reducer.

```jsx
(state, {me, meta}) => {
  if(me){ // happened locally!
    switch(meta.type){
      case 'someAction': //...
    }
  }
  // you can 'listen' to all other global dispatches here
  return state;
}
```

Convenient!


sagas
---
(This assumes familiarity with redux-saga. Check it out, it's the absolute bees knees.)

If you've used redux-saga, you'll notice that sagas share the same fractal-breaking problem as redux reducers - you have to declare/run them at the very start, they run for the entire lifecycle of the app, and aren't friendly with transient components.

Similar to the above, what I really want is -

- declare a saga corresponding to a component
- that 'lives' for the life of that component
- friendly with the above reducing system


tada, redux-react-local already does this! Just declare a `*saga` generator in the annotation.

This saga recieves these arguments

- `getState` - same as redux's getState
- an object with -
  - `$` same localization helper as above
  - `ident` corresponding to the component
  - `getState`- returns this component's state


This gives us our own little 'event loop'/'process' for the component, with all the other goodies from redux-saga. Nice! See the mousetracking example for usage. [4]



Final thoughts
---

Fractal architectures are very nice to grok and work on, because it means you 'think' about your app the same way no matter what level of abstraction you're working on.

But also, there's value in being able to describe your system at very low levels, and have your software treat it as a global concern and optimize accordingly.

An example is the way React does event handling - when we first learn about front end web development, we attach event handlers directly on elements (`<div onclick="handler()"/>`), because that's simple and easy. However, we're soon told by our seniors and whatnot that it's inefficient, and we should use event delegation at a top level, etc etc. This makes it faster, but we lose the programming model of colocating elements and their handlers (replaced with css selectors and what not). React looks at this a different way, and lets you colocate an event handler with an element (as `<div onClick={() => {}}/> `), but internally makes sure it uses event delegation at the very highest level.

Simlarly for html - writing 'inline html' is a bad practice, and we're told to use templating languages, etc etc. React instead offers JSX to 'describe' html, sidestepping the need for string concatenation, and efficiently rendering/updating the dom when something 'changes', letting us still write 'inline html' conceptually, but with fewer warts.

redux-react-local is a similar effort, letting you colocate state, behavior, and components, while treating it as a global concern. I hope this helps you in some way!



[1] 'classes' are *not* fractal, because inheritance mashes methods and properties on a flat level. This gets out of hand quickly, and doesn't satisfy the big-small charecteristic of fractals. react sidesteps this problem by making an inheritance chain exactly one step deep (React.Component) - and discourages further extension, instead excouraging HOCs (higher order components) and other functional-friendly ways of composition (stateless functional components, etc).
[2] Truly, this was one of the advantages of the MVC model, being able to reference components in an app is a very simple way. Sure, it led to so called 'spaghetti' code, but the mental model itself was nice (also see - MVVM, etc)
[3] Indeed, I contend that *all* keys ont the store should be associated with some component or the other, even if the component doesn't render any dom.
[4]inside a saga, it's cumbersome to `take` an action from *another* component where the ident is dynamically generated, unless you have out-of-band knowledge of this ident. This can be alleviated by helpers on data from the 'global' `getState`, and/or dispatching simpler 'global' actions from that component's saga, but it isn't ideal. Open to suggestions!
