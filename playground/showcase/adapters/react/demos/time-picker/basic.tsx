import { TimePicker } from '@magic-scope/react';
import { useState } from 'react';

// 基础用法:非受控用 defaultValue 起一个初值,点开后用「时 / 分 / 秒」三列逐列选;
// 这里再受控一个,实时回显当前 "HH:mm:ss" 字符串。
export default function Demo() {
  const [time, setTime] = useState<string | null>('08:30:00');
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(260px, 80vw)' }}
    >
      <TimePicker value={time} onChange={(v) => setTime(v)} aria-label="选择时间" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前值:{time ?? '(空)'}</small>
    </div>
  );
}
