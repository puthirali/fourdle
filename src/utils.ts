/* eslint-disable import/prefer-default-export */
export function when<A>(predicate: (a: A) => boolean, f: (a: A) => A) {
  return (a: A) => (predicate(a) ? f(a) : a)
}
