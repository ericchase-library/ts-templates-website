/** Shortcut utility function for merging an object into another object. */
export function defineProperties(object: any, other: any) {
  return Object.defineProperties(object, Object.getOwnPropertyDescriptors(other));
}

/** A utility function for extracting all properties in an object's prototype
 * chain, including its own. `Object.defineProperties` does not overwrite
 * properties that already exist, so only the most recent value for a property
 * will be extracted. All the properties are combined into a single object. */
export function getPrototypeChainProperties(object: any) {
  const aggregate = {};
  for (let ref = object; ref; ref = Object.getPrototypeOf(ref)) {
    Object.defineProperties(aggregate, Object.getOwnPropertyDescriptors(object));
  }
  return aggregate;
}
