import { renderToString } from 'react-dom/server'

export function resolveLocalReducers(element) {
  // this is dumb enough to work
  renderToString(element)
}

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
