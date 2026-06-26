import { DatePicker } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(260px, 80vw)' }}>
      <DatePicker value={date} onChange={setDate} aria-label="基础日期选择" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        当前:{date ? date.toLocaleDateString('zh-CN') : '未选择'}
      </small>
    </div>
  );
}
