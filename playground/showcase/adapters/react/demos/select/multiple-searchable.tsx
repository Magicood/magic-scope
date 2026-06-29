import { Select } from '@magic-scope/react';
import { useState } from 'react';

// 多选 + 可搜索 + 可清除 + 前置图标:
// multiple 时 trigger 渲染可逐个移除的 tag,searchable 在浮层顶部内联搜索框按 query 过滤,
// clearable 有值时显示一键清除,prefix 在 trigger 前放图标。
const options = [
  { value: 'arcane', label: 'Arcane 紫', description: '主品牌色,用于主操作' },
  { value: 'frost', label: 'Frost 蓝', description: '冷色调,用于信息提示' },
  { value: 'ember', label: 'Ember 品红', description: '暖色调,用于强调' },
  { value: 'storm', label: 'Storm 靛蓝', description: '中性深色,用于标题' },
  { value: 'verdant', label: 'Verdant 绿', description: '用于成功与正向状态' },
  { value: 'void', label: 'Void 墨黑(企业版)', description: '企业版限定主题', disabled: true },
];

export default function Demo() {
  const [palette, setPalette] = useState<string[]>(['frost', 'ember']);
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(320px, 80vw)' }}>
      <Select
        multiple
        searchable
        clearable
        prefix={<span aria-hidden="true">✦</span>}
        value={palette}
        onChange={(next) => setPalette(next as string[])}
        options={options}
        placeholder="挑选配色…"
        aria-label="主题配色(可多选、可搜索)"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        已选 {palette.length} 项:{palette.join('、') || '无'}
      </small>
    </div>
  );
}
