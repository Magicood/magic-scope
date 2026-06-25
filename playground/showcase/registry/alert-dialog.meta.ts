import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'alert-dialog',
  name: 'AlertDialog',
  category: 'overlay',
  summary: '命令式 confirm / alert / prompt,await 一行拿到用户决策,无需自管 open 状态。',
  description:
    '基于原生 <dialog> + showModal()(焦点陷阱、Esc、top-layer),portal 到 body 并锁背景滚动。\nconfirm() 返回 Promise<boolean>、alert() 返回 Promise<void>、prompt() 返回 Promise<string | null>,可直接 await。\ndanger 变体会把确认按钮染危险色、默认焦点落在取消以防误触销毁性操作;prompt 默认焦点落在输入框并全选。\n模块级队列驱动,任意处直接调用即可——只需在应用根挂载一次 <AlertDialogHost />(本展示站已全局挂载)。',
  controls: [],
};
