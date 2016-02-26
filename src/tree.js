function log() {  //eslint-disable-line no-unused-vars
  console.dir(this) // eslint-disable-line no-console
  return this
}
const forEach = [].forEach
const hasProp = {}.hasOwnProperty

import doHash from './hash'

function replaceInArray(arr, pos, val) {
  return [ ...arr.slice(0, pos),  val, ...arr.slice(pos+1) ]
}

function memoize(fn, c = new WeakMap(), hasher = i => i) {
  return (...args) => {
    let hash = hasher(...args)
    if(c.has(hash)) {
      return c.get(hash)
    }
    c.set(hash, fn(...args))
    return c.get(hash)
  }
}

const getHash = memoize((level = 0, key) => {
  // generate a bucket between 0 - 31
  return doHash(`${level}:${key}`, 5381)%32
}, new Map(), (level, key) => `${level}${key}`)

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

export function isTree(tree, level = 0) {
  return tree && tree::hasProp('hashes') && tree::hasProp('level') && tree.level === level
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
  else if(isTree(hashes[hash], tree.level + 1)) {
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
  else if(isTree(hashes[hash], tree.level + 1)) {
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

  else if(isTree(hashes[hash], tree.level + 1)) {
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

export const entries = memoize(tree => {
  let arr = []
  let hashes = tree.hashes


  hashes::forEach(val => {
    if(!val) {
      return
    }
    if(!isTree(val, tree.level + 1)) {
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

export const toObject = memoize(tree => {
  return entries(tree).reduce((o, [ key, value ]) => (o[key] = value, o), {})
})

export function compressedTree(t, level = 0) {
  if(!isTree(t, level)) {
    return t
  }
  let len = 0,
    hashes = t.hashes.reduce((o, val, i) => {
      if(val) {
        len++
        o[i] = compressedTree(val, level + 1)
      }
      return o
    } , {})
  hashes.length = len
  return {
    level: t.level,
    hashes
  }
}

export function map(tree, fn) {
  let mapped = tree
  entries(tree).forEach(([ key, value ]) => {
    let computed = fn(value, key)
    if(computed !== value) {
      mapped = set(mapped, key, computed)
    }
  })
  return mapped
}

