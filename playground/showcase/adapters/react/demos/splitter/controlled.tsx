import { Splitter } from '@magic-scope/react';
import { useState } from 'react';

// 演示用面板:统一外观,显示当前像素尺寸。
function Pane({ title, px }: { title: string; px: number | undefined }) {
  return (
    <div
      style={{
        blockSize: '100%',
        display: 'grid',
        placeContent: 'center',
        gap: 'var(--ms-space-1, 0.25rem)',
        padding: 'var(--ms-space-3, 0.75rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        textAlign: 'center',
      }}
    >
      <strong style={{ color: 'var(--ms-color-fg)', fontSize: '0.85rem' }}>{title}</strong>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.78rem' }}>
        {px !== undefined ? `${Math.round(px)}px` : '—'}
      </span>
    </div>
  );
}

const btnStyle = {
  padding: 'var(--ms-space-1, 0.25rem) var(--ms-space-3, 0.75rem)',
  borderRadius: 'var(--ms-radius-sm, 0.375rem)',
  border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
  background: 'transparent',
  color: 'var(--ms-color-fg)',
  fontSize: '0.8rem',
  cursor: 'pointer',
} as const;

// 受控:外部 state 托管各面板像素尺寸,onResize 回写;按钮可一键套用预设比例。
export default function Demo() {
  const [sizes, setSizes] = useState<number[]>([200, 360]);
  const total = sizes.reduce((a, b) => a + b, 0) || 1;
  const apply = (ratios: number[]) => setSizes(ratios.map((r) => Math.round(total * r)));

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(36rem, 100%)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle} onClick={() => apply([0.25, 0.75])}>
          1 : 3
        </button>
        <button type="button" style={btnStyle} onClick={() => apply([0.5, 0.5])}>
          对半
        </button>
        <button type="button" style={btnStyle} onClick={() => apply([0.75, 0.25])}>
          3 : 1
        </button>
      </div>
      <Splitter
        sizes={sizes}
        onResize={(detail) => setSizes(detail.sizes)}
        style={{
          blockSize: '11rem',
          border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
          borderRadius: 'var(--ms-radius-md, 0.5rem)',
          overflow: 'hidden',
        }}
      >
        <Splitter.Panel min={100}>
          <Pane title="左" px={sizes[0]} />
        </Splitter.Panel>
        <Splitter.Panel min={100}>
          <Pane title="右" px={sizes[1]} />
        </Splitter.Panel>
      </Splitter>
    </div>
  );
}
