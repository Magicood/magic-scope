import { Select } from '@magic-scope/react';
import { useState } from 'react';

// 多选 + 可搜索 + 可清除 + 前置图标:
// multiple 时 trigger 渲染可逐个移除的 tag,searchable 在浮层顶部内联搜索框按 query 过滤,
// clearable 有值时显示一键清除,prefix 在 trigger 前放图标。
const options = [
  { value: 'arcane', label: 'Arcane 奥术紫', description: '操控秩序与符文' },
  { value: 'frost', label: 'Frost 霜寒青', description: '冰封与减速' },
  { value: 'ember', label: 'Ember 余烬品红', description: '烈焰与爆发' },
  { value: 'storm', label: 'Storm 雷暴蓝', description: '雷电与连锁' },
  { value: 'verdant', label: 'Verdant 翠生绿', description: '治愈与召唤' },
  { value: 'void', label: 'Void 虚空玄(已封印)', description: '禁忌之力', disabled: true },
];

export default function Demo() {
  const [schools, setSchools] = useState<string[]>(['frost', 'ember']);
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(320px, 80vw)' }}>
      <Select
        multiple
        searchable
        clearable
        prefix={<span aria-hidden="true">✦</span>}
        value={schools}
        onChange={(next) => setSchools(next as string[])}
        options={options}
        placeholder="搭配你的流派…"
        aria-label="法术流派(可多选、可搜索)"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        已选 {schools.length} 项:{schools.join('、') || '无'}
      </small>
    </div>
  );
}
