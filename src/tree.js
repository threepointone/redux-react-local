/*

The big idea here - we want a key value store (where keys are strings) that is immutable, with fairly fast reads and write.

If we used a regular object, we'd make copies with assign like so
o2 = {...o1, [key]: value}

this has an O(N) complexity on the number of keys in the object

Instead, we steal an idea from clojure, and store the data in a tree of sorts.

Trees have O(logN) reads and writes, and with some memoization, we can get slightly better perf than that.

Further, these trees uses arrays at their nodes to store actual info, which are relatively fast for copies

*/
import doHash from './hash' // murmur3 hashing
function log() {  //eslint-disable-line no-unused-vars
  console.dir(this) // eslint-disable-line no-console
  return this
}
const forEach = [].forEach
const hasProp = {}.hasOwnProperty

// Add iterator to each tree and mimic Map behaviour in order to achieve better look in the Redux Dev Tools
function wrapTree(t) {
  function createTreeIterator(t) {
    let treeEntries = entries(t);
    let cur = 0;

    return {
      next() {
        return cur < treeEntries.length ? {done: false, value: treeEntries[cur++]} : {done: true}
      }
    }
  }

  t[Symbol.iterator] = () => createTreeIterator(t)
  // We need to define dummy 'set' method in order to mimic Map behaviour in the eyes of Redux Dev Tools
  t.set = () => {}

  return t
}

// helper to makes a copy of an array with a new value at given position
function replaceInArray(arr, pos, val) {
  return [ ...arr.slice(0, pos),  val, ...arr.slice(pos+1) ]
}

// generic memoizer on functions. because we use WeakMap,
// we don't really worry about garbage collection
// when the keys are no longer referenced
function memoize(fn, c = new WeakMap(), keyFn = i => i) {
  return (...args) => {
    let key = keyFn(...args)
    if(c.has(key)) {
      return c.get(key)
    }
    c.set(key, fn(...args))
    return c.get(key)
  }
}

// takes a tree level and key, and returns a slot from 0 - 31
const getHash = memoize((level = 0, key) => {
  // generate a bucket between 0 - 31
  return doHash(`${level}:${key}`, 5381)%32
}, new Map(), (level, key) => `${level}${key}`)
// nb: there's a memory leak here because Maps hold strong references,
// but we can just flush this periodically if needed

export const make = (level = 0) => {
  return wrapTree({
    level, slots: new Array(32)
  })
}

// helper on checking whether something is 'tree' like
export function isTree(tree, level = 0) {
  return tree && tree::hasProp('slots') && tree::hasProp('level') && tree.level === level
}


// we steal this from clojure
// a tree is made of an array of 32 slots
// each slot may be
// undefined
// a key/value pair
// yet another tree

// so to get values from this tree
// we simply walk it based on the hashe for each level
// until we get a key/value pair
export function get(tree, key) {
  let hash = getHash(tree.level, key),
    { slots } = tree

  if(!hasHash(tree, key)) {
    return
  }
  else if(isTree(slots[hash], tree.level + 1)) {
    // recurse
    return get(slots[hash], key)
  }
  else {
    // return value
    if(slots[hash].key === key) {
      return slots[hash].value
    }
  }
}

// similarly, to set a value in a tree
// we recursively walk the tree till we find the slot where it should live
// and return copies of just the affected subtree with he new value in place

export function set(tree, key, value) {
  let hash = getHash(tree.level, key),
    slots = tree.slots

    // simple set
  if(!hasHash(tree, key)) {
    return wrapTree({
      level: tree.level,
      slots: replaceInArray(slots, hash, { key, value })
    })
  }
  else if(isTree(slots[hash], tree.level + 1)) {
    // recurse down
    let afterSet = set(slots[hash], key, value)
    if(afterSet === slots[hash]) {
      // prevents a new object if nothing's changed
      return tree
    }
    return wrapTree({
      level: tree.level,
      slots: replaceInArray(slots, hash, afterSet)
    })
  }
  else {
    // update in place
    if(slots[hash].key === key) {
      if(slots[hash].value === value) {
        return tree
      }
      return wrapTree({
        level: tree.level,
        slots: replaceInArray(slots, hash, { key, value })
      })
    }
    // replace key value pair with a nested tree
    return wrapTree({
      level: tree.level,
      slots: replaceInArray(slots, hash,
        set(
          set(
            make(tree.level + 1),
            slots[hash].key,
            slots[hash].value),
          key,
          value))
    })
  }
}

// to delete a key from the tree
// simply walk the tree till you find the slot
// and return recursive copies of the array without it
// todo - reclaim empty arrays
export function del(tree, key) {
  let hash = getHash(tree.level, key),
    { slots } = tree

  if(!hasHash(tree, key)) {
    return tree
  }

  else if(isTree(slots[hash], tree.level + 1)) {
    let sub = del(slots[hash], key)
    if(slots[hash] !== sub) {
      return wrapTree({
        level: tree.level,
        slots: replaceInArray(slots, hash, sub)
      })
    }
    return tree

  }
  else {
    if(slots[hash].key === key && slots[hash].value !== undefined) {
      return wrapTree({
        level: tree.level,
        slots: replaceInArray(slots, hash, undefined)
      })
    }
    return tree
  }
}

// converts a tree to a [key, value] array
export const entries = memoize(tree => {
  let arr = []
  let slots = tree.slots

  slots::forEach(val => {
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
  return !!tree.slots[getHash(tree.level, key)]
}

// converts a tree to an object
export const toObject = memoize(tree => {
  return entries(tree).reduce((o, [ key, value ]) => (o[key] = value, o), {})
})

// this is a helper when serializing from/to server side
// simply replaces arrays [foo, bar] with objects {0: foo, 1: bar, length: 2}
// this is useful when sending sparse arrays over the wire
export function compressedTree(t, level = 0) {
  if(!isTree(t, level)) {
    return t
  }
  let len = 0,
    slots = t.slots.reduce((o, val, i) => {
      if(val) {
        len++
        o[i] = compressedTree(val, level + 1)
      }
      return o
    } , {})
  slots.length = len
  return {
    level: t.level,
    slots
  }
}

// I don't use this, but it's a way to 'map' over all the values in the tree
// and 'replace' with new values
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

