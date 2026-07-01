import { Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

// closeIcon:自定义抽屉关闭图标(覆盖默认 ✕)。
export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        打开抽屉
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="通知设置"
        closeIcon={<span aria-hidden="true">⤫</span>}
      >
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>
          右上角关闭图标由 closeIcon 覆盖为自定义符号。
        </p>
      </Drawer>
    </>
  );
}
