import type { ContainerSize } from '@magic-scope/react';
import { Container } from '@magic-scope/react';
import type { ComponentType, CSSProperties } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 让容器边界在展示位里可见(实际组件无边框,这里仅为演示限宽/内边距形态)。
const frame: CSSProperties = {
  border: '1px dashed var(--ms-color-border, #888)',
  borderRadius: 'var(--ms-radius-md, 8px)',
  background: 'var(--ms-color-bg-subtle, rgba(127,127,127,0.06))',
};

function Playground({ values }: { values: ControlValues }) {
  const padding = values.padding as string;
  return (
    <Container
      size={values.size as ContainerSize}
      fluid={values.fluid as boolean}
      centered={values.centered as boolean}
      padding={padding === '' ? undefined : Number(padding)}
      style={frame}
    >
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        居中定宽容器:虚线即容器边界。改尺寸档看限宽收放,改内边距看内容与边界的间距。 fluid
        满宽时不再限宽,centered 会把内容撑到整屏垂直居中。
      </p>
    </Container>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/container/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/container/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'container',
  Playground,
  demos: buildDemos(comps, reactSources),
};
