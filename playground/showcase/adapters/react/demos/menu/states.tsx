import { Button, Menu } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [picked, setPicked] = useState('(尚未选择)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <Menu
        trigger={<Button variant="outline">更多 ▾</Button>}
        items={[
          { label: '编辑', onSelect: () => setPicked('编辑') },
          { label: '复制', onSelect: () => setPicked('复制') },
          { label: '归档(禁用)', onSelect: () => setPicked('归档'), disabled: true },
          { label: '删除', onSelect: () => setPicked('删除'), danger: true },
        ]}
      />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
        上次选择:{picked}
      </p>
    </div>
  );
}
