import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';
import { useState } from 'react';

// 富数据项:item 上挂业务字段,render 自定义每项渲染(图标 + 标题 + 副标题徽标);
// filterOption 自定义过滤(按标题或类别匹配)。render 缺省时只展示 title。
interface PluginItem extends TransferItem {
  emoji: string;
  category: string;
}

const dataSource: PluginItem[] = [
  { key: 'lint', title: '代码检查', emoji: '🔍', category: '质量' },
  { key: 'fmt', title: '格式化', emoji: '🎨', category: '质量' },
  { key: 'test', title: '单元测试', emoji: '🧪', category: '验证' },
  { key: 'cov', title: '覆盖率', emoji: '📊', category: '验证' },
  { key: 'deploy', title: '部署', emoji: '🚀', category: '交付' },
  { key: 'notify', title: '通知', emoji: '🔔', category: '交付' },
];

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['lint', 'test']);
  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={setTargetKeys}
      showSearch
      titles={['可用插件', '流水线']}
      render={(item) => {
        const it = item as PluginItem;
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ms-space-2, 0.5rem)',
            }}
          >
            <span aria-hidden="true">{it.emoji}</span>
            <span>{it.title}</span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0 var(--ms-space-2, 0.5rem)',
                borderRadius: 'var(--ms-radius-full, 999px)',
                background: 'var(--ms-color-bg-subtle, rgba(127,127,127,0.15))',
                color: 'var(--ms-color-fg-muted)',
              }}
            >
              {it.category}
            </span>
          </span>
        );
      }}
      filterOption={(query, item) => {
        const it = item as PluginItem;
        const q = query.toLowerCase();
        return it.title.toLowerCase().includes(q) || it.category.toLowerCase().includes(q);
      }}
    />
  );
}
