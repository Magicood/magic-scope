import { Collapsible } from '@magic-scope/react';

// forceMount:历史兼容属性 —— Content 现始终常驻挂载(收起靠 CSS 隐藏 + inert),
// 故收起态内容仍在 DOM,利于 SEO 抓取与页内锚点跳转。
export default function Demo() {
  return (
    <Collapsible forceMount style={{ inlineSize: 'min(340px, 100%)' }}>
      <Collapsible.Trigger
        style={{
          font: 'inherit',
          cursor: 'pointer',
          padding: '0.5rem 0.8rem',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-md)',
          background: 'transparent',
          color: 'var(--ms-color-fg)',
        }}
      >
        技术细节(内容常驻 DOM)▾
      </Collapsible.Trigger>
      <Collapsible.Content>
        <p style={{ margin: '0.6rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
          即使当前收起,这段文字也已在 DOM 中,可被搜索引擎索引、被页内锚点定位。
        </p>
      </Collapsible.Content>
    </Collapsible>
  );
}
