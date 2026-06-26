import type { DatePreset, DateRange } from '@magic-scope/react';
import { DatePicker } from '@magic-scope/react';
import { useState } from 'react';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const today = startOfDay(new Date());
// range 预设渲染在 footer,点击直接落区间
const presets: DatePreset[] = [
  { label: '最近 7 天', range: { start: addDays(today, -6), end: today } },
  { label: '最近 30 天', range: { start: addDays(today, -29), end: today } },
  {
    label: '本月',
    range: {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    },
  },
];

export default function Demo() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const fmt = (d: Date | null) => (d ? d.toLocaleDateString('zh-CN') : '—');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(320px, 90vw)' }}>
      {/* range 双模 + 悬停预览 + footer 预设;选起点后移动鼠标看区间高亮 */}
      <DatePicker
        mode="range"
        rangeValue={range}
        onRangeChange={setRange}
        presets={presets}
        aria-label="选择日期区间"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        区间:{fmt(range.start)} → {fmt(range.end)}
      </small>
    </div>
  );
}
