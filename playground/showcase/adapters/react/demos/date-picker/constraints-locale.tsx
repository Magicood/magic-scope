import { DatePicker } from '@magic-scope/react';
import { useState } from 'react';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const today = startOfDay(new Date());

export default function Demo() {
  const [a, setA] = useState<Date | null>(null);
  const [b, setB] = useState<Date | null>(null);
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(320px, 90vw)' }}>
      {/* min/max 夹取:仅未来 30 天内可选,其余灰显 */}
      <div style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          仅未来 30 天可选(min/max)
        </span>
        <DatePicker
          value={a}
          onChange={setA}
          min={today}
          max={addDays(today, 30)}
          aria-label="未来 30 天内"
        />
      </div>

      {/* disabledDate 自定义禁用:屏蔽周末 + 英文 locale + 周日起始 */}
      <div style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          禁用周末 · en-US locale · 周日起始
        </span>
        <DatePicker
          value={b}
          onChange={setB}
          disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
          locale="en-US"
          weekStart={0}
          aria-label="禁用周末(英文)"
        />
      </div>
    </div>
  );
}
