import { Button, Dialog } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h3 style={{ marginBlockStart: 0 }}>账户设置</h3>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>焦点陷阱、Esc、点遮罩关闭都开箱即用。</p>
        <Button onClick={() => setOpen(false)}>知道了</Button>
      </Dialog>
    </>
  );
}
