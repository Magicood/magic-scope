import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'tour',
  name: 'Tour',
  category: 'feedback',
  summary: '引导漫游,遮罩在目标处镂空高亮 + 浮动引导卡,逐步带新手走完功能巡览。',
  description:
    '自研、零依赖。半透明遮罩压暗全页,只在当前步目标处用 box-shadow spread「挖洞」聚焦注意力,洞内可点透 / 高亮;目标用 CSS 选择器或取值器惰性解析,位置随页面滚动与窗口缩放经 rAF 实时跟随,切步自动 scrollIntoView。\n引导卡走 portal 进 document.body,含标题 / 描述 / 上一步·下一步·跳过·完成底栏与步数指示;方位按目标在视口的剩余空间自动推断(也可显式 placement)。受控(open + current + onChange)与非受控(defaultCurrent)双通道,onClose / onFinish 钩子,键盘 Esc 关、← / → 切步,ref 暴露 goTo/next/prev/close 命令式句柄,tone 经全库 resolver 着色。',
  controls: [
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    {
      type: 'number',
      prop: 'spotlightPadding',
      label: '高亮外扩 spotlightPadding',
      default: 8,
      min: 0,
      max: 32,
      step: 2,
    },
    { type: 'boolean', prop: 'maskClosable', label: '点遮罩关闭 maskClosable', default: false },
    { type: 'boolean', prop: 'closeOnEscape', label: 'Esc 关闭 closeOnEscape', default: true },
    { type: 'boolean', prop: 'showCounter', label: '显示步数 showCounter', default: true },
    { type: 'boolean', prop: 'hideSkip', label: '隐藏跳过 hideSkip', default: false },
  ],
};
