import type { AvatarTone } from '@magic-scope/react';
import { Avatar } from '@magic-scope/react';

// tone 色调系统:全库统一差异点。占位态经 tone resolver 派生底色 / 文字 / 柔光,
// 覆盖全部 7 个语义色调。显式 tone 优先于 name 哈希配色,同一 tone 语义在各组件间一致。
const TONES: { tone: AvatarTone; label: string; initial: string }[] = [
  { tone: 'primary', label: 'primary 主色', initial: 'P' },
  { tone: 'accent', label: 'accent 强调', initial: 'A' },
  { tone: 'success', label: 'success 成功', initial: 'S' },
  { tone: 'warning', label: 'warning 警告', initial: 'W' },
  { tone: 'danger', label: 'danger 危险', initial: 'D' },
  { tone: 'info', label: 'info 信息', initial: 'I' },
  { tone: 'neutral', label: 'neutral 中性', initial: 'N' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {TONES.map(({ tone, label, initial }) => (
        <div
          key={tone}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
        >
          <Avatar tone={tone} name={initial} />
          <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
