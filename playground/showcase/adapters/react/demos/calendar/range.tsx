import { Calendar, type DateTuple } from '@magic-scope/react';
import { useState } from 'react';

// 范围选择(mode=range):先点起始、再点结束,中间高亮为区间;完成一段回调升序归一。
export default function Demo() {
  const [range, setRange] = useState<DateTuple | null>(null);
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <Calendar
        mode="range"
        size="compact"
        tone="accent"
        rangeValue={range}
        onRangeChange={setRange}
        aria-label="选择日期区间"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        {range
          ? `${range[0].toLocaleDateString()} → ${range[1].toLocaleDateString()}`
          : '点两次选一段区间'}
      </small>
    </div>
  );
}
