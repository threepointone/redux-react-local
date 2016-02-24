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

function memoizeHasher(fn) {
  let cache = new Map()
  return (level, key) => {
    let lk = `${level}${key}`
    if(cache.has(lk)) {
      return cache.get(lk)
    }
    cache.set(lk, fn(level, key))
    return cache.get(lk)
  }
}

const getHash = memoizeHasher((level = 0, key) => {
  // generate a number between 0 - 31
  return doHash(`${level}:${key}`, 5381)%32 + ''
})

const make0 = {
  level: 0, hashes: {}
}
export function make(level = 0) {
  if(level === 0) {
    return make0
  }
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
    let afterSet = set(hashes[hash], key, value)
    if(afterSet === hashes[hash]) {
      return tree
    }
    return {
      ...tree,
      hashes: {
        ...hashes,
        [hash]: afterSet
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

function memoizeEntries(fn) {
  let cache = new WeakMap()
  return (o) => {

    if(cache.has(o)) {
      return cache.get(o)
    }
    cache.set(o, fn(o))
    return cache.get(o)
  }
}

export const entries = memoizeEntries((tree) => {
  let arr = []
  let hashes = tree.hashes
  Object.keys(hashes).forEach(key => {
    if(!isTree(hashes[key])) {
      arr.push([ hashes[key].key, hashes[key].value ])
    }
    else {
      arr = arr.concat(entries(hashes[key]))
    }
  })
  return arr
})

// todo - more performant
// export function map(tree, fn) {
//   let mapped = tree
//   entries(tree).forEach(([ key, value ]) => {
//     let computed = fn(value, key)
//     if(computed !== value) {
//       mapped = set(mapped, key, computed)
//     }
//   })
//   return mapped
// }

export function hasHash(tree, key) {
  return tree.hashes::hasProp(getHash(tree.level, key))
}

export function toObject(tree) {
  return entries(tree).reduce((o, [ key, value ]) => (o[key] = value, o), {})
}
