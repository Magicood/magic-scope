import { Button, Dropdown } from '@magic-scope/react';
import { useState } from 'react';

// 受控开合 + onSelect:open / onOpenChange 由外部 state 驱动,onSelect 拿到 (item, index)。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('(无)');

  return (
    <div style={{ display: 'grid', gap: '0.6rem', justifyItems: 'center' }}>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => setLast(String(item.label))}
        trigger={<Button variant="soft">{open ? '菜单已打开 ▴' : '排序方式 ▾'}</Button>}
        items={[
          { label: '按名称', onSelect: () => {} },
          { label: '按修改时间', onSelect: () => {} },
          { label: '按大小', onSelect: () => {} },
        ]}
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>上次选择:{last}</small>
    </div>
  );
}
