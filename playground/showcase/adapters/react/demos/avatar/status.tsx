import type { AvatarStatus } from '@magic-scope/react';
import { Avatar } from '@magic-scope/react';
import { useState } from 'react';

// status 状态徽标:右下角状态点(online/offline/busy/away),语义色由内部映射(在线=success、忙碌=danger…)。
// statusPulse 给状态点叠加呼吸脉冲(受 --ms-motion-scale 门控)。下方按钮切换受控状态点。
const STATUSES: { status: AvatarStatus; label: string }[] = [
  { status: 'online', label: '在线' },
  { status: 'offline', label: '离线' },
  { status: 'busy', label: '忙碌' },
  { status: 'away', label: '离开' },
];

export default function Demo() {
  const [current, setCurrent] = useState<AvatarStatus>('online');

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {STATUSES.map(({ status, label }) => (
          <div
            key={status}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Avatar status={status} statusPulse name={label} />
            <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Avatar
          status={current}
          statusPulse
          src="https://i.pravatar.cc/120?img=24"
          name="当前用户"
        />
        {STATUSES.map(({ status, label }) => (
          <button
            key={status}
            type="button"
            onClick={() => setCurrent(status)}
            aria-pressed={current === status}
            style={{
              padding: '0.3rem 0.7rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--ms-radius-md)',
              border: '1px solid var(--ms-color-border)',
              background: current === status ? 'var(--ms-color-bg-subtle)' : 'transparent',
              color: 'var(--ms-color-fg)',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
