const identity = x => x
import * as T from './tree'

function get(key) {
  return T.get(this.$$tree, key)
}

// too - .get when initialState is passed
export default function localReducer(state = {
  $$tree: T.make(),
  $$fns: T.make(),
  $$changed: T.make()
}, action) {
  // ack!
  state.get = state.get || get
  state.$$tree = state.$$tree || T.make()
  state.$$fns = state.$$fns || T.make()
  state.$$changed = state.$$changed || T.make()

  switch (action.type) {
    case '$$local.flushed': return flush(state, action)
    case '$$local.setState': return setState(state, action)
    case '$$local.register': return register(state, action)
    case '$$local.swap': return swap(state, action)
    case '$$local.unmount': return unmount(state, action)
    default: return reduceAll(state, action)
  }
}

function flush(state) {
  return {
    ...state,
    $$changed: T.make()
  }
}

function setState(state, { payload }) {
  if(payload.state === undefined) {
    throw new Error('cannot set undefined as local state')
  }

  return {
    ...state,
    $$tree: T.set(state.$$tree, payload.ident, payload.state),
    $$changed: T.set(state.$$changed, payload.ident, true)
  }
}

function register(state, action) {
  let { payload: { ident, initial, reducer } } = action,
    fn = T.get(state.$$fns, ident)

  if (fn && fn !== identity && fn !== reducer) {
    throw new Error(`local key ${ident} already exists`)
  }
  // this way we can 'persist' across unmounts
  // also makes preloading data simple
  let prevState = T.get(state.$$tree, ident)
  return {
    ...state,
    $$tree: prevState ? state.$$tree : T.set(state.$$tree, ident, initial),
    $$fns: T.set(state.$$fns, ident, reducer),
    $$changed: T.set(state.$$changed, ident,  true)
  }
}

function swap(state, action) {
  let { payload } = action
  return register(unmount(state, action), {
    ...action,
    payload: {
      ...payload,
      ident: payload.next
    }
  })
}

function unmount(state, action) {
  let { payload: { persist, ident } } = action
  if (persist) {
    return {
      ...state,
      $$fns: T.set(state.$$fns, ident, identity) // we use this as a signal that it's been unmounted
    }
  }
  else {
    return {
      ...state,
      $$tree: T.del(state.$$tree, ident),
      $$fns: T.del(state.$$fns, ident)
    }
  }
}

function memoizeRsToOb(fn) {
  let cache = new WeakMap()
  return (o) => {

    if(cache.has(o)) {
      return cache.get(o)
    }
    cache.set(o, fn(o))
    return cache.get(o)
  }
}

const fnToOb = memoizeRsToOb(T.toObject)


function reduceAll(state, action) {
  // update all local keys
  let { meta: { ident, local } = {} } = action,
    { $$fns } = state, changed = [],
    reducers = fnToOb($$fns)

  let t = state.$$tree, entries = T.entries(state.$$tree)
  entries.forEach(([ key, value ]) => {
    let $action = action
    // if this originated from the same key, then add me: true
    if (key === ident && local) {
      $action = { ...$action, me: true }
    }

    // reduce
    let computed = reducers[key] ? reducers[key](value, $action) : value

    if (computed === undefined) {
      throw new Error(`did you forget to return state from the ${key} reducer?`) // eslint-disable-line no-console
    }

    if(computed !== value) {
      t = T.set(t, key, computed)
      changed.push(key)
    }
  })

  return changed.length > 0 ? {
    ...state,
    $$tree: t,
    $$changed: changed.reduce((c, key) => T.set(c, key, true), state.$$changed)
  } : state
}
