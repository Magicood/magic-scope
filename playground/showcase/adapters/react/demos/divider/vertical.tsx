import { Divider } from '@magic-scope/react';

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        blockSize: '2.5rem',
        color: 'var(--ms-color-fg-muted)',
      }}
    >
      <span>首页</span>
      <Divider orientation="vertical" />
      <span>魔典</span>
      <Divider orientation="vertical" />
      <span>关于</span>
    </div>
  );
}
