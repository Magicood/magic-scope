import type { SelectTone } from '@magic-scope/react';
import { Select } from '@magic-scope/react';

// 全 tone 矩阵:tone 派生 trigger 高亮、选中项打勾色与 focus 发光,
// 不写死配色,只读 --ms-c* 槽位。展开任一个即可看到选中项随 tone 染色。
const tones: { tone: SelectTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
];

const options = [
  { value: 'arcane', label: 'Arcane 紫' },
  { value: 'frost', label: 'Frost 蓝' },
  { value: 'ember', label: 'Ember 品红' },
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {tones.map(({ tone, label }) => (
        <div key={tone} style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <Select tone={tone} options={options} defaultValue="frost" aria-label={label} />
        </div>
      ))}
    </div>
  );
}
