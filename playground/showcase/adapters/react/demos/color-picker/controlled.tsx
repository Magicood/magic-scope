import { ColorPicker } from '@magic-scope/react';
import { useState } from 'react';

// 受控:value + onChange 全程由外部状态托管;外部按钮 / 文本框可双向驱动同一颜色,
// 实时把颜色应用到预览卡片背景。
const QUICK = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Demo() {
  const [color, setColor] = useState('#7c3aed');
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(360px, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <ColorPicker value={color} onChange={setColor} aria-label="受控颜色" />
        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="手动输入色值"
          spellCheck={false}
          style={{
            flex: 1,
            minInlineSize: '8rem',
            padding: '0.4rem 0.6rem',
            borderRadius: 'var(--ms-radius-sm)',
            border: '1px solid var(--ms-color-border)',
            background: 'var(--ms-color-bg)',
            color: 'var(--ms-color-fg)',
            font: 'inherit',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {QUICK.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`设为 ${c}`}
            style={{
              inlineSize: '1.5rem',
              blockSize: '1.5rem',
              padding: 0,
              borderRadius: 'var(--ms-radius-sm)',
              border:
                c === color ? '2px solid var(--ms-color-fg)' : '1px solid var(--ms-color-border)',
              background: c,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
      <div
        style={{
          padding: 'var(--ms-space-4, 1rem)',
          borderRadius: 'var(--ms-radius-md)',
          background: color,
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.45)',
          textAlign: 'center',
        }}
      >
        实时预览 {color}
      </div>
    </div>
  );
}
