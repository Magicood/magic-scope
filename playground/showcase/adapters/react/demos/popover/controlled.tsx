import { Button, Popover } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="outline">{open ? '已展开' : '触发器'}</Button>}
      >
        <p style={{ margin: 0, maxInlineSize: '14rem', color: 'var(--ms-color-fg-muted)' }}>
          受控模式:open 由外部状态决定,点外 / Esc 关闭会回调 onOpenChange 同步状态。
        </p>
      </Popover>
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
        从外部切换
      </Button>
    </div>
  );
}
