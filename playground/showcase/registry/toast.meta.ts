import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'toast',
  name: 'Toast',
  // 显示名 Toast;参数表主体来自 toast(message, options) 的 ToastOptions,并并入 <Toaster> 的 props。
  propsName: 'ToastOptions',
  alsoProps: ['Toaster'],
  category: 'feedback',
  summary: '命令式轻提示,无需 Provider,任意处调用 toast() 即可弹出。',
  description:
    '基于模块级 store + useSyncExternalStore:toast() 可在组件内外任意处调用,无需 Context。\nToaster 容器已在应用根全局挂载(portal 到 body,固定定位 + 安全区避让)。\n支持五种语义变体、次级描述、行动按钮、自动消失(悬停 / 聚焦暂停计时)、常驻、同 id 替换更新,并解耦播报给屏幕阅读器(polite / assertive live region)。',
  // Toast 是命令式 API,无声明式 props 实例;旋钮驱动 toast() 调用参数,点「弹出」即可见效果。
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'default',
      options: [
        { value: 'default', label: 'default 中性' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'loading', label: 'loading 进行' },
      ],
    },
    {
      type: 'select',
      prop: 'duration',
      label: '时长 duration',
      default: '4000',
      options: [
        { value: '2000', label: '2s 快速' },
        { value: '4000', label: '4s 默认' },
        { value: '8000', label: '8s 从容' },
        { value: '0', label: '0 常驻(手动关)' },
      ],
    },
    { type: 'boolean', prop: 'withDescription', label: '带描述 description', default: false },
    { type: 'boolean', prop: 'withAction', label: '带行动 action', default: false },
    { type: 'boolean', prop: 'noIcon', label: '关闭图标 icon=false', default: false },
    { type: 'text', prop: 'message', label: '文案', default: '施法已记录 ✦' },
  ],
};
