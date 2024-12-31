export function shallowCopy<T>(val: T): T {
  if (val === null || typeof val !== 'object') {
    return val;
  }

  if (Array.isArray(val)) {
    return val.slice() as T;
  }

  return { ...val };
}
