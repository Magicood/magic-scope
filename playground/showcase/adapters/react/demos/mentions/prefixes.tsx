import type { MentionOption } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { useMemo, useState } from 'react';

// 组件独有特性:多触发前缀。prefix 传数组,@ 提及人、# 引用话题,
// 两套候选共存于同一份 options(用 value 前缀区分),回填时按命中的前缀续接。
// 这里按当前光标命中的前缀动态切换候选集,体现「多前缀 + 异构候选」的真实用法。
const people: MentionOption[] = [
  { value: '@arcanist', label: '奥术师·墨', icon: '🔮' },
  { value: '@frostweaver', label: '霜织者·凛', icon: '❄️' },
  { value: '@emberkin', label: '余烬使·焰', icon: '🔥' },
];

const topics: MentionOption[] = [
  { value: '#符文研究', label: '符文研究', icon: '📜' },
  { value: '#冰封领域', label: '冰封领域', icon: '🧊' },
  { value: '#烈焰爆发', label: '烈焰爆发', icon: '💥' },
];

export default function Demo() {
  const [text, setText] = useState('提及一个人 @,或引用一个话题 #');

  // 根据当前光标前最近的触发前缀,切换展示哪一组候选。
  const options = useMemo(() => {
    const at = text.lastIndexOf('@');
    const hash = text.lastIndexOf('#');
    return hash > at ? topics : people;
  }, [text]);

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(440px, 100%)' }}>
      <Mentions
        value={text}
        onChange={setText}
        prefix={['@', '#']}
        options={options}
        rows={4}
        placeholder="@ 提及人,# 引用话题…"
        aria-label="多前缀提及"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        前缀:<code>@</code> 提及人 / <code>#</code> 引用话题
      </small>
    </div>
  );
}
