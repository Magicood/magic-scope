import { Select } from '@magic-scope/react';
import { useState } from 'react';

const options = [
  { value: 'arcane', label: 'Arcane 紫' },
  { value: 'frost', label: 'Frost 蓝' },
  { value: 'ember', label: 'Ember 品红' },
  { value: 'void', label: 'Void 墨黑(企业版)', disabled: true },
];

export default function Demo() {
  const [theme, setTheme] = useState('');
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* 未选中:显示占位文本,含禁用项 */}
      <Select
        value={theme}
        onChange={setTheme}
        options={options}
        placeholder="挑一个主题…"
        aria-label="带占位与禁用项"
      />
      {/* 整体禁用 */}
      <Select value="frost" options={options} disabled aria-label="整体禁用" />
    </div>
  );
}
