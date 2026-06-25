import { useState } from 'react';
import type { TagTone } from '../../../packages/react/src/index';
import { Tag } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

const TONE_OPTIONS: { value: TagTone; label: string }[] = [
  { value: 'primary', label: 'primary 主色' },
  { value: 'accent', label: 'accent 强调' },
  { value: 'success', label: 'success 成功' },
  { value: 'warning', label: 'warning 警告' },
  { value: 'danger', label: 'danger 危险' },
  { value: 'neutral', label: 'neutral 中性' },
];

const INITIAL_SKILLS = ['奥术飞弹', '冰霜新星', '烈焰风暴', '时间停滞', '虚空裂隙'];

function Demo({ values }: { values: ControlValues }) {
  const tone = values.tone as TagTone;
  const closable = values.closable as boolean;
  const label = values.children as string;
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
    >
      <Tag tone={tone} closable={closable}>
        {label}
      </Tag>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {skills.length === 0 ? (
          <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
            法术已全部移除 —— 点右侧「重置」恢复。
          </span>
        ) : (
          skills.map((skill) => (
            <Tag
              key={skill}
              tone={tone}
              closable={closable}
              onRemove={() => setSkills((prev) => prev.filter((s) => s !== skill))}
            >
              {skill}
            </Tag>
          ))
        )}
        {(closable || skills.length < INITIAL_SKILLS.length) && (
          <button
            type="button"
            onClick={() => setSkills(INITIAL_SKILLS)}
            style={{
              border: '1px solid var(--ms-color-border)',
              background: 'transparent',
              color: 'var(--ms-color-fg-muted)',
              borderRadius: 'var(--ms-radius-sm)',
              padding: '0.125rem 0.5rem',
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            重置
          </button>
        )}
      </div>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'tag',
  name: 'Tag',
  category: 'data',
  summary: '语义色标签,六档 tone 柔和底色,可选关闭按钮用于分类、过滤与可移除项。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\ntone 用 color-mix 调出 18% 柔和底 + tone 文字,紧凑内边距适合密集场景。\nclosable 时在末尾渲染移除按钮,hover 加深、focus-visible 显示发光环;移除逻辑由 onRemove 交给上层 state 控制。',
  controls: [
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'neutral',
      options: TONE_OPTIONS,
    },
    { type: 'boolean', prop: 'closable', label: '可关闭 closable', default: false },
    { type: 'text', prop: 'children', label: '文案', default: '奥术 ✦' },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Tag } from '@magic-scope/react';

<Tag tone="primary">奥术</Tag>

const [tags, setTags] = useState(['冰霜', '烈焰']);
<Tag
  tone="accent"
  closable
  onRemove={() => setTags((prev) => prev.filter((t) => t !== '冰霜'))}
>
  冰霜
</Tag>`,
  props: [
    {
      name: 'tone',
      type: `'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'`,
      default: `'neutral'`,
      description: '语义色调:主色 / 强调 / 成功 / 警告 / 危险 / 中性,决定柔和底与文字颜色。',
    },
    {
      name: 'closable',
      type: 'boolean',
      default: 'false',
      description: '是否在末尾渲染移除按钮。',
    },
    {
      name: 'onRemove',
      type: '() => void',
      default: '—',
      description: '点击移除按钮时触发(移除由上层 state 控制)。',
    },
    { name: 'children', type: 'ReactNode', default: '—', description: '标签文本内容。' },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'span'>`,
      default: '—',
      description: '透传原生 span 属性(className / onClick / title 等)。',
    },
  ],
  examples: [
    {
      title: '色调',
      description: '六档语义 tone,柔和底色适配深色主题。',
      node: (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Tag tone="primary">primary</Tag>
          <Tag tone="accent">accent</Tag>
          <Tag tone="success">success</Tag>
          <Tag tone="warning">warning</Tag>
          <Tag tone="danger">danger</Tag>
          <Tag tone="neutral">neutral</Tag>
        </div>
      ),
    },
    {
      title: '可关闭',
      description: 'closable 时末尾出现移除按钮,hover 加深、focus-visible 有发光环。',
      node: (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Tag tone="primary" closable>
            奥术飞弹
          </Tag>
          <Tag tone="success" closable>
            治疗术
          </Tag>
          <Tag tone="danger" closable>
            诅咒
          </Tag>
        </div>
      ),
    },
  ],
};
