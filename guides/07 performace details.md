x - avoid {...} spread /assign, especially if you know the state shape.
x - backing store is an immutable hamt sorta thing
x - $$changed allows to target specific components for updates, pseudo-recovering O(1) reads
 - why not immutable js/ mori etc?
- caching functions
- shouldComponentUpdate
- stringify

- setstate vs reducer

from what I've noticed, chrome et al _love_ objects that they know the 'shape' to. Hence, avoid using object spreads / .assign. We take care of this by making sure we almost *never* do spreads/assigns; we know object shapes beforehand [flow annotations].

However, we don't know what idents will be on a page before runtime. If we stored data corresponding to these idents naively, we'd use a regular object, and spread new values into it at runtime.

The basic problem is this - js objects have O(1) read / O(n) copy/ O(n) view-update performance. For larger values of n (say 1k+) and large number of incoming writes (say 500/s), the ui thread will start hanging because of all the object crunching. To get around this, we design a data structure that gives us O(logn) writes/ O(1logn) reads, is json/redux friendly, and as a bonus, we semi-get O(1) view-updates.

- A `tree` consists of a `level`, and an `array` of slots.
- Each slot may contain `undefined`, a `{key, value}`, or another `tree`.
- Given a `key` and `value` to insert into this tree, we first calculate the `hash` for a `key`, which is just a number from 0-31.
- If `array[hash]` is empty, we simply drop it in that place
- if occupied by a `{key, value}`, we take it out, and replace with a new `tree` with `level+1`, added `{key, value}` and the new `key` and `value`
- if occupied by a `tree`, add it to that tree instead

This gives us O(logn) writes onto the store. further, because they're regular js objects, they can be simply sent across the wire (when server side rendering, etc)

[graph]

We also memoize the hashing function, the function that enumerates entries in the tree,

Now, if we had to naively update our react components when this store changed, we'd read from the store on each change in every component, compare against previous value, and then render (or not). Turns out this isn't too efficient either, if only because calling 1000s of functions when just one piece changed is baaaad. However, since we know which keys are being changed, we can use a callback to signal to just those components when data has changed, and what the changed value is, forgoing the top-down render altogether (and yet remaining consistent). O(1) view-updates!

[graph]

We use this backing store for redux-react-local, meaning  you can have many idents alive on the page at the same time. With stress.js - plain setState would reach about 12k elements, while plain object spreads would die around 1.2k. With this new data structure/props.setState, we can reach around 8.5k elements. Nice!

[graph]


