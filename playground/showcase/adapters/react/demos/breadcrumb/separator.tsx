import { Breadcrumb } from '@magic-scope/react';

// 分隔符接受任意节点(纯装饰、aria-hidden,不参与无障碍语义)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Breadcrumb
        separator="›"
        items={[
          { label: '首页', href: '#/' },
          { label: '法术书', href: '#/grimoire' },
          { label: '召唤阵' },
        ]}
      />
      <Breadcrumb
        separator="→"
        items={[
          { label: '首页', href: '#/' },
          { label: '奥术', href: '#/grimoire/arcane' },
          { label: '传送门' },
        ]}
      />
      <Breadcrumb
        separator={<span style={{ color: 'var(--ms-color-accent)' }}>✦</span>}
        items={[
          { label: '首页', href: '#/' },
          { label: '塑能', href: '#/grimoire/evocation' },
          { label: '火球术' },
        ]}
      />
    </div>
  );
}
