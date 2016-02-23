export function stringifySafe(state) {
  if(!state.hasOwnProperty('local')) {
    return state
  }

  return {
    ...state,
    local: {
      ...state.local,
      $$fns: {}
    }
  }
}
