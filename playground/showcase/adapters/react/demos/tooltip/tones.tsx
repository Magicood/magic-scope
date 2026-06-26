import type { TooltipTone } from '@magic-scope/react';
import { Button, Tooltip } from '@magic-scope/react';

// tone 色调系统:全库统一差异点。每个 tone 经 tone resolver 派生气泡边框 / 发光 / 箭头,
// 覆盖全部 7 个语义色调(含 neutral),配 arrow 指向箭头,danger 即警示气泡。
const TONES: { tone: TooltipTone; label: string }[] = [
  { tone: 'neutral', label: 'neutral 中性' },
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警告' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {TONES.map(({ tone, label }) => (
        <Tooltip key={tone} content={`${label} 气泡`} tone={tone} arrow>
          <Button tone={tone} variant="soft">
            {label}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
