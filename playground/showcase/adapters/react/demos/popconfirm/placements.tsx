import type { PopoverPlacement } from '@magic-scope/react';
import { Button, Popconfirm } from '@magic-scope/react';

const PLACEMENTS: { value: PopoverPlacement; label: string }[] = [
  { value: 'top', label: '上 top' },
  { value: 'bottom', label: '下 bottom' },
  { value: 'left', label: '左 left' },
  { value: 'right', label: '右 right' },
];

// 气泡相对 trigger 的四个方位,由 CSS Anchor Positioning 锚定。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {PLACEMENTS.map(({ value, label }) => (
        <Popconfirm
          key={value}
          trigger={<Button variant="outline">{label}</Button>}
          title="确认在此方位弹出?"
          description={`placement="${value}"`}
          placement={value}
        />
      ))}
    </div>
  );
}
