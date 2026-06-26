import type { MentionOption } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { useState } from 'react';

// 基础用法:非受控也行,这里用受控展示回填后的完整文本。
// 在文本里敲 @ 即弹候选,↑↓ 移动、Enter / Tab 选中、Esc 关闭。
const options: MentionOption[] = [
  { value: 'arcanist', label: '奥术师·墨', icon: '🔮', description: '@arcanist' },
  { value: 'frostweaver', label: '霜织者·凛', icon: '❄️', description: '@frost' },
  { value: 'emberkin', label: '余烬使·焰', icon: '🔥', description: '@ember' },
  { value: 'stormcaller', label: '唤雷者·霆', icon: '⚡', description: '@storm' },
];

export default function Demo() {
  const [text, setText] = useState('集合了 @');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(420px, 100%)' }}>
      <Mentions
        value={text}
        onChange={setText}
        options={options}
        placeholder="敲 @ 召唤同袍…"
        aria-label="基础提及输入"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前文本:{text || '(空)'}</small>
    </div>
  );
}
