import { TagInput } from '@magic-scope/react';
import { useState } from 'react';

// 约束与拒绝反馈:maxTags 上限 + validate 只收邮箱格式 + 默认去重,
// 被拒走 onReject 给出原因,不静默吞掉。
export default function Demo() {
  const [tags, setTags] = useState<string[]>(['ada@lab.dev']);
  const [reason, setReason] = useState<string | null>(null);

  const reasonText: Record<string, string> = {
    max: '已达数量上限',
    invalid: '不是合法邮箱',
    empty: '不能为空',
    duplicate: '该邮箱已存在',
  };

  return (
    <div style={{ display: 'grid', gap: '0.4rem', inlineSize: 'min(420px, 100%)' }}>
      <TagInput
        value={tags}
        onChange={setTags}
        maxTags={4}
        validate={(t) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t)}
        onReject={(tag, why) => setReason(`「${tag}」被拒:${reasonText[why]}`)}
        tone="accent"
        placeholder="输入邮箱后回车…"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)', minBlockSize: '1.2em' }}>
        {reason ?? `最多 4 个,仅收合法邮箱,自动去重(当前 ${tags.length} 个)`}
      </small>
    </div>
  );
}
