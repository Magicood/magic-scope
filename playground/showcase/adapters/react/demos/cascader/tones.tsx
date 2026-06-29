import type { CascaderOption, CascaderTone } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';

// 全 tone 矩阵:tone 经全库 resolver 派生 trigger 高亮、选中项染色与 focus 发光,
// 不写死配色,只读 --ms-* 槽位。展开任一个即可看到选中态随 tone 着色。
const options: CascaderOption[] = [
  {
    value: 'engineering',
    label: '研发',
    children: [
      { value: 'frontend', label: '前端' },
      { value: 'backend', label: '后端' },
    ],
  },
  {
    value: 'design',
    label: '设计',
    children: [
      { value: 'product', label: '产品设计' },
      { value: 'brand', label: '品牌设计' },
    ],
  },
];

const tones: { tone: CascaderTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

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
          <Cascader
            tone={tone}
            options={options}
            defaultValue={['engineering', 'backend']}
            aria-label={label}
          />
        </div>
      ))}
    </div>
  );
}
