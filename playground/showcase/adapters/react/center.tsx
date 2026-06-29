import type { CenterAxis } from '@magic-scope/react';
import { Center } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Center
      as="div"
      axis={values.axis as CenterAxis}
      gap={Number(values.gap)}
      padding={Number(values.padding)}
      minBlockSize={Number(values.minBlockSize)}
      inline={values.inline as boolean}
      style={{
        inlineSize: 'min(420px, 100%)',
        border: '1px dashed var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <span style={{ fontWeight: 600 }}>欢迎登录</span>
      <span style={{ color: 'var(--ms-color-fg-muted)' }}>居中的子内容</span>
    </Center>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/center/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/center/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'center',
  Playground,
  demos: buildDemos(comps, reactSources),
};
