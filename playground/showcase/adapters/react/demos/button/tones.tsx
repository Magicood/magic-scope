import type { ButtonTone } from '@magic-scope/react';
import { Button } from '@magic-scope/react';

// tone 色调系统:全库统一差异点。每个 tone 经 tone resolver 派生配色与发光,
// 覆盖全部 6 个语义色调 × solid / soft / outline 三档变体,展示同一色调在不同变体下的一致语义。
const TONES: { tone: ButtonTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警告' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {TONES.map(({ tone, label }) => (
        <div key={tone} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button tone={tone} variant="solid">
            {label}
          </Button>
          <Button tone={tone} variant="soft">
            柔色
          </Button>
          <Button tone={tone} variant="outline">
            描边
          </Button>
        </div>
      ))}
    </div>
  );
}
