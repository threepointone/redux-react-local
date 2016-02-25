const has = {}.hasOwnProperty

import { compressedTree } from './tree'

export function stringifySafe(state) {
  if(!state::has('local')) {
    return state
  }

  return {
    ...state,
    local: {
      $$tree: compressedTree(state.local.$$tree),
      get: undefined,
      $$changed: undefined,
      $$fns: undefined
    }
  }
}


