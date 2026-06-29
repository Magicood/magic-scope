import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'label',
  name: 'Label',
  category: 'forms',
  summary: '表单标签,基于原生 <label>;htmlFor 关联控件,required 时文末追加装饰星号。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n通过 htmlFor 关联原生表单控件(点击标签即聚焦对应控件),或用自身 id 配合自定义控件的 aria-labelledby 关联;required 仅在文末渲染装饰性星号(aria-hidden),真正的必填语义应由控件自身的 aria-required 承担。透传全部原生 label 属性,尊重 reduced-motion。',
  controls: [
    { type: 'boolean', prop: 'required', label: '必填 required', default: true },
    { type: 'text', prop: 'children', label: '标签文案', default: '显示名称' },
  ],
  spread: 'label',
};
