import { Toolbar } from '@magic-scope/react';
import { useState } from 'react';

// 单选组(radiogroup) + 多选组(aria-pressed):
// single 组同一时刻一个激活,multiple 组可多选,值受控。
export default function Demo() {
  const [align, setAlign] = useState<string>('left');
  const [marks, setMarks] = useState<string[]>(['bold']);

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <Toolbar aria-label="富文本工具栏">
        <Toolbar.ToggleGroup
          type="multiple"
          label="文字样式"
          value={marks}
          onValueChange={(v) => setMarks(v as string[])}
        >
          <Toolbar.ToggleItem value="bold" iconOnly>
            <strong>B</strong>
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="italic" iconOnly>
            <em>I</em>
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
        <Toolbar.Separator />
        <Toolbar.ToggleGroup
          type="single"
          label="对齐"
          value={align}
          onValueChange={(v) => setAlign((v as string) ?? 'left')}
        >
          <Toolbar.ToggleItem value="left">左</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="center">中</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="right">右</Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        样式:{marks.join(' + ') || '无'} · 对齐:{align}
      </small>
    </div>
  );
}
