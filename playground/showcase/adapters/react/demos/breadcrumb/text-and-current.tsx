import { Breadcrumb } from '@magic-scope/react';

// 省略 href 的非当前项渲染为静态文本(不可点);末项显式标 current。
export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* 中间项「归档」无 href:渲染为不可点的纯文本 */}
      <Breadcrumb
        items={[{ label: '首页', href: '#/' }, { label: '归档' }, { label: '设置', current: true }]}
      />
      {/* label 可为任意节点:此处带前缀图标 */}
      <Breadcrumb
        items={[
          { label: <span>🏠 首页</span>, href: '#/' },
          { label: <span>📁 项目</span>, href: '#/projects' },
          { label: <span>⚙️ 设置</span>, current: true },
        ]}
      />
    </div>
  );
}
