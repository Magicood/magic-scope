import { Breadcrumb } from '@magic-scope/react';

// 分隔符接受任意节点(纯装饰、aria-hidden,不参与无障碍语义)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Breadcrumb
        separator="›"
        items={[
          { label: '首页', href: '#/' },
          { label: '项目', href: '#/projects' },
          { label: '设置' },
        ]}
      />
      <Breadcrumb
        separator="→"
        items={[
          { label: '首页', href: '#/' },
          { label: '团队', href: '#/team' },
          { label: '成员' },
        ]}
      />
      <Breadcrumb
        separator={<span style={{ color: 'var(--ms-color-accent)' }}>✦</span>}
        items={[
          { label: '首页', href: '#/' },
          { label: '账单', href: '#/billing' },
          { label: '发票' },
        ]}
      />
    </div>
  );
}
