import { Button, Menu } from '@magic-scope/react';
import { useState } from 'react';

// 浮层定位三件套:
// - placement 决定浮层落在触发器的哪一侧(top / bottom / left / right)
// - align 决定沿该侧的对齐(start / center / end)
// - offset 是触发器与浮层之间的间距(px)
// 三个旋钮联动,实时看浮层位置变化。
const placements = ['bottom', 'top', 'left', 'right'] as const;
const aligns = ['start', 'center', 'end'] as const;

const items = [
  { label: '复制', onSelect: () => {} },
  { label: '剪切', onSelect: () => {} },
  { label: '粘贴', onSelect: () => {} },
];

export default function Demo() {
  const [placement, setPlacement] = useState<(typeof placements)[number]>('bottom');
  const [align, setAlign] = useState<(typeof aligns)[number]>('start');
  const [offset, setOffset] = useState(8);

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'grid', gap: '0.2rem', fontSize: '0.8rem' }}>
          placement
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as (typeof placements)[number])}
          >
            {placements.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: '0.2rem', fontSize: '0.8rem' }}>
          align
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value as (typeof aligns)[number])}
          >
            {aligns.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: '0.2rem', fontSize: '0.8rem' }}>
          offset {offset}px
          <input
            type="range"
            min={0}
            max={24}
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value))}
          />
        </label>
      </div>

      <div style={{ padding: '3rem 0' }}>
        <Menu
          placement={placement}
          align={align}
          offset={offset}
          trigger={<Button variant="outline">调整定位后打开 ▾</Button>}
          items={items}
        />
      </div>
    </div>
  );
}
