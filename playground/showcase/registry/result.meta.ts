import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'result',
  name: 'Result',
  category: 'feedback',
  summary: '结果页,七态(成功 / 失败 / 信息 / 警告 + 404 / 403 / 500)派生默认图标与配色,四槽位。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nstatus 七态派生默认符文与 tone 柔底发光圆,HTTP 异常另给默认标题;tone 可显式覆盖配色,size 随 data-ms-density 缩放。title / subtitle / extra / children 四槽位各带细粒度 classNames;icon 传 ReactNode 覆盖、传 false 关闭整区;多态 as 改根标签、asChild 合并到子元素。',
  controls: [
    {
      type: 'select',
      prop: 'status',
      label: '状态 status',
      default: 'success',
      options: [
        { value: 'success', label: 'success 成功' },
        { value: 'error', label: 'error 失败' },
        { value: 'info', label: 'info 信息' },
        { value: 'warning', label: 'warning 警告' },
        { value: '404', label: '404 页面不存在' },
        { value: '403', label: '403 无权访问' },
        { value: '500', label: '500 服务异常' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone(覆盖默认)',
      default: '',
      options: [
        { value: '', label: '跟随 status' },
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
      ],
    },
    { type: 'text', prop: 'title', label: '标题 title', default: '施法成功' },
    {
      type: 'text',
      prop: 'subtitle',
      label: '副标题 subtitle',
      default: '奥术回路已稳定,法术效果已生效。',
    },
  ],
  spread: 'div',
};
