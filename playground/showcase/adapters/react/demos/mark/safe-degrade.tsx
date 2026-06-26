import { Mark } from '@magic-scope/react';

// 安全降级:空搜索词原样返回(不高亮、无多余包裹);
// 搜索词里的正则元字符(. * ( ) [ ] 等)按字面量转义,用户输入也不报错;
// 超长无空格串容器 overflow-wrap:anywhere 兜底、不撑破布局。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.7rem', maxInlineSize: 'min(520px, 100%)' }}>
      <div style={{ display: 'grid', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-muted)' }}>
          空 search:整段原文,无高亮包裹
        </span>
        <p style={{ lineHeight: 1.9, margin: 0 }}>
          <Mark search="">空搜索词时,这段文字原样输出,没有任何 mark 包裹。</Mark>
        </p>
      </div>

      <div style={{ display: 'grid', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-muted)' }}>
          正则元字符按字面量:搜 "(magic)" 精确命中括号文本
        </span>
        <p style={{ lineHeight: 1.9, margin: 0 }}>
          <Mark search="(magic)" tone="accent">
            表达式 f(magic) 里的 (magic) 被当作字面量高亮,而非正则分组。
          </Mark>
        </p>
      </div>

      <div style={{ display: 'grid', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-muted)' }}>
          超长无空格串:容器内断行,不撑破布局
        </span>
        <div
          style={{
            inlineSize: 'min(260px, 100%)',
            border: '1px dashed var(--ms-color-border)',
            borderRadius: 'var(--ms-radius-sm)',
            padding: 'var(--ms-space-2, 0.5rem)',
          }}
        >
          <Mark search="magic" tone="info">
            magicmagicmagicmagicmagicmagicmagicmagicmagicmagicmagicmagic
          </Mark>
        </div>
      </div>
    </div>
  );
}
