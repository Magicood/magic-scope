import { Spin } from '@magic-scope/react';

/**
 * 无 children:Spin 退化为独立指示器(行内 / 块级),可直接塞进文案或按钮旁。
 * spinning=false 时独立模式什么都不渲染(占位交给调用方)。
 */
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <span style={{ display: 'inline-flex', gap: '0.6rem', alignItems: 'center' }}>
        <Spin size="sm" />
        <span style={{ color: 'var(--ms-color-fg-muted, #9a9aa6)' }}>行内:正在同步法术书…</span>
      </span>
      <Spin tip="加载列表中…" />
      <small style={{ color: 'var(--ms-color-fg-muted, #9a9aa6)' }}>
        无 children 时退化为独立指示器;带 tip 则在符文下方显示文字。
      </small>
    </div>
  );
}
