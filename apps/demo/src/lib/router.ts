import { useSyncExternalStore } from 'react';

/** 极简 hash 路由:`#/` 落地页,`#/app` 应用 dashboard(可带子视图 `#/app/events`)。 */
function read(): string {
  const raw = window.location.hash.replace(/^#/, '');
  return raw === '' ? '/' : raw;
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useHashPath(): string {
  return useSyncExternalStore(subscribe, read, () => '/');
}

export function navigate(path: string): void {
  const next = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
  // 切到新路由时回到顶部,贴近真实站点导航体验。
  window.scrollTo({ top: 0, behavior: 'auto' });
}
