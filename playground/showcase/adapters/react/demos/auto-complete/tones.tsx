import type { AutoCompleteTone } from '@magic-scope/react';
import { AutoComplete } from '@magic-scope/react';

// 全 tone 矩阵:tone 派生输入框高亮与 focus 发光环,不写死配色,
// 只读 --ms-c* 槽位。聚焦任一项即可看到发光随 tone 染色。
const tones: { tone: AutoCompleteTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
];

const options = [{ value: 'Indigo 靛蓝' }, { value: 'Frost 霜蓝' }, { value: 'Ember 余烬橙' }];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 'var(--ms-space-3)',
      }}
    >
      {tones.map(({ tone, label }) => (
        <div key={tone} style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <AutoComplete tone={tone} options={options} defaultValue="Frost" aria-label={label} />
        </div>
      ))}
    </div>
  );
}
