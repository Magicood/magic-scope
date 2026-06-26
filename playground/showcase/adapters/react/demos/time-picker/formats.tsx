import type { TimeParts } from '@magic-scope/react';
import { TimePicker } from '@magic-scope/react';

// 形态变体:12 小时制(额外 AM/PM 列)、隐藏秒列(showSecond=false)、自定义 format 显示文案。
// format 接 TimeParts 返回任意字符串,这里加「时分」中文后缀。
const cnFormat = (p: TimeParts) =>
  `${String(p.h).padStart(2, '0')} 时 ${String(p.m).padStart(2, '0')} 分`;

export default function Demo() {
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-4, 1rem)', inlineSize: 'min(300px, 90vw)' }}
    >
      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          12 小时制(带 AM/PM 列)
        </span>
        <TimePicker use12Hours defaultValue="15:45:00" aria-label="12 小时制" />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          仅时 / 分(showSecond=false)
        </span>
        <TimePicker showSecond={false} defaultValue="10:20" aria-label="不显示秒" />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          自定义 format 显示
        </span>
        <TimePicker
          showSecond={false}
          format={cnFormat}
          defaultValue="22:08"
          aria-label="自定义显示格式"
        />
      </div>
    </div>
  );
}
