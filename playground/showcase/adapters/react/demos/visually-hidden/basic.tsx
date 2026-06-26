import { VisuallyHidden } from '@magic-scope/react';

export default function Demo() {
  // 最常见用途:纯图标按钮没有可读文字,用 VisuallyHidden 补一段只给屏幕阅读器的标签。
  // 视觉上只看到放大镜图标,SR 朗读「搜索」。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)' }}>
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          inlineSize: 'var(--ms-space-9)',
          blockSize: 'var(--ms-space-9)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px solid var(--ms-color-border)',
          background: 'var(--ms-color-bg)',
          color: 'var(--ms-color-fg)',
          cursor: 'pointer',
          fontSize: '1.1rem',
        }}
      >
        <span aria-hidden>🔍</span>
        <VisuallyHidden>搜索</VisuallyHidden>
      </button>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        视觉只见图标,SR 读到「搜索」——按钮不再是无名空标签。
      </small>
    </div>
  );
}
