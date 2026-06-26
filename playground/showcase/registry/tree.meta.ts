import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'tree',
  name: 'Tree',
  category: 'data',
  summary: '树形控件:展开折叠、单选/多选、级联勾选(含半选),纯逻辑内核 + 完整 ARIA 键盘导航。',
  description:
    '自研、零依赖,纯树操作(可见节点扁平化、后代/祖先收集、勾选级联上下传播、半选派生)全进零 React 的 logic.ts,可平移 @magic-scope/core。\n勾选用级联模型(非 checkStrictly):checkedKeys 仅存「完全勾选」,半选由 deriveHalfChecked 派生,disabled 子树不参与级联。扁平 ARIA tree 以 aria-level/posinset/setsize 表达层级,而非 DOM 嵌套;role=tree/treeitem、aria-expanded/selected/checked(mixed 半选)。\n键盘交互(↑↓ 移焦、→ 展开或进子、← 折叠或回父、Home/End、Enter 选中、Space 勾选)自实现,roving tabindex + 焦点落格;受控/非受控三态(expanded/selected/checked)独立。',
  controls: [
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
    { type: 'boolean', prop: 'checkable', label: '勾选框 checkable', default: false },
    { type: 'boolean', prop: 'multiple', label: '多选 multiple', default: false },
    { type: 'boolean', prop: 'showIcon', label: '节点图标 showIcon', default: false },
    { type: 'boolean', prop: 'showLine', label: '引导线 showLine', default: false },
    { type: 'boolean', prop: 'blockNode', label: '整行可点 blockNode', default: true },
  ],
};
