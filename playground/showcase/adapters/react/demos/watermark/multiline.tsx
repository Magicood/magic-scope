import { Watermark } from '@magic-scope/react';

export default function Demo() {
  return (
    <Watermark
      content={['张三 · 工号 0427', '2026-06-26 14:30', '严禁外传']}
      fontSize={14}
      gap={[120, 120]}
      style={{
        inlineSize: 'min(440px, 100%)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-surface)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 'var(--ms-space-5)', display: 'grid', gap: 'var(--ms-space-2)' }}>
        <h3 style={{ margin: 0, color: 'var(--ms-color-fg)' }}>多行水印</h3>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', lineHeight: 1.7 }}>
          content 传字符串数组即逐行叠放。常用于把「操作人 + 时间戳 + 密级」三行信息嵌进截图,
          一旦泄露可凭水印精确溯源到人。
        </p>
      </div>
    </Watermark>
  );
}
