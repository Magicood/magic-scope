import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'visually-hidden',
  name: 'VisuallyHidden',
  category: 'layout',
  summary:
    '无障碍隐藏原语:内容对视觉隐身、却仍留在无障碍树里供屏幕阅读器朗读;支持 focusable 的 skip-link 聚焦还原。',
  description:
    '基础设施 / 无障碍工具组件,本身无常规视觉形态。用标准 sr-only 技法(position:absolute + 1px 尺寸 + clip 裁剪 + overflow:hidden)把内容对视觉藏起,刻意不用 display:none / visibility:hidden——后两者会把元素从可达性树摘掉,屏幕阅读器也读不到,与意图相悖。\n典型用途:给纯图标按钮补可读标签、给表单控件补隐藏说明、给区块补朗读标题。focusable 开启 skip-link 模式:平时隐身、键盘 Tab 聚焦时浮现还原可见(:focus / :focus-within 解除裁剪),做「跳到主内容」锚点。\n全库一致的留口:as 多态根标签(默认 span)、asChild 把类/props/ref 合并到自带子元素(事件 compose + ref 合并)、forwardRef 与 className / 原生属性透传。',
  controls: [
    {
      type: 'boolean',
      prop: 'focusable',
      label: '聚焦还原 focusable(skip-link)',
      default: false,
    },
    {
      type: 'select',
      prop: 'as',
      label: '根标签 as',
      default: 'span',
      options: [
        { value: 'span', label: 'span(默认)' },
        { value: 'div', label: 'div(块级)' },
        { value: 'label', label: 'label' },
        { value: 'h2', label: 'h2(朗读标题)' },
        { value: 'a', label: 'a(可聚焦锚点)' },
      ],
    },
    {
      type: 'text',
      prop: 'children',
      label: '隐藏文案 children',
      default: '仅屏幕阅读器可读的说明文字',
      placeholder: '给 SR 朗读的文字…',
    },
  ],
  spread: 'span',
};
