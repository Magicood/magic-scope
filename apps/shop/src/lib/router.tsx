import { useEffect, useState } from 'react';

/* ============================================================================
 * 极简 hash 路由 —— 自研 ~60 行,不引第三方(样板站唯一依赖就是组件库本身)。
 * 路径形如 #/products/duna-vase、#/admin/orders;无 hash 时视为 '/'。
 * ========================================================================== */

/** 规范化当前 hash 为以 '/' 开头的路径。 */
export function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw || raw === '/') return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

/** 编程式导航(写 hash;hashchange 统一驱动重渲染与滚动复位)。 */
export function navigate(to: string): void {
  const target = to.startsWith('/') ? to : `/${to}`;
  if (currentPath() === target) return;
  window.location.hash = target;
}

/** 订阅当前路径;路由切换时自动滚回顶部(保留同页内锚点行为)。 */
export function useHashPath(): string {
  const [path, setPath] = useState<string>(() =>
    typeof window === 'undefined' ? '/' : currentPath(),
  );
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

/** 路径的 pathname 部分(去掉 ?query)。 */
export function pathnameOf(path: string): string {
  return path.split('?')[0] ?? path;
}

/** 路径的 query 部分(如 #/products?category=ceramics)。 */
export function queryOf(path: string): URLSearchParams {
  const idx = path.indexOf('?');
  return new URLSearchParams(idx === -1 ? '' : path.slice(idx + 1));
}

/** 匹配 /products/:id。 */
export function productIdFromPath(path: string): string | null {
  const m = pathnameOf(path).match(/^\/products\/([^/]+)$/);
  return m?.[1] ?? null;
}

/** 匹配 /orders/:id(买家订单跟踪)。 */
export function orderIdFromPath(path: string): string | null {
  const m = pathnameOf(path).match(/^\/orders\/([^/]+)$/);
  return m?.[1] ?? null;
}

/** 是否落在商家控制台(/admin 及其子路径)。 */
export function isAdminPath(path: string): boolean {
  const p = pathnameOf(path);
  return p === '/admin' || p.startsWith('/admin/');
}

/** 声明式链接 —— 原生 <a href="#/...">,天然支持新标签打开与中键点击。 */
export function RouterLink({
  to,
  className,
  children,
  ...rest
}: { to: string } & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>) {
  return (
    <a href={`#${to}`} className={className} {...rest}>
      {children}
    </a>
  );
}
