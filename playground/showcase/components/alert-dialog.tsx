import { useState } from 'react';
import { alert, Button, confirm, prompt } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [result, setResult] = useState<string>('（尚未触发，点上方按钮试试）');
  const label = (values.label as string) || '目标';

  const handleConfirm = async () => {
    const ok = await confirm(`确定要删除「${label}」吗？此操作不可撤销。`, {
      title: '删除确认',
      variant: 'danger',
      confirmText: '删除',
      cancelText: '再想想',
    });
    setResult(ok ? `confirm → 已确认删除「${label}」` : 'confirm → 已取消');
  };

  const handleAlert = async () => {
    await alert(`「${label}」已成功保存到奥术档案库。`, {
      title: '操作完成',
      confirmText: '好的',
    });
    setResult('alert → 用户已知晓');
  };

  const handlePrompt = async () => {
    const name = await prompt('给这道法术起个名字：', {
      title: '命名法术',
      placeholder: '例如：奥术飞弹',
      defaultValue: label,
      confirmText: '确定',
    });
    setResult(name === null ? 'prompt → 已取消（返回 null）' : `prompt → 输入值：「${name}」`);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="solid" onClick={handleConfirm}>
          危险确认 confirm
        </Button>
        <Button variant="outline" onClick={handleAlert}>
          提示 alert
        </Button>
        <Button variant="ghost" onClick={handlePrompt}>
          输入 prompt
        </Button>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--ms-color-fg-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        返回值：{result}
      </p>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'alert-dialog',
  name: 'AlertDialog',
  category: 'overlay',
  summary: '命令式 confirm / alert / prompt，await 一行拿到用户决策，无需自管 open 状态。',
  description:
    '基于原生 <dialog> + showModal()（焦点陷阱、Esc、top-layer），portal 到 body 并锁背景滚动。\nconfirm() 返回 Promise<boolean>，alert() 返回 Promise<void>，prompt() 返回 Promise<string | null>，可直接 await。\ndanger 变体会把确认按钮染危险色、默认焦点落在取消以防误触销毁性操作。\n模块级队列驱动，任意处直接调用即可——只需在应用根挂载一次 <AlertDialogHost />（本展示站已全局挂载）。',
  controls: [
    {
      type: 'text',
      prop: 'label',
      label: '目标名称',
      default: '奥术飞弹',
      placeholder: '会拼进弹窗文案',
    },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { confirm, alert, prompt, AlertDialogHost } from '@magic-scope/react';

// 应用根挂载一次
<AlertDialogHost />

// 任意处命令式调用
if (await confirm('确定删除？', { variant: 'danger', confirmText: '删除' })) {
  // 用户确认了
}
await alert('已保存', { title: '完成' });
const name = await prompt('请输入名称', { defaultValue: '未命名' });`,
  props: [
    {
      name: 'confirm(message, options?)',
      type: '(message: ReactNode, options?: ConfirmOptions) => Promise<boolean>',
      default: '—',
      description: '确认弹窗。确认返回 true；取消 / Esc / 点遮罩返回 false。',
    },
    {
      name: 'alert(message, options?)',
      type: '(message: ReactNode, options?: AlertOptions) => Promise<void>',
      default: '—',
      description: '提示弹窗（仅一个确认按钮）。确认 / Esc / 点遮罩后 resolve。',
    },
    {
      name: 'prompt(message, options?)',
      type: '(message: ReactNode, options?: PromptOptions) => Promise<string | null>',
      default: '—',
      description: '输入弹窗。确认返回输入值；取消 / Esc / 点遮罩返回 null。',
    },
    {
      name: 'AlertDialogHost',
      type: '() => ReactNode',
      default: '—',
      description: '渲染容器，需在应用根渲染一次；订阅模块级队列，无需 Provider。',
    },
    {
      name: 'ConfirmOptions.title',
      type: 'ReactNode',
      default: '—',
      description: 'confirm：标题（可选）。',
    },
    {
      name: 'ConfirmOptions.confirmText',
      type: 'ReactNode',
      default: `'确定'`,
      description: 'confirm：确认按钮文案。',
    },
    {
      name: 'ConfirmOptions.cancelText',
      type: 'ReactNode',
      default: `'取消'`,
      description: 'confirm：取消按钮文案。',
    },
    {
      name: 'ConfirmOptions.variant',
      type: `'default' | 'danger'`,
      default: `'default'`,
      description: 'confirm：danger 时确认按钮染危险色、默认焦点落在取消。',
    },
    {
      name: 'AlertOptions.title',
      type: 'ReactNode',
      default: '—',
      description: 'alert：标题（可选）。',
    },
    {
      name: 'AlertOptions.confirmText',
      type: 'ReactNode',
      default: `'确定'`,
      description: 'alert：确认按钮文案。',
    },
    {
      name: 'PromptOptions.title',
      type: 'ReactNode',
      default: '—',
      description: 'prompt：标题（可选）。',
    },
    {
      name: 'PromptOptions.confirmText',
      type: 'ReactNode',
      default: `'确定'`,
      description: 'prompt：确认按钮文案。',
    },
    {
      name: 'PromptOptions.cancelText',
      type: 'ReactNode',
      default: `'取消'`,
      description: 'prompt：取消按钮文案。',
    },
    {
      name: 'PromptOptions.placeholder',
      type: 'string',
      default: '—',
      description: 'prompt：输入框占位符。',
    },
    {
      name: 'PromptOptions.defaultValue',
      type: 'string',
      default: '—',
      description: 'prompt：输入框初始值。',
    },
  ],
};
