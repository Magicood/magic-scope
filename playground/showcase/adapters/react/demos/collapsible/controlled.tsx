import { Collapsible } from '@magic-scope/react';
import { useState } from 'react';

// 受控:open + onOpenChange 由外部 state 驱动,外部按钮也能翻开合态;
// Content 常驻挂载,收起后其内部 state(输入草稿)不丢。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(340px, 100%)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ font: 'inherit', cursor: 'pointer', justifySelf: 'start' }}
      >
        {open ? '收起备注' : '展开备注'}(外部控制)
      </button>
      <Collapsible open={open} onOpenChange={setOpen} tone="accent">
        <Collapsible.Trigger
          style={{
            font: 'inherit',
            cursor: 'pointer',
            padding: '0.5rem 0.8rem',
            border: '1px solid var(--ms-color-border)',
            borderRadius: 'var(--ms-radius-md)',
            background: 'transparent',
            color: 'var(--ms-color-fg)',
          }}
        >
          订单备注 {open ? '▲' : '▼'}
        </Collapsible.Trigger>
        <Collapsible.Content>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="收起再展开草稿仍在…"
            style={{
              marginBlockStart: '0.5rem',
              inlineSize: '100%',
              padding: '0.4rem 0.6rem',
              font: 'inherit',
            }}
          />
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
}
