import { Button, Dialog } from '@magic-scope/react';
import { useState } from 'react';

// closeIcon:自定义右上角关闭按钮图标(替换默认 ✕)。
export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开(自定义关闭图标)</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        closeIcon={<span aria-hidden="true">⤫</span>}
      >
        <h3 style={{ marginBlockStart: 0 }}>自定义关闭图标</h3>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>右上角关闭按钮的图标由 closeIcon 覆盖。</p>
      </Dialog>
    </>
  );
}
