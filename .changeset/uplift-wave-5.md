---
"@magic-scope/react": minor
---

组件补强 Wave 5:ContextMenu / Tag / Timeline / Card / Divider / Label

右键菜单 + 展示/结构类补厚:

- **ContextMenu**:复用 Menu 的 MenuItem 类型与 logic + tone + typeahead;受控 `onOpenChange` + `onSelect` + `onContextMenu`(可拦截)+ `onOpen(e,{x,y})`(右键坐标)+ `onEscapeKeyDown`/`onPointerDownOutside`;包裹/浮层 `...rest`;clampToViewport 纯函数。
- **Tag**:tone 解析器 + variant(soft/solid/outline)+ size + icon/closeIcon 槽 + **checkable filter chip**;`onRemove(e)`(带事件)+ **关闭按钮事件隔离 stopPropagation** + 可点击键盘语义 + asChild;closeButtonProps 透传。
- **Timeline**:variant 接 tone + **mode(left/right/alternate)/reverse** + **pending 末节点**(虚线+呼吸点)+ 圆点 pulse + lineStyle;TimelineItem 交互式 `onSelect`/active/键盘;i18n `timeline.pending`。
- **Card**:**CardHeader/Title/Body/Footer/Media 子组件** + tone + padding 档 + **interactive 键盘激活**(Enter/Space→onClick)+ asChild。
- **Divider**:**带文字分隔**(children+textAlign,role=separator)+ tone + variant(solid/dashed/dotted)+ thickness/spacing。
- **Label**:size + tone + `optional` 标记(i18n)+ requiredMark 可替换。

接 tone 槽位、发光受 `--ms-fx-glow`、动效双降级。i18n 字典补 `label.optional`/`label.required`/`timeline.pending`。+49 测试,全量 452 无回归,dts strict 通过。向后兼容(Tag onRemove、Timeline variant 类名等签名增强,原测试更新)。
