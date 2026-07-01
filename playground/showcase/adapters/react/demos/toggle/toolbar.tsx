import { Toggle } from '@magic-scope/react';
import { useState } from 'react';

// 富文本编辑器工具栏典型场景:纯图标 Toggle(iconOnly + square)保持各自激活态,
// 多个独立双态按钮(加粗 / 斜体 / 下划线),互不排斥。
type Marks = { bold: boolean; italic: boolean; underline: boolean };

export default function Demo() {
  const [marks, setMarks] = useState<Marks>({ bold: true, italic: false, underline: false });
  const toggle = (key: keyof Marks) => setMarks((m) => ({ ...m, [key]: !m[key] }));

  const active = (Object.entries(marks) as [keyof Marks, boolean][])
    .filter(([, on]) => on)
    .map(([k]) => k)
    .join(' + ');

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
        <Toggle
          iconOnly
          shape="square"
          pressed={marks.bold}
          onPressedChange={() => toggle('bold')}
          aria-label="加粗"
        >
          <strong>B</strong>
        </Toggle>
        <Toggle
          iconOnly
          shape="square"
          pressed={marks.italic}
          onPressedChange={() => toggle('italic')}
          aria-label="斜体"
        >
          <em>I</em>
        </Toggle>
        <Toggle
          iconOnly
          shape="square"
          pressed={marks.underline}
          onPressedChange={() => toggle('underline')}
          aria-label="下划线"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </Toggle>
      </div>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前格式:{active || '(无)'}
      </span>
    </div>
  );
}
