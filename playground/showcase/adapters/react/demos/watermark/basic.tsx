import { Watermark } from '@magic-scope/react';

export default function Demo() {
  return (
    <Watermark
      content="@magic-scope"
      style={{
        inlineSize: 'min(440px, 100%)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-surface)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 'var(--ms-space-5)', display: 'grid', gap: 'var(--ms-space-2)' }}>
        <h3 style={{ margin: 0, color: 'var(--ms-color-fg)' }}>基础水印</h3>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', lineHeight: 1.7 }}>
          只需把内容塞进 Watermark,传一个 content 文字,就会在内容上平铺一层旋转水印。 默认旋转
          -22°、间距 100×100、不透明度 0.15,开箱即用。
        </p>
      </div>
    </Watermark>
  );
}
