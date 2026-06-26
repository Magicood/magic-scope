import type { DrawerTone } from '@magic-scope/react';
import { Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

// tone 色调系统:全库统一差异点。Drawer 的 tone 经 tone resolver 派生 focus 环、
// 贴边描边与辉光,覆盖全部 7 个语义色调(含 neutral)。点任一色调打开对应抽屉。
const TONES: { tone: DrawerTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警告' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

export default function Demo() {
  const [tone, setTone] = useState<DrawerTone | null>(null);
  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {TONES.map((t) => (
          <Button key={t.tone} tone={t.tone} variant="soft" onClick={() => setTone(t.tone)}>
            {t.label}
          </Button>
        ))}
      </div>
      <Drawer
        open={tone != null}
        onClose={() => setTone(null)}
        tone={tone ?? 'primary'}
        title={`${tone ?? 'primary'} 色调`}
      >
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
          tone 派生贴边描边、focus 环与辉光;同一套语义色调在全库组件间保持一致。
        </p>
        <Button tone={tone ?? 'primary'} onClick={() => setTone(null)}>
          收起
        </Button>
      </Drawer>
    </>
  );
}
