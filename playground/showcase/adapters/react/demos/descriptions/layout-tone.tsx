import type { DescriptionsItem, DescriptionsTone } from '@magic-scope/react';
import { Descriptions } from '@magic-scope/react';

const items: DescriptionsItem[] = [
  { key: 'name', label: '召唤物', value: '冰晶元素' },
  { key: 'hp', label: '生命', value: '640 / 640' },
  { key: 'duration', label: '持续', value: '8 回合' },
  // span 跨两列:占满本行剩余宽度。
  { key: 'note', label: '备注', value: '受到火焰伤害时持续时间减半', span: 2 },
];

const tones: { tone: DescriptionsTone; title: string }[] = [
  { tone: 'primary', title: 'primary 主色' },
  { tone: 'success', title: 'success 成功' },
  { tone: 'warning', title: 'warning 警告' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.2rem', inlineSize: 'min(640px, 100%)' }}>
      {tones.map(({ tone, title }) => (
        <Descriptions
          key={tone}
          items={items}
          title={title}
          tone={tone}
          layout="vertical"
          columns={2}
          bordered
        />
      ))}
    </div>
  );
}
