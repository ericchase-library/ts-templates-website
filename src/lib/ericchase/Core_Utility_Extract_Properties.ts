export function Core_Utility_Extract_Properties(target: any) {
  const props = {};
  for (const key of Reflect.ownKeys(target)) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      Object.defineProperty(props, key, descriptor);
    }
  }
  return props;
}
