import type { MentionOption } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { useState } from 'react';

// 关键状态:校验失败(invalid 染 danger + aria-invalid)、整体禁用、
// 含禁用候选(高亮自动跳过、不可选中)。
const options: MentionOption[] = [
  { value: 'mira', label: 'Mira Chen', icon: '🧭' },
  { value: 'jonas', label: 'Jonas Park', icon: '🛠️' },
  { value: 'guest', label: 'Guest 访客(已离职)', icon: '🚫', disabled: true },
  { value: 'ann', label: 'Ann Lee', icon: '🎨' },
];

export default function Demo() {
  const [text, setText] = useState('');
  // 简易校验:至少提及一个人(文本里出现 @ 视为已提及)。
  const invalid = text.length > 0 && !text.includes('@');

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)', inlineSize: 'min(440px, 100%)' }}>
      <div style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          校验失败态(写点字但不 @ 任何人即标红)
        </span>
        <Mentions
          value={text}
          onChange={setText}
          options={options}
          invalid={invalid}
          rows={2}
          placeholder="记得 @ 上相关的人…"
          aria-label="带校验的提及"
        />
        {invalid && (
          <small style={{ color: 'var(--ms-color-danger-fg, var(--ms-color-fg-muted))' }}>
            请至少 @ 提及一位成员。
          </small>
        )}
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          整体禁用(不可编辑、不弹浮层)
        </span>
        <Mentions
          options={options}
          disabled
          defaultValue="已锁定:本条评论不可再 @ 提及"
          rows={2}
          aria-label="禁用的提及"
        />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          含禁用候选(↑↓ 自动跳过「已离职」项)
        </span>
        <Mentions
          options={options}
          rows={2}
          defaultValue="@"
          placeholder="敲 @ 看候选里的禁用项"
          aria-label="含禁用候选的提及"
        />
      </div>
    </div>
  );
}
