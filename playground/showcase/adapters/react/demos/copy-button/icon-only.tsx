import { CopyButton } from '@magic-scope/react';

// 纯图标复制按钮:不给文字 children,复制成功后 icon → copiedIcon(默认对勾);
// 这里用 ghost 变体嵌进代码块角落,并自定义 icon / copiedIcon。
export default function Demo() {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        padding: '0.75rem 2.4rem 0.75rem 0.9rem',
        borderRadius: 'var(--ms-radius-md)',
        background: 'var(--ms-color-bg-subtle)',
        fontFamily: 'var(--ms-font-mono, monospace)',
        color: 'var(--ms-color-fg-muted)',
      }}
    >
      pnpm add @magic-scope/tokens
      <span style={{ position: 'absolute', top: '0.35rem', right: '0.35rem' }}>
        <CopyButton
          value="pnpm add @magic-scope/tokens"
          variant="ghost"
          size="sm"
          icon="⧉"
          copiedIcon="✓"
          aria-label="复制安装命令"
          withTooltip
        />
      </span>
    </div>
  );
}
