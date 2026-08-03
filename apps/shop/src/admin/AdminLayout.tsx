/* 占位:由 wave-1 agent 实现(侧栏 + 顶栏 + Command ⌘K + 路由分发)。 */
export function AdminLayout({ path }: { path: string }) {
  return <div className="ad-root" data-path={path} />;
}
