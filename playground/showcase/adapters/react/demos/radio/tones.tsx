import type { RadioTone } from '@magic-scope/react';
import { Radio, RadioGroup } from '@magic-scope/react';

// tone 色调系统:全库统一差异点。每个 RadioGroup 走一个 tone,
// checked 时由 tone resolver 派生主色染点与发光,覆盖全部 7 个语义色调。
const TONES: { tone: RadioTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警告' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
      {TONES.map(({ tone, label }) => (
        <RadioGroup key={tone} defaultValue="on" tone={tone} aria-label={label}>
          <Radio value="on">{label}</Radio>
          <Radio value="off">未选</Radio>
        </RadioGroup>
      ))}
    </div>
  );
}
