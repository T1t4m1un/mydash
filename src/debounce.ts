export interface DebounceOption {
  immediate?: boolean,
}

export function debounce<Fn extends (...args: any[]) => any>(fn: Fn, time: number, option?: DebounceOption) {
  let timer = 0;
  return (...args: Parameters<Fn>) => {
    const isCallnow = timer == 0 && option?.immediate;

    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = 0;
      if (!option?.immediate) {
        fn(...args);
      }
    }, time);

    if (isCallnow) {
      fn(...args);
    }
  };
}
