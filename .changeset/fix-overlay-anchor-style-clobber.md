---
"@magic-scope/react": patch
---

fix(react): 修复浮层组件用户传 style 时锚点定位丢失(弹层跑到左上角)

浮层组件(Select/AutoComplete/TimePicker/Menubar 等)把 CSS Anchor Positioning 的
`anchor-name`/`position-anchor` 经组件 `style` 设到触发器/面板上,但随后 `{...rest}`
(含用户 `style`)在其后展开,把 `anchor-name` 覆盖掉 —— 一旦使用方给组件传 `style`
(如 `style={{ maxInlineSize: '16rem' }}`),锚点丢失,popover 退化到 top-layer 左上角。

改为把用户 `style` 与锚点样式合并且锚点放最后(`{ ...style, anchorName }`),并从
`{...rest}` 中解构出 `style` 避免二次覆盖。已在真实浏览器(Chrome 148,全支持 anchor)
复现并验证修复:trigger 同时带 `max-inline-size` 与 `anchor-name`,弹层正确贴回触发器下方。
