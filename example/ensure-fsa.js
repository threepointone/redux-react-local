// like '@meadow/redux-ensure-fsa', but allows `optimist` as a key

import isPlainObject from 'lodash.isplainobject'

const validKeys = [
  'type',
  'payload',
  'error',
  'meta',
  'optimist'
]

function isValidKey(key) {
  return validKeys.indexOf(key) > -1
}

export function isFSA(action) {
  return isPlainObject(action) &&
    typeof action.type !== 'undefined' &&
    Object.keys(action).every(isValidKey)
}

export default function ensureFSAMiddleware() {
  return next => action => {
    if (!isFSA(action)) {
      console.error(action); // eslint-disable-line
      throw new Error('Flux Standard Action Violation: Actions must only have type, payload, error, optimist, or meta properties.')
    }

    return next(action)
  }
}


