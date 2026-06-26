---
"@magic-scope/react": minor
---

feat(react): 新增 Tree 树形控件(v2 旗舰)

- **零 React 树内核** `logic.ts`:可见节点扁平化、后代/祖先收集、勾选级联上下传播、半选派生,全部纯函数,可平移 `@magic-scope/core`。
- **级联勾选模型**(非 checkStrictly):checkedKeys 仅存「完全勾选」,半选由 `deriveHalfChecked` 派生;toggle 向下传后代、向上重算祖先;disabled 子树不参与级联。
- **扁平 ARIA tree**:`li` 经 aria-level/posinset/setsize 表达层级(非 DOM 嵌套),role=tree/treeitem、aria-expanded/selected/checked(mixed 半选)/disabled。
- **完整键盘导航**:↑↓ 移焦、→ 展开或进子、← 折叠或回父、Home/End、Enter 选中、Space 勾选,roving tabindex + 焦点落格。
- **受控/非受控三态**(expanded / selected / checked)独立;单选/多选、节点图标、引导线、blockNode 整行可点、密度缩放、tone 选中高亮。

logic 11 + 组件 13 测试。lint / tsc / build / size 全绿。
