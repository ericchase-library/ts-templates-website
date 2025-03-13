export function MapGuard<K, V>(map: Map<K, V>, key: K, value: V | undefined): value is V {
  return map.has(key);
}

export function Map_GetOrDefault<K, V>(map: Map<K, V>, key: K, newValue: () => V): V {
  let value = map.get(key);
  if (!MapGuard<K, V>(map, key, value)) {
    value = newValue();
    map.set(key, value);
  }
  return value;
}
