import { ContextMenu } from '@magic-scope/react';

// tone:右键菜单的 hover / focus / 强调配色随 tone 切换(与全库 tone 令牌对齐)。
export default function Demo() {
  return (
    <ContextMenu
      tone="accent"
      items={[
        { label: '打开', onSelect: () => {} },
        { label: '重命名', onSelect: () => {} },
        { label: '在新窗口打开', onSelect: () => {} },
      ]}
    >
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          blockSize: '6rem',
          border: '1px dashed var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          color: 'var(--ms-color-fg-muted)',
        }}
      >
        在此区域右键(tone=accent)
      </div>
    </ContextMenu>
  );
}
