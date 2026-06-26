import type { TextareaTone } from '@magic-scope/react';
import { Textarea } from '@magic-scope/react';

// tone 色调系统:控制聚焦发光环颜色(读 --ms-c / --ms-c-glow 槽位)。
// 聚焦任一框即可看到对应色调的发光环;invalid 时会被强制为 danger。
const TONES: TextareaTone[] = [
  'primary',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))',
        inlineSize: '100%',
      }}
    >
      {TONES.map((tone) => (
        <Textarea
          key={tone}
          tone={tone}
          rows={2}
          defaultValue={`tone="${tone}"`}
          footer={<span style={{ color: 'var(--ms-color-fg-muted)' }}>聚焦看发光环</span>}
          aria-label={`色调 ${tone}`}
        />
      ))}
    </div>
  );
}
