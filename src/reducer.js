const identity = x => x;

const has = {}.hasOwnProperty;

function omit(obj, key) {
  if (!obj::has(key)){
    return obj;
  }
  return Object.keys(obj).reduce((o, k) => {
    return k === key ? o : (o[k] = obj[k], o);
  }, {});
}

// this is the test sequence -
// - setState
// - local.*
// -  .register
// -  .swap
// -  .unmount
// - else, reduce on all local keys

export default function localReducer(state = {$$fns: {}}, action){
  let {payload, type, meta} = action;

  if (meta && meta.type === '$$setState' && meta.local){
    // shortcircuit
    return {
      ...state,
      [meta.ident]: payload
    };
  }

  switch (type){
    case '$$local.register': return register(state, action);

    case '$$local.swap': return register(
      unmount(state, action), {
        ...action,
        payload: {
          ...payload,
          ident: payload.next
        }
      });

    case '$$local.unmount': return unmount(state, action);

    default: return reduceAll(state, action);
  }
}


function register(state, action){
  let {payload: {ident, initial, reducer}} = action,
    fn = state.$$fns[ident];

  if (ident === '$$fns'){
    throw new Error('cannot have an ident named `$$fns`, sorry!');
  }

  if (fn && fn !== identity){
    // todo - throw, but not when hot reloading
    console.warn(`${ident} already exists, swapping anyway`);
  }

  return {
    ...state,
    [ident] : state[ident] !== undefined ? state[ident] : initial,
    // this way we can 'persist' across unmounts
    // also makes preloading data simple
    $$fns : {
      ...state.$$fns,
      [ident]: reducer
    }
  };
}

function unmount(state, action){
  let {payload: {persist, ident}} = action;
  if (persist){
    return {
      ...state,
      $$fns: {
        ...state.$$fns,
        [ident]: identity
      }
    };
  }
  else {
    return {
      ...omit(state, ident),
      $$fns: omit(state.$$fns, ident)
    };
  }
}

function reduceAll(state, action){
  // update all local keys
  let {meta} = action,
    {$$fns} = state,
    o = {$$fns},
    changed = false;

  Object.keys($$fns).forEach(key => {
    let $action = action;
    // if this originated from the same key, then add me: true
    if (meta && key === meta.ident && meta.local){
      $action = { ...$action, me: true };
    }

    // reduce
    let computed = $$fns[key](state[key], $action);
    if (computed === undefined){
      console.warn(`did you forget to return state from the ${key} reducer?`);
    }

    if (computed !== state[key]){
      changed = true;
    }
    o[key] = computed;
  });


  if (!changed) {
    // prevent rerenders if nothing's changed
    return state;
  }

  return o;
}
