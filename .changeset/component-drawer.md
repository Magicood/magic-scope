---
"@magic-scope/react": minor
---

新增 Drawer 侧边抽屉组件

基于原生 `<dialog>` + `showModal()`(焦点陷阱、Esc、`::backdrop`、top-layer)。受控 `open` + `onClose`,四个方向滑入(`side`: start/end/top/bottom),可选 `title` 头部(`aria-labelledby` 关联)+ 内建关闭按钮(无标题时浮于右上角),点击遮罩关闭(`dismissable`)、锁背景滚动、安全区避让、进出场滑动动画、尊重 `prefers-reduced-motion`。含 6 个功能测试 + playground 演示。
