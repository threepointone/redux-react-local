function log() {
  console.dir(this)
  return this
}
const forEach = [].forEach
const hasProp = {}.hasOwnProperty

import doHash from './hash'

function replaceInArray(arr, pos, val) {
  return [ ...arr.slice(0, pos),  val, ...arr.slice(pos+1) ]
}

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
  return doHash(`${level}:${key}`, 5381)%32
})

const make0 = {
  level: 0, hashes: new Array(32)
}
export function make(level = 0) {
  if(level === 0) {
    return make0
  }
  return {
    level, hashes: new Array(32)
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
      level: tree.level,
      hashes: replaceInArray(hashes, hash, { key, value })
    }
  }
  else if(isTree(hashes[hash])) {
    let afterSet = set(hashes[hash], key, value)
    if(afterSet === hashes[hash]) {
      return tree
    }
    return {
      level: tree.level,
      hashes: replaceInArray(hashes, hash, afterSet)
    }
  }
  else {
    if(hashes[hash].key === key) {
      if(hashes[hash].value === value) {
        return tree
      }
      return {
        level: tree.level,
        hashes: replaceInArray(hashes, hash, { key, value })
      }
    }
    return {
      level: tree.level,
      hashes: replaceInArray(hashes, hash,
        set(
          set(
            make(tree.level + 1),
            hashes[hash].key,
            hashes[hash].value),
          key,
          value))
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
        level: tree.level,
        hashes: replaceInArray(hashes, hash, undefined)
      }
    }
    return tree
  }
}

function memoizeEntries(fn) {
  let cache = new WeakMap()
  return o => {

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


  hashes::forEach(val => {
    if(!val) {
      return
    }
    if(!isTree(val)) {
      arr.push([ val.key, val.value ])
      return
    }
    else {
      arr = arr.concat(entries(val))
    }
  })
  return arr
})

export function hasHash(tree, key) {
  return !!tree.hashes[getHash(tree.level, key)]
}

export function toObject(tree) {
  return entries(tree).reduce((o, [ key, value ]) => (o[key] = value, o), {})
}

export function compressedTree(t) {
  if(!isTree(t)) {
    return t
  }
  let len =0 , hashes = t.hashes.reduce((o, val, i) => {
      if(val) {
        len++
        o[i] = compressedTree(val)
      }
      return o
    } , {})
  hashes.length = len
  return {
    level: t.level,
    hashes
  }
}

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

