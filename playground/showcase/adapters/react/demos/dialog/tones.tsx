import type { DialogTone } from '@magic-scope/react';
import { Button, Dialog } from '@magic-scope/react';
import { useState } from 'react';

// tone 色调系统:全库统一差异点。Dialog 设置 tone 后根元素加 ms-tone-*,
// focus 环与面板辉光走对应 tone 槽位。覆盖全部 7 个语义色调,点开看辉光差异。
const TONES: { tone: DialogTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警告' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

export default function Demo() {
  const [active, setActive] = useState<DialogTone | null>(null);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {TONES.map(({ tone, label }) => (
        <Button key={tone} variant="soft" onClick={() => setActive(tone)}>
          {label}
        </Button>
      ))}
      <Dialog open={active !== null} tone={active ?? undefined} onClose={() => setActive(null)}>
        <Dialog.Header>
          <Dialog.Title>{active} 色调</Dialog.Title>
          <Dialog.Description>
            根元素挂上 ms-tone-{active},focus 环与面板辉光跟随该语义色调切换。
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button onClick={() => setActive(null)}>知道了</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}
