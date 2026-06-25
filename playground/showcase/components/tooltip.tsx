import { Button, Tooltip } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'tooltip',
  name: 'Tooltip',
  category: 'overlay',
  summary:
    '提示气泡,Popover API 进 top-layer + CSS Anchor 定位,hover / focus 触发,触屏 tap-to-toggle。',
  description:
    '气泡进 top-layer 用 Popover API(popover="manual" 手动控制,无需 z-index),定位用 CSS Anchor Positioning 并以 @supports 降级。\nhover / focus 延时显示(delay),leave / blur / Esc 隐藏;trigger 与气泡用 aria-describedby 关联,键盘可达。\n触屏(无 hover)环境自动切到 tap-to-toggle:点 trigger 切换显隐、点外部关闭,桌面行为零变化。',
  controls: [
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'top',
      options: [
        { value: 'top', label: 'top 上方' },
        { value: 'bottom', label: 'bottom 下方' },
      ],
    },
    {
      type: 'number',
      prop: 'delay',
      label: '延时 delay(ms)',
      default: 150,
      min: 0,
      max: 1000,
      step: 50,
    },
    { type: 'text', prop: 'content', label: '提示内容 content', default: '✦ 奥术提示气泡' },
  ],
  render: (v) => (
    <Tooltip
      content={v.content as string}
      placement={v.placement as 'top' | 'bottom'}
      delay={v.delay as number}
    >
      <Button variant="outline">悬停 / 聚焦我</Button>
    </Tooltip>
  ),
  usage: `import { Tooltip, Button } from '@magic-scope/react';

<Tooltip content="奥术提示" placement="top">
  <Button>悬停我</Button>
</Tooltip>`,
  props: [
    { name: 'content', type: 'ReactNode', default: '—', description: '提示气泡的内容(必填)。' },
    {
      name: 'children',
      type: 'ReactElement',
      default: '—',
      description: '单个触发元素,将被克隆以注入事件 / anchor / aria(必填)。',
    },
    {
      name: 'placement',
      type: `'top' | 'bottom'`,
      default: `'top'`,
      description: '气泡相对 trigger 的方位。',
    },
    {
      name: 'delay',
      type: 'number',
      default: '150',
      description: 'hover / focus 到显示的延时(毫秒)。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '透传到气泡容器的额外 className。',
    },
  ],
  examples: [
    {
      title: '方位',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Tooltip content="出现在上方" placement="top">
            <Button variant="outline">top</Button>
          </Tooltip>
          <Tooltip content="出现在下方" placement="bottom">
            <Button variant="outline">bottom</Button>
          </Tooltip>
        </div>
      ),
    },
    {
      title: '无延时',
      description: 'delay=0:hover / focus 立即显示。',
      node: (
        <Tooltip content="立即显示" delay={0}>
          <Button variant="ghost">即时提示</Button>
        </Tooltip>
      ),
    },
  ],
};
