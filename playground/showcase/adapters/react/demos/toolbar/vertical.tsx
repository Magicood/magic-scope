import { Toolbar } from '@magic-scope/react';
import { useState } from 'react';

// 纵向工具栏(orientation=vertical):↑/↓ 移焦,常用于画布左侧工具条;plain 变体去容器背景。
export default function Demo() {
  const [tool, setTool] = useState('select');
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Toolbar orientation="vertical" variant="plain" aria-label="画布工具">
        <Toolbar.ToggleGroup
          type="single"
          label="工具"
          value={tool}
          onValueChange={(v) => setTool((v as string) ?? 'select')}
        >
          <Toolbar.ToggleItem value="select" iconOnly>
            ⌖
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="pen" iconOnly>
            ✎
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="rect" iconOnly>
            ▭
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="text" iconOnly>
            T
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前工具:{tool}
      </span>
    </div>
  );
}
