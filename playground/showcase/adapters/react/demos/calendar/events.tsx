import { Calendar } from '@magic-scope/react';
import { useState } from 'react';

// dateCellRender 在日格数字下方挂事件圆点(对标 Ant Design Calendar 的日程看板);
// 同时用 disabledDate 禁掉周末,minDate 限制不能选过去。
const EVENTS = new Set([5, 12, 18, 25]);
const today = new Date();

export default function Demo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <Calendar
      size="compact"
      value={date}
      onChange={setDate}
      minDate={new Date(today.getFullYear(), today.getMonth(), 1)}
      disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
      dateCellRender={(d) =>
        EVENTS.has(d.getDate()) ? (
          <span
            aria-hidden="true"
            style={{
              display: 'block',
              inlineSize: 5,
              blockSize: 5,
              margin: '2px auto 0',
              borderRadius: '50%',
              background: 'var(--ms-color-primary, currentColor)',
            }}
          />
        ) : null
      }
      aria-label="带日程圆点的月历"
    />
  );
}
