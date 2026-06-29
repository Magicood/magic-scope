import { Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开抽屉</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="面板设置">
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
          传入 title 后渲染头部,并与抽屉的 aria-labelledby 关联;头部右侧自带关闭按钮。
        </p>
        <Button onClick={() => setOpen(false)}>收起</Button>
      </Drawer>
    </>
  );
}
