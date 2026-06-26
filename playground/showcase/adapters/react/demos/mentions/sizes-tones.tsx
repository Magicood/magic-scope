import type { MentionOption, MentionsSize, MentionsTone } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';

// 尺寸 × 色调:size 影响 font-size 与 min-block-size(随密度缩放),
// tone 决定聚焦发光环的色调。tone 不写死配色,只读 --ms-tone-* 槽位。
const options: MentionOption[] = [
  { value: 'arcanist', label: '奥术师·墨', icon: '🔮' },
  { value: 'frostweaver', label: '霜织者·凛', icon: '❄️' },
  { value: 'emberkin', label: '余烬使·焰', icon: '🔥' },
];

const sizes: MentionsSize[] = ['sm', 'md', 'lg'];
const tones: { tone: MentionsTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'info', label: 'info 信息' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)', inlineSize: 'min(460px, 100%)' }}>
      <div style={{ display: 'grid', gap: 'var(--ms-space-2)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>三种尺寸</span>
        {sizes.map((size) => (
          <Mentions
            key={size}
            size={size}
            options={options}
            rows={2}
            defaultValue=""
            placeholder={`size = ${size},敲 @ 试试`}
            aria-label={`尺寸 ${size}`}
          />
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--ms-space-3)',
        }}
      >
        {tones.map(({ tone, label }) => (
          <div key={tone} style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
            <Mentions
              tone={tone}
              options={options}
              rows={2}
              placeholder="聚焦看发光环"
              aria-label={label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
