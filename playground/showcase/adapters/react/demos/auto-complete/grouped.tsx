import type { AutoCompleteOptions } from '@magic-scope/react';
import { AutoComplete } from '@magic-scope/react';
import { useState } from 'react';

// 分组候选 + 自定义 renderOption:options 既可平铺也可分组传入,
// 过滤后空组自动隐藏;renderOption 覆盖默认 label 文本(这里加图标 + 描述)。
const options: AutoCompleteOptions = [
  {
    label: '🔥 火系',
    options: [{ value: 'Ember 余烬' }, { value: 'Blaze 烈焰' }, { value: 'Cinder 灰烬' }],
  },
  {
    label: '❄️ 冰系',
    options: [{ value: 'Frost 霜寒' }, { value: 'Glacier 冰川' }, { value: 'Rime 雾凇' }],
  },
  {
    label: '🌿 自然系',
    options: [{ value: 'Verdant 苍翠' }, { value: 'Bloom 繁花' }],
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
        aria-label="分组流派联想"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>提示:输入「霜」「焰」等可跨组过滤</small>
    </div>
  );
}
