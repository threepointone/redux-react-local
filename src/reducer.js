const identity = x => x;

const has = {}.hasOwnProperty;

function omit(obj, key) {
  if (!obj[key]::has(key)){
    return obj;
  }
  return Object.keys(obj).reduce( (o, k) => {
    return k === key ? o : (o[k] = obj[k], o);
  }, {});
}

export default function localReducer(state = {registered: {}}, action){
  let {payload, type, meta} = action;

  // this is the test sequence -
  // - setState
  // - local.*
  // -  .register
  // -  .swap
  // -  .unmount
  // - else, reduce on all local keys

  if (meta && meta.local && meta.type === 'setState'){
    // shortcircuit
    return {
      ...state,
      [meta.ident]: payload
    };
  }

  if (type === 'local.register'){
    if (state.registered[payload.ident] && state.registered[payload.ident].reducer !== identity){
      // todo - throw, but not when hot reloading
      console.warn(`${payload.ident} already exists`);
    }
    if (payload.ident === 'registered'){
      throw new Error('cannot have an ident named `registered`, sorry!');
    }
    return {
        ...state,
        [payload.ident] : state[payload.ident] !== undefined ? state[payload.ident] : payload.initial,
        // this way we can 'persist' across unmounts
        // also makes preloading data simple
        registered : {
          ...state.registered,
          [payload.ident]: {
            reducer: payload.reducer
          }
        }
      };
  }

  if (type === 'local.swap'){
    // ???
    return state;
  }

  if (type === 'local.unmount'){
    if (payload.persist){
      return {
        ...state,
        registered: {
          ...state.registered,
          [payload.ident]: {reducer: identity}
        }
      };
    }
    else {
      return {
        ...omit(state, payload.ident),
        registered: omit(state.registered, payload.ident)
      };
    }
  }

  // update all local keys
  let ret = {registered: state.registered}, changed = false;
  Object.keys(state.registered).forEach(key => {
    let a = action;

    // if this originated from the same key, then add me: true
    if (meta && meta.local && key === meta.ident){
      a = {
        ...a,
        me: true
      };
    }

    // reduce
    let computed = state.registered[key].reducer(state[key], a);
    if (computed === undefined){
      console.warn(`did you forget to return state from the ${key} reducer?`);
    }

    if (computed !== state[key]){
      changed = true;
    }
    ret[key] = computed;
  });


  if (changed) {
    // prevent rerenders if nothing's changed
    return ret;
  }

  return state;
}
