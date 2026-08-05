---
'@magic-scope/react': patch
---

修 FloatButton.Group 触发钮的死 CSS(展开方向倒置)+ 新增「孤儿 CSS 类」全库红线

**FloatButton.Group 四个 direction 的展开方向全部倒置。** `FloatButton.css` 里给触发钮定位的
规则写成了 `.ms-float-button-group__group-trigger`,而 TSX 渲染的类名是
`ms-float-button__group-trigger`(block 名多写了一层 `-group`),整条规则从未生效。后果不是
「少了点样式」:触发钮的 `order: 2` 退回初始值 0,排到了子项面板**前面** —— `up` 的子项往下弹、
`down` 往上弹、`left`/`right` 同样反向,而且贴锚点边的从触发钮变成了子项面板(触发钮位置随子项
数量漂移)。真浏览器实测:修前 `order=0` / `flex-shrink=1`、触发钮在列表上方;修后 `order=2` /
`flex-shrink=0`,四个方向的触发钮都精确贴住各自的锚点边。

修的是 CSS 选择器而非 TSX 类名 —— `ms-float-button__group-trigger` 已随包发布,是使用方写覆盖
样式的公开类名契约,动它会破坏下游;而错拼的那个从未出现在任何渲染输出里,不属于契约。

**新增全库红线「孤儿 CSS 类」**(`css-contract.test.ts`):CSS 选择器里出现的每个 `.ms-*` 类,
都必须在仓库源码 / 文档里找得到渲染方。类名拼错既不报错也不告警,jsdom 更是连 CSS 都不解析,
只能静态兜。使用证据支持模板拼接(`ms-tabs--${variant}` 按前缀放行,前缀需窄到 `ms-<组件>-`
粒度);确实要留给使用方自己挂的钩子类,用 `--ms-contract-css-only` 声明豁免。

顺带删掉 `Form.css` 里 `.ms-form__list` / `.ms-form__list-item` 两条同类死规则(Form.List 是
纯 render-prop,不产出任何 DOM,没有元素带得上这两个类)—— 与 PR #68 是同一处改动,两边内容
逐字一致。
