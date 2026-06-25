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
  controls: [],
};
