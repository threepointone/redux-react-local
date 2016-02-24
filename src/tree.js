function log() {
  console.dir(this)
  return this
}
const hasProp = {}.hasOwnProperty

function omit(obj, key) {
  if (!obj::hasProp(key)) {
    return obj
  }
  return Object.keys(obj).reduce((o, k) =>
    k === key ?
      o :
      (o[k] = obj[k], o),
    {})
}


import doHash from './hash'

function getHash(level = 0, key) {
  // generate a number between 0 - 31
  return doHash(`${level}:${key}`, 5381)%32 + ''
}

export function make(level = 0) {
  return {
    level, hashes: {}
  }
}

export function isTree(tree) {
  return tree && tree::hasProp('hashes') && tree::hasProp('level')
}

export function set(tree, key, value) {
  let hash = getHash(tree.level, key),
    hashes = tree.hashes

  if(!hasHash(tree, key)) {
    return {
      ...tree,
      hashes: {
        ...hashes,
        [hash]: { key, value }
      }
    }
  }
  else if(isTree(hashes[hash])) {
    return {
      ...tree,
      hashes: {
        ...hashes,
        [hash]: set(hashes[hash], key, value)
      }
    }
  }
  else {
    if(hashes[hash].key === key) {
      if(hashes[hash].value === value) {
        return tree
      }
      return {
        ...tree,
        hashes: {
          ...hashes,
          [hash]: { key, value }
        }
      }
    }
    return {
      ...tree,
      hashes: {
        ...hashes,
        [hash]: set(
          set(
            make(tree.level + 1),
            hashes[hash].key,
            hashes[hash].value),
          key,
          value)
      }
    }
  }
}


export function get(tree, key) {
  let hash = getHash(tree.level, key),
    { hashes } = tree

  if(!hasHash(tree, key)) {
    return
  }
  else if(isTree(hashes[hash])) {
    return get(hashes[hash], key)
  }
  else {
    if(hashes[hash].key === key) {
      return hashes[hash].value
    }
  }
}

export function del(tree, key) {
  let hash = getHash(tree.level, key),
    { hashes } = tree

  if(!hasHash(tree, key)) {
    return tree
  }

  else if(isTree(hashes[hash])) {
    return del(hashes[hash], key)
  }
  else {
    if(hashes[hash].key === key) {
      return {
        ...tree,
        hashes: omit(hashes, hash)
      }
    }
    return tree
  }
}

export function *entries(tree) {
  let hashes = tree.hashes
  for(let key of Object.keys(hashes)) {
    if(!isTree(hashes[key])) {
      yield [ hashes[key].key, hashes[key].value ]
    }
    else{
      yield* entries(hashes[key])
    }
  }
}

// todo - more performant
export function map(tree, fn) {
  let mapped = tree
  for(let [ key, value ] of entries(tree)) {
    let computed = fn(value, key)
    if(computed !== value) {
      mapped = set(mapped, key, computed)
    }
  }
  return mapped
}

export function hasHash(tree, key) {
  return tree.hashes::hasProp(getHash(tree.level, key))
}

export function toObject(tree) {
  return [ ...entries(tree) ].reduce((o, [ key, value ]) => (o[key] = value, o), {})
}
