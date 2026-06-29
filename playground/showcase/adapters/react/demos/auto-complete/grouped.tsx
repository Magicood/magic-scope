import type { AutoCompleteOptions } from '@magic-scope/react';
import { AutoComplete } from '@magic-scope/react';
import { useState } from 'react';

// 分组候选 + 自定义 renderOption:options 既可平铺也可分组传入,
// 过滤后空组自动隐藏;renderOption 覆盖默认 label 文本(这里加图标 + 描述)。
const options: AutoCompleteOptions = [
  {
    label: '📄 文档',
    options: [{ value: '产品需求文档' }, { value: '接口设计稿' }, { value: '发布说明' }],
  },
  {
    label: '👤 成员',
    options: [{ value: 'Mira Chen' }, { value: 'Jonas Park' }, { value: 'Ann Lee' }],
  },
  {
    label: '📁 项目',
    options: [{ value: '官网改版' }, { value: '移动端 App' }],
  },
];

export default function Demo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(300px, 80vw)' }}>
      <AutoComplete
        value={value}
        onChange={setValue}
        options={options}
        placeholder="键入以在分组中联想…"
        renderOption={(opt, { active }) => (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ms-space-2)',
              fontWeight: active ? 600 : 400,
            }}
          >
            <span aria-hidden="true">✦</span>
            {opt.value}
          </span>
        )}
        aria-label="分组联想"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        提示:输入「文档」「项目」等可跨组过滤
      </small>
    </div>
  );
}
