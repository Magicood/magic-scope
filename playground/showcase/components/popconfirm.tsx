import { useState } from 'react';
import type { PopoverPlacement } from '../../../packages/react/src/index';
import { Button, Popconfirm } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [result, setResult] = useState<'idle' | 'confirmed' | 'cancelled'>('idle');
  const variant = values.variant as 'default' | 'danger';
  const tip =
    result === 'confirmed'
      ? '已确认 ✓'
      : result === 'cancelled'
        ? '已取消(取消 / 点外 / Esc)'
        : '点按钮试试,会反馈你的选择';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Popconfirm
        trigger={
          <Button variant={variant === 'danger' ? 'outline' : 'solid'}>
            {variant === 'danger' ? '删除条目' : '提交施法'}
          </Button>
        }
        title={values.title as string}
        description={values.description as string}
        confirmText={values.confirmText as string}
        cancelText={values.cancelText as string}
        variant={variant}
        placement={values.placement as PopoverPlacement}
        onConfirm={() => setResult('confirmed')}
        onCancel={() => setResult('cancelled')}
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>{tip}</span>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'popconfirm',
  name: 'Popconfirm',
  category: 'overlay',
  summary: '锚定在元素旁的轻量确认气泡,内建确认 / 取消按钮流,常用于内联删除确认。',
  description:
    '复用 Popover(原生 Popover API + CSS Anchor Positioning,自带点外 / 取消 / Esc 关闭),在 trigger 旁弹出确认气泡,而非全屏模态。\ndanger 变体把确认按钮染危险色;点外 / Esc 关闭等同取消(触发 onCancel)。适合列表内联删除等不打断上下文的二次确认。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'default',
      options: [
        { value: 'default', label: 'default 默认' },
        { value: 'danger', label: 'danger 危险' },
      ],
    },
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'top',
      options: [
        { value: 'top', label: 'top 上' },
        { value: 'bottom', label: 'bottom 下' },
        { value: 'left', label: 'left 左' },
        { value: 'right', label: 'right 右' },
      ],
    },
    { type: 'text', prop: 'title', label: '标题 title', default: '确定执行此操作?' },
    {
      type: 'text',
      prop: 'description',
      label: '描述 description',
      default: '操作不可撤销,请确认。',
    },
    { type: 'text', prop: 'confirmText', label: '确认文案 confirmText', default: '确定' },
    { type: 'text', prop: 'cancelText', label: '取消文案 cancelText', default: '取消' },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Popconfirm, Button } from '@magic-scope/react';

<Popconfirm
  trigger={<Button variant="outline">删除</Button>}
  title="确定删除?"
  description="此操作不可撤销。"
  variant="danger"
  onConfirm={() => remove()}
/>`,
  props: [
    {
      name: 'trigger',
      type: 'ReactElement',
      default: '—',
      description: '触发元素(单个 React 元素,如 <Button>),点击弹出确认气泡。',
    },
    { name: 'title', type: 'ReactNode', default: '—', description: '确认标题 / 主问题。' },
    { name: 'description', type: 'ReactNode', default: '—', description: '次级描述说明。' },
    {
      name: 'onConfirm',
      type: '() => void',
      default: '—',
      description: '点击确认时触发,随后自动关闭气泡。',
    },
    {
      name: 'onCancel',
      type: '() => void',
      default: '—',
      description: '点击取消 / 点外 / Esc 关闭时触发。',
    },
    { name: 'confirmText', type: 'ReactNode', default: `'确定'`, description: '确认按钮文案。' },
    { name: 'cancelText', type: 'ReactNode', default: `'取消'`, description: '取消按钮文案。' },
    {
      name: 'variant',
      type: `'default' | 'danger'`,
      default: `'default'`,
      description: 'danger 时确认按钮染危险色。',
    },
    {
      name: 'placement',
      type: `'top' | 'bottom' | 'left' | 'right'`,
      default: `'top'`,
      description: '气泡相对 trigger 的方位。',
    },
  ],
  examples: [
    {
      title: '默认与危险变体',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Popconfirm
            trigger={<Button>提交</Button>}
            title="确定提交?"
            description="提交后将进入审核队列。"
          />
          <Popconfirm
            trigger={<Button variant="outline">删除</Button>}
            title="确定删除该条目?"
            description="此操作不可撤销。"
            variant="danger"
            confirmText="删除"
          />
        </div>
      ),
    },
  ],
};
