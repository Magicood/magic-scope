import { Button, Popconfirm } from '@magic-scope/react';
import { useState } from 'react';

// danger 变体把确认按钮染危险色,典型用于列表内联删除的二次确认。
export default function Demo() {
  const [rows, setRows] = useState(['卷轴 · 烈焰术', '卷轴 · 寒冰术', '卷轴 · 雷击术']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '16rem' }}>
      {rows.map((row) => (
        <div
          key={row}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--ms-radius-md)',
            background: 'var(--ms-color-surface-raised)',
          }}
        >
          <span>{row}</span>
          <Popconfirm
            trigger={
              <Button variant="ghost" size="sm">
                删除
              </Button>
            }
            title="确定删除该条目?"
            description="此操作不可撤销。"
            variant="danger"
            confirmText="删除"
            placement="left"
            onConfirm={() => setRows((prev) => prev.filter((item) => item !== row))}
          />
        </div>
      ))}
      {rows.length === 0 && (
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
          列表已清空。
        </span>
      )}
    </div>
  );
}
