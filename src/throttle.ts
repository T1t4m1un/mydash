export function throttle<Fn extends (...args: any[]) => any>(fn: Fn, time: number) {
  let last_timestamp = Date.now();
  return (...args: Parameters<Fn>): undefined | ReturnType<Fn> => {
    const duration = Date.now() - last_timestamp;
    if (duration < time) {
      return;
    } else {
      last_timestamp = Date.now();
      return fn();
    }
  }
}
