import type { AlertVariant } from '../../../packages/react/src/index';
import { Alert } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'alert',
  name: 'Alert',
  category: 'feedback',
  summary: '语义提示框,四种变体(信息 / 成功 / 警告 / 危险),起始边强调条 + 柔和底色。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="alert" 会向辅助技术主动播报内容;按变体用 color-mix 渲染柔和底色与起始边强调条,适合表单校验、操作结果、风险警示等场景。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'info',
      options: [
        { value: 'info', label: 'info 信息' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
      ],
    },
    { type: 'text', prop: 'title', label: '标题', default: '咒文已就绪' },
    {
      type: 'text',
      prop: 'children',
      label: '正文',
      default: '法术回路稳定,可以安全释放这道奥术。',
    },
  ],
  render: (v) => (
    <Alert variant={v.variant as AlertVariant} style={{ maxInlineSize: '32rem' }}>
      <strong style={{ display: 'block', marginBlockEnd: '0.25rem' }}>{v.title as string}</strong>
      <span>{v.children as string}</span>
    </Alert>
  ),
  usage: `import { Alert } from '@magic-scope/react';

<Alert variant="success">
  <strong>咒文已就绪</strong>
  法术回路稳定,可以安全释放。
</Alert>`,
  props: [
    {
      name: 'variant',
      type: `'info' | 'success' | 'warning' | 'danger'`,
      default: `'info'`,
      description: '语义变体:信息 / 成功 / 警告 / 危险,决定底色与强调条颜色。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: '提示内容,可放标题、正文或任意节点。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'div'>`,
      default: '—',
      description: "透传原生 div 属性(className / style / id 等);role 固定为 'alert'。",
    },
  ],
  examples: [
    {
      title: '四种变体',
      node: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxInlineSize: '32rem',
          }}
        >
          <Alert variant="info">信息:新版本咒文库已同步至本地缓存。</Alert>
          <Alert variant="success">成功:奥术回路校准完成,可以释放。</Alert>
          <Alert variant="warning">警告:法力储备低于 20%,谨慎施放高阶法术。</Alert>
          <Alert variant="danger">危险:检测到不稳定的虚空裂隙,立即中止仪式。</Alert>
        </div>
      ),
    },
    {
      title: '标题 + 正文',
      node: (
        <Alert variant="warning" style={{ maxInlineSize: '32rem' }}>
          <strong style={{ display: 'block', marginBlockEnd: '0.25rem' }}>法力即将耗尽</strong>
          <span>建议先吟唱回复咒,或饮用一瓶法力药剂再继续。</span>
        </Alert>
      ),
    },
  ],
};
