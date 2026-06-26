import { Checkbox, type CheckboxTone } from '@magic-scope/react';

const tones: { tone: CheckboxTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

/**
 * tone 色调矩阵:全库统一的 7 色调经 tone resolver 派生配色,
 * 选中态的方块底色、对勾与发光环都随 tone 切换,语义与品牌色保持一致。
 */
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {tones.map(({ tone, label }) => (
        <Checkbox key={tone} tone={tone} defaultChecked>
          {label}
        </Checkbox>
      ))}
    </div>
  );
}
