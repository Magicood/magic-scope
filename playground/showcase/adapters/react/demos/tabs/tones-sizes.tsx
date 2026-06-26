import type { TabItem, TabsTone } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';

// tone 色调系统:全库统一差异点,经 tone resolver 派生配色与发光(只读 6 槽位)。
// 覆盖全部 7 个语义色调,pill 变体下选中项以该 tone 实底呈现;并演示 size 三档。
const TONES: { tone: TabsTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警告' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

const items: TabItem[] = [
  { value: 'arcane', label: '奥术' },
  { value: 'frost', label: '冰霜' },
  { value: 'ember', label: '余烬' },
];

const sizeItems: TabItem[] = [
  { value: 'arcane', label: 'Arcane 奥术' },
  { value: 'frost', label: 'Frost 冰霜' },
  { value: 'ember', label: 'Ember 余烬' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', inlineSize: '100%' }}>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {TONES.map(({ tone, label }) => (
          <div key={tone} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                inlineSize: '7rem',
                flexShrink: 0,
                color: 'var(--ms-color-fg-muted)',
                fontSize: '0.85rem',
              }}
            >
              {label}
            </span>
            <Tabs items={items} defaultValue="arcane" variant="pill" tone={tone} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Tabs items={sizeItems} defaultValue="arcane" tone="accent" size="sm" />
        <Tabs items={sizeItems} defaultValue="arcane" tone="accent" size="md" />
        <Tabs items={sizeItems} defaultValue="arcane" tone="accent" size="lg" />
      </div>
    </div>
  );
}
