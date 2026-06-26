import { AutoComplete } from '@magic-scope/react';
import { useState } from 'react';

// 关键状态:整体禁用 / 校验失败(invalid 强制 danger 发光环并设 aria-invalid)/
// 可清除(allowClear,有值时显示 × 清除按钮)。
const options = [
  { value: 'Arcane 奥术紫' },
  { value: 'Frost 霜寒青' },
  { value: 'Ember 余烬品红' },
];

export default function Demo() {
  const [value, setValue] = useState('Frost 霜寒青');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(280px, 80vw)' }}>
      {/* 整体禁用 */}
      <AutoComplete value="Frost 霜寒青" options={options} disabled aria-label="整体禁用" />

      {/* 校验失败态 */}
      <AutoComplete
        defaultValue="非法流派"
        options={options}
        invalid
        placeholder="校验失败"
        aria-label="校验失败"
      />

      {/* 可清除:有值时显示清除按钮 */}
      <AutoComplete
        value={value}
        onChange={setValue}
        options={options}
        allowClear
        placeholder="键入后出现清除按钮…"
        aria-label="可清除"
      />
    </div>
  );
}
