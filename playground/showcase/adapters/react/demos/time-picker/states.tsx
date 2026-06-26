import { TimePicker } from '@magic-scope/react';
import { useState } from 'react';

// 关键状态汇总:占位(未选)、可清除、校验失败 invalid、整体禁用、隐藏底部操作栏。
export default function Demo() {
  const [time, setTime] = useState<string | null>('11:11:00');
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--ms-space-4, 1rem)',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>占位(未选)</span>
        <TimePicker placeholder="选个时间…" aria-label="占位态" />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          可清除 clearable
        </span>
        <TimePicker value={time} onChange={(v) => setTime(v)} clearable aria-label="可清除" />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          校验失败 invalid
        </span>
        <TimePicker invalid defaultValue="25:00" placeholder="时间非法" aria-label="校验失败" />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          整体禁用 disabled
        </span>
        <TimePicker disabled defaultValue="08:00:00" aria-label="整体禁用" />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          无操作栏 footer=false
        </span>
        <TimePicker footer={false} defaultValue="06:45:00" aria-label="无底部操作栏" />
      </div>
    </div>
  );
}
