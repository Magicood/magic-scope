import type { MentionOption, MentionsSize, MentionsTone } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 主交互演示用的候选名单(团队成员):带头像 emoji 与副描述,展示 option 的完整结构。
const options: MentionOption[] = [
  { value: 'mira', label: 'Mira Chen', icon: '🧭', description: '@mira · 产品负责人' },
  { value: 'jonas', label: 'Jonas Park', icon: '🛠️', description: '@jonas · 前端工程师' },
  { value: 'ann', label: 'Ann Lee', icon: '🎨', description: '@ann · 设计师' },
  { value: 'leo', label: 'Leo Wang', icon: '📊', description: '@leo · 数据分析' },
  { value: 'sara', label: 'Sara Kim', icon: '🚀', description: '@sara · 项目经理' },
  {
    value: 'guest',
    label: 'Guest 访客(已离职)',
    icon: '🚫',
    description: '账号已停用',
    disabled: true,
  },
];

function Playground({ values }: { values: ControlValues }) {
  const [text, setText] = useState('在此输入 @ 试试,例如:辛苦 ');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(420px, 100%)' }}>
      <Mentions
        value={text}
        onChange={setText}
        options={options}
        size={values.size as MentionsSize}
        tone={values.tone as MentionsTone}
        invalid={values.invalid as boolean}
        disabled={values.disabled as boolean}
        loading={values.loading as boolean}
        rows={values.rows as number}
        placeholder="敲 @ 提及成员…"
        aria-label="提及输入演示"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前文本:{text || '(空)'}</small>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/mentions/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/mentions/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'mentions',
  Playground,
  demos: buildDemos(comps, reactSources),
};
