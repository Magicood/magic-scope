/**
 * 框架无关订阅式 store —— 内核状态的最小载体。
 * 各框架薄壳各自绑定:React useSyncExternalStore;Vue shallowRef + onScopeDispose;Angular signal + DI。
 * core 不依赖任何框架,只提供 getState / subscribe / setState。
 */
export interface Store<S> {
  getState(): S;
  subscribe(listener: () => void): () => void;
}

export interface WritableStore<S> extends Store<S> {
  setState(next: S | ((prev: S) => S)): void;
}

export function createStore<S>(initial: S): WritableStore<S> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setState(next) {
      const resolved = typeof next === 'function' ? (next as (prev: S) => S)(state) : next;
      if (Object.is(resolved, state)) {
        return;
      }
      state = resolved;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}
