import { Mark } from '@magic-scope/react';

// 留口:as 换多态容器(这里渲染成 <p>),classNames(root / hit)细粒度精修;
// 非字符串 children(已是元素)不切分、原样渲染 —— 只对纯文本串做高亮。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem', maxInlineSize: 'min(520px, 100%)' }}>
      <Mark
        as="p"
        search="多态"
        tone="primary"
        style={{
          margin: 0,
          lineHeight: 1.9,
          padding: 'var(--ms-space-2, 0.5rem)',
          borderRadius: 'var(--ms-radius-sm)',
          background: 'var(--ms-color-bg-subtle, transparent)',
        }}
        classNames={{ root: 'demo-mark-root' }}
      >
        通过 as 把容器渲染成多态 p 元素,style 与 classNames.root 同时作用在容器上。
      </Mark>

      <div style={{ display: 'grid', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-muted)' }}>
          非字符串 children:已是元素则原样渲染,不做高亮切分
        </span>
        <Mark search="高亮" tone="warning">
          <strong style={{ color: 'var(--ms-color-fg)' }}>
            这是一个已存在的 strong 元素,不会被高亮切分。
          </strong>
        </Mark>
      </div>
    </div>
  );
}
