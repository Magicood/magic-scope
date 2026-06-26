import { Textarea } from '@magic-scope/react';
import { useState } from 'react';

const MAX = 80;

// showCount + maxLength:底部显示「当前/上限」,超限染 danger。
// footer 槽:在计数同一行的起始侧追加帮助文字 / 工具按钮。
// onSubmitShortcut:在多行框里按 Cmd/Ctrl + Enter 也能提交。
export default function Demo() {
  const [value, setValue] = useState('愿这条留言,载着祝福抵达远方。');
  const [sent, setSent] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(28rem, 100%)' }}>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        showCount
        maxLength={MAX}
        tone="accent"
        onSubmitShortcut={() => setSent(value)}
        footer={
          <button
            type="button"
            onClick={() => setSent(value)}
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--ms-color-accent)',
              font: 'inherit',
            }}
          >
            发送（⌘/Ctrl + Enter）
          </button>
        }
        aria-label="带计数与底栏的留言框"
      />
      {sent != null && <small style={{ color: 'var(--ms-color-success)' }}>已发送:{sent}</small>}
    </div>
  );
}
