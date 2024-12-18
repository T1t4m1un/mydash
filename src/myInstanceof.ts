export function myInstanceof<T>(obj: any, constructor: (...args: any[]) => T) {
  // 若obj是null或undefined
  if (obj == null) return false;

  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
