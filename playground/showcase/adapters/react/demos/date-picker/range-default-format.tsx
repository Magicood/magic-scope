import type { DateRange } from '@magic-scope/react';
import { DatePicker } from '@magic-scope/react';

// defaultRangeValue:非受控 range 初值;format:自定义 trigger 显示格式(覆盖默认);
// placement:浮层朝上弹出(top-start)。
const today = new Date();
const initial: DateRange = {
  start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
  end: today,
};

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(320px, 90vw)' }}>
      <DatePicker
        mode="range"
        defaultRangeValue={initial}
        format={(d) => d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
        placement="top-start"
        aria-label="日期区间(非受控)"
      />
    </div>
  );
}
