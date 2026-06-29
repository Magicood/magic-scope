import { useSyncExternalStore } from 'react';

/** 极简 hash 路由:`#/` 首页 · `#/shop` 列表 · `#/product/<id>` 详情 · `#/checkout` 结账。 */
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
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/** 解析 `#/product/<id>` → id;非该路由返回 null。 */
export function productIdFromPath(path: string): string | null {
  const m = path.match(/^\/product\/(.+)$/);
  return m ? decodeURIComponent(m[1] as string) : null;
}
