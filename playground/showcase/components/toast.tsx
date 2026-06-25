import { Button, toast } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo(_props: { values: ControlValues }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={() => toast('施法已记录 ✦')}>
        默认 default
      </Button>
      <Button variant="outline" onClick={() => toast.success('传送门已开启')}>
        成功 success
      </Button>
      <Button variant="outline" onClick={() => toast.warning('魔力即将耗尽')}>
        警告 warning
      </Button>
      <Button variant="outline" onClick={() => toast.error('咒语反噬,施法失败')}>
        危险 danger
      </Button>
      <Button variant="outline" onClick={() => toast.info('新的符文已解锁')}>
        信息 info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('卷轴已封存', {
            description: '可在「我的法器」中随时取回。',
          })
        }
      >
        带描述 description
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('已将传送门移除', {
            action: { label: '撤销', onClick: () => toast.success('传送门已恢复') },
          })
        }
      >
        带行动 action
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning('结界常驻中,需手动关闭', { duration: 0 })}
      >
        常驻 duration=0
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast('正在吟唱…', { id: 'cast', duration: 0 });
          setTimeout(() => toast.success('吟唱完成 ✦', { id: 'cast' }), 1500);
        }}
      >
        同 id 更新
      </Button>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'toast',
  name: 'Toast',
  category: 'feedback',
  summary: '命令式轻提示,无需 Provider,任意处调用 toast() 即可弹出。',
  description:
    '基于模块级 store + useSyncExternalStore:toast() 可在组件内外任意处调用,无需 Context。\nToaster 容器已在应用根全局挂载(portal 到 body,固定定位 + 安全区避让)。\n支持五种语义变体、次级描述、行动按钮、自动消失(悬停 / 聚焦暂停计时)、常驻、同 id 替换更新,并解耦播报给屏幕阅读器(polite / assertive live region)。',
  controls: [],
  render: (v) => <Demo values={v} />,
  usage: `import { toast, Toaster } from '@magic-scope/react';

// 应用根挂载一次
<Toaster position="bottom-end" />

// 任意处调用
toast.success('保存成功', {
  description: '已同步到云端',
  action: { label: '撤销', onClick: undo },
});`,
  props: [
    {
      name: 'toast(message, options?)',
      type: '(message: ReactNode, options?: ToastOptions) => string',
      default: '—',
      description: '弹出 default 变体提示,返回 toast id。',
    },
    {
      name: 'toast.success / warning / info',
      type: '(message: ReactNode, options?: Omit<ToastOptions, "variant">) => string',
      default: '—',
      description: '对应语义变体的快捷方法(success / warning / info)。',
    },
    {
      name: 'toast.error',
      type: '(message: ReactNode, options?: Omit<ToastOptions, "variant">) => string',
      default: '—',
      description: '弹出 danger 变体(错误)提示的快捷方法。',
    },
    {
      name: 'toast.dismiss',
      type: '(id: string) => void',
      default: '—',
      description: '按 id 主动关闭某条提示(走退场动画)。',
    },
    {
      name: 'options.id',
      type: 'string',
      default: '自动生成',
      description: 'ToastOptions:指定 id,重复 id 会替换并重置寿命(用于「上传中→完成」更新)。',
    },
    {
      name: 'options.variant',
      type: `'default' | 'success' | 'warning' | 'danger' | 'info'`,
      default: `'default'`,
      description: 'ToastOptions:语义变体(快捷方法已内置,直接 toast() 时可显式指定)。',
    },
    {
      name: 'options.duration',
      type: 'number',
      default: '4000',
      description: 'ToastOptions:自动消失时长(ms);0 或 Infinity 表示常驻,需手动关闭。',
    },
    {
      name: 'options.description',
      type: 'ReactNode',
      default: '—',
      description: 'ToastOptions:次级描述文字,显示在主消息下方。',
    },
    {
      name: 'options.action',
      type: '{ label: ReactNode; onClick: () => void }',
      default: '—',
      description: 'ToastOptions:行动按钮,点击后执行回调并关闭该提示。',
    },
    {
      name: 'Toaster.position',
      type: `'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'`,
      default: `'bottom-end'`,
      description: 'Toaster 容器:弹出堆叠位置。',
    },
    {
      name: 'Toaster.label',
      type: 'string',
      default: `'通知'`,
      description: 'Toaster 容器:通知区域的可访问标签(aria-label)。',
    },
  ],
};
