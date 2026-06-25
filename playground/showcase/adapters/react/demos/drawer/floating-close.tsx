import { Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        无标题 + 强确认
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} side="start" dismissable={false}>
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
          不传 title 时右上角渲染浮动关闭按钮;dismissable={'{false}'} 关掉点遮罩关闭, 只能按按钮或
          Esc。
        </p>
        <Button onClick={() => setOpen(false)}>我已知晓</Button>
      </Drawer>
    </>
  );
}
