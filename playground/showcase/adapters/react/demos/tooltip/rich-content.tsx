import { Button, Tooltip } from '@magic-scope/react';

export default function Demo() {
  return (
    <Tooltip
      content={
        <div style={{ display: 'grid', gap: '0.35rem', maxInlineSize: '16rem' }}>
          <strong>键盘快捷键</strong>
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>
            按 ⌘K 打开命令面板,⌘/ 查看全部快捷键。
          </span>
        </div>
      }
    >
      <Button variant="outline">富文本提示</Button>
    </Tooltip>
  );
}
