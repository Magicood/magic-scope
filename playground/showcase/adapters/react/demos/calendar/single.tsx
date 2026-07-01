import { Calendar } from '@magic-scope/react';
import { useState } from 'react';

// 单选月历(紧凑尺寸):点选某日,今天高亮,方向键 + Enter 键盘可达。
export default function Demo() {
  const [date, setDate] = useState<Date | null>(new Date());
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <Calendar size="compact" value={date} onChange={setDate} aria-label="选择日期" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        已选:{date ? date.toLocaleDateString() : '(未选)'}
      </small>
    </div>
  );
}
