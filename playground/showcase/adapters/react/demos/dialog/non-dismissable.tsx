import { Button, Dialog } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        强确认(不可点遮罩关闭)
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} dismissable={false}>
        <h3 style={{ marginBlockStart: 0 }}>请先确认</h3>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>点遮罩不会关闭,必须明确选择。</p>
        <Button onClick={() => setOpen(false)}>我已知晓</Button>
      </Dialog>
    </>
  );
}
