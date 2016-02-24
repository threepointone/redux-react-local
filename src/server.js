const has = {}.hasOwnProperty

export function stringifySafe(state) {
  if(!state::has('local')) {
    return state
  }

  return {
    ...state,
    local: {
      ...state.local,
      $$changed: undefined,
      $$fns: undefined
    }
  }
}
