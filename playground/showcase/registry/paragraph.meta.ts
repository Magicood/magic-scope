import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'paragraph',
  name: 'Paragraph',
  category: 'typography',
  summary:
    '块级正文段落,围绕 <p> 的生产级排版原语:size/leading/tone/dimmed/align,多行省略与一键复制。',
  description:
    '自研、复用全库 tone resolver,消费 @magic-scope/tokens 的 --ms-* 变量。\nsize 走流式字阶(--ms-type-step-*),leading 为行高语义档(正文默认 relaxed 更舒展);tone 上色、dimmed 弱化为次要前景、align 逻辑对齐(RTL 友好)。\nellipsis 多行 clamp(可带 AntD 式「展开/收起」),copyable 一键复制(成功瞬间触发魔法 glow 一闪,受全局光影开关与 reduced-motion 调制)。\n留口:...rest 透传原生属性/事件,as 多态、asChild Slot,classNames 映射子部件。展开/收起/复制文案走 i18n。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '字号 size',
      default: 'base',
      options: [
        { value: 'xs', label: 'xs' },
        { value: 'sm', label: 'sm' },
        { value: 'base', label: 'base 默认' },
        { value: 'lg', label: 'lg' },
        { value: 'xl', label: 'xl' },
      ],
    },
    {
      type: 'select',
      prop: 'leading',
      label: '行高 leading',
      default: 'relaxed',
      options: [
        { value: 'tight', label: 'tight 紧凑' },
        { value: 'snug', label: 'snug' },
        { value: 'normal', label: 'normal' },
        { value: 'relaxed', label: 'relaxed 舒展' },
        { value: 'loose', label: 'loose 宽松' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'neutral',
      options: [
        { value: 'neutral', label: 'neutral 默认' },
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
      ],
    },
    {
      type: 'select',
      prop: 'align',
      label: '对齐 align',
      default: 'start',
      options: [
        { value: 'start', label: 'start 起始' },
        { value: 'center', label: 'center 居中' },
        { value: 'end', label: 'end 末尾' },
        { value: 'justify', label: 'justify 两端' },
      ],
    },
    { type: 'boolean', prop: 'dimmed', label: '弱化 dimmed', default: false },
    {
      type: 'text',
      prop: 'children',
      label: '文案',
      default:
        '在魔法的世界里,文字不只是信息的载体,更是咒语本身。每一个字符都承载着施法者的意图,从微弱的低语到震彻天地的吟唱。',
    },
  ],
  spread: 'p',
};
