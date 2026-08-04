# Tree <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

树形控件:展开折叠、单选/多选、级联勾选(含半选),纯逻辑内核 + 完整 ARIA 键盘导航。

> **[在展示站中打开 Tree](https://magicood.github.io/magic-scope/#/tree)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,纯树操作(可见节点扁平化、后代/祖先收集、勾选级联上下传播、半选派生)全进零 React 的 logic.ts,可平移 @magic-scope/core。

勾选用级联模型(非 checkStrictly):checkedKeys 仅存「完全勾选」,半选由 deriveHalfChecked 派生,disabled 子树不参与级联。扁平 ARIA tree 以 aria-level/posinset/setsize 表达层级,而非 DOM 嵌套;role=tree/treeitem、aria-expanded/selected/checked(mixed 半选)。

键盘交互(↑↓ 移焦、→ 展开或进子、← 折叠或回父、Home/End、Enter 选中、Space 勾选)自实现,roving tabindex + 焦点落格;受控/非受控三态(expanded/selected/checked)独立。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` * | `TreeNode[]` | — | 树数据。 |
| `expandedKeys` | `string[]` | — | 受控展开 key。 |
| `defaultExpandedKeys` | `string[]` | — | 非受控初始展开 key。 |
| `defaultExpandAll` | `boolean` | `false` | 默认全展开(仅非受控初始)。 |
| `selectable` | `boolean` | `true` | 是否可选中。默认 true。 |
| `multiple` | `boolean` | `false` | 多选。默认 false(单选)。 |
| `selectedKeys` | `string[]` | — | 受控选中 key。 |
| `defaultSelectedKeys` | `string[]` | — | 非受控初始选中。 |
| `checkable` | `boolean` | `false` | 显示勾选框(级联)。 |
| `checkedKeys` | `string[]` | — | 受控勾选 key(完全勾选)。 |
| `defaultCheckedKeys` | `string[]` | — | 非受控初始勾选。 |
| `showIcon` | `boolean` | `false` | 显示节点图标。 |
| `showLine` | `boolean` | `false` | 显示层级引导线:每个祖先层级一条竖导轨,对齐该层展开箭头;线色可用 --ms-tree-line 覆写。 |
| `blockNode` | `boolean` | `true` | 节点整行可点(整行高亮),否则仅标题区。默认 true。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `classNames` | `TreeClassNames` | — | 各部件 className。 |
| `className` | `string` | — | 根 className。 |
| `as` | `ElementType` | — | 多态根标签(默认 'ul')。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onExpandedChange` | `(keys: string[]) => void` | 展开变化回调。<br>· `keys` — 展开后的全部节点 key 列表 |
| `onSelect` | `(keys: string[], info: { node: TreeNode; selected: boolean; }) => void` | 选中变化回调。<br>· `keys` — 选中的节点 key 列表(单选时长度 0 或 1)<br>· `info` — 本次详情:node 触发的节点、selected 是选中(true)还是取消(false) |
| `onCheck` | `(keys: string[], info: { node: TreeNode; checked: boolean; halfCheckedKeys: string[]; }) => void` | 勾选变化回调。<br>· `keys` — 完全勾选的节点 key 列表(不含半选)<br>· `info` — 本次详情:node 触发节点、checked 勾选(true)/取消(false)、halfCheckedKeys 半选 key 列表 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `tree` `hierarchy` `checkbox` `cascade` `a11y` `keyboard` |

::: details 需求原文 / 设计意图
做一个生产级树形控件。硬约束:① 所有树操作(可见节点扁平化、后代/祖先收集、勾选级联上下传播、半选派生)纯 TS 进 logic.ts,零 React,可平移 @magic-scope/core;② 勾选用级联模型(非 checkStrictly):checkedKeys 仅存『完全勾选』,半选由 deriveHalfChecked 从中派生,toggle 向下传后代、向上重算祖先(全部非禁用子勾选才勾选),disabled 子树不参与级联;③ 扁平 ARIA tree:li 经 aria-level/posinset/setsize 表达层级(而非 DOM 嵌套),role=tree/treeitem、aria-expanded/selected/checked(mixed 半选)/disabled;④ 完整键盘:↑↓ 移焦、→ 展开或进子、← 折叠或回父、Home/End、Enter 选中、Space 勾选,roving tabindex + 焦点落格;⑤ 受控/非受控三套(expanded/selected/checked)独立;⑥ 单选/多选、节点图标、引导线、blockNode 整行可点、密度缩放、tone 选中高亮。诚实取舍:虚拟滚动(大数据量)与拖拽排序延后;勾选框为自绘轻量元素(非复用 Checkbox)以承载半选态。
:::
