export function deepCopy<T>(val: T): T {
  if (val == null || typeof val !== 'object') {
    return val;
  }

  if (Array.isArray(val)) {
    const arrayCopy = [] as unknown[];
    for (let i = 0; i < val.length; i++) {
      arrayCopy[i] = deepCopy(val[i]) as unknown;
    }
    return arrayCopy as T;
  }

  const objCopy = {} as { [K in keyof T]: T[K] };;
  for (const key in val) {
    if (val.hasOwnProperty(key)) {
      objCopy[key] = deepCopy(val[key]);
    }
  }
  return objCopy;
}
