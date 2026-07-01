import { HoverCard, type HoverCardPlacement } from '@magic-scope/react';

// 四向 placement + offset:同一张卡分别锚在四个方位,带箭头指向 trigger。
const sides: [HoverCardPlacement, string][] = [
  ['top', '上'],
  ['bottom', '下'],
  ['left', '左'],
  ['right', '右'],
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
      {sides.map(([placement, label]) => (
        <HoverCard key={placement} openDelay={100}>
          <HoverCard.Trigger>
            <button type="button" style={{ font: 'inherit', cursor: 'pointer' }}>
              {label}方
            </button>
          </HoverCard.Trigger>
          <HoverCard.Content placement={placement} offset={10} arrow tone="accent">
            <span style={{ fontSize: '0.85rem' }}>placement=&quot;{placement}&quot;</span>
          </HoverCard.Content>
        </HoverCard>
      ))}
    </div>
  );
}
