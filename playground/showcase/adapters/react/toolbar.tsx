import {
  Toolbar,
  type ToolbarOrientation,
  type ToolbarSize,
  type ToolbarTone,
  type ToolbarVariant,
} from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [align, setAlign] = useState('left');
  const [marks, setMarks] = useState<string[]>(['bold']);

  return (
    <Toolbar
      orientation={values.orientation as ToolbarOrientation}
      size={values.size as ToolbarSize}
      variant={values.variant as ToolbarVariant}
      tone={values.tone as ToolbarTone}
      wrap={values.wrap as boolean}
      aria-label="格式工具栏"
    >
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
        <Toolbar.ToggleItem value="underline" iconOnly>
          <span style={{ textDecoration: 'underline' }}>U</span>
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

      <Toolbar.Separator />

      <Toolbar.Button>插入链接</Toolbar.Button>
    </Toolbar>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/toolbar/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/toolbar/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'toolbar',
  Playground,
  demos: buildDemos(comps, reactSources),
};
