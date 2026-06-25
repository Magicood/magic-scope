import type { DividerOrientation } from '../../../packages/react/src/index';
import { Divider } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'divider',
  name: 'Divider',
  category: 'layout',
  summary: '分隔线,语义 <hr>(隐含 separator role),支持水平 / 垂直两种朝向。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n用语义 <hr> 渲染(隐含 separator role),按朝向设 aria-orientation;水平用 border-block-start 横跨容器,垂直用 border-inline-start 行内贴满高度。',
  controls: [
    {
      type: 'select',
      prop: 'orientation',
      label: '朝向 orientation',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 水平' },
        { value: 'vertical', label: 'vertical 垂直' },
      ],
    },
  ],
  render: (v) => {
    const orientation = v.orientation as DividerOrientation;
    if (orientation === 'vertical') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            blockSize: '3rem',
            color: 'var(--ms-color-fg-muted)',
          }}
        >
          <span>奥术</span>
          <Divider orientation="vertical" />
          <span>秘法</span>
          <Divider orientation="vertical" />
          <span>禁咒</span>
        </div>
      );
    }
    return (
      <div style={{ inlineSize: 'min(28rem, 100%)' }}>
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>上半段魔典正文。</p>
        <Divider orientation="horizontal" />
        <p style={{ marginBlockEnd: 0, color: 'var(--ms-color-fg-muted)' }}>下半段魔典正文。</p>
      </div>
    );
  },
  usage: `import { Divider } from '@magic-scope/react';

<Divider />
<Divider orientation="vertical" />`,
  props: [
    {
      name: 'orientation',
      type: `'horizontal' | 'vertical'`,
      default: `'horizontal'`,
      description: '朝向:水平横跨容器宽度,垂直贴满容器高度(行内)。同步设 aria-orientation。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'hr'>`,
      default: '—',
      description: '透传原生 hr 属性(className / style 等)。注意 <hr> 为空元素,不接受 children。',
    },
  ],
  examples: [
    {
      title: '水平',
      node: (
        <div style={{ inlineSize: 'min(28rem, 100%)' }}>
          <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>段落一</p>
          <Divider />
          <p style={{ marginBlockEnd: 0, color: 'var(--ms-color-fg-muted)' }}>段落二</p>
        </div>
      ),
    },
    {
      title: '垂直(行内导航)',
      node: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            blockSize: '2.5rem',
            color: 'var(--ms-color-fg-muted)',
          }}
        >
          <span>首页</span>
          <Divider orientation="vertical" />
          <span>文档</span>
          <Divider orientation="vertical" />
          <span>关于</span>
        </div>
      ),
    },
  ],
};
