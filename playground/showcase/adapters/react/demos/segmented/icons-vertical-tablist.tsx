import { Segmented } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [tab, setTab] = useState('overview');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
      {/* 复合 Segmented.Item + 图标,纵向堆叠,含禁用段 */}
      <Segmented orientation="vertical" defaultValue="grid" tone="accent">
        <Segmented.Item value="grid" icon="▦">
          网格
        </Segmented.Item>
        <Segmented.Item value="list" icon="☰">
          列表
        </Segmented.Item>
        <Segmented.Item value="gallery" icon="◳" disabled>
          画廊
        </Segmented.Item>
      </Segmented>

      {/* role=tablist:移焦不自动激活,Enter/Space 才选中 */}
      <div style={{ display: 'grid', gap: '0.6rem' }}>
        <Segmented
          role="tablist"
          aria-label="详情分页"
          value={tab}
          onValueChange={setTab}
          options={[
            { value: 'overview', label: '概览' },
            { value: 'spec', label: '规格' },
            { value: 'reviews', label: '评价' },
          ]}
        />
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          激活分页:{tab}
        </span>
      </div>
    </div>
  );
}
