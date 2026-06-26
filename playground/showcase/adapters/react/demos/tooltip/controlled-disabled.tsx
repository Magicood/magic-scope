import { Button, Tooltip } from '@magic-scope/react';
import { useState } from 'react';

// 受控 open:用 open + onOpenChange 把显隐交给外部状态(如常驻引导提示)。
// disabled:吞掉显示,常用于禁用态 trigger —— 即便点开关也不弹。
export default function Demo() {
  const [open, setOpen] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button variant="soft" onClick={() => setOpen((v) => !v)}>
          {open ? '收起气泡' : '展开气泡'}
        </Button>
        <Button variant="soft" tone="warning" onClick={() => setDisabled((v) => !v)}>
          {disabled ? '启用提示' : '禁用提示'}
        </Button>
      </div>
      <Tooltip
        content="受控常驻气泡:由外部状态控制显隐"
        tone="info"
        arrow
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <Button variant="outline">受控触发器</Button>
      </Tooltip>
    </div>
  );
}
