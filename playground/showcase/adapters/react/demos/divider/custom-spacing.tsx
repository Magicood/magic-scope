import { Divider } from '@magic-scope/react';

export default function Demo() {
  // 透传原生 hr 属性:style 自定义外边距与内缩,Divider 不接受 children(空元素)。
  return (
    <div style={{ inlineSize: 'min(28rem, 100%)', color: 'var(--ms-color-fg-muted)' }}>
      <p style={{ marginBlockStart: 0 }}>紧凑分隔:上下间距压到最小。</p>
      <Divider style={{ marginBlock: '0.25rem' }} />
      <p>宽松且内缩:左右各留出一段呼吸。</p>
      <Divider style={{ marginBlock: '1.5rem', marginInline: '2rem' }} />
      <p style={{ marginBlockEnd: 0 }}>下一段。</p>
    </div>
  );
}
