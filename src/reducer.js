const identity = x => x

function get(key) {
  return this.$$index[key]
}

// too - .get when initialState is passed
export default function localReducer(state = {
  $$index: {},
  $$changed: {}
}, action) {
  state.get = state.get || get
  switch (action.type) {
    case '$$local.setState': return setState(state, action)
    case '$$local.register': return register(state, action)
    case '$$local.swap': return swap(state, action)
    case '$$local.unmount': return unmount(state, action)
    default: return reduceAll(state, action)
  }
}

function setState(state, { payload }) {
  if(payload.state === undefined) {
    throw new Error('cannot set undefined as local state')
  }

  return {
    ...state,
    $$index: (state.$$index[payload.ident] = payload.state, state.$$index),
    $$changed: (state.$$changed[payload.ident] = true, state.$$changed)
  }
}

function register(state, action) {
  let { payload: { ident, initial, reducer } } = action,
    fn = (state.$$fns || {})[ident]

  if (fn && fn !== identity && fn !== reducer) {
    throw new Error(`local key ${ident} already exists`)
  }
  // this way we can 'persist' across unmounts
  // also makes preloading data simple
  let $$fns = state.$$fns || {}
  return {
    ...state,
    $$index: (state.$$index[ident] = state.$$index[ident] !== undefined ? state.$$index[ident] : initial, state.$$index),
    $$fns: ($$fns[ident] = reducer, $$fns),
    $$changed: (state.$$changed[ident] = true, state.$$changed)
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
  let $$fns = state.$$fns || {}
  if (persist) {
    return {
      ...state,
      $$fns: ($$fns[ident] = identity, $$fns) // we use this as a signal that it's been unmounted
    }
  }
  else {
    return {
      ...state,
      $$index: (delete state.$$index[ident], state.$$index),
      $$fns: (delete state.$$fns[ident], state.$$fns)
    }
  }
}

function reduceAll(state, action) {
  // update all local keys
  let { meta: { ident, local } = {} } = action,
    { $$fns = {} } = state, changed

  let $$reduced = Object.keys(state.$$index).reduce((o, key) => {
    let $action = action
    // if this originated from the same key, then add me: true
    if (key === ident && local) {
      $action = { ...$action, me: true }
    }

    // reduce
    let computed = ($$fns[key] || identity)(state.$$index[key], $action)
    if (computed === undefined) {
      throw new Error(`did you forget to return state from the ${key} reducer?`) // eslint-disable-line no-console
    }
    if(computed !== state.$$index[key]) {
      changed = changed || {}
      changed[key] = true

    }
    o[key] = computed
    return o
  }, {})

  return changed ? {
    ...state,
    $$index: $$reduced,
    $$changed: { ...state.$$changed, ...changed }
  } : state
}
