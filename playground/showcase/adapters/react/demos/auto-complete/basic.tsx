import { AutoComplete } from '@magic-scope/react';
import { useState } from 'react';

// 基础用法:自由文本 + 补全建议。「值就是输入串」,候选项只作提示,
// 不强制从中选取;键入即默认子串过滤、聚焦即展开全量建议。
const options = [
  { value: 'apple 苹果' },
  { value: 'banana 香蕉' },
  { value: 'cherry 樱桃' },
  { value: 'grape 葡萄' },
  { value: 'mango 芒果' },
];

export default function Demo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(280px, 80vw)' }}>
      <AutoComplete
        value={value}
        onChange={setValue}
        options={options}
        placeholder="键入水果名…"
        aria-label="水果联想"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前输入:{value || '(空)'}</small>
    </div>
  );
}
