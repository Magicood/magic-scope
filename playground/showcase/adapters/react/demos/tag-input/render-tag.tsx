import { TagInput } from '@magic-scope/react';
import { useState } from 'react';

// renderTag 自绘芯片:给每枚标签配一个色点前缀。
// ref 挂到自绘的可聚焦删除按钮上,让 ←/→/Backspace 标签键盘导航在自绘模式下也生效。
const dot = (s: string) => `hsl(${(s.length * 47) % 360} 70% 55%)`;

export default function Demo() {
  const [tags, setTags] = useState<string[]>(['紧急', '待办', '已排期']);
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <TagInput
        value={tags}
        onChange={setTags}
        editable
        clearable
        placeholder="添加状态标签…"
        renderTag={({ value, onRemove, removeLabel, ref, disabled }) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--ms-radius-pill, 999px)',
              background: 'var(--ms-color-bg-subtle)',
              color: 'var(--ms-color-fg)',
            }}
          >
            <span
              aria-hidden="true"
              style={{ inlineSize: 8, blockSize: 8, borderRadius: '50%', background: dot(value) }}
            />
            {value}
            <button
              type="button"
              ref={ref}
              disabled={disabled}
              aria-label={removeLabel}
              onClick={onRemove}
              style={{
                font: 'inherit',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
              }}
            >
              ×
            </button>
          </span>
        )}
      />
    </div>
  );
}
