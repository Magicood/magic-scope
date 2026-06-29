import type { DescriptionsItem, DescriptionsTone } from '@magic-scope/react';
import { Descriptions } from '@magic-scope/react';

const items: DescriptionsItem[] = [
  { key: 'name', label: '服务', value: 'web-gateway' },
  { key: 'version', label: '版本', value: 'v2.4.0' },
  { key: 'region', label: '区域', value: '华东 1' },
  // span 跨两列:占满本行剩余宽度。
  { key: 'note', label: '备注', value: '灰度发布,流量切换中,预计 10 分钟完成', span: 2 },
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
