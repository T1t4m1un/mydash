export function deepEqual<T, U>(lhs: T, rhs: U): boolean {
  // 判断引用相同 或原始类型相等
  if (lhs === rhs as unknown) return true;

  // 判断是否为null或undefined
  if (lhs == null || rhs == null) return false;

  // 判断是否类型相同
  if (typeof lhs !== typeof rhs) return false;

  // 如果是基本类型则直接比较
  if (typeof lhs !== "object") return lhs !== rhs as unknown;

  // 如果是数组比较每个元素
  if (Array.isArray(lhs) && Array.isArray(rhs)) {
    if (lhs.length !== rhs.length) return false;
    return lhs.every((val, idx) => deepEqual(val, rhs[idx]))
  }

  // 如果是对象则递归比较每个key
  if (Object.prototype.toString.call(lhs) === "[object Object]" &&
      Object.prototype.toString.call(rhs) === "[object Object]") {
    const lhsKey = Object.keys(lhs),
          rhsKey = Object.keys(rhs);
    if (lhsKey.length !== rhsKey.length) return false;
    return lhsKey.every(val => rhsKey.includes(val) && deepEqual((lhs as any)[val], (rhs as any)[val]));
  }

  // 对Date比较
  if (lhs instanceof Date && rhs instanceof Date) {
    return lhs.getTime() === rhs.getTime();
  }

  // 对Set比较
  if (lhs instanceof Set && rhs instanceof Set) {
    if (lhs.size !== rhs.size) return false;
    return Array.from(lhs).every(val => rhs.has(val));
  }

  // 对Map比较
  if (lhs instanceof Map && rhs instanceof Map) {
    if (lhs.size !== rhs.size) return false;
    return Array.from(lhs).every(([k, v]) => deepEqual(rhs.get(k), v));
  }

  return false;
}
