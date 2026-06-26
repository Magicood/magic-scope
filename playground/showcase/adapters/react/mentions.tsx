import type { MentionOption, MentionsSize, MentionsTone } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 主交互演示用的候选名单(法师同袍):带头像 emoji 与副描述,展示 option 的完整结构。
const options: MentionOption[] = [
  { value: 'arcanist', label: '奥术师·墨', icon: '🔮', description: '@arcanist · 符文研究' },
  { value: 'frostweaver', label: '霜织者·凛', icon: '❄️', description: '@frost · 冰封领域' },
  { value: 'emberkin', label: '余烬使·焰', icon: '🔥', description: '@ember · 烈焰爆发' },
  { value: 'stormcaller', label: '唤雷者·霆', icon: '⚡', description: '@storm · 雷电连锁' },
  { value: 'verdant', label: '翠生者·苏', icon: '🌿', description: '@verdant · 治愈召唤' },
  {
    value: 'void',
    label: '虚空者·阒(已封印)',
    icon: '🌀',
    description: '禁忌之力',
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
        placeholder="敲 @ 召唤同袍…"
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
