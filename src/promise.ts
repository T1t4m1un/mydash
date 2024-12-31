class MyPromise<T> {
  private status: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  private value: undefined | T = undefined;
  private reason: undefined | unknown = undefined;

  private onFulfilledCallback: Function[] = [];
  private onRejectedCallback: Function[] = [];

  constructor(executor: (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void) {
    const resolve = (value: T) => {
      if (this.status === 'pending') {
        this.status = 'fulfilled';
        this.value = value;
        this.onFulfilledCallback.forEach(fn => fn(value));
      }
    };

    const reject = (reason?: unknown) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.onRejectedCallback.forEach(fn => fn(reason));
      }
    }

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then<P>(onFulFilled?: (value: T) => P, onRejected?: (reason: unknown) => unknown): MyPromise<P> {
    return new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        if (onFulFilled) {
          try {
            // @ts-expect-error(状态机保证此时value不为undefined)
            const result = onFulFilled(this.value);
            if (result instanceof MyPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } catch (err) {
            reject(err);
          }
        } else {
          // @ts-expect-error(状态机保证此时value不为undefined)
          resolve(this.value);
        }
      };

      const handleRejected = () => {
        if (onRejected) {
          try {
            const result = onRejected(this.reason);
            if (result instanceof MyPromise) {
              result.then(resolve, reject);
            } else {
              reject(result);
            }
          } catch (err) {
            reject(err);
          }
        } else {
          reject(this.reason);
        }
      };

      if (this.status === 'fulfilled') {
        handleFulfilled();
      } else if (this.status === 'rejected') {
        handleRejected();
      } else {
        this.onFulfilledCallback.push(handleFulfilled);
        this.onRejectedCallback.push(handleRejected);
      }
    });
  }

  catch<P>(onRejected: (reason: unknown) => P): MyPromise<P> {
    return this.then(undefined, onRejected);
  }

  static resolve<T>(value: T): MyPromise<T> {
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason: unknown): MyPromise<void> {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises: MyPromise<any>[]): MyPromise<any[]> {
    return new MyPromise((resolve, reject) => {
      const res: any[] = [];
      let count = 0;
      promises.forEach((promise, idx) => {
        promise.then(value => {
          res[idx] = value
          count += 1;
          if (count === promises.length) {
            resolve(res);
          }
        }, reject);
      });
    });
  }
}
